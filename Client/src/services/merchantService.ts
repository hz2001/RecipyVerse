import axiosInstance from './api';

/**
 * 商家实体接口
 */
export interface Merchant {
  id: number;
  created_at: string;
  wallet_address: string;
  is_verified: string;
  merchant_name: string;
  merchant_address: string;
}

/**
 * 商家服务接口
 */
export interface MerchantService {
  uploadQualification(merchantName: string, merchantAddress: string, file: File): Promise<boolean>;
  getMyNFTContracts(): Promise<any[]>;
  getMerchantInfo(): Promise<Merchant>;
}

/**
 * 商家服务实现
 */
class MerchantServiceImpl implements MerchantService {
  /**
   * 上传商家资质认证
   * @param merchantName 商家名称
   * @param merchantAddress 商家地址
   * @param file 认证文件
   * @returns 是否上传成功
   */
  async uploadQualification(merchantName: string, merchantAddress: string, file: File): Promise<boolean> {
    try {
      // 创建FormData对象用于文件上传
      const formData = new FormData();
      formData.append('file', file);
      formData.append('merchantName', merchantName);
      formData.append('merchantAddress', merchantAddress);
      
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId=')).split('=')[1];
      // 发送上传请求
      const response = await axiosInstance.post(`/api/merchant/upload_qualification?sessionId=${sessionId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }

      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Failed to upload merchant qualification:', error);
      return false;
    }
  }
  /**
   * 获取我的NFT合约列表
   * @returns NFT合约列表
   */
  async getMyNFTContracts(): Promise<any[]> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      const response = await axiosInstance.get(`/api/merchant/my_nft_contracts?sessionId=${sessionId}`);
      
      if (response.status === 200) {
        console.log(response.data);
        return response.data || [];
      }
      
      return [];
    } catch (error) {
      console.error('Failed to get NFT contracts:', error);
      return [];
    }
  }
  /**
   * 获取商家信息
   * @returns 商家信息
   */
  async getMerchantInfo(): Promise<Merchant> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      const response = await axiosInstance.get(`/api/merchant/get_merchant_detail?sessionId=${sessionId}`);
      
      if (response.status === 200) {
        const rawData = response.data;
        let merchant: Merchant;
        
        merchant = {
          id: rawData.id,
          created_at: rawData.created_at,
          wallet_address: rawData.wallet_address,
          is_verified: rawData.is_verified,
          merchant_name: rawData.merchant_name,
          merchant_address: rawData.merchant_address
        };
        
        
        console.log(merchant);
        return merchant || null;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get merchant info:', error);
      return null;
    }
  }
}

// 单例模式
const merchantService = new MerchantServiceImpl();
export default merchantService; 