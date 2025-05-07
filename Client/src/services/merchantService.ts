import axiosInstance from './api';
import { NFT } from './nftService';

/**
 * 商家实体接口
 */
export interface Merchant {
  id: number;
  created_at: string;
  wallet_address: string;
  is_verified: boolean;
  merchant_name: string;
  merchant_address: string;
}

/**
 * 商家服务接口
 */
export interface MerchantService {
  uploadQualification(merchantName: string, merchantAddress: string, file: File): Promise<boolean>;
  getMyNFTContracts(): Promise<NFT[]>;
  getMerchantInfo(): Promise<Merchant>;
}

/**
 * 商家服务实现
 */
class MerchantServiceImpl implements MerchantService {
  /**S
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
      
      // 发送上传请求
      const response = await axiosInstance.post('/api/merchant/upload_qualification', formData, {
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
  async getMyNFTContracts(): Promise<NFT[]> {
    try {
      const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
      if (!sessionId) {
        console.error('未找到会话ID，请先连接钱包');
        return [];
      }

      const response = await axiosInstance.get('/api/merchant/my_nft_contracts');
      
      if (response.status === 200 && response.data) {
        console.log(response.data);
        return response.data;
      }

      return [];
    } catch (error) {
      console.error('获取商家NFT合约失败:', error);
      return [];
    }
  }
  /**
   * 获取商家信息
   * @returns 商家信息
   */
  async getMerchantInfo(): Promise<Merchant> {
    try {
      const response = await axiosInstance.get(`/api/merchant/get_merchant_detail`);
      
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