import React, { useEffect, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

interface User {
    id: string
    created_at: string
    wallet_address: string
    is_merchant: boolean
}

interface Merchant {
    id: string
    created_at: string
    wallet_address: string
    merchant_name: string
    merchant_address: string
    is_verified: string
}

interface TableInfo {
    name: string;
    rowCount: number;
}

const TestSupabaseConnection: React.FC = () => {
    const [users, setUsers] = useState<User[]>([])
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [tables, setTables] = useState<TableInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking')
    const [activeTab, setActiveTab] = useState<'users' | 'merchants' | 'tables'>('tables')

    // 测试数据库连接
    useEffect(() => {
        const testConnection = async () => {
            try {
                const { data, error } = await supabase.from('users').select('count').limit(1)
                if (error) {
                    console.error('❌ Supabase connection error:', error.message)
                    setConnectionStatus('error')
                    setError(error.message)
                } else {
                    console.log('✅ Supabase connection successful!')
                    setConnectionStatus('success')
                    fetchTables()
                }
            } catch (err) {
                console.error('❌ Unexpected error:', err)
                setConnectionStatus('error')
                setError('Unexpected error during connection test')
            }
        }

        testConnection()
    }, [])

    // 获取数据库表信息
    const fetchTables = async () => {
        try {
            // 获取用户表数据
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('count')

            // 获取商家表数据
            const { data: merchantData, error: merchantError } = await supabase
                .from('merchants')
                .select('count')

            // 获取NFT表数据
            const { data: nftData, error: nftError } = await supabase
                .from('nfts')
                .select('count')

            const tableData: TableInfo[] = [
                { name: 'users', rowCount: userError ? -1 : (userData?.length || 0) },
                { name: 'merchants', rowCount: merchantError ? -1 : (merchantData?.length || 0) },
                { name: 'nfts', rowCount: nftError ? -1 : (nftData?.length || 0) }
            ]

            setTables(tableData)
        } catch (err) {
            console.error('Error fetching table info:', err)
        }
    }

    // 获取用户数据
    const fetchUsers = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Error fetching users:', error.message)
            setError(error.message)
        } else {
            console.log('✅ User data:', data)
            setUsers(data as User[])
            setError(null)
        }

        setLoading(false)
    }

    // 获取商家数据
    const fetchMerchants = async () => {
        setLoading(true)
        const { data, error } = await supabase
            .from('merchants')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Error fetching merchants:', error.message)
            setError(error.message)
        } else {
            console.log('✅ Merchant data:', data)
            setMerchants(data as Merchant[])
            setError(null)
        }

        setLoading(false)
    }

    // 切换标签时加载相应数据
    useEffect(() => {
        if (connectionStatus === 'success') {
            if (activeTab === 'users') {
                fetchUsers()
            } else if (activeTab === 'merchants') {
                fetchMerchants()
            }
        }
    }, [activeTab, connectionStatus])

    // 渲染连接状态
    const renderConnectionStatus = () => {
        if (connectionStatus === 'checking') {
            return <p className="text-blue-500">正在检查数据库连接...</p>
        } else if (connectionStatus === 'success') {
            return <p className="text-green-500">✅ 数据库连接成功!</p>
        } else {
            return <p className="text-red-500">❌ 数据库连接失败: {error}</p>
        }
    }

    // 渲染表信息
    const renderTables = () => {
        return (
            <div className="mt-4">
                <h2 className="text-xl font-bold mb-2">数据库表信息</h2>
                <div className="bg-gray-50 rounded p-4">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="text-left py-2">表名</th>
                                <th className="text-left py-2">行数</th>
                                <th className="text-left py-2">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(table => (
                                <tr key={table.name} className="border-t">
                                    <td className="py-2">{table.name}</td>
                                    <td className="py-2">
                                        {table.rowCount === -1 ? 
                                            <span className="text-red-500">访问错误</span> : 
                                            table.rowCount
                                        }
                                    </td>
                                    <td className="py-2">
                                        {table.name === 'users' && (
                                            <button 
                                                onClick={() => setActiveTab('users')}
                                                className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                            >
                                                查看用户
                                            </button>
                                        )}
                                        {table.name === 'merchants' && (
                                            <button 
                                                onClick={() => setActiveTab('merchants')}
                                                className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                                            >
                                                查看商家
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right">
                    <button 
                        onClick={fetchTables}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                    >
                        刷新表信息
                    </button>
                </div>
            </div>
        )
    }

    // 渲染用户数据
    const renderUsers = () => {
        return (
            <div className="mt-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">用户列表</h2>
                    <button 
                        onClick={() => setActiveTab('tables')}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                    >
                        返回表列表
                    </button>
                </div>

                {loading && <p className="mt-4">加载用户数据中...</p>}
                {error && <p className="mt-4 text-red-500">错误：{error}</p>}

                {!loading && !error && users.length === 0 && (
                    <p className="mt-4">🚫 当前没有任何用户记录。</p>
                )}

                {!loading && !error && users.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full bg-white border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-3 text-left">ID</th>
                                    <th className="py-2 px-3 text-left">钱包地址</th>
                                    <th className="py-2 px-3 text-left">类型</th>
                                    <th className="py-2 px-3 text-left">创建时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-t hover:bg-gray-50">
                                        <td className="py-2 px-3">{user.id}</td>
                                        <td className="py-2 px-3 font-mono text-sm">{user.wallet_address}</td>
                                        <td className="py-2 px-3">
                                            {user.is_merchant ? (
                                                <span className="bg-amber-100 text-amber-800 py-1 px-2 rounded text-xs">
                                                    商家
                                                </span>
                                            ) : (
                                                <span className="bg-blue-100 text-blue-800 py-1 px-2 rounded text-xs">
                                                    普通用户
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 text-sm">
                                            {new Date(user.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-right">
                            <button 
                                onClick={fetchUsers}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                刷新用户数据
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    // 渲染商家数据
    const renderMerchants = () => {
        return (
            <div className="mt-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">商家列表</h2>
                    <button 
                        onClick={() => setActiveTab('tables')}
                        className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                    >
                        返回表列表
                    </button>
                </div>

                {loading && <p className="mt-4">加载商家数据中...</p>}
                {error && <p className="mt-4 text-red-500">错误：{error}</p>}

                {!loading && !error && merchants.length === 0 && (
                    <p className="mt-4">🚫 当前没有任何商家记录。</p>
                )}

                {!loading && !error && merchants.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full bg-white border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="py-2 px-3 text-left">ID</th>
                                    <th className="py-2 px-3 text-left">钱包地址</th>
                                    <th className="py-2 px-3 text-left">商家名称</th>
                                    <th className="py-2 px-3 text-left">商家地址</th>
                                    <th className="py-2 px-3 text-left">验证状态</th>
                                    <th className="py-2 px-3 text-left">创建时间</th>
                                </tr>
                            </thead>
                            <tbody>
                                {merchants.map((merchant) => (
                                    <tr key={merchant.id} className="border-t hover:bg-gray-50">
                                        <td className="py-2 px-3">{merchant.id}</td>
                                        <td className="py-2 px-3 font-mono text-sm">{merchant.wallet_address}</td>
                                        <td className="py-2 px-3">{merchant.merchant_name}</td>
                                        <td className="py-2 px-3">{merchant.merchant_address}</td>
                                        <td className="py-2 px-3">
                                            {merchant.is_verified === 'true' ? (
                                                <span className="bg-green-100 text-green-800 py-1 px-2 rounded text-xs">
                                                    已验证
                                                </span>
                                            ) : merchant.is_verified === 'rejected' ? (
                                                <span className="bg-red-100 text-red-800 py-1 px-2 rounded text-xs">
                                                    已拒绝
                                                </span>
                                            ) : (
                                                <span className="bg-yellow-100 text-yellow-800 py-1 px-2 rounded text-xs">
                                                    未验证
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3 text-sm">
                                            {new Date(merchant.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="mt-4 text-right">
                            <button 
                                onClick={fetchMerchants}
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                刷新商家数据
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Supabase 数据库测试</h1>
            
            {/* 连接状态 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <h2 className="text-lg font-semibold mb-2">数据库连接状态</h2>
                {renderConnectionStatus()}
            </div>
            
            {/* 内容区域 */}
            {connectionStatus === 'success' && (
                <div className="bg-white rounded-lg shadow-md p-4">
                    {activeTab === 'tables' && renderTables()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'merchants' && renderMerchants()}
                </div>
            )}
        </div>
    )
}

export default TestSupabaseConnection 