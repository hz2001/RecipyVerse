import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import walletService from '../services/walletService';

interface WalletContextType {
  connectedWallet: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  sessionId: string | null;
}

export const WalletContext = createContext<WalletContextType>({
  connectedWallet: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  sessionId: null,
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  // 检查本地存储中的钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      const address = await walletService.getConnectedWalletAddress();
      const sessionId = await walletService.getSessionId();
      if (address && sessionId) {
        setConnectedWallet(address);
        setSessionId(sessionId);
      }
    };

    checkWalletConnection();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const address = await walletService.connectWallet();
      
      setConnectedWallet(address);
      const sessionId = await walletService.getSessionId();
      setSessionId(sessionId);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    walletService.disconnectWallet();
    setConnectedWallet(null);
    setSessionId(null);
  };

  return (
    <WalletContext.Provider value={{
      connectedWallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
      sessionId,
    }}>
      {children}
    </WalletContext.Provider>
  );
}; 