import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet, WalletContext } from '../contexts/WalletContext';
import userService, { UserRole, User } from '../services/userService';
import merchantService, { Merchant } from '../services/merchantService';
import NftTypeSelectionModal from '../components/NftTypeSelectionModal';
import NftCard from '../components/NftCard';
import nftService, { NFT } from '../services/nftService';
import MerchantVerificationInputModal from '../components/MerchantVerificationInputModal';



// NFT卡片适配器
const adaptNftForCard = (nft: NFT): any => ({
  ...nft,
  coupon_name: nft.coupon_name || 'Unnamed NFT'
});

const MerchantProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedWallet, connectWallet, disconnectWallet, sessionId } = useWallet();
  
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [merchantInfo, setMerchantInfo] = useState<Merchant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // NFT数据
  const [ownedNfts, setOwnedNfts] = useState<NFT[]>([]);
  const [createdNfts, setCreatedNfts] = useState<NFT[]>([]);
  
  // NFT类型选择模态框
  const [isNftTypeModalOpen, setIsNftTypeModalOpen] = useState(false);
  
  // NFT详情模态框
  const [showNftDetailModal, setShowNftDetailModal] = useState(false);
  const [selectedNftForDetail, setSelectedNftForDetail] = useState<NFT | null>(null);

  // 添加商家验证模态框状态
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // 处理创建NFT按钮点击
  const handleCreateNft = () => {
    console.log('Opening NFT type selection modal');
    setIsNftTypeModalOpen(true);
  };

  // 加载用户和商家数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
        if (sessionId) {
          // 获取用户信息
          const userInfo = await userService.getUserInfo();
          setUserInfo(userInfo);

          // // 检查用户角色
          // if (userInfo?.role !== UserRole.MERCHANT) {
          //   console.log('用户不是商家，重定向到用户页面');
          //   navigate('/profile');
          //   return;
          // }
          
          // 获取商家信息
          const merchantInfo = await merchantService.getMerchantInfo();
          if (merchantInfo) {
            setMerchantInfo(merchantInfo);
          } else {
            setMerchantInfo(null);
            setError('Failed to load merchant information. Please try again later.');
          }
          
          // 获取NFT数据
          await fetchOwnedNfts();
          await fetchCreatedNfts();
        } else {
          navigate('/profile');
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load user data. Please try again later.');
        navigate('/profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [sessionId]); 

  // 获取用户拥有的NFT
  const fetchOwnedNfts = async () => {
    try {      
      // 使用nftService获取用户拥有的NFT
      const owned = await nftService.getUserOwnedNFTs();
      console.log('获取到用户拥有的NFT:', owned);
      // 确保nfts始终是一个数组
      setOwnedNfts(Array.isArray(owned) ? owned : []);
    } catch (err) {
      console.error('获取NFT失败:', err);
      setError('Failed to load your NFTs. Please try again later.');
      // 发生错误时设置为空数组
      setOwnedNfts([]);
    }
  };

  // 获取用户创建的NFT
  const fetchCreatedNfts = async () => {
    try {
      // 使用nftService获取用户创建的NFT
      const created = await merchantService.getMyNFTContracts();
      console.log('获取到用户创建的NFT:', created);
      
      // 按合约地址过滤，每个合约只保留一个NFT
      const filteredByContract = created.reduce((acc: any[], nft: any) => {
        // 检查是否已经有相同合约地址的NFT
        const existingIndex = acc.findIndex(item => item.contract_address === nft.contract_address);
        
        if (existingIndex === -1) {
          // 如果没有相同合约地址的NFT，则添加当前NFT
          acc.push(nft);
        }
        
        return acc;
      }, []);
      
      // 确保createdNfts始终是一个数组
      setCreatedNfts(Array.isArray(filteredByContract) ? filteredByContract : []);
    } catch (err) {
      console.error('获取创建的NFT失败:', err);
      setError('Failed to load your created NFTs. Please try again later.');
      setCreatedNfts([]);
    }
  };

  // 处理选择优惠券NFT
  const handleSelectCoupon = () => {
    console.log('Selected Coupon NFT');
    setIsNftTypeModalOpen(false);
    navigate('/create-coupon');
  };
  
  // 处理选择会员NFT
  const handleSelectMembership = () => {
    console.log('Selected Membership NFT');
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
          // 使用已有的商家信息
          if (merchantInfo) {
            nftDetails.merchant_name = merchantInfo.merchant_name;
          }
          setSelectedNftForDetail(nftDetails);
        } else {
          setSelectedNftForDetail(nft);
        }
      } else {
        setSelectedNftForDetail(nft);
      }
      
      setShowNftDetailModal(true);
    } catch (err) {
      console.error('获取NFT详情失败:', err);
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
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      
      // 假设这里调用API提交商家验证信息
      const response = await merchantService.uploadQualification(details.name, details.address, details.file);
      
      if (!response) {
        alert('Failed to submit verification. Please try again.');
        throw new Error('Failed to submit verification. Please try again.');
      }

      // 关闭模态框
      setIsVerificationModalOpen(false);
      
      // 提示用户
      alert('Verification information submitted successfully. Please wait for review.');
      
      // 只更新商家信息，不需要重新获取NFT数据
      if (sessionId) {
        const updatedMerchantInfo = await merchantService.getMerchantInfo();
        if (updatedMerchantInfo) {
          setMerchantInfo(updatedMerchantInfo);
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
              <p>{userInfo?.role === UserRole.ADMIN ? 'Administrator' : 'Merchant'}</p>
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
                    merchantInfo.is_verified === true ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {merchantInfo.is_verified === true ? 'Verified' : 'Pending Verification'}
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
            <p className="text-3xl font-bold text-amber-600">{ownedNfts.length}</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Created NFTs</h3>
            <p className="text-3xl font-bold text-amber-600">{createdNfts.length}</p>
          </div>
        </div>
      </div>
      
      
      {/* 商家验证提醒（仅对未验证商家显示） */}
      {merchantInfo && !merchantInfo.is_verified && (
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
        {ownedNfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Explore More NFTs Card */}
            <div 
              onClick={() => navigate('/swap-market')}
              className="bg-white rounded-lg shadow-md p-6 border border-dashed border-gray-300 hover:border-amber-500 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Explore More NFTs</h3>
                <p className="text-gray-600 text-center">Click to explore and discover more NFTs in the market</p>
              </div>
            </div>

            {ownedNfts.map((nft, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New NFT Card */}
            <div 
              onClick={handleCreateNft}
              className="bg-white rounded-lg shadow-md p-6 border border-dashed border-gray-300 hover:border-amber-500 transition-colors cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Create New NFT</h3>
                <p className="text-gray-600 text-center">Click to create a new NFT for your business</p>
              </div>
            </div>

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
            
            {merchantInfo?.is_verified && (
              <div className="mt-6">
                <button
                  onClick={handleCreateNft}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors font-medium"
                >
                  Create Your First NFT
                </button>
              </div>
            )}
            
            {merchantInfo && !merchantInfo.is_verified && (
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
          </div>
        )}
      </div>
      
      {/* Modals */}
      {/* NFT Type Selection Modal */}
      <NftTypeSelectionModal
        isOpen={isNftTypeModalOpen}
        onClose={() => setIsNftTypeModalOpen(false)}
        onSelectCoupon={handleSelectCoupon}
        onSelectMembership={handleSelectMembership}
      />

      {/* Merchant Verification Modal */}
      <MerchantVerificationInputModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        onSubmit={handleVerificationSubmit}
        merchantId={connectedWallet || ''}
      />

      {/* NFT Detail Modal */}
      {showNftDetailModal && selectedNftForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 max-w-xl w-11/12 max-h-[90vh] overflow-y-auto">
            {/* 上方图片区域 */}
            <div className="w-full h-64 bg-gray-200 relative">
              <img
                src={selectedNftForDetail.coupon_image}
                alt={selectedNftForDetail.coupon_name}
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
                {selectedNftForDetail.coupon_name || 'NFT'}
              </h2>
              
              <div className="mb-4 flex items-center">
                <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 text-xs font-semibold rounded">
                  {selectedNftForDetail.coupon_type || 'NFT'}
                </span>
                {selectedNftForDetail.merchant_name && (
                  <span className="ml-2 text-sm text-gray-500">
                    Created by {selectedNftForDetail.merchant_name}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Merchant</h3>
                    <p className="text-gray-800">{selectedNftForDetail.merchant_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Expiration Date</h3>
                    <p className="text-gray-800">
                      {new Date(selectedNftForDetail.expires_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* 详细信息区域 */}
              {selectedNftForDetail.details && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {(() => {
                      try {
                        console.log('Raw description:', selectedNftForDetail.details);
                        const details = typeof selectedNftForDetail.details === 'string' 
                          ? JSON.parse(selectedNftForDetail.details)
                          : selectedNftForDetail.details;
                        console.log('Parsed details:', details);
                        return (
                          <div className="space-y-3">
                            {details.benefits && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Benefits</h4>
                                <p className="text-gray-800">{details.benefits}</p>
                              </div>
                            )}
                            {details.description && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                                <p className="text-gray-800">{details.description}</p>
                              </div>
                            )}
                          </div>
                        );
                      } catch (e) {
                        console.error('Error parsing description:', e);
                        return <p className="text-gray-800">{selectedNftForDetail.details?.benefits || 'No benefits available.'}</p>;
                      }
                    })()}
                  </div>
                </div>
              )}

              {/* 合约信息 */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Contract Information</h3>
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Contract Address</h4>
                    <p className="text-gray-800 font-mono text-sm break-all">{selectedNftForDetail.contract_address}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Creator Address</h4>
                    <p className="text-gray-800 font-mono text-sm break-all">{selectedNftForDetail.creator_address}</p>
                  </div>
                </div>
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
        </div>
        <button 
          onClick={() => disconnectWallet()}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default MerchantProfilePage; 