import {BrowserProvider, Contract, ethers, JsonRpcSigner} from 'ethers';
import axiosInstance from './api';
import walletService from './walletService';

// 合约类型枚举
export enum ContractType {
  NFT_FACTORY = 'NFT_FACTORY',
  NFT_COUPON = 'NFT_COUPON',
  NFT_SWAP = 'NFT_SWAP'
}

// 缓存ABI以避免重复请求
const abiCache: Record<ContractType, any> = {
  [ContractType.NFT_FACTORY]: null,
  [ContractType.NFT_COUPON]: null,
  [ContractType.NFT_SWAP]: null
};

/**
 * 合约服务接口
 */
export interface ContractService {
  getNFTFactoryABI(): Promise<any>;
  getNFTCouponABI(): Promise<any>;
  getNFTSwapABI(): Promise<any>;
  createContract(contractType: ContractType, address: string): Promise<Contract | null>;
}

/**
 * 合约服务实现
 */
class ContractServiceImpl implements ContractService {
  
  /**
   * 获取以太坊提供者和签名者
   */
  private async getProviderAndSigner(): Promise<{ provider: BrowserProvider, signer: JsonRpcSigner } | null> {
    try {
      if (typeof window.ethereum === 'undefined') {
        console.error('MetaMask is not installed');
        return null;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return { provider, signer };
    } catch (error) {
      console.error('Failed to get ethereum provider:', error);
      return null;
    }
  }
  
  /**
   * 通用方法获取ABI
   */
  private async getABI(type: ContractType, endpoint: string): Promise<any> {
    // 如果已缓存，则直接返回
    if (abiCache[type]) {
      return abiCache[type];
    }
    
    try {
      const response = await axiosInstance.get(endpoint);
      const abi = response.data;
      
      // 缓存结果
      abiCache[type] = abi;
      
      return abi;
    } catch (error) {
      console.error(`Failed to get ${type} ABI:`, error);
      throw error;
    }
  }
  
  /**
   * 获取NFT工厂合约ABI
   */
  async getNFTFactoryABI(): Promise<any> {
    return this.getABI(ContractType.NFT_FACTORY, '/api/contract/get_nft_factory_abi');
  }
  
  /**
   * 获取NFT优惠券合约ABI
   */
  async getNFTCouponABI(): Promise<any> {
    return this.getABI(ContractType.NFT_COUPON, '/api/contract/get_nft_coupon_abi');
  }
  
  /**
   * 获取NFT交换合约ABI
   */
  async getNFTSwapABI(): Promise<any> {
    return this.getABI(ContractType.NFT_SWAP, '/api/contract/get_nft_swap_abi');
  }
  

  async createContract(): Promise<Contract | null> {
    try {
      // 确保钱包已连接
      if (!walletService.isConnected()) {
        console.error('Wallet not connected');
        return null;
      }
      
      // 获取提供者和签名者
      const result = await this.getProviderAndSigner();
      if (!result) {
        return null;
      }
      const { signer } = result;
      
      // 根据合约类型获取ABI
      const { address, abi } = await this.getNFTFactoryABI();

      return new ethers.Contract(address, abi, signer);
    } catch (error) {
      console.error('Failed to create contract:', error);
      return null;
    }
  }
  
  async getContractToBeCalled(contractAddress: string): Promise<Contract | null> {
    try {
      // 确保钱包已连接
      if (!walletService.isConnected()) {
        console.error('Wallet not connected');
        return null;
      }
      
      // 获取提供者和签名者
      const result = await this.getProviderAndSigner();
      if (!result) {
        return null;
      }
      const { signer } = result;
      
      // 根据合约类型获取ABI
      const { abi } = await this.getNFTCouponABI();

      return new ethers.Contract(contractAddress, abi, signer);
    } catch (error) {
      console.error('Failed to create contract:', error);
      return null;
    }
  }

  async getSwapContract(): Promise<Contract | null> {
    try {
      // 确保钱包已连接
      if (!walletService.isConnected()) {
        console.error('Wallet not connected');
        return null;
      }
      const result = await this.getProviderAndSigner();
      if (!result) {
        return null;
      }
      const { signer } = result;
      
      // 根据合约类型获取ABI    
      const { address, abi } = await this.getNFTSwapABI();

      return new ethers.Contract(address, abi, signer);
    } catch (error) {
      console.error('Failed to create contract:', error);
      return null;
    }
  }
}

// 单例模式
const contractService = new ContractServiceImpl();
export default contractService; 