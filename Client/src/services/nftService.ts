import axiosInstance from './api';

/**
 * NFT服务接口
 */
export interface NFT {
  id: string;
  coupon_name?: string;
  name?: string;
  token_id?: string;
  description?: string;
  owner_address?: string | Record<string, string>;
  creator_address?: string;
  imageUrl?: string;
  coupon_image?: string;
  coupon_type?: string;
  expires_at?: string;
  expirationDate?: string;
  merchantName?: string;
  total_supply?: number;
  created_at?: string;
  details?: {
    merchantName?: string;
    description?: string;
  };
}

/**
 * NFT服务
 */
const nftService = {
  /**
   * 获取用户拥有的NFT
   * @param walletAddress 钱包地址
   * @returns 拥有的NFT列表
   */
  async getUserOwnedNFTs(walletAddress: string): Promise<NFT[]> {
    try {
      if (!walletAddress) {
        console.error('未提供钱包地址');
        return [];
      }

      // 调用API获取用户拥有的NFT
      const response = await axiosInstance.get(`/nft/owned`, {
        params: { walletAddress }
      });

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
  async getUserCreatedNFTs(walletAddress: string): Promise<NFT[]> {
    try {
      if (!walletAddress) {
        console.error('未提供钱包地址');
        return [];
      }

      // 调用API获取用户创建的NFT
      const response = await axiosInstance.get(`/nft/created`, {
        params: { walletAddress }
      });

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
  async getNFTDetails(nftId: string): Promise<NFT | null> {
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
  }
};

export default nftService; 