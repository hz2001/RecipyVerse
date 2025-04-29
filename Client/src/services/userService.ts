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
  async getUserInfo(): Promise<User | null> {
    // 如果有缓存直接返回
    if (this.userCache) {
      return this.userCache;
    }
    
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      const response = await axiosInstance.get(`/api/user/get_info?sessionId=${sessionId}`);
      if (response.status === 200) {
        this.userCache = response.data;
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
    return null;
  }

}

// 单例模式
const userService = new UserServiceImpl();
export default userService; 