import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

interface User {
    id: string
    created_at: string
    wallet_address: string
    is_merchant: boolean
}

const TestSupabaseConnection: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('❌ Supabase error:', error.message)
                setError(error.message)
            } else {
                console.log('✅ Supabase data:', data)
                setUsers(data as User[])
            }

            setLoading(false)
        }

        fetchUsers()
    }, [])

    return (
        <div style={{ padding: 20 }}>
            <h1>Supabase 连接测试</h1>

            {loading && <p>加载中...</p>}
            {error && <p style={{ color: 'red' }}>出错：{error}</p>}

            {!loading && !error && users.length === 0 && (
                <p>🚫 当前没有任何用户记录。</p>
            )}

            {!loading && !error && users.length > 0 && (
                <div>
                    <h2>用户列表：</h2>
                    <ul>
                        {users.map((user) => (
                            <li key={user.id}>
                                🧾 <b>{user.wallet_address}</b>（
                                {user.is_merchant ? '商家 ✅' : '普通用户 👤'}）
                                <br />
                                🕒 注册时间：{new Date(user.created_at).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default TestSupabaseConnection

