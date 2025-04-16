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
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const testAddress = '0x14fcd7555e1042260e05b43240f63c7ab1f77f2a';

        const fetchTestNfts = async () => {
            const { data, error } = await supabase
                .from('nfts')
                .select('*')
                .eq('owner_address', testAddress); // 或用 .ilike() 忽略大小写

            if (error) {
                setError(error.message);
            } else {
                setNfts(data);
            }
            setLoading(false);
        };

        fetchTestNfts();
    }, []);

    if (loading) return <p className="p-4">Loading...</p>;
    if (error) return <p className="p-4 text-red-500">Error: {error}</p>;

    return (
        <div className="min-h-screen p-6 bg-gray-100">
            <h1 className="text-2xl font-bold mb-4">Test NFT Query (owner = 0x14fcd...)</h1>
            {nfts.length > 0 ? (
                <ul className="space-y-4">
                    {nfts.map((nft) => (
                        <li
                            key={nft.token_id}
                            className="p-4 bg-white rounded shadow border"
                        >
                            <p><strong>Token ID:</strong> {nft.token_id}</p>
                            <p><strong>Owner:</strong> {nft.owner_address}</p>
                            <p><strong>Merchant ID:</strong> {nft.merchant_id}</p>
                            <p><strong>Metadata URL:</strong> {nft.metadata_url}</p>
                            <p><strong>Tradeable:</strong> {nft.trade_not ? 'Yes' : 'No'}</p>
                            <p><strong>Created At:</strong> {nft.created_at}</p>
                            <p><strong>Expires At:</strong> {nft.expires_at}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">No NFTs found for the specified owner address.</p>
            )}
        </div>
    );
};

export default TestNFTQueryPage;
