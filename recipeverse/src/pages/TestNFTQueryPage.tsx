import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface Nft {
    token_id: string;
    created_at: string;
    owner_address: string;
    creator_address: string;
    swapping: boolean;
    expires_at: string;
    detail: any; // JSON格式，可能包含名称、描述等
}

const TestNFTQueryPage: React.FC = () => {
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
    const [detailsVisible, setDetailsVisible] = useState<{[key: string]: boolean}>({});

    useEffect(() => {
        fetchNfts();
    }, []);

    const fetchNfts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('nfts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching NFTs:', error.message);
                setError(error.message);
            } else {
                console.log('Fetched NFTs:', data);
                setNfts(data as Nft[]);
                setError(null);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const toggleDetails = (id: string) => {
        setDetailsVisible(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const updateSwappingStatus = async (tokenId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('nfts')
                .update({ swapping: !currentStatus })
                .eq('token_id', tokenId);
                
            if (error) {
                alert(`Error updating NFT status: ${error.message}`);
                return;
            }
            
            // 刷新NFT列表
            fetchNfts();
        } catch (err) {
            console.error('Error updating NFT:', err);
            alert('An unexpected error occurred while updating the NFT');
        }
    };

    const formatJsonDisplay = (json: any) => {
        if (!json) return 'No detail data';
        
        try {
            const detailObj = typeof json === 'string' ? JSON.parse(json) : json;
            return (
                <div className="bg-gray-50 p-2 rounded font-mono text-xs whitespace-pre">
                    {JSON.stringify(detailObj, null, 2)}
                </div>
            );
        } catch (e) {
            return <div className="text-red-500">Invalid JSON: {String(json)}</div>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">NFT 数据测试</h1>
                <button 
                    onClick={fetchNfts}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    刷新数据
                </button>
            </div>

            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载NFT数据中...</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                    <p className="font-bold">错误</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && nfts.length === 0 && (
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <p className="text-gray-600 text-lg">当前没有任何NFT记录</p>
                </div>
            )}

            {!loading && !error && nfts.length > 0 && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Token ID
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    拥有者
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    创建者
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    交换状态
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    过期时间
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {nfts.map((nft) => (
                                <React.Fragment key={nft.token_id}>
                                    <tr className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{nft.token_id}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(nft.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-mono truncate max-w-[150px]">
                                                {nft.owner_address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-mono truncate max-w-[150px]">
                                                {nft.creator_address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                nft.swapping 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {nft.swapping ? '交换中' : '未交换'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {nft.expires_at 
                                                ? new Date(nft.expires_at).toLocaleDateString() 
                                                : '无过期时间'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                onClick={() => toggleDetails(nft.token_id)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                {detailsVisible[nft.token_id] ? '隐藏详情' : '查看详情'}
                                            </button>
                                            <button
                                                onClick={() => updateSwappingStatus(nft.token_id, nft.swapping)}
                                                className={`${
                                                    nft.swapping 
                                                        ? 'text-yellow-600 hover:text-yellow-900' 
                                                        : 'text-green-600 hover:text-green-900'
                                                }`}
                                            >
                                                {nft.swapping ? '取消交换' : '标记为交换'}
                                            </button>
                                        </td>
                                    </tr>
                                    {detailsVisible[nft.token_id] && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    <h4 className="font-semibold mb-2">详情:</h4>
                                                    {formatJsonDisplay(nft.detail)}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TestNFTQueryPage; 