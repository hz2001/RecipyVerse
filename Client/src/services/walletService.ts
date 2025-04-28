import { BrowserProvider, JsonRpcSigner, Wallet, verifyMessage } from 'ethers';
import axiosInstance, { ApiError } from './api';

// 钱包服务接口定义
export interface WalletService {
  connectWallet(): Promise<string | null>;
  verifySignature(address: string): Promise<string | null>;
  disconnectWallet(): void;
  isConnected(): boolean;
}

/**
 * 获取MetaMask提供的以太坊提供者和签名者
 */
const getEthereumProvider = async (): Promise<{ provider: BrowserProvider, signer: JsonRpcSigner } | null> => {
  try {
    // 检查是否安装了MetaMask
    if (typeof window.ethereum === 'undefined') {
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install MetaMask to use this application.');
      return null;
    }

    // 创建提供者和签名者
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return { provider, signer };
  } catch (error) {
    console.error('Failed to get ethereum provider:', error);
    return null;
  }
};

/**
 * 钱包服务实现
 * 提供连接钱包、验证签名和断开连接的方法
 */
class WalletServiceImpl implements WalletService {
  
  /**
   * 连接MetaMask钱包
   * @returns 连接的钱包地址或null
   */
  async connectWallet(): Promise<string | null> {
    if (!window.ethereum) {
      alert("You need MetaMask to use this app.");
      return null;
    }

    try {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        return accounts[0];
    } catch (error) {
        console.error("Connection ERROR:", error);
        return null;
    }
  }
  
  /**
   * 验证钱包签名
   * @param address 钱包地址
   * @returns 成功时返回会话ID，失败时返回null
   */
  async verifySignature(address: string): Promise<string | null> {
    const res = await fetch(`/api/wallet/get_verify_message?address=${address}`)
    const message = await res.text();

    const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [address, message],
    });

    try {
      const result = await fetch("/api/wallet/verify_signature", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                sign: signature,
                account: address
            })
        });
        const sessionId = await result.text();
        document.cookie = `sessionId=${sessionId}; path=/; max-age=3600`;
        return sessionId;
    }catch (e) {
        console.log(e);
        return null;
    }
  }
  
  /**
   * 断开钱包连接
   */
  disconnectWallet(): void {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('sessionId');
  }
  
  /**
   * 检查钱包是否已连接
   */
  isConnected(): boolean {
    return !!localStorage.getItem('sessionId') && !!localStorage.getItem('walletAddress');
  }
  
  /**
   * 获取当前连接的钱包地址
   */
  getConnectedAddress(): string | null {
    return localStorage.getItem('walletAddress');
  }
}

// 单例模式
const walletService = new WalletServiceImpl();
export default walletService;

// 为TypeScript声明全局Window类型，添加ethereum属性
declare global {
  interface Window {
    ethereum: any;
  }
} 