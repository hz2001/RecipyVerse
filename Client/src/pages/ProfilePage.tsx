import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import MerchantVerificationInputModal from '../components/MerchantVerificationInputModal';
import { UserData } from '../data/userDataService';
import merchantService from '../services/merchantService';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedWallet, isConnecting, connectWallet } = useWallet();
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // 商家验证相关状态
  const [isPreVerifyModalOpen, setIsPreVerifyModalOpen] = useState(false);
  const [pendingMerchantDetails, setPendingMerchantDetails] = useState<{ name: string; address: string; file: File } | null>(null);
  const [registrationStep, setRegistrationStep] = useState<'initial' | 'submitted' | 'connecting' | 'completed'>('initial');
  const [isUploading, setIsUploading] = useState(false);

  // 检查钱包连接状态，如果已连接则重定向到合适的页面
  useEffect(() => {
    if (connectedWallet) {
      // 检查用户角色并重定向
      if (localStorage.getItem('isMerchant') === 'true') {
        navigate('/merchant_profile');
      } else {
        navigate('/user_profile');
      }
    }
  }, [connectedWallet, navigate]);
  
  // 处理商家验证表单提交
  const handlePreVerificationSubmit = async (details: { name: string; address: string; file: File }) => {
    try {
      // 保存商家信息
      setPendingMerchantDetails(details);
      
      // 关闭模态框
      setIsPreVerifyModalOpen(false);
      
      // 更新状态为已提交
      setRegistrationStep('submitted');
      setIsUploading(true);
      
      // 检查是否已连接钱包
      if (!connectedWallet) {
        // 显示连接钱包提示
        setSuccessMessage("Please connect your wallet to complete your merchant registration.");
        // 下一步将连接钱包
        setRegistrationStep('connecting');
        // 自动触发钱包连接
        await connectWallet();
      }
      
      // 上传商家验证资料
      const uploadSuccess = await merchantService.uploadQualification(
        details.name,
        details.address,
        details.file
      );
      
      if (!uploadSuccess) {
        throw new Error('Failed to upload merchant verification information.');
      }
      
      // 设置用户类型为商家
      localStorage.setItem('isMerchant', 'true');
      
      // 更新状态为已完成
      setRegistrationStep('completed');
      setSuccessMessage('Merchant verification information submitted successfully. Redirecting to merchant profile...');
      
      // 等待1秒后重定向到商家页面，让用户看到成功消息
      setTimeout(() => {
        navigate('/merchant_profile');
      }, 1000);
      
    } catch (err) {
      console.error('Error submitting verification:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit verification. Please try again later.');
      setRegistrationStep('initial');
    } finally {
      setIsUploading(false);
    }
  };

  // 处理用户注册点击
  const handleCustomerClick = () => {
    // 确保不是商家
    localStorage.setItem('isMerchant', 'false');
    // 直接调用钱包连接功能
    connectWallet();
  };

  // 处理商家注册点击
  const handleMerchantRegisterClick = () => {
    // 重置状态
    setError(null);
    setSuccessMessage(null);
    setRegistrationStep('initial');
    
    // 打开商家验证模态框
    setIsPreVerifyModalOpen(true);
  };

  // 处理重试按钮点击
  const handleRetry = () => {
    setError(null);
    setSuccessMessage(null);
    setRegistrationStep('initial');
  };
  
  // 如果已连接钱包但正在加载中，显示加载状态
  if (isConnecting || isUploading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-gray-600">
            {isUploading ? 'Uploading merchant information...' : 'Connecting wallet...'}
          </p>
        </div>
      </div>
    );
  }
  
  // 未登录页面
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow mt-10">
      <div className="text-center">
        
        {/* 注册成功消息 */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{successMessage}</p>
            {registrationStep === 'connecting' && (
              <div className="mt-4">
                <p className="text-gray-600 mb-2">Connecting wallet to complete registration...</p>
                <div className="animate-spin h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
              </div>
            )}
          </div>
        )}
        
        {/* 错误消息 */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={handleRetry}
              className="mt-2 px-4 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* 新用户注册模块 */}
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">First time using RecipeVerse?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">I am a Customer</h3>
            <p className="text-gray-600 mb-4">Join RecipeVerse to discover, collect, and trade NFTs released by verified merchants.</p>
            <button
              onClick={handleCustomerClick}
              disabled={isConnecting || registrationStep === 'connecting' || isUploading}
              className="w-full bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed"
            >
              {isConnecting ? 'Connecting Wallet...' : 'Connect Wallet'}
            </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Register as a Merchant</h3>
            <p className="text-gray-600 mb-4">Publish your own Coupons NFTs and build your own brand.</p>
            <button
              onClick={handleMerchantRegisterClick}
              disabled={isConnecting || registrationStep === 'connecting' || isUploading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {registrationStep === 'connecting' ? 'Registration in Progress...' : (isUploading ? 'Uploading Information...' : 'Start Registration')}
            </button>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-6">Already have an account? Login to view your profile.</p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mb-10">
            <button
              onClick={connectWallet}
              disabled={isConnecting || registrationStep === 'connecting' || isUploading}
              className="bg-amber-500 text-white px-6 py-2 rounded-md hover:bg-amber-600 transition-colors flex items-center justify-center disabled:bg-amber-300 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Connecting...
                </>
              ) : (
                'Login (Connect Wallet)'
              )}
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
      
      {/* 商家验证模态框 */}
      <MerchantVerificationInputModal
        isOpen={isPreVerifyModalOpen}
        onClose={() => setIsPreVerifyModalOpen(false)}
        onSubmit={handlePreVerificationSubmit}
        merchantId={connectedWallet || ''}
      />
    </div>
  );
};

export default ProfilePage; 