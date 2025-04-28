import axiosInstance from './api';

// 用户角色枚举
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MERCHANT = "merchant"
}

// 用户信息接口
export interface User {
  wallet_address: string;
  created_at: string;
  user_id: string;
  role: UserRole;
}

// 商家信息接口
export interface Merchant {
  id: string;
  created_at: string;
  wallet_address: string;
  is_verified: boolean;
  merchant_name: string;
  merchant_address: string;
}

/**
 * 用户服务接口
 */
export interface UserService {
  getUserInfo(): Promise<User | null>;
  getMerchantInfo(): Promise<Merchant | null>;
  checkIsConnected(): boolean;
  getRole(): UserRole | null;
}

/**
 * 用户服务实现
 */
class UserServiceImpl implements UserService {
  // 缓存用户信息
  private userCache: User | null = null;
  // 缓存商家信息
  private merchantCache: Merchant | null = null;
  
  /**
   * 获取用户信息
   * @returns 用户信息或null
   */
  async getUserInfo(): Promise<User | null> {
    // 如果有缓存直接返回
    if (this.userCache) {
      return this.userCache;
    }
    
    try {
      // 这里需要后端提供一个用户信息接口
      // 目前后端似乎缺少这个API，我们需要请求后端开发者添加
      // 暂时从localStorage中获取walletAddress
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        return null;
      }
      
      // 模拟从API获取用户信息
      // 实际应该使用以下代码：
      // const response = await axiosInstance.get('/user/info');
      // this.userCache = response.data;
      
      // 临时模拟用户数据
      this.userCache = {
        wallet_address: walletAddress,
        created_at: new Date().toISOString(),
        user_id: Math.random().toString(36).substring(2, 15),
        role: UserRole.USER
      };
      
      return this.userCache;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }
  
  /**
   * 获取商家信息
   * @returns 商家信息或null
   */
  async getMerchantInfo(): Promise<Merchant | null> {
    // 如果有缓存直接返回
    if (this.merchantCache) {
      return this.merchantCache;
    }
    
    try {
      // 这里需要后端提供一个商家信息接口
      // 目前后端似乎缺少这个API，我们需要请求后端开发者添加
      // 暂时从localStorage中获取walletAddress
      const walletAddress = localStorage.getItem('walletAddress');
      if (!walletAddress) {
        return null;
      }
      
      // 模拟从API获取商家信息
      // 实际应该使用以下代码：
      // const response = await axiosInstance.get('/merchant/info');
      // this.merchantCache = response.data;
      
      // 临时模拟商家数据
      this.merchantCache = {
        id: Math.random().toString(36).substring(2, 15),
        created_at: new Date().toISOString(),
        wallet_address: walletAddress,
        is_verified: false,
        merchant_name: "模拟商家",
        merchant_address: "模拟地址"
      };
      
      return this.merchantCache;
    } catch (error) {
      console.error('Failed to get merchant info:', error);
      return null;
    }
  }
  
  /**
   * 检查用户是否已连接
   */
  checkIsConnected(): boolean {
    return !!localStorage.getItem('sessionId') && !!localStorage.getItem('walletAddress');
  }
  
  /**
   * 获取用户角色
   */
  getRole(): UserRole | null {
    if (this.userCache) {
      return this.userCache.role;
    }
    return null;
  }
}

// 单例模式
const userService = new UserServiceImpl();
export default userService; 