import axiosInstance from './api';
import contractService from './contractService';


export interface NFT{
  created_at?: string; // on contract
  owner_address?: string; // on contract
  expires_at?: string; // on contract
  creator_address?: string; // on contract
  details?: {
    benefits?: string;
    others?: string;
  };
  details_hash?: string; // on contract
  id: string; 

  coupon_name?: string; // on contract
  coupon_type?: string;
  coupon_image?: string;
  total_supply?: number; // on contract

  swapping?: string; // JSON-encoded string array of contract addresses
  swapping_id?: string; // JSON-encoded string array of contract addresses
  is_used?: boolean; // on contract
  contract_address?: string;
  merchant_name?: string;
  token_id?: string;
}

/**
 * NFT服务接口
 */
export interface CouponNFT extends NFT {
  created_at?: string; // on contract
  owner_address?: string; // on contract
  expires_at?: string; // on contract
  creator_address?: string; // on contract
  details?: {
    benefits?: string;
    others?: string;
  };
  details_hash?: string; // on contract
  id: string; 

  coupon_name?: string; // on contract
  coupon_type?: string;
  coupon_image?: string;
  total_supply?: number; // on contract

  swapping?: string; // JSON-encoded string array of contract addresses
  swapping_id?: string; // JSON-encoded string array of contract addresses
  is_used?: boolean; // on contract
  contract_address?: string;
  merchant_name?: string;
  token_id?: string;
}

interface ImageUploadResponse {
  url: string;
}

export interface CreateCouponNFTData {
  coupon_name: string;
  coupon_type: string;
  coupon_image: string;
  expires_at: string;
  total_supply: number;
  creator_address: string;
  contract_address: string;
  owner_address: string | null;
  is_used: boolean;
  details: {
    benefits: string;
    other_info?: string;
  };
}

/**
 * NFT服务
 */
const nftService = {
  // 缓存已获取的商家名称
  _merchantNameCache: new Map<string, string>(),

  // 缓存已获取的合约NFT信息
  _contractNFTCache: new Map<string, any>(),

  /**
   * 获取商家名称
   * @param creatorAddress 创建者地址
   * @returns 商家名称
   */
  async getMerchantName(creatorAddress: string): Promise<string> {
    // 检查缓存中是否已有该地址的商家名称
    if (this._merchantNameCache.has(creatorAddress)) {
      return this._merchantNameCache.get(creatorAddress) || 'Unknown Merchant';
    }
    
    try {
      const merchantResponse = await axiosInstance.get(`/api/merchant/get_merchant_info/${creatorAddress}`);
      const merchantName = merchantResponse.data?.merchant_name || 'Unknown Merchant';
      
      // 将结果存入缓存
      this._merchantNameCache.set(creatorAddress, merchantName);
      
      return merchantName;
    } catch (error) {
      console.error('Error fetching merchant name:', error);
      // 错误情况下也缓存默认值，避免重复请求出错的地址
      this._merchantNameCache.set(creatorAddress, 'Unknown Merchant');
      return 'Unknown Merchant';
    }
  },

  /**
   * 获取用户拥有的NFT
   * @returns 拥有的NFT列表
   */
  async getUserOwnedNFTs(): Promise<NFT[]> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        console.error('Cannot get user owned NFTs: Wallet not connected');
        return [];
      }

      const response = await axiosInstance.get(`/api/user/get_nfts`);
      
      if (response.status === 200 && response.data) {
        console.log("Owned NFTs response.data", response.data);

        // 获取所有NFT的商家名称
        const merchantNames = await Promise.all(
          response.data.map(async (nft: any) => this.getMerchantName(nft.creator_address))
        );

        return response.data.map((nft: any, index: number) => ({
          id: nft.id,
          token_id: nft.token_id,
          coupon_name: nft.coupon_name,
          coupon_type: nft.coupon_type,
          coupon_image: nft.coupon_image,
          total_supply: nft.total_supply,
          expires_at: nft.expires_at,
          contract_address: nft.contract_address,
          creator_address: nft.creator_address,
          owner_address: nft.owner_address,
          created_at: nft.created_at,
          details: nft.details,
          is_used: nft.is_used || false,
          merchant_name: merchantNames[index],
          swapping: nft.swapping || "",
          swapping_id: nft.swapping_id || ""
        }));
      }

      // Transform the response data to match CouponNFT structure
      return [];
    } catch (error) {
      console.error('Error getting user owned NFTs:', error);
      throw error;
    }
  },

  /**
   * 获取用户创建的NFT
   * @param walletAddress 钱包地址
   * @returns 创建的NFT列表
   */
  async getCreatedNFTs(): Promise<CouponNFT[]> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        console.error('未找到会话ID，请先连接钱包');
        return [];
      }

      // 调用API获取用户创建的NFT
      const response = await axiosInstance.get(`api/merchant/my_nft_contracts`);
      if (response.status === 200 && response.data) {
        console.log(response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('获取用户创建的NFT失败:', error);
      return [];
    }
  },

  /**
   * 获取NFT详情
   * @param nftId NFT ID
   * @returns NFT详情
   */
  async getNFTDetails(nftId: string): Promise<CouponNFT | null> {
    try {
      if (!nftId) {
        console.error('未提供NFT ID');
        return null;
      }

      const response = await axiosInstance.get(`/api/user/get_nft_detail/${nftId}`);

      if (response.status === 200 && response.data) {
        const nftData = response.data;
        return {
          ...nftData,
          description: nftData.details?.description || JSON.stringify(nftData.details || {})
        };
      }

      return null;
    } catch (error) {
      console.error('获取NFT详情失败:', error);
      return null;
    }
  },

  /**
   * 获取所有可交换的NFT, 可交换NFT是指在数据库中设置了swapping字段的NFT
   * @returns 可交换的NFT列表
   */
  async getAllSwappableNFTs(): Promise<NFT[]> {
    try {
      const response = await axiosInstance.get('/api/nft/get_swapping');
      if (response.status === 200 && response.data) {
        console.log("getAllSwappableNFTs response.data", response.data);
        
        // 获取所有NFT的商家名称
        const merchantNames = await Promise.all(
          response.data.map(async (nft: any) => this.getMerchantName(nft.creator_address))
        );
        
        // 将商家名称添加到NFT对象中
        return response.data.map((nft: any, index: number) => ({
          ...nft,
          merchant_name: merchantNames[index]
        }));
      }
      return [];
    } catch (error) {
      console.error('获取所有可交换的NFT失败:', error);
      return [];
    }
  },

  /** 
   * 获取所有NFT
   * @returns 所有NFT列表
   */
  async getAllNfts(): Promise<NFT[]> {
    try {
      const response = await axiosInstance.get('/api/nft/get_all');
      if (response.status === 200 && response.data) {
        // 获取所有NFT的商家名称
        const merchantNames = await Promise.all(
          response.data.map(async (nft: any) => this.getMerchantName(nft.creator_address))
        );
        
        // 将商家名称添加到NFT对象中
        return response.data.map((nft: any, index: number) => ({
          ...nft,
          merchant_name: merchantNames[index]
        }));
      }
      return [];
    } catch (error) {
      console.error('获取所有NFT失败:', error);
      return [];
    }
  },
  /**
   * 上传NFT图片
   * @param formData 包含图片文件的FormData
   * @returns 图片URL
   */
  async uploadImage(formData: FormData): Promise<{ data: ImageUploadResponse }> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        throw new Error('未找到会话ID，请先连接钱包');
      }

      const response = await axiosInstance.post('/api/nft/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 200 && response.data) {
        console.log(response.data);
        return { data: response.data };
      }

      throw new Error('上传图片失败');
    } catch (error) {
      console.error('上传NFT图片失败:', error);
      throw error;
    }
  },

  /**
   * 创建NFT
   * @param nftData NFT数据
   * @returns 创建的NFT
   */
  async createNFT(nftData: Omit<CouponNFT, 'id'>): Promise<CouponNFT> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        throw new Error('未找到会话ID，请先连接钱包');
      }

      const response = await axiosInstance.post('/nft/create', nftData);

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new Error('创建NFT失败');
    } catch (error) {
      console.error('创建NFT失败:', error);
      throw error;
    }
  },

  /**
   * 创建优惠券NFT
   * @param data 创建优惠券NFT数据
   * @param img
   * @returns 创建的优惠券NFT
   */
  async createCouponNFT(data: CreateCouponNFTData, img: File): Promise<CouponNFT> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        throw new Error('未找到会话ID，请先连接钱包');
      }
      // TODO: upload image to ipfs then later get the url and display it

      // 1. Parse initial owners from comma-separated string
      const initialOwners = data.owner_address 
        ? data.owner_address.split(',').map(addr => addr.trim())
        : [];

      // 2. Create details JSON string
      const detailsJson = JSON.stringify(data.details);
      const detailsHash = await this.generateHash(detailsJson);
      
      // 3. Try to mint NFT for each initial owner sequentially
      const contract = await contractService.getContractToBeCalled(data.contract_address);
      const results = [];
      
      for (const ownerAddress of initialOwners) {
        try {
          // First upload to database
          const nftData: NFT = {
            id: '', // Will be assigned by backend
            coupon_name: data.coupon_name,
            coupon_type: data.coupon_type,
            coupon_image: data.coupon_image,
            expires_at: data.expires_at,
            total_supply: data.total_supply,
            creator_address: data.creator_address,
            contract_address: data.contract_address,
            owner_address: ownerAddress,
            details: data.details,
            details_hash: detailsHash,
            token_id: '', // Will be assigned after minting
            created_at: new Date().toISOString()
          };

          const nftFormData = new FormData();
          nftFormData.append('nft_data', JSON.stringify(nftData));
          nftFormData.append('file', img);

          const dbResponse = await axiosInstance.post('/api/nft/create_nft', nftFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          if (dbResponse.status !== 200) {
            results.push({ address: ownerAddress, success: false, error: 'Failed to upload NFT data to database' });
            continue;
          }

          // Then mint on contract
          const tx = await contract.mint(ownerAddress, detailsHash);
          const receipt = await tx.wait();
          console.log("tx receipt", receipt);
          const tokenId = receipt.logs[1].args[1].toString();

          console.log("tokenId", tokenId);
          if (tokenId === null || tokenId === undefined) {
            results.push({ address: ownerAddress, success: false, error: 'Failed to get tokenId from event' });
            continue;
          }
          
          // Update database with tokenId
          const formData = new FormData();
          formData.append('token_id', tokenId);
          const updateResponse = await axiosInstance.put(`/api/nft/update/${dbResponse.data.id}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          // const updateResponse = await fetch(`/api/nft/update/${dbResponse.data.id}`, {
          //   method: 'PUT',
          //   headers: {
          //     'Content-Type': 'multipart/form-data'
          //   },
          //   body: formData
          // });

          if (updateResponse.status !== 200) {
            results.push({ address: ownerAddress, success: false, error: 'Failed to update NFT with tokenId' });
            continue;
          }

          results.push({ address: ownerAddress, success: true, nftData: updateResponse.data });
        } catch (error) {
          console.error(`Failed to process NFT for ${ownerAddress}:`, error);
          results.push({ address: ownerAddress, success: false, error });
        }
      }

      // 4. Log results and return successful operations
      const successfulOperations = results.filter(result => result.success);
      const failedOperations = results.filter(result => !result.success);

      if (successfulOperations.length > 0) {
        console.log('Successfully processed NFTs for addresses:', successfulOperations.map(op => op.address));
        if (failedOperations.length > 0) {
          console.warn('Failed to process NFTs for addresses:', failedOperations.map(op => op.address));
        }
        return successfulOperations[0].nftData;
      }

      throw new Error('Failed to create any NFTs');
    } catch (error) {
      console.error('Error creating NFT:', error);
      throw error;
    }
  },

  async generateHash(data: string): Promise<string> {
    // Using Web Crypto API to generate SHA-256 hash
    const msgBuffer = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  /**
   * 更新NFT的交换状态
   * @param nftId NFT ID
   * @param desiredNFTs 期望交换的NFT ID列表
   * @param swapping_id 交换ID
   */
  async updateNFTSwap(nftId: string, desiredNFTs: string[], swapping_id?: string): Promise<boolean> {
    try {
      const formData = new FormData();
      
      // 将desiredNFTs数组转换为JSON字符串并添加到FormData
      // The backend will handle the JSON stringification
      formData.append('desiredNFTs', JSON.stringify(desiredNFTs));
      formData.append('swapping_id', swapping_id);

      console.log('Updating NFT swap with desiredNFTs:', desiredNFTs);
      
      const response = await axiosInstance.put(`/api/nft/update/${nftId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.status !== 200) {
        throw new Error('Failed to update NFT swap status');
      }
      
      return true;
    } catch (error) {
      console.error('Error updating NFT swap status:', error);
      return false;
    }
  },

  /**
   * 交换NFT所有权
   * @param my_nft 要交换的NFT ID
   * @param target_nft 目标NFT ID
   * @returns 交换结果
   */
  async swapOwnership(my_nft: NFT, target_nft: NFT): Promise<boolean> {
    try {
      if (!my_nft || !target_nft) {
        throw new Error('Invalid NFTs provided');
      }

      const formData = new FormData();
      formData.append('my_nft', JSON.stringify(my_nft));
      formData.append('target_nft', JSON.stringify(target_nft));

      const response = await axiosInstance.put(`/api/nft/swap_nft`, formData, {  
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }); 

      if (response.status !== 200) {
        throw new Error('Failed to swap ownership');
      }

      return true;
    } catch (error) {
      console.error('Error swapping ownership:', error);
      return false;
    }
  }
};

export default nftService; 