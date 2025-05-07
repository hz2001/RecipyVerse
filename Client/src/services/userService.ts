import axiosInstance from './api';
import walletService from './walletService';
// 用户角色枚举
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MERCHANT = "merchant"
}

// 用户信息接口
export interface User {
  session_id: string;
  wallet_address: string;
  created_at: string;
  user_id: string;
  role: UserRole;
  isverified: boolean;
  NFThold: string[];
  NFTcreated: string[];
}



/**
 * 用户服务接口
 */
export interface UserService {
  getUserInfo(): Promise<User | null>;
  getRole(): UserRole | null;
}

/**
 * 用户服务实现
 */
class UserServiceImpl implements UserService {
  // 缓存用户信息
  private userCache: User | null = null;
  
  /**
   * 获取用户信息 从User表中获取
   * @returns 用户信息或null
   */
  async getUserInfo(counter: number = 0): Promise<User | null> {

    if (counter > 3) {
      return null;
    }

    const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
    // 如果有缓存直接返回
    if (this.userCache && this.userCache.session_id === sessionId) {
      return this.userCache;
    } 
    
    try {
      const response = await axiosInstance.get(`/api/user/get_info`);
      if (response.status === 200) {
        this.userCache = response.data;
        this.userCache.session_id = sessionId;
      } else if (response.status === 401) {
        walletService.connectWallet();
        await this.getUserInfo(counter + 1);
      }
      
      return this.userCache;
    } catch (error) {
      console.error('Failed to get user info:', error);
      return null;
    }
  }
  
  /**
   * 获取用户角色
   */
  getRole(): UserRole | null {
    if (this.userCache) {
      return this.userCache.role;
    }
    if (document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1] != null) {
      this.getUserInfo().then(user => {
        console.log("getRole", user);
        return user?.role;
      });
    }
    return null;
  }

  getIsVerified(): boolean {
    if (this.userCache) {
      return this.userCache.isverified;
    }
    return false;
  }
  


}

// 单例模式
const userService = new UserServiceImpl();
export default userService; 