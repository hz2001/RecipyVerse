import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { UserData, fetchUserDataByWallet } from '../data/dummyUserData';
import { testMode } from '../test/testConfig'; // Import from config file
import { supabase } from '../utils/supabaseClient';

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
    const checkMetaMask = () => {
      if (typeof window.ethereum !== 'undefined') {
        setIsMetaMaskInstalled(true);
        console.log('MetaMask detected');
        return true;
      } else {
        console.log('MetaMask not detected in first check');
        return false;
      }
    };

    // 第一次检查
    const firstCheck = checkMetaMask();
    
    // 如果第一次检查失败，延迟再检查几次
    if (!firstCheck) {
      const retryTimes = 3;
      let currentRetry = 0;
      
      const retryCheck = setInterval(() => {
        currentRetry++;
        console.log(`Retrying MetaMask detection (${currentRetry}/${retryTimes})...`);
        
        if (checkMetaMask() || currentRetry >= retryTimes) {
          clearInterval(retryCheck);
        }
      }, 500); // 每500ms检查一次
      
      return () => clearInterval(retryCheck);
    }
  }, []);



  const fetchDataForWallet = useCallback(async (walletId: string): Promise<UserData | undefined> => {
    if (!walletId) return undefined;
    setIsLoading(true);
    setUserData(null); // Reset user data while fetching
    console.log(`Fetching data for wallet: ${walletId}`);
    
    let data: UserData | undefined = undefined;
    
    try {
      // First check if this is a merchant
      const { data: merchantData, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('wallet_address', walletId)
        .single();
      
      if (merchantData && !merchantError) {
        console.log("Found merchant data:", merchantData);
        
        // Get NFTs created by this merchant
        const { data: createdNfts, error: nftError } = await supabase
          .from('nfts')
          .select('token_id')
          .eq('creator_address', walletId);
          
        // Convert to app schema
        data = {
          userWalletID: merchantData.wallet_address,
          merchantName: merchantData.merchant_name,
          merchantAddress: merchantData.merchant_address,
          isMerchant: true,
          isverified: merchantData.is_verified === "true", // Convert from string to boolean
          NFThold: [], // Will be populated below if any
          NFTcreated: createdNfts?.map(nft => nft.token_id) || []
        };
      } else {
        // Not a merchant, check if it's a regular user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('wallet_address', walletId)
          .single();
          
        if (userData && !userError) {
          console.log("Found user data:", userData);
          
          // Get NFTs held by this user
          const { data: heldNfts, error: nftError } = await supabase
            .from('nfts')
            .select('token_id')
            .eq('owner_address', walletId);
            
          // Convert to app schema
          data = {
            userWalletID: userData.wallet_address,
            isMerchant: false,
            isverified: false, // Regular users don't need verification
            NFThold: heldNfts?.map(nft => nft.token_id) || [],
            NFTcreated: [] // Regular users don't create NFTs in this model
          };
        } else {
          // Neither merchant nor user found
          console.log("No user or merchant found for wallet:", walletId);
          data = undefined;
        }
      }
      
      // If we found merchant data, also check for NFTs they might hold
      if (data?.isMerchant) {
        const { data: heldNfts, error: nftError } = await supabase
          .from('nfts')
          .select('token_id')
          .eq('owner_address', walletId);
          
        if (heldNfts && !nftError) {
          data.NFThold = heldNfts.map(nft => nft.token_id);
        }
      }
      
      setUserData(data); // Update context state
      console.log("Final processed user data:", data);
      
    } catch (error) {
      console.error("Error fetching user data from database:", error);
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
    
    // 直接检查MetaMask是否可用，而不仅依赖isMetaMaskInstalled状态
    if (typeof window.ethereum === 'undefined') {
      console.error('MetaMask not installed or not detected at connection time.');
      alert('未检测到MetaMask。请确保已安装MetaMask浏览器扩展并刷新页面。');
      return { walletId: null, userData: undefined };
    }
    
    // 更新状态，确保后续操作正常
    setIsMetaMaskInstalled(true);

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
        
        // Try to fetch existing user/merchant data
        finalUserData = await fetchDataForWallet(walletId);
        
        // If no user/merchant record exists, create a new user record
        if (!finalUserData) {
          console.log('No existing user found for wallet, creating new user record');
          
          try {
            // Insert a new user record
            const { data: newUser, error } = await supabase
              .from('users')
              .insert([{ 
                wallet_address: walletId,
                is_merchant: false,
                created_at: new Date().toISOString()
              }])
              .select();
              
            if (error) {
              console.error('Error creating new user record:', error);
            } else if (newUser && newUser.length > 0) {
              console.log('Created new user record:', newUser[0]);
              
              // Convert to app schema and update context
              finalUserData = {
                userWalletID: newUser[0].wallet_address,
                isMerchant: false,
                isverified: false,
                NFThold: [],
                NFTcreated: []
              };
              
              setUserData(finalUserData);
            }
          } catch (err) {
            console.error('Unexpected error creating user record:', err);
          }
        }
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
  }, [fetchDataForWallet, isMetaMaskInstalled, testMode]);

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