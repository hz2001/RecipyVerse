import { supabase } from '../utils/supabaseClient'

export interface User {
  id: string
  wallet_address: string
  is_merchant: boolean
  created_at: string
}

const USER_STORAGE_KEY = 'currentUser'

const UserService = {
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()
    return error ? null : data
  },

  async registerWithWallet(walletAddress: string, isMerchant: boolean): Promise<User | null> {
    const { data, error } = await supabase
        .from('users')
        .insert([{ wallet_address: walletAddress, is_merchant: isMerchant }])
        .select()
        .single()
    return error ? null : data
  },

  // 懒注册: 仅在用户首次获取或创建NFT时保存用户数据
  async saveUserForNFT(walletAddress: string, isMerchant: boolean = false): Promise<User | null> {
    // 首先检查用户是否已存在
    const existingUser = await this.getUserByWallet(walletAddress)
    if (existingUser) {
      return existingUser
    }
    
    // 用户不存在，注册新用户
    return this.registerWithWallet(walletAddress, isMerchant)
  },

  setCurrentUser(user: User) {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(USER_STORAGE_KEY)
    return data ? JSON.parse(data) : null
  },

  logout() {
    localStorage.removeItem(USER_STORAGE_KEY)
  }
}

export default UserService 