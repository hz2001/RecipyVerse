import axiosInstance from './api';

/**
 * NFT服务接口
 */
export interface CouponNFT {
  created_at?: string; // on contract
  owner_address?: string; // on contract
  expires_at?: string; // on contract
  creator_address?: string; // on contract
  description?: string; 
  // description_hash?: string; // on contract
  id: string; 

  coupon_name?: string; // on contract
  coupon_type?: string;
  coupon_image?: string;
  total_supply?: number; // on contract

  swapping?: string[];
  is_used?: boolean; // on contract
  contract_address?: string;
  merchant_name?: string;
  token_id?: string;
}

interface ImageUploadResponse {
  url: string;
}

interface CreateCouponNFTData {
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
    coupon_name: string;
    coupon_type: string;
    benefits: string;
    other_info?: string;
  };
}

/**
 * NFT服务
 */
const nftService = {
  /**
   * 获取用户拥有的NFT
   * @returns 拥有的NFT列表
   */
  async getUserOwnedNFTs(): Promise<CouponNFT[]> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        console.error('未找到会话ID，请先连接钱包');
        return [];
      }

      // 调用API获取用户拥有的NFT
      const response = await axiosInstance.get(`/api/user/get_nfts`);

      if (response.status === 200 && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('获取用户拥有的NFT失败:', error);
      
      // 由于API可能尚未实现，返回空数组
      console.warn('API可能尚未实现，返回空数组');
      return [];
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
      const response = await axiosInstance.get(`/merchant/my_nft_contracts`);
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

      // 调用API获取NFT详情
      const response = await axiosInstance.get(`/nft/details/${nftId}`);

      if (response.status === 200 && response.data) {
        console.log(response.data);
        const couponNFT: CouponNFT = {
          id: response.data.id,
          coupon_name: response.data.coupon_name,
          coupon_type: response.data.coupon_type,
          coupon_image: response.data.coupon_image,
          expires_at: response.data.expires_at,
          total_supply: response.data.total_supply,
          creator_address: response.data.creator_address,
          contract_address: response.data.contract_address,
          owner_address: response.data.owner_address,
          is_used: response.data.is_used,
          description: response.data.details,
          created_at: response.data.created_at,
          swapping: response.data.swapping,
          merchant_name: response.data.merchant_name,
          token_id: response.data.token_id,
        };

        return couponNFT;
      }

      return null;
    } catch (error) {
      console.error('获取NFT详情失败:', error);
      
      // 由于API可能尚未实现，返回null
      console.warn('API可能尚未实现，返回null');
      return null;
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

      const response = await axiosInstance.post('/nft/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 200 && response.data) {
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
   * @returns 创建的优惠券NFT
   */
  async createCouponNFT(data: CreateCouponNFTData) {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        throw new Error('未找到会话ID，请先连接钱包');
      }

      // 1. Create details JSON string and generate hash
      const detailsJson = JSON.stringify(data.details);
      const detailsHash = await this.generateHash(detailsJson);
      
      // 2. Prepare NFT data
      const nftData = {
        coupon_name: data.coupon_name,
        coupon_type: data.coupon_type,
        coupon_image: data.coupon_image,
        expires_at: data.expires_at,
        total_supply: data.total_supply,
        creator_address: data.creator_address,
        contract_address: data.contract_address,
        owner_address: data.owner_address,
        details: detailsJson,
        details_hash: detailsHash,
        swapping: [], // Initialize empty swapping list
        created_at: new Date().toISOString()
      };

      // 3. Send to backend API
      const response = await axiosInstance.post('/nft/create-coupon', nftData);

      if (response.status === 200 && response.data) {
        return response.data;
      }

      throw new Error('Failed to create NFT');
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
  }
};

export default nftService; 