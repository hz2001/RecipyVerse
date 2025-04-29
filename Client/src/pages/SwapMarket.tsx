import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import hooks
import { Button, CircularProgress, Modal, TextField, Pagination, FormControlLabel, Checkbox } from '@mui/material';
import NftCard from '../components/NftCard'; 
import { useWallet } from '../contexts/WalletContext';
import { Link } from 'react-router-dom';
import nftService, { CouponNFT } from '../services/nftService';
import axiosInstance from '../services/api';
import { AxiosResponse } from 'axios';

// 使用 CouponNFT 作为基础接口
export interface SwapNft extends CouponNFT {
  // 添加交换相关的字段
  swapping?: any; // 可以是布尔值、对象或字符串
  // 添加 NftCard 组件所需的额外字段
  name?: string;
  merchantName?: string;
  imageUrl?: string;
  ownerId?: string;
  details?: any;
  // 添加其他缺失的字段
  expirationDate?: string;
  tokenId?: string;
}

function SwapMarket() {
  const navigate = useNavigate(); // Initialize navigate
  const location = useLocation(); // Initialize location
  const { connectedWallet } = useWallet(); // Get connected wallet

  const [userNFTs, setUserNFTs] = useState<SwapNft[]>([]);
  const [marketNFTs, setMarketNFTs] = useState<SwapNft[]>([]);
  const [isLoadingUserNFTs, setIsLoadingUserNFTs] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNFTToPost, setSelectedNFTToPost] = useState<SwapNft | null>(null);
  
  const [showSwapModal, setShowSwapModal] = useState(false); 
  const [selectedNftToOffer, setSelectedNftToOffer] = useState<SwapNft | null>(null);

  // New state variables for pagination, filtering, and search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  
  // State variables for selecting desired NFTs during post creation
  const [desiredNFTs, setDesiredNFTs] = useState<SwapNft[]>([]);
  const [availableNFTsForSelection, setAvailableNFTsForSelection] = useState<SwapNft[]>([]);
  const [isLoadingAvailableNFTs, setIsLoadingAvailableNFTs] = useState(false);
  const [desiredNFTsSearchQuery, setDesiredNFTsSearchQuery] = useState('');
  const [showDesiredNFTsSelectionModal, setShowDesiredNFTsSelectionModal] = useState(false);

  // Re-introduce state to hold the NFT being targeted for a swap, set from NftDetailPage navigation
  const [targetNftForSwap, setTargetNftForSwap] = useState<SwapNft | null>(null);

  // 添加NFT详情模态框的状态
  const [showNftDetailModal, setShowNftDetailModal] = useState(false);
  const [selectedNftForDetail, setSelectedNftForDetail] = useState<SwapNft | null>(null);

  // --- UseEffect to handle navigation state from NftDetailPage ---
  useEffect(() => {
      const locationState = location.state as { triggerSwapForNft?: SwapNft };
      if (locationState?.triggerSwapForNft) {
          console.log("Swap initiated from Detail Page for:", locationState.triggerSwapForNft);
          // Set the target NFT and immediately open the 'Select Your NFT' modal
          setTargetNftForSwap(locationState.triggerSwapForNft);
          // Clear the state from location history to prevent re-triggering on refresh/back
          navigate(location.pathname, { replace: true, state: {} }); 
          // 打开swap模态框
          setShowSwapModal(true);
          loadUserNFTs();
      }
  }, [location.state, navigate]); // Depend on location.state

  // Load market NFTs on component mount and when wallet changes
  useEffect(() => {
    loadMarketNFTs();
  }, [connectedWallet]);

  // Load market NFTs
  const loadMarketNFTs = async () => {
    setIsLoadingMarket(true);
    try {
      console.log('Loading available NFTs from the market...');
      
      // 调用API获取所有NFT
      const response = await axiosInstance.get('/nft/market');
      
      if (response.status !== 200) {
        console.log('No NFTs found');
        setMarketNFTs([]);
        setTotalPages(1);
        return;
      }
      
      const nfts = response.data.map((nft: CouponNFT) => {
        const benefits = Array.isArray(nft.benefits) ? nft.benefits : [nft.benefits || ''];
        return {
          ...nft,
          benefits,
          name: nft.coupon_name || `NFT #${nft.id}`,
          merchantName: nft.merchant_name || 'Unknown Merchant',
          imageUrl: nft.coupon_image || '/placeholder-images/nft-default.jpg',
          ownerId: nft.owner_addresses,
          expirationDate: nft.expires_at || '',
          tokenId: nft.token_id || nft.id.toString(),
          details: {
            merchantName: nft.merchant_name,
            description: nft.description,
            benefits
          }
        } as SwapNft;
      });
      
      setMarketNFTs(nfts);
      setTotalPages(Math.ceil(nfts.length / itemsPerPage));
    } catch (error) {
      console.error("Error loading market NFTs:", error);
      setMarketNFTs([]);
      setTotalPages(1);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  // 获取用户NFT ID列表
  const getUserNFTIds = async () => {
    if (!connectedWallet) return [];
    
    try {
      const userNFTs = await nftService.getUserOwnedNFTs();
      return userNFTs.map(nft => nft.id);
    } catch (error) {
      console.error("Failed to get user NFT IDs:", error);
      return [];
    }
  };

  // Load user NFTs
  const loadUserNFTs = async () => {
    if (!connectedWallet) {
      setUserNFTs([]);
      return;
    }
    
    setIsLoadingUserNFTs(true);
    try {
      const response = await nftService.getUserOwnedNFTs();
      const nfts = response.map((nft: CouponNFT) => ({
        ...nft,
        name: nft.coupon_name || `NFT #${nft.id}`,
        merchantName: nft.merchant_name || 'Unknown Merchant',
        imageUrl: nft.coupon_image || '/placeholder-images/nft-default.jpg',
        ownerId: nft.owner_addresses,
        expirationDate: nft.expires_at || '',
        tokenId: nft.token_id || nft.id.toString(),
        details: {
          merchantName: nft.merchant_name,
          description: nft.description,
          benefits: nft.benefits
        }
      })) as SwapNft[];
      setUserNFTs(nfts);
    } catch (error) {
      console.error("Error loading user NFTs:", error);
      setUserNFTs([]);
    } finally {
      setIsLoadingUserNFTs(false);
    }
  };

  const handleOpenPostModal = () => {
    setSelectedNFTToPost(null); 
    setDesiredNFTs([]);
    loadUserNFTs(); 
    setIsPostModalOpen(true); 
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setSelectedNFTToPost(null);
    setDesiredNFTs([]);
    setShowDesiredNFTsSelectionModal(false);
  }

  const handleSelectNFTToPost = (nft: SwapNft) => {
    setSelectedNFTToPost(nft);
  };

  // New function to handle opening the modal for selecting desired NFTs
  const handleOpenDesiredNFTsModal = () => {
    setIsLoadingAvailableNFTs(true);
    setDesiredNFTsSearchQuery('');
    
    // Load all available NFTs for selection
    loadAvailableNFTsForSelection().then(nfts => {
      setAvailableNFTsForSelection(nfts);
      setIsLoadingAvailableNFTs(false);
      setShowDesiredNFTsSelectionModal(true);
    });
  };
  
  // New function to load all available NFTs for selection
  const loadAvailableNFTsForSelection = async () => {
    try {
      // 获取所有NFT
      const response = await axiosInstance.get('/nft/market');
      
      if (response.status !== 200) {
        console.error("Failed to fetch NFT data");
        return [];
      }
      
      // 过滤掉当前用户拥有的NFT和当前选择的NFT
      const availableNfts = response.data.filter((nft: SwapNft) => {
        // 跳过当前选择的NFT
        if (selectedNFTToPost && nft.id === selectedNFTToPost.id) {
          return false;
        }
        
        // 跳过用户自己的NFT
        if (typeof nft.owner_addresses === 'string') {
          return nft.owner_addresses !== connectedWallet;
        }
        
        if (typeof nft.owner_addresses === 'object' && nft.owner_addresses !== null) {
          return !Object.values(nft.owner_addresses).includes(connectedWallet);
        }
        
        return true;
      });
      
      return availableNfts.map((nft: SwapNft) => ({
        ...nft,
        name: nft.coupon_name || `NFT #${nft.id}`,
        merchantName: nft.merchant_name || 'Unknown Merchant',
        imageUrl: nft.coupon_image || '/placeholder-images/nft-default.jpg',
        ownerId: nft.owner_addresses,
        details: {
          merchantName: nft.merchant_name,
          description: nft.description,
          benefits: nft.benefits
        }
      }));
    } catch (error) {
      console.error("Error loading available NFTs:", error);
      return [];
    }
  };
  
  // New function to toggle selection of a desired NFT
  const handleToggleDesiredNFT = (nft: SwapNft) => {
    setDesiredNFTs(prev => {
      // Check if NFT is already in the list
      const isSelected = prev.some(item => item.id === nft.id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(item => item.id !== nft.id);
      } else {
        // Add to selection
        return [...prev, nft];
      }
    });
  };
  
  // New function to confirm selected desired NFTs
  const handleConfirmDesiredNFTs = async () => {
    if (!selectedNFTToPost || !desiredNFTs.length) return;

    try {
      // 确认用户拥有选中的NFT
      const ownershipResponse = await axiosInstance.get(`/nft/check-ownership/${selectedNFTToPost.id}`);
      const ownershipData = handleApiResponse(ownershipResponse);

      // 更新NFT的交换状态
      const updateResponse = await axiosInstance.put(`/nft/${selectedNFTToPost.id}/swap`, {
        desiredNFTs: desiredNFTs.map(nft => nft.id)
      });
      const updateData = handleApiResponse(updateResponse);

      // 更新本地状态
      setDesiredNFTs([]);
      setShowDesiredNFTsSelectionModal(false);
      setSelectedNFTToPost(null);
    } catch (error) {
      console.error("Error confirming desired NFTs:", error);
    }
  };
  
  // 处理API响应
  const handleApiResponse = (response: AxiosResponse) => {
    if (response.status !== 200) {
      throw new Error('API request failed');
    }
    return response.data;
  };

  // New function to filter available NFTs based on search query
  const getFilteredAvailableNFTs = () => {
    if (!desiredNFTsSearchQuery.trim()) {
      return availableNFTsForSelection;
    }
    
    const query = desiredNFTsSearchQuery.toLowerCase().trim();
    return availableNFTsForSelection.filter(nft => {
      // 同时检查name和coupon_name字段
      const nameValue = nft.name || nft.coupon_name || '';
      const matchesName = nameValue.toLowerCase().includes(query);
      
      // 检查merchantName以及details.merchantName
      const merchantValue = nft.merchantName || (nft.details?.merchantName) || '';
      const matchesMerchant = merchantValue.toLowerCase().includes(query);
      
      // 检查coupon_type
      const typeValue = nft.coupon_type || '';
      const matchesType = typeValue.toLowerCase().includes(query);
      
      // 检查description以及details.description
      const descriptionValue = nft.description || (nft.details?.description) || '';
      const matchesDescription = descriptionValue.toLowerCase().includes(query);
      
      // 额外检查details中可能的其他描述性字段
      const matchesDetails = nft.details ? 
        Object.values(nft.details).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(query)
        ) : false;
      
      // 记录到控制台以便调试
      if (query.length > 2 && (matchesName || matchesMerchant || matchesType || matchesDescription || matchesDetails)) {
        console.log(`匹配到NFT: ${nameValue}, 搜索词: ${query}`);
      }
      
      return matchesName || matchesMerchant || matchesType || matchesDescription || matchesDetails;
    });
  };

  // 修改这个函数，现在变成next step而不是post to market
  const handleNextStep = () => {
    if (!selectedNFTToPost) return;
    handleOpenDesiredNFTsModal();
  };

  // Updated: 显示NFT详情模态框，而不是导航到NftDetailPage
  const handleMarketNFTClick = (nft: SwapNft) => {
      if (nft.ownerId === connectedWallet) return; 
      handleOpenNftDetail(nft);
  };

  // Updated: Opens the modal to select user's NFT, now takes target NFT as argument
  const handleInitiateSwap = (targetNft: SwapNft) => {
      // Removed console log from here, already logged in useEffect
      // Removed handleCloseDetailModal call
      setSelectedNftToOffer(null); 
      loadUserNFTs(); // Load user's NFTs to select from
      setTargetNftForSwap(targetNft); // Ensure target is set (might be redundant if called from useEffect)
      setShowSwapModal(true); // Open the modal to select user's NFT
  };

   const handleCloseSwapModal = () => {
        setShowSwapModal(false);
        setSelectedNftToOffer(null);
        setTargetNftForSwap(null); // Clear the target when closing modal
   }

  const handleSelectNFTForSwap = (nftToOffer: SwapNft) => {
      setSelectedNftToOffer(nftToOffer);
  };

  // Uses selectedNftToOffer (user's) and targetNftForSwap (market's)
  const handleConfirmSwap = async () => {
      if (!targetNftForSwap || !selectedNftToOffer || !connectedWallet) return;
      console.log(`确认交换: 用户的NFT ${selectedNftToOffer.name} (${selectedNftToOffer.id}) 换取 ${targetNftForSwap.name} (${targetNftForSwap.id})`);
      try {
          // 验证用户对选择的NFT的所有权
          const userNftResponse = await axiosInstance.get(`/nft/${selectedNftToOffer.id}`);
          const userNftData = handleApiResponse(userNftResponse);
          
          // 检查所有权
          let isOwner = false;
          
          // 检查字符串类型的owner_addresses
          if (typeof userNftData.owner_addresses === 'string') {
            isOwner = userNftData.owner_addresses === connectedWallet;
          }
          // 检查JSON对象类型的owner_addresses
          else if (typeof userNftData.owner_addresses === 'object' && userNftData.owner_addresses !== null) {
            isOwner = Object.values(userNftData.owner_addresses).includes(connectedWallet);
          }
          
          if (!isOwner) {
            throw new Error(`您不是此NFT的所有者，无法用于交换`);
          }
          
          // 验证目标NFT是否接受用户的NFT
          const targetNftResponse = await axiosInstance.get(`/nft/${targetNftForSwap.id}`);
          const targetNftData = handleApiResponse(targetNftResponse);
          
          // 检查目标NFT是否可交换
          if (!targetNftData.swapping || 
              (typeof targetNftData.swapping === 'object' && 
               Object.values(targetNftData.swapping).every(arr => 
                 !Array.isArray(arr) || arr.length === 0))) {
            throw new Error('此NFT当前不可用于交换');
          }
          
          // 检查目标NFT是否接受用户的NFT（如果有特定需求）
          let isAccepted = false;
          
          // 新格式：检查是否在任意一个所需NFT数组中
          if (typeof targetNftData.swapping === 'object' && targetNftData.swapping !== null) {
            const arrays = Object.values(targetNftData.swapping);
            // 如果任意一个数组为空，表示接受任何NFT
            const hasEmptyArray = arrays.some(arr => Array.isArray(arr) && arr.length === 0);
            
            if (hasEmptyArray) {
              isAccepted = true;
            } else {
              // 检查是否包含用户的NFT ID
              isAccepted = arrays.some(arr => 
                Array.isArray(arr) && arr.includes(selectedNftToOffer.id));
            }
          }
          // 向后兼容：旧格式默认接受任何NFT
          else if (targetNftData.swapping === true || 
                  (typeof targetNftData.swapping === 'string' && 
                   targetNftData.swapping.includes('true'))) {
            isAccepted = true;
          }
          
          if (!isAccepted) {
            throw new Error('此NFT不接受您提供的NFT作为交换');
          }
          
          // 为用户的NFT创建swapping对象，表明它在交换中
          let userNftSwapping: any = {};
          
          if (typeof userNftData.owner_addresses === 'object' && userNftData.owner_addresses !== null) {
            Object.keys(userNftData.owner_addresses).forEach(key => {
              userNftSwapping[key] = [targetNftForSwap.id];
            });
          } else {
            userNftSwapping["pending_1"] = [targetNftForSwap.id];
          }
          
          // 更新用户NFT的swapping状态
          const updateResponse = await axiosInstance.put(`/nft/${selectedNftToOffer.id}/swapping`, { swapping: userNftSwapping });
          const updateData = handleApiResponse(updateResponse);
            
          alert('交换申请已成功发起！所有权将在对方接受后更新。');
          setShowSwapModal(false);
          setSelectedNftToOffer(null);
          setTargetNftForSwap(null); // 清除目标NFT状态
          loadMarketNFTs(); 
          loadUserNFTs(); 
      } catch (error: any) {
          console.error("发起交换时发生错误:", error);
          alert(`交换失败: ${error.message || '未知错误'}`); 
      }
  };

  // 转换函数：将SwapNft转换为NftCard期望的格式
  const adaptToNftCardFormat = (nft: SwapNft): SwapNft => {
    // 确保必需字段存在
    const coupon_name = nft.coupon_name || nft.name || `NFT #${nft.id}`;
    const coupon_type = nft.coupon_type || 'Generic';
    const expires_at = nft.expires_at || nft.expirationDate || new Date().toISOString();
    
    // 处理owner_address字段
    const owner_address = typeof nft.owner_addresses === 'string' 
      ? nft.owner_addresses 
      : Object.keys(nft.owner_addresses || {})[0] || '';
    
    // 创建一个新的对象，包含所有必需的属性
    return {
      id: nft.id,
      coupon_name,
      coupon_type,
      expires_at,
      coupon_image: nft.coupon_image || nft.imageUrl || '/placeholder-images/nft-default.jpg',
      creator_address: nft.creator_address || '',
      owner_addresses: nft.owner_addresses || '',
      details: {
        merchantName: nft.merchant_name || nft.merchantName || 'Unknown Merchant',
        description: nft.description || '',
        benefits: Array.isArray(nft.benefits) ? nft.benefits[0] : nft.benefits || ''
      }
    };
  };

  // 添加处理函数，用于打开NFT详情模态框
  const handleOpenNftDetail = (nft: SwapNft) => {
    setSelectedNftForDetail(nft);
    setShowNftDetailModal(true);
  };

  // 添加处理函数，用于关闭NFT详情模态框
  const handleCloseNftDetail = () => {
    setShowNftDetailModal(false);
    setSelectedNftForDetail(null);
  };

  // --- Rendering --- 
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Swap Market
          </h1>
          <p className="text-lg text-gray-600">
            Exchange your NFTs with others in the community
          </p>
        </div>

        {/* Post NFT Button Section */}
        <div className="mb-8">
          <button 
            onClick={handleOpenPostModal} 
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-md"
            disabled={!connectedWallet}
          >
            Post an NFT for Swap
          </button>
          {!connectedWallet && (
            <p className="text-gray-500 mt-2">Connect your wallet to post NFTs for swap</p>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-2/3">
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Search by name, merchant, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1); // Reset to first page when searching
                    loadMarketNFTs();
                  }
                }}
              />
            </div>
            <div className="w-full md:w-1/3 flex items-center">
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  setPage(1); // Reset to first page when searching
                  loadMarketNFTs();
                }}
                sx={{ mr: 2 }}
              >
                Search
              </Button>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showOnlyMatches}
                    onChange={(e) => {
                      setShowOnlyMatches(e.target.checked);
                      setPage(1); // Reset to first page when filtering
                      loadMarketNFTs();
                    }}
                    disabled={!connectedWallet}
                  />
                }
                label="Show only matches for my NFTs"
              />
            </div>
          </div>
        </div>

        {/* Market NFTs Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Available for Swap</h3>
          
          {isLoadingMarket ? (
            <div className="flex justify-center p-5">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : marketNFTs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {marketNFTs.map((nft) => (
                  <NftCard 
                    key={nft.id}
                    nft={adaptToNftCardFormat(nft)} 
                    onClick={() => handleMarketNFTClick(nft)}
                  />
                ))} 
              </div>
              
              {/* Pagination */}
              <div className="flex justify-center mt-8">
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={(e, value) => {
                    setPage(value);
                    loadMarketNFTs();
                  }}
                  color="primary"
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No NFTs available</h3>
              <p className="text-gray-500">
                {searchQuery || showOnlyMatches ? 
                  "No NFTs match your current filters. Try adjusting your search criteria." : 
                  "There are currently no NFTs available for swap."}
              </p>
            </div>
          )}
        </div>

        {/* Your Posted NFTs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Your Posted NFTs</h3>
          
          {!connectedWallet ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Connect your wallet to view your posted NFTs.</p>
            </div>
          ) : isLoadingMarket ? (
            <div className="flex justify-center p-5">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : (
            <UserPostedNFTs />
          )}
        </div>
      </div>

      {/* Post NFT Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Select Your NFT to Post
            </h2>
            {isLoadingUserNFTs ? (
              <div className="flex justify-center p-5">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {userNFTs.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => handleSelectNFTToPost(nft)}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedNFTToPost?.id === nft.id 
                        ? 'border-amber-500 ring-2 ring-amber-500' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <NftCard 
                      nft={adaptToNftCardFormat(nft)} 
                      onClick={handleSelectNFTToPost}
                      isSelected={selectedNFTToPost?.id === nft.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">You don't have any eligible NFTs available to post for swap.</p>
            )}
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={handleClosePostModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleNextStep}
                disabled={!selectedNFTToPost || isLoadingUserNFTs}
                className={`px-6 py-2 bg-amber-500 text-white rounded-md ${
                  !selectedNFTToPost || isLoadingUserNFTs 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-amber-600'
                } transition-colors`}
              >
                Next Step
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desired NFTs Selection Modal */}
      {showDesiredNFTsSelectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Select NFTs You Want In Return
            </h2>
            
            <div className="mb-6">
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                label="Search NFTs..."
                value={desiredNFTsSearchQuery}
                onChange={(e) => setDesiredNFTsSearchQuery(e.target.value)}
              />
            </div>

            {/* 显示已选择的NFT区域 */}
            {desiredNFTs.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">Selected NFTs ({desiredNFTs.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  {desiredNFTs.map(nft => (
                    <div key={nft.id} className="flex items-center bg-white p-2 rounded-md shadow-sm">
                      <div className="w-8 h-8 rounded-md overflow-hidden mr-2">
                        <img 
                          src={nft.imageUrl || nft.coupon_image || '/placeholder-images/nft-default.jpg'} 
                          alt={nft.name || 'NFT'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-xs font-medium truncate">{nft.name || nft.coupon_name}</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDesiredNFT(nft);
                        }}
                        className="text-red-500 hover:text-red-700 ml-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mb-3 border-b pb-2 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-700">Available NFTs</h3>
              <span className="text-sm text-gray-500">Click to select/deselect</span>
            </div>
            
            {isLoadingAvailableNFTs ? (
              <div className="flex justify-center p-5">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : getFilteredAvailableNFTs().length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {getFilteredAvailableNFTs().map((nft) => {
                  const isSelected = desiredNFTs.some(item => item.id === nft.id);
                  return (
                    <div 
                      key={nft.id}
                      onClick={() => handleToggleDesiredNFT(nft)}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-500' 
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="relative">
                        <NftCard 
                          nft={adaptToNftCardFormat(nft)} 
                          onClick={() => {}} // 防止NftCard内部onClick与外层容器onClick冲突
                          isSelected={isSelected}
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {/* 添加查看详情按钮 */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-800 to-transparent p-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // 阻止事件冒泡，不触发选择
                              handleOpenNftDetail(nft);
                            }}
                            className="w-full bg-white text-amber-600 text-sm font-medium py-1 px-2 rounded shadow hover:bg-amber-50 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">
                {desiredNFTsSearchQuery 
                  ? "No NFTs match your search. Try different keywords." 
                  : "No NFTs available to select."}
              </p>
            )}
            
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setShowDesiredNFTsSelectionModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDesiredNFTs}
                className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                Post NFT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Select Your NFT to Offer
            </h2>
            <p className="text-gray-600 mb-6">
              You are offering to swap for: <span className="font-semibold">{targetNftForSwap?.name}</span>
            </p>
            {isLoadingUserNFTs ? (
              <div className="flex justify-center p-5">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {userNFTs.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => handleSelectNFTForSwap(nft)}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedNftToOffer?.id === nft.id 
                        ? 'border-amber-500 ring-2 ring-amber-500' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <NftCard 
                      nft={adaptToNftCardFormat(nft)} 
                      onClick={handleSelectNFTForSwap}
                      isSelected={selectedNftToOffer?.id === nft.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">You don't have any eligible NFTs to offer.</p>
            )}
            <div className="flex justify-end gap-4">
              <button 
                onClick={handleCloseSwapModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSwap}
                disabled={!selectedNftToOffer || isLoadingUserNFTs}
                className={`px-6 py-2 bg-amber-500 text-white rounded-md ${
                  !selectedNftToOffer || isLoadingUserNFTs 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-amber-600'
                } transition-colors`}
              >
                Confirm Swap Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NFT Detail Modal */}
      {showNftDetailModal && selectedNftForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 max-w-xl w-11/12 max-h-[90vh] overflow-y-auto">
            {/* 上方图片区域 */}
            <div className="w-full h-64 bg-gray-200 relative">
              <img
                src={selectedNftForDetail.imageUrl || selectedNftForDetail.coupon_image || '/placeholder-images/nft-default.jpg'}
                alt={selectedNftForDetail.name || selectedNftForDetail.coupon_name || 'NFT'}
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
                {selectedNftForDetail.name || selectedNftForDetail.coupon_name || 'NFT'}
              </h2>
              
              <div className="mb-4 flex items-center">
                <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 text-xs font-semibold rounded">
                  {selectedNftForDetail.coupon_type || 'Coupon NFT'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Created by {selectedNftForDetail.creator_address?.substring(0, 6)}...{selectedNftForDetail.creator_address?.substring(38) || 'Unknown'}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Merchant</h3>
                    <p className="text-gray-800">{selectedNftForDetail.merchantName || selectedNftForDetail.details?.merchantName || 'Unknown Merchant'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Expiration Date</h3>
                    <p className="text-gray-800">{new Date(selectedNftForDetail.expirationDate || selectedNftForDetail.expires_at || '').toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Token ID</h3>
                    <p className="text-gray-800">{selectedNftForDetail.tokenId || 'N/A'}</p>
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
                  {selectedNftForDetail.description || selectedNftForDetail.details?.description || 'No description available.'}
                </p>
              </div>
              
              {/* 优惠内容 */}
              {(selectedNftForDetail.benefits && selectedNftForDetail.benefits.length > 0 || selectedNftForDetail.details?.benefits) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                  {Array.isArray(selectedNftForDetail.benefits) ? (
                    <ul className="list-disc pl-5">
                      {selectedNftForDetail.benefits.map((benefit, index) => (
                        <li key={index} className="text-gray-700 mb-1">{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{selectedNftForDetail.details?.benefits}</p>
                  )}
                </div>
              )}
              
              {/* 链上信息 */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Blockchain Information</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Token ID:</span>
                    <span className="text-gray-800 font-mono text-sm truncate ml-2">
                      {selectedNftForDetail.token_id || selectedNftForDetail.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner:</span>
                    <span className="text-gray-800 font-mono text-sm truncate ml-2">
                      {typeof selectedNftForDetail.owner_addresses === 'string' 
                        ? `${selectedNftForDetail.owner_addresses.substring(0, 6)}...${selectedNftForDetail.owner_addresses.substring(38)}`
                        : 'Multiple Owners'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 按钮区域 */}
              <div className="flex justify-end mt-6 space-x-3">
                <Link 
                  to={`/nft/${selectedNftForDetail.id}`}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  View Full Details
                </Link>
                <button 
                  onClick={() => {
                    handleCloseNftDetail();
                    handleInitiateSwap(selectedNftForDetail);
                  }}
                  className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                >
                  Swap This NFT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  // User Posted NFTs Component (internal)
  function UserPostedNFTs() {
    const [postedNFTs, setPostedNFTs] = useState<SwapNft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Function to get the desired NFT IDs for a posted NFT
    const getDesiredNftIds = (nft: SwapNft) => {
      if (!nft.swapping) return [];
      
      // Handle new format
      if (typeof nft.swapping === 'object' && nft.swapping !== null) {
        const allDesiredIds: string[] = [];
        
        Object.values(nft.swapping).forEach(value => {
          if (Array.isArray(value)) {
            value.forEach(id => {
              if (!allDesiredIds.includes(id)) {
                allDesiredIds.push(id);
              }
            });
          }
        });
        
        return allDesiredIds;
      }
      
      return []; // Return empty array for old format or if no desired NFTs
    };
    
    useEffect(() => {
      async function fetchUserPostedNFTs() {
        setIsLoading(true);
        try {
          // 获取用户发布的NFT
          const response = await axiosInstance.get('/nft/posted');
          const nfts = handleApiResponse(response).map((nft: CouponNFT) => ({
            ...nft,
            name: nft.coupon_name || `NFT #${nft.id}`,
            merchantName: nft.merchant_name || 'Unknown Merchant',
            imageUrl: nft.coupon_image || '/placeholder-images/nft-default.jpg',
            ownerId: nft.owner_addresses,
            expirationDate: nft.expires_at || '',
            tokenId: nft.token_id || nft.id.toString(),
            details: {
              merchantName: nft.merchant_name,
              description: nft.description,
              benefits: nft.benefits
            }
          })) as SwapNft[];
          setPostedNFTs(nfts);
        } catch (error) {
          console.error("Error loading posted NFTs:", error);
          setPostedNFTs([]);
        } finally {
          setIsLoading(false);
        }
      }
      
      fetchUserPostedNFTs();
    }, [connectedWallet]);
    
    if (isLoading) {
      return (
        <div className="flex justify-center p-5">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      );
    }
    
    if (postedNFTs.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">You haven't posted any NFTs for swap yet.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {postedNFTs.map((nft) => {
          const desiredNftIds = getDesiredNftIds(nft);
          
          return (
            <div key={nft.id} className="relative">
              <NftCard 
                nft={adaptToNftCardFormat(nft)}
                onClick={() => handleOpenNftDetail(nft)}
              />
              
              {/* Desired NFTs indicator */}
              {desiredNftIds.length > 0 ? (
                <div className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                  Looking for {desiredNftIds.length} specific NFT{desiredNftIds.length > 1 ? 's' : ''}
                </div>
              ) : (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  Open to any offers
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }
}

export default SwapMarket; 