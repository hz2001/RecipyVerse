import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import hooks
import { Button, CircularProgress, Modal, TextField, Pagination, FormControlLabel, Checkbox } from '@mui/material';
import NftCard from '../components/NftCard'; 
import { useWallet } from '../contexts/WalletContext';
import { supabase } from '../utils/supabaseClient';

// 重命名以避免与导入的NftCard期望的Nft接口冲突
interface SwapNft {
  id: string;
  name?: string;
  imageUrl?: string;
  merchantName?: string;
  expirationDate?: string;
  benefits?: string[];
  ownerId?: string; 
  description?: string;
  contractAddress?: string;
  tokenId?: string;
  // 添加NftCard组件所需字段以便转换
  coupon_name?: string;
  coupon_type?: string;
  coupon_image?: string;
  expires_at?: string;
  creator_address?: string;
  owner_address?: string | any; // 兼容字符串和JSON对象格式
  details?: any;
  total_supply?: number;
}

// Interface for Supabase NFT data
interface SupabaseNft {
  id: string;
  token_id?: string;
  created_at: string;
  owner_address: string | any; // 可以是字符串或JSON对象
  swapping?: string | any; // 可以是布尔值或JSON对象，如 {"pending_1":"true","pending_2":"false"}
  expires_at: string;
  creator_address: string;
  details?: any; // JSON格式的NFT详情
  coupon_name: string;
  coupon_type?: string;
  coupon_image?: string;
  total_supply?: number;
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

  // --- UseEffect to handle navigation state from NftDetailPage ---
  useEffect(() => {
      const locationState = location.state as { triggerSwapForNft?: SwapNft };
      if (locationState?.triggerSwapForNft) {
          console.log("Swap initiated from Detail Page for:", locationState.triggerSwapForNft);
          // Set the target NFT and immediately open the 'Select Your NFT' modal
          setTargetNftForSwap(locationState.triggerSwapForNft);
          // Clear the state from location history to prevent re-triggering on refresh/back
          navigate(location.pathname, { replace: true, state: {} }); 
          // Call the handler that opens the modal
          handleInitiateSwap(locationState.triggerSwapForNft);
      }
  }, [location.state, navigate]); // Depend on location.state

  // Load market NFTs on component mount and when wallet changes
  useEffect(() => {
    loadMarketNFTs();
  }, [connectedWallet]);

  // Convert Supabase NFT to app NFT format
  const convertSupabaseNftToAppNft = (nft: SupabaseNft): SwapNft => {
    // Parse the detail JSON if it's a string
    const detail = typeof nft.details === 'string' 
      ? JSON.parse(nft.details) 
      : nft.details;
      
    return {
      id: nft.id,
      name: detail?.name || `NFT #${nft.token_id}`,
      description: detail?.description || '',
      imageUrl: detail?.imageUrl || '/placeholder-images/nft-default.jpg',
      merchantName: detail?.merchantName || '',
      expirationDate: nft.expires_at || '',
      benefits: detail?.benefits || [],
      ownerId: nft.owner_address,
      contractAddress: detail?.contractAddress || '',
      tokenId: nft.token_id,
      coupon_name: nft.coupon_name,
      coupon_type: nft.coupon_type,
      coupon_image: nft.coupon_image,
      expires_at: nft.expires_at,
      creator_address: nft.creator_address,
      owner_address: nft.owner_address,
      details: detail,
      total_supply: nft.total_supply
    };
  };

  const loadMarketNFTs = async () => {
    setIsLoadingMarket(true);
    try {
      console.log('加载市场上可用的NFT...');
      
      // 获取所有NFT
      const { data, error } = await supabase
        .from('nfts')
        .select('*');
        
      if (error) {
        console.error("获取NFT数据失败:", error);
        setMarketNFTs([]);
        setTotalPages(1);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('未找到任何NFT');
        setMarketNFTs([]);
        setTotalPages(1);
        return;
      }
      
      console.log('获取到的NFT总数:', data.length);
      
      // 筛选出在市场上交换的NFT
      const marketAvailableNfts = data.filter(nft => {
        // 检查swapping状态
        // 新的检查方法：检查swapping是否为对象，且包含至少一个非空数组
        if (typeof nft.swapping === 'object' && nft.swapping !== null) {
          return Object.values(nft.swapping).some(value => 
            Array.isArray(value) && value.length > 0);
        }
        
        // 向后兼容：检查旧格式的swapping (布尔值或字符串)
        if (nft.swapping === true) {
          return true;
        }
        
        // 向后兼容：检查旧格式的JSON对象
        if (typeof nft.swapping === 'string' && nft.swapping.includes('{')) {
          try {
            const swappingObj = JSON.parse(nft.swapping);
            if (typeof swappingObj === 'object') {
              return Object.values(swappingObj).some(status => 
                status === true || status === "true");
            }
          } catch (err) {
            console.error('解析swapping JSON字符串失败:', err);
          }
        }
        
        return false;
      });
      
      console.log('可交换的NFT数量:', marketAvailableNfts.length);
      
      // 过滤掉当前用户拥有的NFT
      let filteredNfts = marketAvailableNfts.filter(nft => {
        // 检查字符串类型的owner_address
        if (typeof nft.owner_address === 'string') {
          return nft.owner_address !== connectedWallet;
        }
        
        // 检查JSON对象类型的owner_address
        if (typeof nft.owner_address === 'object' && nft.owner_address !== null) {
          return !Object.values(nft.owner_address).includes(connectedWallet);
        }
        
        return true; // 其他情况保留
      });
      
      // 检查是否只显示匹配的NFT（接受用户NFT的）
      if (showOnlyMatches && connectedWallet) {
        // 获取用户拥有的NFT ID列表
        const userNftIds = await getUserNFTIds();
        
        // 只保留那些明确接受用户NFT的帖子
        filteredNfts = filteredNfts.filter(nft => {
          if (typeof nft.swapping === 'object' && nft.swapping !== null) {
            // 检查所有的desired数组，看是否包含用户的NFT
            return Object.values(nft.swapping).some(desiredIds => {
              return Array.isArray(desiredIds) && 
                     desiredIds.some(id => userNftIds.includes(id));
            });
          }
          return false;
        });
      }
      
      // 应用搜索过滤
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredNfts = filteredNfts.filter(nft => {
          const details = typeof nft.details === 'string' 
            ? JSON.parse(nft.details) 
            : nft.details || {};
            
          const matchesName = (nft.coupon_name || details?.name || '').toLowerCase().includes(query);
          const matchesMerchant = (details?.merchantName || '').toLowerCase().includes(query);
          const matchesType = (nft.coupon_type || '').toLowerCase().includes(query);
          const matchesDescription = (details?.description || '').toLowerCase().includes(query);
          
          return matchesName || matchesMerchant || matchesType || matchesDescription;
        });
      }
      
      // 计算总页数
      const totalItems = filteredNfts.length;
      const calculatedTotalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
      setTotalPages(calculatedTotalPages);
      
      // 应用分页
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedNfts = filteredNfts.slice(startIndex, startIndex + itemsPerPage);
      
      // 转换为应用格式的NFT
      const marketNfts = paginatedNfts.map(convertSupabaseNftToAppNft);
      setMarketNFTs(marketNfts);
      console.log("加载市场NFT完成:", marketNfts.length);
    } catch (error) {
      console.error("加载市场NFT时发生错误:", error);
      setMarketNFTs([]);
      setTotalPages(1);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  // 辅助函数：获取用户拥有的NFT ID列表
  const getUserNFTIds = async () => {
    if (!connectedWallet) return [];
    
    try {
      const { data: allNfts, error } = await supabase
        .from('nfts')
        .select('id, owner_address');
        
      if (error) {
        console.error("获取用户NFT ID失败:", error);
        return [];
      }
      
      // 筛选用户拥有的NFT ID
      const userOwnedNftIds = allNfts
        .filter(nft => {
          let isOwned = false;
          
          // 检查字符串类型的owner_address
          if (typeof nft.owner_address === 'string') {
            isOwned = nft.owner_address === connectedWallet;
          }
          // 检查JSON对象类型的owner_address
          else if (typeof nft.owner_address === 'object' && nft.owner_address !== null) {
            isOwned = Object.values(nft.owner_address).includes(connectedWallet);
          }
          
          return isOwned;
        })
        .map(nft => nft.id);
      
      return userOwnedNftIds;
    } catch (error) {
      console.error("获取用户NFT ID失败:", error);
      return [];
    }
  };

  const loadUserNFTs = async () => {
    if (!connectedWallet) {
      setUserNFTs([]);
      return;
    }
    
    setIsLoadingUserNFTs(true);
    try {
      console.log('加载用户拥有的NFT, 钱包地址:', connectedWallet);
      
      // 获取所有NFT
      const { data: allNfts, error: allError } = await supabase
        .from('nfts')
        .select('*');
        
      if (allError) {
        console.error("获取所有NFT失败:", allError);
        setUserNFTs([]);
        return;
      }
      
      // 筛选用户拥有的NFT
      const userOwnedNfts = allNfts.filter(nft => {
        let isOwned = false;
        
        // 检查字符串类型的owner_address
        if (typeof nft.owner_address === 'string') {
          isOwned = nft.owner_address === connectedWallet;
        }
        // 检查JSON对象类型的owner_address
        else if (typeof nft.owner_address === 'object' && nft.owner_address !== null) {
          isOwned = Object.values(nft.owner_address).includes(connectedWallet);
        }
        
        return isOwned;
      });
      
      // 筛选未在交换中的NFT - 使用新格式
      const availableNfts = userOwnedNfts.filter(nft => {
        // 如果swapping不存在或为false
        if (nft.swapping === false || nft.swapping === undefined || nft.swapping === null) {
          return true;
        }
        
        // 新格式：检查swapping是否为对象
        if (typeof nft.swapping === 'object' && nft.swapping !== null) {
          // 如果所有数组都为空，则视为不在交换中
          return Object.values(nft.swapping).every(value => 
            !Array.isArray(value) || value.length === 0);
        }
        
        // 向后兼容：旧格式
        if (nft.swapping === true) {
          return false;
        }
        
        if (typeof nft.swapping === 'string' && nft.swapping.includes('{')) {
          try {
            const swappingObj = JSON.parse(nft.swapping);
            if (typeof swappingObj === 'object') {
              return !Object.values(swappingObj).some(status => 
                status === true || status === "true");
            }
          } catch (err) {
            console.error('解析swapping JSON字符串失败:', err);
          }
        }
        
        return true; // 默认可用
      });
      
      console.log('用户拥有的可用NFT数量:', availableNfts.length);
      
      // 转换为应用格式
      const userNftsFormatted = availableNfts.map(convertSupabaseNftToAppNft);
      setUserNFTs(userNftsFormatted);
      console.log("加载用户NFT完成:", userNftsFormatted.length);
    } catch (error) {
      console.error("加载用户NFT时发生错误:", error);
      setUserNFTs([]);
    } finally {
      setIsLoadingUserNFTs(false);
    }
  };

  const loadUserPostedNFTs = async () => {
    if (!connectedWallet) return [];
    
    try {
      console.log('加载用户已发布的NFT, 钱包地址:', connectedWallet);
      
      // 获取所有NFT
      const { data: allNfts, error: allError } = await supabase
        .from('nfts')
        .select('*');
        
      if (allError) {
        console.error("获取所有NFT失败:", allError);
        return [];
      }
      
      // 筛选用户拥有的NFT
      const userOwnedNfts = allNfts.filter(nft => {
        let isOwned = false;
        
        // 检查字符串类型的owner_address
        if (typeof nft.owner_address === 'string') {
          isOwned = nft.owner_address === connectedWallet;
        }
        // 检查JSON对象类型的owner_address
        else if (typeof nft.owner_address === 'object' && nft.owner_address !== null) {
          isOwned = Object.values(nft.owner_address).includes(connectedWallet);
        }
        
        return isOwned;
      });
      
      // 筛选已在交换中的NFT - 使用新格式
      const swappingNfts = userOwnedNfts.filter(nft => {
        // 新格式：检查swapping是否为对象且包含非空数组
        if (typeof nft.swapping === 'object' && nft.swapping !== null) {
          return Object.values(nft.swapping).some(value => 
            Array.isArray(value) && value.length > 0);
        }
        
        // 向后兼容：旧格式
        if (nft.swapping === true) {
          return true;
        }
        
        if (typeof nft.swapping === 'string' && nft.swapping.includes('{')) {
          try {
            const swappingObj = JSON.parse(nft.swapping);
            if (typeof swappingObj === 'object') {
              return Object.values(swappingObj).some(status => 
                status === true || status === "true");
            }
          } catch (err) {
            console.error('解析swapping JSON字符串失败:', err);
          }
        }
        
        return false;
      });
      
      console.log('用户已发布交换的NFT数量:', swappingNfts.length);
      
      // 转换为应用格式
      const formattedNfts = swappingNfts.map(convertSupabaseNftToAppNft);
      console.log("加载用户已发布NFT完成:", formattedNfts.length);
      return formattedNfts;
    } catch (error) {
      console.error("加载用户已发布NFT时发生错误:", error);
    }
    return [];
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
      // Get all NFTs excluding the user's own NFTs
      const { data, error } = await supabase
        .from('nfts')
        .select('*');
        
      if (error) {
        console.error("获取NFT数据失败:", error);
        return [];
      }
      
      // Filter out the user's own NFTs and the currently selected NFT
      const availableNfts = data.filter(nft => {
        // Skip the currently selected NFT
        if (selectedNFTToPost && nft.id === selectedNFTToPost.id) {
          return false;
        }
        
        // Skip user's own NFTs
        if (typeof nft.owner_address === 'string') {
          return nft.owner_address !== connectedWallet;
        }
        
        if (typeof nft.owner_address === 'object' && nft.owner_address !== null) {
          return !Object.values(nft.owner_address).includes(connectedWallet);
        }
        
        return true;
      });
      
      // Convert to app format
      return availableNfts.map(convertSupabaseNftToAppNft);
    } catch (error) {
      console.error("加载可选NFT时发生错误:", error);
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
  const handleConfirmDesiredNFTs = () => {
    setShowDesiredNFTsSelectionModal(false);
  };
  
  // New function to filter available NFTs based on search query
  const getFilteredAvailableNFTs = () => {
    if (!desiredNFTsSearchQuery.trim()) {
      return availableNFTsForSelection;
    }
    
    const query = desiredNFTsSearchQuery.toLowerCase().trim();
    return availableNFTsForSelection.filter(nft => {
      const matchesName = (nft.name || '').toLowerCase().includes(query);
      const matchesMerchant = (nft.merchantName || '').toLowerCase().includes(query);
      const matchesType = (nft.coupon_type || '').toLowerCase().includes(query);
      const matchesDescription = (nft.description || '').toLowerCase().includes(query);
      
      return matchesName || matchesMerchant || matchesType || matchesDescription;
    });
  };

  const handleConfirmPostToMarket = async () => {
    if (!selectedNFTToPost || !connectedWallet) return;
    console.log("确认发布NFT到市场:", selectedNFTToPost);
    console.log("已选择的期望交换NFT:", desiredNFTs);
    
    try {
        // 查询NFT以获取当前状态
        const { data: nftData, error: nftError } = await supabase
          .from('nfts')
          .select('*')
          .eq('id', selectedNFTToPost.id)
          .single();
          
        if (nftError) {
          console.error("获取NFT数据失败:", nftError);
          alert('获取NFT数据失败，无法发布');
          return;
        }
        
        // 确认这个NFT属于当前用户
        let isOwner = false;
        
        // 检查字符串类型的owner_address
        if (typeof nftData.owner_address === 'string') {
          isOwner = nftData.owner_address === connectedWallet;
        }
        // 检查JSON对象类型的owner_address
        else if (typeof nftData.owner_address === 'object' && nftData.owner_address !== null) {
          isOwner = Object.values(nftData.owner_address).includes(connectedWallet);
        }
        
        if (!isOwner) {
          console.error("当前用户不是此NFT的所有者");
          alert('您不是此NFT的所有者，无法发布');
          return;
        }
        
        // 获取所需NFT的ID列表
        const desiredNftIds = desiredNFTs.map(nft => nft.id);
        
        // 创建swapping对象，使用新的数据结构
        let updatedSwapping: any = {};
        
        // 如果owner_address是对象，为每个token创建一个desired数组
        if (typeof nftData.owner_address === 'object' && nftData.owner_address !== null) {
          Object.keys(nftData.owner_address).forEach(key => {
            updatedSwapping[key] = desiredNftIds;
          });
        } else {
          // 单一所有者，创建一个pending_1条目
          updatedSwapping["pending_1"] = desiredNftIds;
        }
        
        // 如果没有选择期望的NFT，使用空数组
        if (desiredNftIds.length === 0) {
          if (typeof nftData.owner_address === 'object' && nftData.owner_address !== null) {
            Object.keys(nftData.owner_address).forEach(key => {
              updatedSwapping[key] = [];
            });
          } else {
            updatedSwapping["pending_1"] = [];
          }
        }
        
        // 更新NFT的swapping状态
        const { error } = await supabase
          .from('nfts')
          .update({ swapping: updatedSwapping })
          .eq('id', selectedNFTToPost.id);
          
        if (error) {
          console.error("发布NFT到市场失败:", error);
          alert('发布NFT到市场失败');
          return;
        }
        
        alert('NFT已成功发布到交换市场！'); 
        handleClosePostModal();
        loadMarketNFTs(); 
    } catch (error) {
        console.error("发布NFT到市场时发生错误:", error);
        alert('发布NFT失败'); 
    }
  };

  // Updated: Navigates to NftDetailPage
  const handleMarketNFTClick = (nft: SwapNft) => {
      if (nft.ownerId === connectedWallet) return; 
      console.log(`Navigating to detail page for NFT: ${nft.id}`);
      // Pass the NFT data along in state to potentially avoid re-fetch on detail page
      navigate(`/nft/${nft.id}`, { state: { nftData: nft } }); 
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
          const { data: userNftData, error: userNftError } = await supabase
            .from('nfts')
            .select('*')
            .eq('id', selectedNftToOffer.id)
            .single();
            
          if (userNftError) {
            throw new Error(`获取用户NFT数据失败: ${userNftError.message}`);
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
          const { data: targetNftData, error: targetNftError } = await supabase
            .from('nfts')
            .select('*')
            .eq('id', targetNftForSwap.id)
            .single();
            
          if (targetNftError) {
            throw new Error(`获取目标NFT数据失败: ${targetNftError.message}`);
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
          
          if (typeof userNftData.owner_address === 'object' && userNftData.owner_address !== null) {
            Object.keys(userNftData.owner_address).forEach(key => {
              userNftSwapping[key] = [targetNftForSwap.id];
            });
          } else {
            userNftSwapping["pending_1"] = [targetNftForSwap.id];
          }
          
          // 更新用户NFT的swapping状态
          const { error: markError } = await supabase
            .from('nfts')
            .update({ swapping: userNftSwapping })
            .eq('id', selectedNftToOffer.id);
            
          if (markError) {
            throw new Error(`标记NFT为交换状态失败: ${markError.message}`);
          }
            
          // TODO: 这里应该实现实际的交换逻辑
          // 这通常会涉及智能合约调用或后端交换处理
          // 目前我们只是模拟交换请求的记录
          
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
  const adaptToNftCardFormat = (nft: SwapNft) => {
    // 将benefits数组转换为字符串
    const benefitsString = Array.isArray(nft.benefits) 
      ? nft.benefits.join(', ') 
      : (nft.benefits || '');
    
    return {
      id: nft.id,
      coupon_name: nft.coupon_name || nft.name || `NFT #${nft.id}`,
      coupon_type: nft.coupon_type || 'Generic',
      coupon_image: nft.coupon_image,
      expires_at: nft.expires_at || nft.expirationDate || new Date().toISOString(),
      creator_address: nft.creator_address,
      owner_address: nft.owner_address || nft.ownerId,
      details: {
        merchantName: nft.merchantName || 'Unknown Merchant',
        description: nft.description || '',
        benefits: benefitsString, // 使用转换后的字符串
      },
      name: nft.name,
      imageUrl: nft.imageUrl,
      merchantName: nft.merchantName,
      expirationDate: nft.expirationDate,
      // 不要传递原始benefits数组，以避免类型冲突
      ownerId: nft.ownerId,
      description: nft.description,
      // 确保必填字段有默认值
      total_supply: nft.total_supply || 1
    };
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
            
            {/* Desired NFTs Section */}
            {selectedNFTToPost && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Select NFTs You Want in Return</h3>
                  <Button 
                    variant="outlined" 
                    color="primary"
                    onClick={handleOpenDesiredNFTsModal}
                  >
                    Browse NFTs
                  </Button>
                </div>
                
                {desiredNFTs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {desiredNFTs.map((nft) => (
                      <div key={nft.id} className="flex items-center border rounded-lg p-2">
                        <div className="w-12 h-12 rounded-md overflow-hidden mr-3">
                          <img 
                            src={nft.imageUrl || nft.coupon_image || '/placeholder-images/nft-default.jpg'} 
                            alt={nft.name || 'NFT'} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{nft.name || nft.coupon_name}</h4>
                          <p className="text-xs text-gray-500">{nft.merchantName || 'Unknown Merchant'}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleDesiredNFT(nft);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    No specific NFTs selected. Your NFT will be available for anyone to offer a swap.
                  </p>
                )}
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
                onClick={handleConfirmPostToMarket}
                disabled={!selectedNFTToPost || isLoadingUserNFTs}
                className={`px-6 py-2 bg-amber-500 text-white rounded-md ${
                  !selectedNFTToPost || isLoadingUserNFTs 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-amber-600'
                } transition-colors`}
              >
                Confirm & Post NFT
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
              Select NFTs You Want
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
                      <NftCard 
                        nft={adaptToNftCardFormat(nft)} 
                        onClick={() => handleToggleDesiredNFT(nft)}
                        isSelected={isSelected}
                      />
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
                Confirm Selection
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
    </div>
  );
  
  // User Posted NFTs Component (internal)
  function UserPostedNFTs() {
    const [postedNFTs, setPostedNFTs] = useState<SwapNft[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
      async function fetchUserPostedNFTs() {
        setIsLoading(true);
        const nfts = await loadUserPostedNFTs();
        setPostedNFTs(nfts || []);
        setIsLoading(false);
      }
      
      fetchUserPostedNFTs();
    }, [connectedWallet]);
    
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
                onClick={() => {}}
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