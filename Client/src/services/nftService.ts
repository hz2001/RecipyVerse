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

      const response = await axiosInstance.get(`/api/user/get_nfts`);

      const data = response.data;

      // Transform the response data to match CouponNFT structure
      return data.map((nft: any) => ({
        id: nft.id,
        coupon_name: nft.coupon_name,
        coupon_type: nft.coupon_type,
        coupon_image: nft.coupon_image,
        total_supply: nft.total_supply,
        expires_at: nft.expires_at,
        contract_address: nft.contract_address,
        creator_address: nft.creator_address,
        description: JSON.stringify(nft.details),
        is_used: nft.is_used,
        created_at: nft.created_at,
        owner_address: nft.owner_address
      }));
    } catch (error) {
      console.error('Error fetching user owned NFTs:', error);
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
      const response = await axiosInstance.post('/api/nft/create_nft', nftData);

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