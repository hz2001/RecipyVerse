
// 钱包服务接口定义
export interface WalletService {
  connectWallet(): Promise<string | null>;
  verifySignature(address: string): Promise<string | null>;
  disconnectWallet(): void;
  isConnected(): boolean;
}

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
      console.error('MetaMask is not installed');
      alert('MetaMask is not installed. Please install MetaMask to use this application.');
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
        localStorage.setItem('walletAddress', address);
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
    document.cookie = 'sessionId=; path=/; max-age=0';
  }
  
  /**
   * 检查钱包是否已连接
   */
  isConnected(): boolean {
    return !!document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
  }
  
  /**
   * 获取当前连接的钱包地址
   */
  getConnectedWalletAddress(): string | null {
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