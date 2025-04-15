import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { UserData, fetchUserDataByWallet } from '../data/dummyUserData';
import { testMode } from '../test/testConfig'; // Import from config file

// --- Configuration ---
// testMode is now imported from ../test/testConfig.ts
// const testMode = true; // Removed local definition
// --- End Configuration ---

interface WalletContextState {
  connectedWallet: string | null;
  userData: UserData | null | undefined; // null: initial, undefined: not found after fetch
  isLoading: boolean;
  isMetaMaskInstalled: boolean;
  testMode: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
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


  const fetchDataForWallet = useCallback(async (walletId: string) => {
    if (!walletId) return;
    setIsLoading(true);
    setUserData(null); // Reset user data while fetching
    console.log(`Fetching data for wallet: ${walletId}`);
    // Simulate API call delay even for dummy data
    await new Promise(resolve => setTimeout(resolve, 300)); 
    try {
      const data = fetchUserDataByWallet(walletId); // Use existing dummy data fetcher
      setUserData(data); // Will be UserData or undefined
      console.log("Fetched user data:", data);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(undefined); // Indicate fetch error/not found
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectWallet = useCallback(async () => {
     if (testMode) {
         console.warn("ConnectWallet called in test mode. No action taken. Use simulated login.");
         return;
     }
    if (!isMetaMaskInstalled) {
      alert('MetaMask is not installed. Please install it to connect your wallet.');
      console.error('MetaMask not installed.');
      return;
    }

    setIsLoading(true);
    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' }) as string[];
      
      if (accounts && accounts.length > 0) {
        const walletId = accounts[0];
        console.log('MetaMask connected:', walletId);
        setConnectedWallet(walletId);
        // Fetch associated user data after connecting
        await fetchDataForWallet(walletId); 
      } else {
         console.warn('No accounts returned from MetaMask.');
         setConnectedWallet(null);
         setUserData(null);
      }
    } catch (error: any) {
      if (error.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('User rejected MetaMask connection request.');
        alert('You rejected the connection request.');
      } else {
        console.error('Error connecting MetaMask:', error);
        alert(`Error connecting wallet: ${error.message || 'Unknown error'}`);
      }
       setConnectedWallet(null);
       setUserData(null);
    } finally {
       // Loading state is handled within fetchDataForWallet if called
       // If connection failed before fetch, set loading false here
       if (!connectedWallet) setIsLoading(false);
    }
  }, [isMetaMaskInstalled, testMode, fetchDataForWallet, connectedWallet]); // Added connectedWallet dependency

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

  const value = {
    connectedWallet,
    userData,
    isLoading,
    isMetaMaskInstalled,
    testMode,
    connectWallet,
    disconnectWallet,
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