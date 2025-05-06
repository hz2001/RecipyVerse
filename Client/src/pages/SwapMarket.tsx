import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import hooks
import { Button, CircularProgress, Modal, TextField, Pagination, FormControlLabel, Checkbox } from '@mui/material';
import NftCard from '../components/NftCard'; 
import { useWallet } from '../contexts/WalletContext';
import { Link } from 'react-router-dom';
import nftService, { NFT } from '../services/nftService';
import contractService from '../services/contractService';

function SwapMarket() {
  const navigate = useNavigate(); // Initialize navigate
  const location = useLocation(); // Initialize location
  const { connectedWallet, sessionId } = useWallet(); // Get connected wallet

  const [userOwnedNFTs, setUserOwnedNFTs] = useState<NFT[]>([]);
  const [marketNFTs, setMarketNFTs] = useState<NFT[]>([]);
  const [isLoadingUserNFTs, setIsLoadingUserNFTs] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNFTToPost, setSelectedNFTToPost] = useState<NFT | null>(null);
  
  const [showSwapModal, setShowSwapModal] = useState(false); 
  const [selectedNftToOffer, setSelectedNftToOffer] = useState<NFT | null>(null);

  // New state variables for pagination, filtering, and search
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMatches, setShowOnlyMatches] = useState(false);
  
  // State variables for selecting desired NFTs during post creation
  const [desiredNFTs, setDesiredNFTs] = useState<NFT[]>([]);
  const [availableNFTsForSelection, setAvailableNFTsForSelection] = useState<NFT[]>([]);
  const [isLoadingAvailableNFTs, setIsLoadingAvailableNFTs] = useState(false);
  const [desiredNFTsSearchQuery, setDesiredNFTsSearchQuery] = useState('');
  const [showDesiredNFTsSelectionModal, setShowDesiredNFTsSelectionModal] = useState(false);

  // Re-introduce state to hold the NFT being targeted for a swap, set from NftDetailPage navigation
  const [targetNftsForSwap, setTargetNftsForSwap] = useState<NFT[]>([]);

  // 添加NFT详情模态框的状态
  const [showNftDetailModal, setShowNftDetailModal] = useState(false);
  const [selectedNftForDetail, setSelectedNftForDetail] = useState<NFT | null>(null);

  // New state variable for desired NFTs pagination
  const [desiredNFTsPage, setDesiredNFTsPage] = useState(1);

  // 添加状态变量来控制交易处理和成功消息
  const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
  const [isPostSuccessful, setIsPostSuccessful] = useState(false);

  // --- UseEffect to handle navigation state from NftDetailPage ---
  useEffect(() => {
      const locationState = location.state as { triggerSwapForNft?: NFT };
      if (locationState?.triggerSwapForNft) {
          console.log("Swap initiated from Detail Page for:", locationState.triggerSwapForNft);
          // Set the target NFT and immediately open the 'Select Your NFT' modal
          setTargetNftsForSwap([locationState.triggerSwapForNft]);
          // Clear the state from location history to prevent re-triggering on refresh/back
          navigate(location.pathname, { replace: true, state: {} }); 
          // 打开swap模态框
          setShowSwapModal(true);
          loadUserNFTs();
      }
  }, [location.state]);

  // Load market NFTs on component mount and when wallet changes
  useEffect(() => {
    loadAllSwappableNFTs();
  }, [connectedWallet, sessionId]);

  // Load market NFTs
  const loadAllSwappableNFTs = async () => {
    setIsLoadingMarket(true);
    try {
      console.log('Loading available NFTs from the market...');
      
      // 调用API获取所有NFT
      const response = await nftService.getAllSwappableNFTs();
      
      if (response.length === 0) {
        console.log('No NFTs found');
        setMarketNFTs([]);
        setTotalPages(1);
        return;
      }
      
      setMarketNFTs(response);
      setTotalPages(Math.ceil(response.length / itemsPerPage));
    } catch (error) {
      console.error("Error loading market NFTs:", error);
      setMarketNFTs([]);
      setTotalPages(1);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  // Load user NFTs
  const loadUserNFTs = async () => {
    if (!connectedWallet || !sessionId) {
      setUserOwnedNFTs([]);
      return;
    }
    
    setIsLoadingUserNFTs(true);
    try {
      const response = await nftService.getUserOwnedNFTs();
      console.log("User NFTs:", response);
      setUserOwnedNFTs(response);
    } catch (error) {
      console.error("Error loading user NFTs:", error);
      setUserOwnedNFTs([]);
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

  const handleSelectNFTToPost = (nft: NFT) => {
    setSelectedNFTToPost(nft);
  };

  // New function to handle opening the modal for selecting desired NFTs
  const handleOpenDesiredNFTsModal = () => {
    setIsLoadingAvailableNFTs(true);
    setDesiredNFTsSearchQuery('');
    
    loadAvailableNFTsForSelection().then(nfts => {
      setAvailableNFTsForSelection(nfts);
      setIsLoadingAvailableNFTs(false);
      setShowDesiredNFTsSelectionModal(true);
    });
  };
  
  const loadAvailableNFTsForSelection = async () => {
    try {
      // 获取所有NFT
      const allNfts: NFT[] = await nftService.getAllNfts();
      
      // 创建一个Map来存储每个合约地址的第一个未过期NFT
      const contractNfts = new Map<string, NFT>();
      
      // 遍历所有NFT
      for (const nft of allNfts) {
        // 检查NFT是否过期
        if (nft.expires_at && new Date(nft.expires_at) < new Date()) {
          continue;
        }
        
        // 如果这个合约地址还没有被记录，就保存这个NFT
        if (!contractNfts.has(nft.contract_address)) {
          contractNfts.set(nft.contract_address, nft);
        }
      }
      
      // 将Map转换为数组并返回
      return Array.from(contractNfts.values()).map(nft => ({
        id: nft.contract_address,
        contract_address: nft.contract_address,
        coupon_name: nft.coupon_name,
        coupon_type: nft.coupon_type,
        coupon_image: nft.coupon_image,
        total_supply: nft.total_supply, // 每一个nft的total_supply都是最大值，所以使用得到的nft就可
        details: {
          benefits: nft.details?.benefits || '',
          others: 'Contract Level NFT'
        },
        // 移除单个NFT特有的信息
        owner_address: undefined,
        merchant_name: undefined,
        expires_at: undefined,
        swapping: undefined
      }));
    } catch (error) {
      console.error("Error loading available NFTs:", error);
      return [];
    }
  };
  
  // New function to toggle selection of a desired NFT
  const handleToggleDesiredNFT = (nft: NFT) => {
    setDesiredNFTs(prev => {
      const isSelected = prev.some(item => item.id === nft.id);
      return isSelected 
        ? prev.filter(item => item.id !== nft.id)
        : [...prev, nft];
    });
  };
  
  const handleConfirmDesiredNFTs = async () => {
    if (!selectedNFTToPost || !desiredNFTs.length) return;
    console.log('selectedNFTToPost', selectedNFTToPost);
    console.log('desiredNFTs', desiredNFTs);

    try {
      setIsProcessingTransaction(true);
      
      try {
        
        console.log('Initiating contract transaction...');
        // 1. 更新数据库中NFT的swapping字段，使用FormData格式
        const response = await nftService.updateNFTSwap(selectedNFTToPost.id, desiredNFTs.map(nft => nft.id));

        if (!response) {
          alert('Failed to update NFT swap status');
          throw new Error('Failed to update NFT swap status');
        }

        // 2. 调用智能合约将NFT传给合约
        const contract = await contractService.getSwapContract();

        if (!contract) {
          throw new Error('Failed to get swap contract');
        }


        const transactionResponse = contract.createSwap(
          selectedNFTToPost.contract_address,
          selectedNFTToPost.token_id,
          desiredNFTs
        )
        
        console.log('Transaction sent:', transactionResponse);
        
        
        // 显示成功消息
        setIsPostSuccessful(true);
      } catch (contractError) {
        console.error('Transaction failed:', contractError);
        alert('Failed to post NFT. Please try again.');
        return;
      } finally {
        setIsProcessingTransaction(false);
      }
      
      // 关闭模态框
      setDesiredNFTs([]);
      setShowDesiredNFTsSelectionModal(false);
      setSelectedNFTToPost(null);
      
      // 3. 刷新市场和用户已发布NFT数据
      loadAllSwappableNFTs();
      loadUserNFTs();
      
    } catch (error) {
      console.error("Error confirming desired NFTs:", error);
      alert('Failed to update NFT swap preferences. Please try again.');
      setIsProcessingTransaction(false);
    }
  };

  const getFilteredAvailableNFTs = () => {
    if (!desiredNFTsSearchQuery.trim()) {
      return availableNFTsForSelection;
    }
    
    const query = desiredNFTsSearchQuery.toLowerCase().trim();
    return availableNFTsForSelection.filter(nft => {
      // 同时检查name和coupon_name字段
      const nameValue = nft.coupon_name || nft.coupon_name || '';
      const matchesName = nameValue.toLowerCase().includes(query);
      
      // 检查merchantName以及details.merchantName
      const merchantValue = nft.merchant_name || (nft.merchant_name) || '';
      const matchesMerchant = merchantValue.toLowerCase().includes(query);
      
      // 检查coupon_type
      const typeValue = nft.coupon_type || '';
      const matchesType = typeValue.toLowerCase().includes(query);
      
      // 额外检查details中可能的其他描述性字段
      const matchesDetails = nft.details ? 
        Object.values(nft.details).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(query)
        ) : false;
      
      // 记录到控制台以便调试
      if (query.length > 2 && (matchesName || matchesMerchant || matchesType || matchesDetails)) {
        console.log(`匹配到NFT: ${nameValue}, 搜索词: ${query}`);
      }
      
      return matchesName || matchesMerchant || matchesType || matchesDetails;
    });
  };

  const handleNextStep = () => {
    if (!selectedNFTToPost) return;
    handleOpenDesiredNFTsModal();
  };

  // Updated: 显示NFT详情模态框，而不是导航到NftDetailPage
  const handleMarketNFTClick = (nft: NFT) => {
    setSelectedNftForDetail({
      ...nft,
      details: {
        benefits: nft.details?.benefits || '',
        others: nft.details?.others || ''
      }
    });
    setShowNftDetailModal(true);
  };

  // Updated: Opens the modal to select user's NFT, now takes target NFT as argument
  const handleInitiateSwap = (targetNft: NFT) => {
      setSelectedNftToOffer(null); 
      loadUserNFTs(); // Load user's NFTs to select from
      setTargetNftsForSwap([targetNft]); // Set single target NFT
      setShowSwapModal(true); // Open the modal to select user's NFT
  };

   const handleCloseSwapModal = () => {
        setShowSwapModal(false);
        setSelectedNftToOffer(null);
        setTargetNftsForSwap([]); // Clear the targets when closing modal
   }

  const handleSelectNFTForSwap = (nftToOffer: NFT) => {
      setSelectedNftToOffer(nftToOffer);
  };

  // Uses selectedNftToOffer (user's) and targetNftsForSwap (market's)
  const handleConfirmSwap = async () => {
      if (targetNftsForSwap.length === 0 || !selectedNftToOffer || !connectedWallet) return;
      const targetNft = targetNftsForSwap[0]; // Get the first target NFT
      console.log(`确认交换: 用户的NFT ${selectedNftToOffer.coupon_name} (${selectedNftToOffer.id}) 换取 ${targetNft.coupon_name} (${targetNft.id})`);
      try {
          // 验证用户对选择的NFT的所有权
          const userNftData = await nftService.getNFTDetails(selectedNftToOffer.id);
          if (!userNftData) {
            throw new Error('无法获取NFT详情');
          }
          
          // 检查所有权
          let isOwner = false;
          
          // 检查字符串类型的owner_address
          if (typeof userNftData.owner_address === 'string') {
            isOwner = userNftData.owner_address === connectedWallet;
          }
          // 检查JSON对象类型的owner_address
          else if (typeof userNftData.owner_address === 'object' && userNftData.owner_address !== null) {
            isOwner = Object.values(userNftData.owner_address).includes(connectedWallet);
          }
          
          if (!isOwner) {
            throw new Error(`您不是此NFT的所有者，无法用于交换`);
          }
          
          // 验证目标NFT是否接受用户的NFT
          const targetNftData = await nftService.getNFTDetails(targetNft.id);
          if (!targetNftData) {
            throw new Error('无法获取目标NFT详情');
          }
          
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
          else if (Array.isArray(targetNftData.swapping) && targetNftData.swapping.length > 0) {
            isAccepted = true;
          }
          
          if (!isAccepted) {
            throw new Error('此NFT不接受您提供的NFT作为交换');
          }
          
          // 为用户的NFT创建swapping对象，表明它在交换中
          let userNftSwapping: any = {};
          
          if (typeof userNftData.owner_address === 'object' && userNftData.owner_address !== null) {
            Object.keys(userNftData.owner_address).forEach(key => {
              userNftSwapping[key] = [targetNft.id];
            });
          } else {
            userNftSwapping["pending_1"] = [targetNft.id];
          }
          
          // 更新用户NFT的swapping状态
          await nftService.updateNFTSwap(selectedNftToOffer.id, [targetNft.id]);
            
          alert('交换申请已成功发起！所有权将在对方接受后更新。');
          setShowSwapModal(false);
          setSelectedNftToOffer(null);
          setTargetNftsForSwap([]); // 清除目标NFT状态
          loadAllSwappableNFTs(); 
          loadUserNFTs(); 
      } catch (error: any) {
          console.error("发起交换时发生错误:", error);
          alert(`交换失败: ${error.message || '未知错误'}`); 
      }
  };

  // 转换函数：将NFT转换为NftCard期望的格式
  const adaptToNftCardFormat = (nft: NFT): NFT => nft;

  // 添加处理函数，用于打开NFT详情模态框
  const handleOpenNftDetail = (nft: NFT) => {
    setSelectedNftForDetail(nft);
    setShowNftDetailModal(true);
  };

  // 添加处理函数，用于关闭NFT详情模态框
  const handleCloseNftDetail = () => {
    setShowNftDetailModal(false);
    setSelectedNftForDetail(null);
  };

  // 添加过滤函数
  const getFilteredMarketNFTs = () => {
    return marketNFTs.filter(nft => {
      // 过滤掉用户自己的NFT
      const isUserOwned = typeof nft.owner_address === 'string' 
        ? nft.owner_address === connectedWallet
        : typeof nft.owner_address === 'object' && nft.owner_address !== null
          ? Object.values(nft.owner_address).includes(connectedWallet)
          : false;
      
      // 检查是否可交换
      const isSwappable = nft.swapping !== null && 
        (Array.isArray(nft.swapping) ? nft.swapping.length > 0 : 
         typeof nft.swapping === 'object' ? Object.values(nft.swapping).some(arr => Array.isArray(arr) && arr.length > 0) : 
         false);
      
      return !isUserOwned && isSwappable;
    });
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1); // Reset to first page when searching
                    loadAllSwappableNFTs();
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
                  loadAllSwappableNFTs();
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
                      loadAllSwappableNFTs();
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
          ) : getFilteredMarketNFTs().length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {getFilteredMarketNFTs().map((nft) => (
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
                  count={Math.ceil(getFilteredMarketNFTs().length / itemsPerPage)} 
                  page={page} 
                  onChange={(e, value) => {
                    setPage(value);
                    loadAllSwappableNFTs();
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
            ) : userOwnedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {userOwnedNFTs.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => handleSelectNFTToPost(nft)}
                    className={`rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedNFTToPost?.id === nft.id 
                        ? 'ring-2 ring-amber-500' 
                        : 'hover:ring-1 hover:ring-amber-300'
                    }`}
                  >
                    <NftCard 
                      nft={adaptToNftCardFormat(nft)} 
                      onClick={() => handleSelectNFTToPost(nft)}
                      isSelected={selectedNFTToPost?.id === nft.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">You don't have any eligible NFTs available to post for swap.</p>
            )}
            
            {/* 显示选中的NFT名称 */}
            {selectedNFTToPost && (
              <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-gray-700">
                  <span className="font-semibold">Selected:</span> {selectedNFTToPost.coupon_name}
                </p>
              </div>
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
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-11/12 h-[80vh] flex flex-col">
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
                          src={nft.coupon_image || nft.coupon_image || '/placeholder-images/nft-default.jpg'} 
                          alt={nft.coupon_name || 'NFT'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-xs font-medium truncate">{nft.coupon_name || nft.coupon_name}</p>
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
            
            {/* 可滚动的内容区域 */}
            <div className="flex-1 overflow-y-auto mb-4">
              {isLoadingAvailableNFTs ? (
                <div className="flex justify-center p-5">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
                </div>
              ) : getFilteredAvailableNFTs().length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {getFilteredAvailableNFTs()
                      .slice((desiredNFTsPage - 1) * 4, desiredNFTsPage * 4)
                      .map((nft) => {
                        const isSelected = desiredNFTs.some(item => item.id === nft.id);
                        return (
                          <div 
                            key={nft.id}
                            onClick={() => handleToggleDesiredNFT(nft)}
                            className="rounded-lg overflow-hidden cursor-pointer transition-all p-4"
                          >
                            <NftCard 
                              nft={adaptToNftCardFormat(nft)} 
                              onClick={() => {}} // 防止NftCard内部onClick与外层容器onClick冲突
                              isSelected={isSelected}
                            />
                            {/* 添加合约地址显示 */}
                            <div className="p-1 bg-gray-50 border-t mt-0"> 
                              {/* TODO: 合约地址显示 看不全*/}
                              <p className="text-[10px] text-gray-500 truncate">
                                Contract: {nft.contract_address}
                              </p>
                            </div>
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </>
              ) : (
                <p className="text-gray-600">
                  {desiredNFTsSearchQuery 
                    ? "No NFTs match your search. Try different keywords." 
                    : "No NFTs available to select."}
                </p>
              )}
            </div>
            
            {/* 分页控件 */}
            <div className="flex justify-center">
              <Pagination 
                count={Math.ceil(getFilteredAvailableNFTs().length / 4)} 
                page={desiredNFTsPage} 
                onChange={(e, value) => setDesiredNFTsPage(value)}
                color="primary"
              />
            </div>
            
            <div className="flex justify-end gap-4 mt-4">
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

      {/* 成功发布消息对话框 */}
      {isPostSuccessful && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-11/12">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">NFT Posted Successfully!</h2>
              <p className="text-gray-600 mb-4">
                You will be able to claim your NFT any time by clicking on your posted NFT in the "Posted NFTs" section.
              </p>
              <p className="text-gray-600 mb-6">
                Your post will be automatically reclaimed after 48 hours if no one swaps.
              </p>
            </div>
            <div className="text-center">
              <button
                onClick={() => setIsPostSuccessful(false)}
                className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 交易处理中的加载提示 */}
      {isProcessingTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-11/12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Transaction</h2>
            <p className="text-gray-600 mb-4">
              Please wait while we process your transaction. Do not close this window.
            </p>
            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 text-left">
              <p className="text-gray-700 mb-2">
                You will be able to claim your NFT any time by clicking on your posted NFT in the "Posted NFTs" section.
              </p>
              <p className="text-gray-700">
                Your post will be automatically reclaimed after 48 hours if no one swaps.
              </p>
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
              You are offering to swap for: <span className="font-semibold">{targetNftsForSwap[0]?.coupon_name}</span>
            </p>
            {isLoadingUserNFTs ? (
              <div className="flex justify-center p-5">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : userOwnedNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {userOwnedNFTs.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => handleSelectNFTForSwap(nft)}
                    className={`rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedNftToOffer?.id === nft.id 
                        ? 'ring-2 ring-amber-500' 
                        : 'hover:ring-1 hover:ring-amber-300'
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
                src={selectedNftForDetail.coupon_image || selectedNftForDetail.coupon_image || '/placeholder-images/nft-default.jpg'}
                alt={selectedNftForDetail.coupon_name || selectedNftForDetail.coupon_name || 'NFT'}
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
                  {selectedNftForDetail.coupon_type || 'Coupon NFT'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Created by {selectedNftForDetail.creator_address?.substring(0, 6)}...{selectedNftForDetail.creator_address?.substring(38) || 'Unknown'}
                </span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Merchant</h3>
                  <p className="text-gray-800">{selectedNftForDetail.merchant_name || 'Unknown Merchant'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Benefits</h3>
                  <p className="text-gray-800">
                    {selectedNftForDetail.details?.benefits || 'No benefits available.'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-1">Other Details</h3>
                  <p className="text-gray-800">
                    {selectedNftForDetail.details?.others || 'No additional details available.'}
                  </p>
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
    const [postedNFTs, setPostedNFTs] = useState<NFT[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Function to get the desired NFT IDs for a posted NFT
    const getDesiredNftIds = (nft: NFT) => {
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
          // 如果已经有marketNFTs数据，从中过滤出用户发布的NFT
          if (marketNFTs.length > 0 && connectedWallet) {
            const userPostedNFTs = marketNFTs.filter(nft => 
              typeof nft.owner_address === 'string' 
                ? nft.owner_address === connectedWallet
                : typeof nft.owner_address === 'object' && nft.owner_address !== null
                  ? Object.values(nft.owner_address).includes(connectedWallet)
                  : false
            );
            setPostedNFTs(userPostedNFTs);
            return;
          } 
          setPostedNFTs([]);
        } catch (error) {
          console.error("Error loading posted NFTs:", error);
          setPostedNFTs([]);
        } finally {
          setIsLoading(false);
        }
      }
      
      fetchUserPostedNFTs();
    }, [connectedWallet, marketNFTs]);
    
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