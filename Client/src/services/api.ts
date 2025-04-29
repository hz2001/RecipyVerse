import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 环境变量配置
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// 创建axios实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 从localStorage获取sessionId
    const sessionId = document.cookie.split(';').find(row => row.startsWith('sessionId='))?.split('=')[1];
    
    // 如果存在sessionId，将其添加到所有请求的查询参数中
    if (sessionId && config.params) {
      config.params = { ...config.params, sessionId };
    } else if (sessionId) {
      config.params = { sessionId };
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    // 处理401错误 - 令牌过期或无效
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('sessionId');
      // 重定向到首页或登录页
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// API响应类型接口
export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

// API错误接口
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// 通用API请求函数
export const apiRequest = async <T = any>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = {
        message: error.response?.data?.message || error.message,
        status: error.response?.status,
        code: error.code,
      };
      throw apiError;
    }
    throw error;
  }
};

export default axiosInstance; 