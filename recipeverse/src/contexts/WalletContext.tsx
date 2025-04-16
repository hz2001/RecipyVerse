import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { UserData, fetchUserDataByWallet } from '../data/dummyUserData';
import { testMode } from '../test/testConfig'; // Import from config file

interface WalletContextState {
  connectedWallet: string | null;
  userData: UserData | null | undefined; // null: initial, undefined: not found after fetch
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  testMode: boolean;
  connectWallet: () => Promise<{ walletId: string | null; userData: UserData | null | undefined }>;
  disconnectWallet: () => void;
  updateUserData: (userData: UserData | null | undefined) => void;
}

const WalletContext = createContext<WalletContextState | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null | undefined>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check for MetaMask on initial load (only relevant for non-test mode)
    if (typeof window.ethereum !== 'undefined') {
      setIsMetaMaskInstalled(true);
       // Optional: Check if already connected (e.g., on page refresh)
      // window.ethereum.request({ method: 'eth_accounts' })
      //   .then(handleAccountsChanged)
      //   .catch(err => console.error("Error checking initial accounts:", err));

       // Optional: Listen for account changes
      // window.ethereum.on('accountsChanged', handleAccountsChanged);
      // return () => {
      //   window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      // };
    } else {
      setIsMetaMaskInstalled(false);
    }
  }, []);

//   const handleAccountsChanged = (accounts: string[]) => {
//      if (!testMode) {
//         if (accounts.length === 0) {
//           console.log('MetaMask disconnected.');
//           disconnectWallet();
//         } else {
//           const walletId = accounts[0];
//           console.log('MetaMask account changed:', walletId);
//           setConnectedWallet(walletId);
//           fetchDataForWallet(walletId);
//         }
//      }
//   };


  const fetchDataForWallet = useCallback(async (walletId: string): Promise<UserData | undefined> => {
    if (!walletId) return undefined;
    setIsLoading(true);
    setUserData(null); // Reset user data while fetching
    console.log(`Fetching data for wallet: ${walletId}`);
    await new Promise(resolve => setTimeout(resolve, 300));
    let data: UserData | undefined = undefined;
    try {
      data = fetchUserDataByWallet(walletId);
      setUserData(data); // Update context state
      console.log("Fetched user data:", data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(undefined); // Indicate fetch error/not found
      data = undefined;
    } finally {
      setIsLoading(false);
    }
    return data; // Return the fetched data
  }, []);

  const connectWallet = useCallback(async (): Promise<{ walletId: string | null; userData: UserData | null | undefined }> => {
     if (testMode) {
         console.warn("ConnectWallet called in test mode.");
         return { walletId: null, userData: undefined };
     }
    if (!isMetaMaskInstalled) {
      alert('MetaMask is not installed.');
      console.error('MetaMask not installed.');
      return { walletId: null, userData: undefined };
    }

    setIsLoading(true);
    let connectedWalletId: string | null = null;
    let finalUserData: UserData | null | undefined = null;

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log('MetaMask connected:', walletId);
        setConnectedWallet(walletId); // Update context state
        connectedWalletId = walletId; // Store locally for return value
        finalUserData = await fetchDataForWallet(walletId);
      } else {
         console.warn('No accounts returned from MetaMask.');
         setConnectedWallet(null);
         setUserData(null);
         // walletId remains null, userData remains null
         setIsLoading(false);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        console.log('User rejected MetaMask connection request.');
        alert('You rejected the connection request.');
      } else {
        console.error('Error connecting MetaMask:', error);
        alert(`Error connecting wallet: ${error.message || 'Unknown error'}`);
      }
       console.error('Error connecting MetaMask:', error);
       setConnectedWallet(null);
       setUserData(null);
       // walletId remains null, userData remains null
       setIsLoading(false);
    } 
    // Loading state should be false now either from fetchDataForWallet or error handling

    return { walletId: connectedWalletId, userData: finalUserData }; // <<< Return object

  }, [isMetaMaskInstalled, testMode, fetchDataForWallet]);

  const disconnectWallet = useCallback(() => {
     if (testMode) {
         console.warn("DisconnectWallet called in test mode. No action taken. Use simulated logout.");
         // Potentially clear UserService localStorage here if needed for consistency in test mode
         // UserService.logout(); 
         return;
     }
    console.log('Disconnecting wallet.');
    setConnectedWallet(null);
    setUserData(null);
    setIsLoading(false);
    // Note: Doesn't truly disconnect from MetaMask extension, just clears app state
  }, [testMode]);

  const updateUserData = useCallback((newUserData: UserData | null | undefined) => {
      console.log('WalletContext: Updating user data directly', newUserData);
      setUserData(newUserData);
  }, []);

  const value = {
    connectedWallet,
    userData,
    isLoading,
    isMetaMaskInstalled,
    testMode,
    connectWallet,
    disconnectWallet,
    updateUserData,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = (): WalletContextState => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

// Utility function to get wallet ID (though useWallet hook is preferred in components)
export const getWalletId = (): string | null => {
   const context = useContext(WalletContext); // This won't work outside component render
   // A better approach might involve a separate global variable updated by the context,
   // but direct context usage is cleaner in React components.
   // For simplicity, we'll rely on useWallet().connectedWallet within components.
   console.warn("getWalletId utility function is deprecated. Use useWallet() hook instead.");
   return context?.connectedWallet || null; 
};

// Extend window type for ethereum object (optional but good practice)
declare global {
  interface Window {
    ethereum?: any; // Use a more specific type if available (e.g., from ethers.js)
  }
} 