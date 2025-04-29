import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import walletService from '../services/walletService';
import userService, { UserRole } from '../services/userService';
import { UserData, fetchUserDataByWallet } from '../data/userDataService';
import { merchantService } from '@/services';

interface WalletContextType {
  connectedWallet: string | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  userRole: UserRole | null;
  isAdmin: boolean;
  isMerchant: boolean;
  isVerifiedMerchant: boolean;
  userData: UserData | null;
  updateUserData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  connectedWallet: null,
  isConnecting: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  userRole: null,
  isAdmin: false,
  isMerchant: false,
  isVerifiedMerchant: false,
  userData: null,
  updateUserData: async () => {}
});

export const useWallet = () => useContext(WalletContext);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isVerifiedMerchant, setIsVerifiedMerchant] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  // 检查本地存储中的钱包连接状态
  useEffect(() => {
    const checkWalletConnection = async () => {
      const isConnected = walletService.isConnected();
      if (isConnected) {
        const address = localStorage.getItem('walletAddress');
        setConnectedWallet(address);
        
        // 获取用户信息和角色
        const userInfo = await userService.getUserInfo();
        if (userInfo) {
          setUserRole(userInfo.role);
        } else {
          // 如果无法获取用户信息，尝试从 localStorage 获取角色
          const storedRole = localStorage.getItem('userRole');
          if (storedRole) {
            setUserRole(storedRole as UserRole);
          }
        }

        // 如果是商家，检查验证状态
        if (userInfo?.role === UserRole.MERCHANT || localStorage.getItem('isMerchant') === 'true') {
          const merchantInfo = await merchantService.getMerchantInfo();
          setIsVerifiedMerchant(merchantInfo?.is_verified || false);
        }

        // 获取用户数据
        if (address) {
          const userData = await userService.getUserInfo();
          if (userData) {
            setUserData({
              userWalletID: userData.wallet_address,
              NFThold: [],
              NFTcreated: [],
              isMerchant: userData.role === UserRole.MERCHANT,
              isverified: false
            });
          }
        }
      }
    };

    checkWalletConnection();
  }, []);

  // 更新用户数据
  const updateUserData = async () => {
    if (connectedWallet) {
      const userData = await userService.getUserInfo();
      if (userData) {
        setUserData({
          userWalletID: userData.wallet_address,
          NFThold: [],
          NFTcreated: [],
          isMerchant: userData.role === UserRole.MERCHANT,
          isverified: false
        });
      }
    }
  };

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
    setUserRole(null);
    setIsVerifiedMerchant(false);
    setUserData(null);
  };

  return (
    <WalletContext.Provider value={{
      connectedWallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
      userRole,
      isAdmin: userRole === UserRole.ADMIN,
      isMerchant: userRole === UserRole.MERCHANT,
      isVerifiedMerchant,
      userData,
      updateUserData
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export default WalletContext; 