import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import walletService from '../services/walletService';

interface WalletContextType {
  connectedWallet: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  connectedWallet: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  // 检查本地存储中的钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      const isConnected = walletService.isConnected();
      if (isConnected) {
        const address = localStorage.getItem('walletAddress');
        setConnectedWallet(address);
      }
    };

    checkWalletConnection();
  }, []);

  // 连接钱包
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // 连接钱包
      const address = await walletService.connectWallet();
      if (!address) {
        throw new Error('Failed to connect wallet');
      }
      
      // 验证签名
      const sessionId = await walletService.verifySignature(address);
      if (!sessionId) {
        throw new Error('Failed to verify signature');
      }
      
      setConnectedWallet(address);
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
  };

  return (
    <WalletContext.Provider value={{
      connectedWallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext; 