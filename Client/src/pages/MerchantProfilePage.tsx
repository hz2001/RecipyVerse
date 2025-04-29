import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import userService, { UserRole, User } from '../services/userService';
import merchantService, { Merchant } from '../services/merchantService';
import NftTypeSelectionModal from '../components/NftTypeSelectionModal';
import NftCard from '../components/NftCard';
import nftService, { NFT } from '../services/nftService';
import MerchantVerificationInputModal from '../components/MerchantVerificationInputModal';



// NFT卡片适配器
const adaptNftForCard = (nft: NFT): any => ({
  ...nft,
  coupon_name: nft.coupon_name || nft.name || 'Unnamed NFT'
});

const MerchantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedWallet, userRole, updateUserData, userData, connectWallet } = useWallet();
  
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<Merchant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // NFT数据
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [createdNfts, setCreatedNfts] = useState<NFT[]>([]);
  
  // NFT类型选择模态框
  const [isNftTypeModalOpen, setIsNftTypeModalOpen] = useState(false);
  
  // NFT详情模态框
  const [showNftDetailModal, setShowNftDetailModal] = useState(false);
  const [selectedNftForDetail, setSelectedNftForDetail] = useState<NFT | null>(null);

  // 添加商家验证模态框状态
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // 检查是否已登录和是否是商家
  useEffect(() => {
    if (!connectedWallet) {
      navigate('/profile');
    } else {
      // 检查用户角色是否是商家
      if (localStorage.getItem('isMerchant') !== 'true') {
        navigate('/user_profile');
      }
    }
  }, [connectedWallet, navigate]);

  // 加载用户和商家数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        if (connectedWallet) {
          // 获取用户信息
          const userInfo = await userService.getUserInfo();
          setUserInfo(userInfo);
          
          // 获取NFT数据
          await fetchNfts(connectedWallet);
          await fetchCreatedNfts(connectedWallet);
          
          // 获取商家信息
          try {
            const merchantData = await merchantService.getMerchantInfo();
            if (merchantData) {
              setMerchantInfo(merchantData);
            }
            
            // 获取商家铸造的NFT合约
            const contracts = await merchantService.getMyNFTContracts();
            console.log('商家NFT合约:', contracts);
          } catch (merchantErr) {
            console.error('获取商家信息失败:', merchantErr);
            setMerchantInfo(null);
            setError('Failed to load merchant information. Please try again later.');
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [connectedWallet]); // 只依赖connectedWallet

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

  // 获取用户创建的NFT
  const fetchCreatedNfts = async (address: string) => {
    if (!address) return;
    
    try {
      console.log('获取用户创建的NFT，钱包地址:', address);
      
      // 使用nftService获取用户创建的NFT
      const created = await nftService.getUserCreatedNFTs(address);
      console.log('获取到用户创建的NFT:', created);
      // 确保createdNfts始终是一个数组
      setCreatedNfts(Array.isArray(created) ? created : []);
    } catch (err) {
      console.error('获取创建的NFT失败:', err);
      setError('Failed to load your created NFTs. Please try again later.');
      // 发生错误时设置为空数组
      setCreatedNfts([]);
    }
  };

  // 处理NFT类型选择
  const handleOpenNftTypeModal = () => {
    setIsNftTypeModalOpen(true);
  };
  
  // 处理选择优惠券NFT
  const handleSelectCoupon = () => {
    setIsNftTypeModalOpen(false);
    navigate('/create-coupon');
  };
  
  // 处理选择会员NFT
  const handleSelectMembership = () => {
    setIsNftTypeModalOpen(false);
    alert('Membership NFT creation is coming soon!');
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

  // 处理重新提交商家验证
  const handleResubmitVerification = () => {
    setIsVerificationModalOpen(true);
  };
  
  // 处理验证信息提交
  const handleVerificationSubmit = async (details: { name: string; address: string; file: File }) => {
    try {
      setIsLoading(true);
      
      // 假设这里调用API提交商家验证信息
      const response = await merchantService.uploadQualification(details.name, details.address, details.file);
      
      // 关闭模态框
      setIsVerificationModalOpen(false);
      
      // 提示用户
      alert('Verification information submitted successfully. Please wait for review.');
      
      // 重新加载商家信息
      if (connectedWallet) {
        const merchantData = await merchantService.getMerchantInfo();
        if (merchantData) {
          // 转换为merchantService.Merchant类型
          setMerchantInfo(merchantData);
        }
      }
    } catch (error) {
      console.error('Error submitting verification:', error);
      alert('Failed to submit verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Merchant Profile</h1>
      
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
              <p>{userRole === UserRole.ADMIN ? 'Administrator' : 'Merchant'}</p>
            </div>
            {userInfo && (
              <div>
                <p className="text-sm font-medium text-gray-500">Joined</p>
                <p>{new Date(userInfo.created_at).toLocaleDateString()}</p>
              </div>
            )}
            {/* Merchant Information */}
            {merchantInfo && (
              <>
                <div>
                  <p className="text-sm font-medium text-gray-500">Merchant Name</p>
                  <p>{merchantInfo.merchant_name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Merchant Address</p>
                  <p>{merchantInfo.merchant_address || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Verification Status</p>
                  <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    merchantInfo.is_verified === "true" ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {merchantInfo.is_verified === "true" ? 'Verified' : 'Pending Verification'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* NFT 统计信息 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Recipe NFTs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Owned NFTs</h3>
            <p className="text-3xl font-bold text-amber-600">{nfts.length || userData?.NFThold?.length || 0}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Created NFTs</h3>
            <p className="text-3xl font-bold text-amber-600">{createdNfts.length || 0}</p>
          </div>
        </div>
      </div>
      
      {/* 已验证商家的创建NFT按钮 */}
      {userData?.isMerchant && userData.isverified && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Merchant Tools</h2>
            <button
              onClick={handleOpenNftTypeModal}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New NFT
            </button>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-600 mb-4">
              Use the merchant tools to manage your NFTs and create new ones to promote your brand.
            </p>
            <div className="flex space-x-3">
              <Link
                to="/my-recipes"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                View My Creations
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* 商家验证提醒（仅对未验证商家显示） */}
      {userData?.isMerchant && !userData.isverified && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Your merchant account is pending verification</h3>
          <p className="text-yellow-700 mb-3">
            Once your application is approved, you'll be able to create and sell your own NFTs.
          </p>
          <p className="text-yellow-700 text-sm">
            If you have any questions, please contact our support team.
          </p>
        </div>
      )}
      
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
      
      {/* 用户的NFT信息 - 创建的NFT */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">My Creations</h2>
        {createdNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {createdNfts.map((nft, index) => (
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
            <p className="text-gray-600">You haven't created any NFTs with this wallet yet.</p>
            
            {userData?.isMerchant && !userData.isverified && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium mb-3">Your merchant account is pending verification</p>
                <p className="text-yellow-700 mb-4">You will be able to create NFTs once your account is verified.</p>
                <button
                  onClick={handleResubmitVerification}
                  className="w-full sm:w-auto px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors font-medium"
                >
                  Resubmit Verification Information
                </button>
              </div>
            )}
            
            {userData?.isMerchant && userData.isverified && (
              <div className="mt-6">
                <button
                  onClick={handleOpenNftTypeModal}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                  Create Your First NFT
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* NFT类型选择模态框 */}
      {userData?.isMerchant && userData.isverified && (
        <NftTypeSelectionModal
          isOpen={isNftTypeModalOpen}
          onClose={() => setIsNftTypeModalOpen(false)}
          onSelectCoupon={handleSelectCoupon}
          onSelectMembership={handleSelectMembership}
        />
      )}
      
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

      {/* 钱包信息 */}
      <div className="mb-8 p-4 bg-gray-100 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex-grow">
          <p className="text-sm text-gray-600 font-medium">Connected Wallet:</p>
          <p className="text-md text-gray-900 font-mono break-all" title={connectedWallet}>{connectedWallet}</p>
          {/* 显示商家状态 */}
          {userData?.isMerchant && (
            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${userData.isverified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {userData.isverified ? 'Verified Merchant' : 'Unverified Merchant'}
            </span>
          )}
        </div>
        <button 
          onClick={() => connectWallet()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Disconnect
        </button>
      </div>

      {/* Merchant Verification Modal */}
      <MerchantVerificationInputModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmit={handleVerificationSubmit}
        merchantId={connectedWallet || ''}
      />
    </div>
  );
};

export default MerchantProfilePage; 