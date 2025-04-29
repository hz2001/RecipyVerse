import axiosInstance from './api';

/**
 * NFT服务接口
 */
export interface CouponNFT {
  id: string;
  coupon_name?: string;
  coupon_type?: string;
  token_id?: string;
  description?: string;
  benefits?: string;
  owner_addresses?: string | Record<string, string>;
  creator_address?: string;
  coupon_image?: string;
  expires_at?: string;
  merchant_name?: string;
  total_supply?: number;
  created_at?: string;
}

interface ImageUploadResponse {
  url: string;
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
  async getUserCreatedNFTs(): Promise<CouponNFT[]> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        console.error('未找到会话ID，请先连接钱包');
        return [];
      }

      // 调用API获取用户创建的NFT
      const response = await axiosInstance.get(`/nft/created`);
      if (response.status === 200 && response.data) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('获取用户创建的NFT失败:', error);
      
      // 由于API可能尚未实现，返回空数组
      console.warn('API可能尚未实现，返回空数组');
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
        return response.data;
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
  }
};

export default nftService; 