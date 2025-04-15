import { supabase } from '../utils/supabaseClient'

export interface User {
    id?: string
    username?: string
    walletAddress: string
    bio?: string
}

class UserService {
    // ✅ 将用户写入 Supabase 数据库
    static async registerWithWallet(user: User): Promise<{ success: boolean; user?: User; error?: string }> {
        const { data, error } = await supabase
            .from('users')
            .insert({
                wallet_address: user.walletAddress,
                username: user.username || '',
                bio: user.bio || ''
            })
            .select()
            .single()

        if (error) return { success: false, error: error.message }

        return { success: true, user: { ...user, id: data.id } }
    }

    // ✅ 查询钱包是否已存在
    static async getUserByWallet(wallet: string): Promise<User | null> {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('wallet_address', wallet)
            .single()

        if (error || !data) return null

        return {
            id: data.id,
            username: data.username,
            walletAddress: data.wallet_address,
            bio: data.bio
        }
    }

    // 本地 session（可选）
    static setCurrentUser(user: User) {
        localStorage.setItem('recipeverse_current_user', JSON.stringify(user))
    }

    static getCurrentUser(): User | null {
        const data = localStorage.getItem('recipeverse_current_user')
        return data ? JSON.parse(data) : null
    }

    static logout() {
        localStorage.removeItem('recipeverse_current_user')
    }
}

export default UserService
