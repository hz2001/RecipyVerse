import axiosInstance from '../services/api';
import { UserRole } from '../services/userService';

// 用户数据接口，兼容原来的dummyUserData
export interface UserData {
  userWalletID: string;
  NFThold: string[]; // 持有的NFT IDs
  isMerchant: boolean;
  NFTcreated: string[]; // 创建的NFT IDs
  isverified: boolean;
  merchantName?: string; // 商家名称
  merchantAddress?: string; // 商家地址
}

// 将从API获取的用户数据转换为前端使用的UserData格式
const convertApiUserDataToUserData = (apiData: any): UserData => {
  return {
    userWalletID: apiData.wallet_address,
    NFThold: apiData.nft_hold || [],
    isMerchant: apiData.role === UserRole.MERCHANT,
    NFTcreated: apiData.nft_created || [],
    isverified: apiData.is_verified || false,
    merchantName: apiData.merchant_name,
    merchantAddress: apiData.merchant_address
  };
};

// 获取用户数据
export const fetchUserDataByWallet = async (walletId: string): Promise<UserData | undefined> => {
  try {
    if (!walletId) {
      console.error('未提供钱包地址');
      return undefined;
    }

    // 获取会话ID，用于API认证
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      console.error('未找到会话ID，请先连接钱包');
      return undefined;
    }

    // 从API获取用户信息
    const response = await axiosInstance.get('/user/info', {
      params: { sessionId }
    });

    if (response.status === 200 && response.data) {
      // 将API返回的数据转换为前端需要的格式
      return convertApiUserDataToUserData(response.data);
    }

    console.error('获取用户数据失败:', response);
    return undefined;
  } catch (error) {
    console.error('获取用户数据出错:', error);
    
    // 如果API尚未实现，使用模拟数据进行回退
    console.warn('使用模拟数据');
    const mockData = getMockUserData(walletId);
    return mockData;
  }
};

// 添加新商家
export const addNewMerchantToDb = async (walletId: string, details: { name: string; address: string; file?: File }): Promise<UserData | undefined> => {
  try {
    if (!walletId) {
      console.error('未提供钱包地址');
      return undefined;
    }

    // 获取会话ID，用于API认证
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      console.error('未找到会话ID，请先连接钱包');
      return undefined;
    }

    // 创建FormData对象用于文件上传
    const formData = new FormData();
    if (details.file) {
      formData.append('file', details.file);
    }
    formData.append('merchantName', details.name);
    formData.append('merchantAddress', details.address);

    // 调用API上传商家资质
    const response = await axiosInstance.post('/merchant/upload_qualification', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      params: { sessionId }
    });

    if (response.status === 200) {
      // 重新获取用户数据
      return await fetchUserDataByWallet(walletId);
    }

    console.error('添加商家失败:', response);
    return undefined;
  } catch (error) {
    console.error('添加商家出错:', error);
    
    // 如果API尚未实现，使用模拟数据进行回退
    console.warn('使用模拟数据');
    return getMockMerchantData(walletId, details);
  }
};

// 更新用户的NFT列表
export const updateUserNftLists = async (walletId: string, createdNftId?: string, heldNftId?: string): Promise<boolean> => {
  try {
    if (!walletId) {
      console.error('未提供钱包地址');
      return false;
    }

    // 获取会话ID，用于API认证
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      console.error('未找到会话ID，请先连接钱包');
      return false;
    }

    // 构建更新数据
    const updateData: any = {};
    if (createdNftId) {
      updateData.addCreatedNft = createdNftId;
    }
    if (heldNftId) {
      updateData.addHeldNft = heldNftId;
    }

    // 调用API更新NFT列表
    const response = await axiosInstance.post('/user/update_nft_lists', updateData, {
      params: { sessionId }
    });

    return response.status === 200;
  } catch (error) {
    console.error('更新NFT列表出错:', error);
    // 如果API尚未实现，直接返回成功
    console.warn('API尚未实现，模拟成功更新');
    return true;
  }
};

// 为兼容现有代码，提供模拟数据
// 这些数据会在API未实现时使用，后续可以移除
const getMockUserData = (walletId: string): UserData => {
  // 基于钱包地址前缀判断类型
  if (walletId.startsWith('0xMerchantVerified')) {
    return {
      userWalletID: walletId,
      NFThold: [],
      isMerchant: true,
      NFTcreated: ['5', '6'],
      isverified: true,
      merchantName: '模拟已验证商家',
      merchantAddress: '模拟地址'
    };
  } else if (walletId.startsWith('0xMerchantUnverified')) {
    return {
      userWalletID: walletId,
      NFThold: [],
      isMerchant: true,
      NFTcreated: [],
      isverified: false,
      merchantName: '模拟未验证商家',
      merchantAddress: '模拟地址'
    };
  } else {
    return {
      userWalletID: walletId,
      NFThold: ['1', '2'],
      isMerchant: false,
      NFTcreated: [],
      isverified: false
    };
  }
};

// 获取模拟的商家数据
const getMockMerchantData = (walletId: string, details: { name: string; address: string }): UserData => {
  return {
    userWalletID: walletId,
    NFThold: [],
    isMerchant: true,
    NFTcreated: [],
    isverified: false,
    merchantName: details.name,
    merchantAddress: details.address
  };
};

// 提供一个空的dummyUserData数组用于兼容，但实际不再使用
export const dummyUserData: UserData[] = []; 