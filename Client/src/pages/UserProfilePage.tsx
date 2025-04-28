import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import userService, { UserRole, User } from '../services/userService';
import NftCard from '../components/NftCard';
import nftService, { NFT } from '../services/nftService';
import { UserData } from '../data/userDataService';

// NFT卡片适配器
const adaptNftForCard = (nft: NFT): any => ({
  ...nft,
  coupon_name: nft.coupon_name || nft.name || 'Unnamed NFT'
});

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedWallet, userRole, updateUserData, userData, connectWallet } = useWallet();
  
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // NFT数据
  const [nfts, setNfts] = useState<NFT[]>([]);
  
  // NFT详情模态框
  const [showNftDetailModal, setShowNftDetailModal] = useState(false);
  const [selectedNftForDetail, setSelectedNftForDetail] = useState<NFT | null>(null);

  // 检查是否已登录
  useEffect(() => {
    if (!connectedWallet) {
      navigate('/profile');
    } else {
      // 检查用户角色是否是商家
      if (localStorage.getItem('isMerchant') === 'true') {
        navigate('/merchant_profile');
      }
    }
  }, [connectedWallet, navigate]);

  // 加载用户数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (connectedWallet) {
          await updateUserData();
          
          // 从userService获取用户信息，避免类型不匹配
          const user = await userService.getUserInfo();
          if (user) {
            setUserInfo(user);
          }
          
          // 获取NFT数据
          await fetchNfts(connectedWallet);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again later.');
        setIsLoading(false);
        // 3秒后重定向到首页
        setTimeout(() => navigate('/'), 3000);
      }
    };
    
    fetchData();
  }, [connectedWallet, updateUserData, userData, navigate]);

  // 获取用户拥有的NFT
  const fetchNfts = async (address: string) => {
    if (!address) return;
    
    try {
      console.log('获取用户拥有的NFT，钱包地址:', address);
      
      // 使用nftService获取用户拥有的NFT
      const ownedNfts = await nftService.getUserOwnedNFTs(address);
      console.log('获取到用户拥有的NFT:', ownedNfts);
      // 确保nfts始终是一个数组
      setNfts(Array.isArray(ownedNfts) ? ownedNfts : []);
    } catch (err) {
      console.error('获取NFT失败:', err);
      setError('Failed to load your NFTs. Please try again later.');
      // 发生错误时设置为空数组
      setNfts([]);
    }
  };

  // 处理NFT详情模态框
  const handleOpenNftDetail = async (nft: NFT) => {
    try {
      // 获取完整的NFT详情
      if (nft.id) {
        const nftDetails = await nftService.getNFTDetails(nft.id);
        if (nftDetails) {
          setSelectedNftForDetail(nftDetails);
        } else {
          // 如果无法获取详情，使用当前NFT数据
          setSelectedNftForDetail(nft);
        }
      } else {
        setSelectedNftForDetail(nft);
      }
      
      setShowNftDetailModal(true);
    } catch (err) {
      console.error('获取NFT详情失败:', err);
      // 即使失败也显示当前信息
      setSelectedNftForDetail(nft);
      setShowNftDetailModal(true);
    }
  };
  
  // 关闭NFT详情模态框
  const handleCloseNftDetail = () => {
    setShowNftDetailModal(false);
    setSelectedNftForDetail(null);
  };

  // 申请成为商家
  const handleApplyForMerchant = () => {
    navigate('/profile');
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow mt-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Good Morning, Customer</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      
      {/* 用户基本信息 */}
      <div className="mb-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Account Type</p>
              <p>{userRole === UserRole.ADMIN ? 'Administrator' : 'User'}</p>
            </div>
            {userInfo && (
              <div>
                <p className="text-sm font-medium text-gray-500">Joined</p>
                <p>{new Date(userInfo.created_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* NFT 统计信息 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your NFTs</h2>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-600 mb-2">Owned NFTs</h3>
          <p className="text-3xl font-bold text-amber-600">{nfts.length || userData?.NFThold?.length || 0}</p>
        </div>
      </div>
      
      
      
      {/* 用户的NFT信息 - 拥有的NFT */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Owned NFTs</h2>
        {nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {nfts.map((nft, index) => (
              <div key={index} className="relative">
                <NftCard 
                  nft={adaptNftForCard(nft)} 
                  onClick={() => handleOpenNftDetail(nft)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-600">You don't own any recipe NFTs yet.</p>
            <Link
              to="/swap-market"
              className="mt-4 inline-block px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
            >
              Explore Swap Market
            </Link>
          </div>
        )}
      </div>
      
      {/* NFT详情模态框 */}
      {showNftDetailModal && selectedNftForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 max-w-xl w-11/12 max-h-[90vh] overflow-y-auto">
            {/* 上方图片区域 */}
            <div className="w-full h-64 bg-gray-200 relative">
              <img
                src={selectedNftForDetail.coupon_image 
                  ? `/images/${selectedNftForDetail.coupon_image}` 
                  : selectedNftForDetail.imageUrl || '/placeholder-images/nft-default.jpg'}
                alt={selectedNftForDetail.coupon_name || selectedNftForDetail.name || 'NFT'}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={handleCloseNftDetail}
                className="absolute top-3 right-3 bg-white bg-opacity-70 text-gray-700 rounded-full p-1 hover:bg-opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 下方详情区域 */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {selectedNftForDetail.coupon_name || selectedNftForDetail.name || 'NFT'}
              </h2>
              
              <div className="mb-4 flex items-center">
                <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 text-xs font-semibold rounded">
                  {selectedNftForDetail.coupon_type || 'NFT'}
                </span>
                {selectedNftForDetail.creator_address && (
                  <span className="ml-2 text-sm text-gray-500">
                    Created by {selectedNftForDetail.creator_address?.substring(0, 6)}...{selectedNftForDetail.creator_address?.substring(38) || ''}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Merchant</h3>
                    <p className="text-gray-800">
                      {selectedNftForDetail.details?.merchantName || 
                       selectedNftForDetail.merchantName || 
                       'Unknown Merchant'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Expiration Date</h3>
                    <p className="text-gray-800">
                      {selectedNftForDetail.expires_at 
                        ? new Date(selectedNftForDetail.expires_at).toLocaleDateString() 
                        : selectedNftForDetail.expirationDate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Token ID</h3>
                    <p className="text-gray-800">{selectedNftForDetail.token_id || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Supply</h3>
                    <p className="text-gray-800">{selectedNftForDetail.total_supply || 1}</p>
                  </div>
                </div>
              </div>
              
              {/* 描述部分 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">
                  {selectedNftForDetail.details?.description || 
                   selectedNftForDetail.description || 
                   'No description available.'}
                </p>
              </div>
              
              {/* 操作按钮 */}
              <div className="flex justify-end space-x-3">
                <Link 
                  to="/swap-market" 
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                >
                  Swap Market
                </Link>
                <button
                  onClick={handleCloseNftDetail}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 申请成为商家 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Become a Merchant</h2>
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-gray-600 mb-4">
            As a merchant, you can create and sell recipe NFTs, build your culinary brand, 
            and reach a global audience of food enthusiasts.
          </p>
          <button
            onClick={handleApplyForMerchant}
            className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
          >
            Apply for Merchant Account
          </button>
        </div>
      </div>

      {/* 钱包信息 */}
      <div className="mb-8 p-4 bg-gray-100 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-grow">
          <p className="text-sm text-gray-600 font-medium">Connected Wallet:</p>
          <p className="text-md text-gray-900 font-mono break-all" title={connectedWallet}>{connectedWallet}</p>
        </div>
        <button 
          onClick={() => connectWallet()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Disconnect
        </button>
      </div>


    </div>
  );
};

export default UserProfilePage; 