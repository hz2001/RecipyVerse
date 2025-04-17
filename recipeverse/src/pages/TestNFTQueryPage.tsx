import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

interface Nft {
    token_id: number;
    owner_address: string;
    merchant_id: string;
    metadata_url: string;
    trade_not: boolean;
    created_at: string;
    expires_at: string;
}

const TestNFTQueryPage: React.FC = () => {
    const [nfts, setNfts] = useState<Nft[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNfts = async () => {
            setLoading(true);
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
            }

            setLoading(false);
        };

        fetchNfts();
    }, []);

    return (
        <div style={{ padding: 20 }}>
            <h1>NFT 查询测试</h1>

            {loading && <p>加载中...</p>}
            {error && <p style={{ color: 'red' }}>错误: {error}</p>}

            {!loading && !error && nfts.length === 0 && (
                <p>当前没有任何NFT记录。</p>
            )}

            {!loading && !error && nfts.length > 0 && (
                <div>
                    <h2>NFT列表：</h2>
                    <ul>
                        {nfts.map((nft) => (
                            <li key={nft.token_id}>
                                <b>Token ID: {nft.token_id}</b><br />
                                所有者: {nft.owner_address}<br />
                                商家ID: {nft.merchant_id}<br />
                                元数据URL: {nft.metadata_url}<br />
                                可交易: {nft.trade_not ? '否' : '是'}<br />
                                创建时间: {new Date(nft.created_at).toLocaleString()}<br />
                                过期时间: {new Date(nft.expires_at).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default TestNFTQueryPage; 