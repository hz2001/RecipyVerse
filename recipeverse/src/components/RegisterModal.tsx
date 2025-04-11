import { useState } from 'react';
import UserService from '../services/userService';

// 注册步骤枚举
enum RegistrationStep {
  UserInfo,
  WalletConnect,
  Confirmation
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  walletAddress: string;
  bio: string;
  registeredWith: 'email' | 'google' | 'wallet';
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (user: User) => void;
  userType: 'user' | 'merchant';
  mode?: 'register' | 'login';
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onComplete, 
  userType,
  mode = 'register'
}) => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(
    mode === 'login' ? RegistrationStep.UserInfo : RegistrationStep.UserInfo
  );
  const [registrationType, setRegistrationType] = useState<'email' | 'google' | 'wallet'>('email');
  const [isLoading, setIsLoading] = useState(false);
  
  // 用户表单数据
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: '',
  });

  // 钱包数据
  const [walletAddress, setWalletAddress] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // 模拟 Google 登录
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    // 模拟 API 调用
    setTimeout(() => {
      setIsLoading(false);
      setRegistrationType('google');
      
      // 预填充来自 Google 的模拟数据
      setFormData({
        ...formData,
        username: 'Google User',
        email: 'user@gmail.com',
      });
      
      // 如果是注册模式，进入下一步；如果是登录模式，直接完成
      if (mode === 'register') {
        setCurrentStep(RegistrationStep.WalletConnect);
      } else {
        handleLogin();
      }
    }, 1500);
  };
  
  // 处理用户信息表单提交
  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证逻辑
    if (!formData.username.trim()) {
      alert('Username is required');
      return;
    }

    if (mode === 'register') {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        alert('Valid email is required');
        return;
      }

      if (registrationType === 'email') {
        if (!formData.password.trim() || formData.password.length < 6) {
          alert('Password must be at least 6 characters');
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
      }
      
      // 进入下一步
      setCurrentStep(RegistrationStep.WalletConnect);
    } else {
      // 登录模式，直接验证
      handleLogin();
    }
  };
  
  // 处理登录
  const handleLogin = () => {
    setIsLoading(true);
    
    // 模拟登录验证
    setTimeout(() => {
      setIsLoading(false);
      
      // 创建用户对象
      const user: User = {
        id: `user_${Date.now()}`,
        username: formData.username,
        email: formData.email || `${formData.username}@example.com`,
        avatar: `https://avatars.dicebear.com/api/initials/${formData.username}.svg`,
        walletAddress: 'Not connected',
        bio: '',
        registeredWith: registrationType,
      };
      
      // 设置当前用户
      UserService.setCurrentUser(user);
      onComplete(user);
    }, 1000);
  };
  
  // 模拟钱包连接
  const connectWallet = (walletType: string) => {
    setIsLoading(true);
    
    // 模拟连接过程
    setTimeout(() => {
      setIsLoading(false);
      
      // 生成随机钱包地址
      const randomWallet = `0x${Math.random().toString(16).substr(2, 40)}`;
      setWalletAddress(randomWallet);
      
      // 进入确认步骤
      setCurrentStep(RegistrationStep.Confirmation);
    }, 1500);
  };
  
  // 完成注册
  const completeRegistration = () => {
    // 创建用户对象
    const newUser: User = {
      id: `user_${Date.now()}`,
      username: formData.username,
      email: formData.email,
      avatar: `https://avatars.dicebear.com/api/initials/${formData.username}.svg`,
      walletAddress,
      bio: formData.bio,
      registeredWith: registrationType,
    };

    // 注册用户（只保存用户名和密码）
    const registeredUser = UserService.register(formData.username, formData.password);
    if (registeredUser) {
      UserService.setCurrentUser(registeredUser);
      onComplete(newUser);
    } else {
      alert('Username already exists');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* 模态窗口标题 */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'login' ? 'Log In' : (
              currentStep === RegistrationStep.UserInfo && 'Create Your Account'
              || currentStep === RegistrationStep.WalletConnect && 'Connect Your Wallet'
              || currentStep === RegistrationStep.Confirmation && 'Confirm Registration'
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 模态窗口内容 */}
        <div className="px-6 py-4">
          {/* 步骤指示器 - 仅在注册模式下显示 */}
          {mode === 'register' && (
            <div className="flex mb-8 justify-between">
              {[RegistrationStep.UserInfo, RegistrationStep.WalletConnect, RegistrationStep.Confirmation].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    currentStep >= step 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="text-xs mt-1 text-gray-500">
                    {step === RegistrationStep.UserInfo && 'User Info'}
                    {step === RegistrationStep.WalletConnect && 'Wallet'}
                    {step === RegistrationStep.Confirmation && 'Confirm'}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 用户信息步骤 */}
          {currentStep === RegistrationStep.UserInfo && (
            <div>
              {/* 登录选项 - 仅在注册模式下显示 */}
              {mode === 'register' && (
                <div className="mb-6 flex flex-col space-y-3">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className={`flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                      </g>
                    </svg>
                    Continue with Google
                  </button>
                  
                  <div className="flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="mx-4 text-gray-500 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                </div>
              )}
              
              {/* 登录/注册表单 */}
              <form onSubmit={handleUserInfoSubmit}>
                <div className="mb-4">
                  <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {mode === 'register' && (
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                {mode === 'register' && (
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                  </div>
                )}

                {mode === 'register' && (
                  <div className="mb-6">
                    <label htmlFor="bio" className="block text-gray-700 text-sm font-medium mb-1">
                      Bio (Optional)
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={3}
                    ></textarea>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex justify-center">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  ) : (
                    mode === 'login' ? 'Log In' : 'Continue'
                  )}
                </button>
              </form>
            </div>
          )}
          
          {/* 钱包连接步骤 - 仅在注册模式下显示 */}
          {mode === 'register' && currentStep === RegistrationStep.WalletConnect && (
            <div>
              <p className="text-gray-600 mb-6">
                Connect your wallet to mint recipe NFTs and track your creations on the blockchain.
              </p>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => connectWallet('metamask')}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <img
                      src="https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg"
                      alt="MetaMask"
                      className="h-8 w-8 mr-3"
                    />
                    <span className="font-medium">MetaMask</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={() => connectWallet('coinbase')}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white">
                        <path d="M512 1024C794.769 1024 1024 794.769 1024 512C1024 229.23 794.769 0 512 0C229.23 0 0 229.23 0 512C0 794.769 229.23 1024 512 1024Z" fill="white"/>
                        <path d="M512.55 275C376.324 275 266 385.324 266 521.55C266 657.776 376.324 768.1 512.55 768.1C648.776 768.1 759.1 657.776 759.1 521.55C759.1 385.324 648.776 275 512.55 275ZM512.55 668.516C431.346 668.516 365.584 602.754 365.584 521.55C365.584 440.346 431.346 374.584 512.55 374.584C593.754 374.584 659.516 440.346 659.516 521.55C659.516 602.754 593.754 668.516 512.55 668.516Z" fill="#0052FF"/>
                      </svg>
                    </div>
                    <span className="font-medium">Coinbase Wallet</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <button
                  onClick={() => connectWallet('wallet-connect')}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-between py-3 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.58818 11.8556C13.1997 8.24998 19.0922 8.24998 22.7037 11.8556L23.1942 12.3452C23.3484 12.4994 23.3484 12.7528 23.1942 12.9071L21.6299 14.4693C21.5527 14.5464 21.4261 14.5464 21.3489 14.4693L20.6944 13.8156C18.029 11.1538 14.2629 11.1538 11.5975 13.8156L10.8905 14.5218C10.8134 14.5989 10.6867 14.5989 10.6096 14.5218L9.04522 12.9595C8.89102 12.8053 8.89102 12.5519 9.04522 12.3976L9.58818 11.8556ZM26.6034 15.7516L27.9962 17.1428C28.1505 17.297 28.1505 17.5505 27.9962 17.7047L21.421 24.2708C21.2668 24.425 21.0132 24.425 20.859 24.2708L16.3277 19.7442C16.2891 19.7056 16.2261 19.7056 16.1875 19.7442L11.6562 24.2708C11.502 24.425 11.2485 24.425 11.0943 24.2708L4.51346 17.7047C4.35926 17.5505 4.35926 17.297 4.51346 17.1428L5.90629 15.7516C6.06049 15.5974 6.31396 15.5974 6.46816 15.7516L10.9994 20.2781C11.038 20.3168 11.101 20.3168 11.1396 20.2781L15.6709 15.7516C15.8251 15.5974 16.0786 15.5974 16.2328 15.7516L20.7641 20.2781C20.8027 20.3168 20.8656 20.3168 20.9042 20.2781L25.4355 15.7516C25.5897 15.5974 25.8432 15.5974 25.9974 15.7516H26.6034Z" fill="#3396FF"/>
                      </svg>
                    </div>
                    <span className="font-medium">WalletConnect</span>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {isLoading && (
                <div className="flex justify-center">
                  <svg className="animate-spin h-5 w-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}

              <div className="mt-6 text-sm text-gray-500">
                <p>Don't want to connect a wallet now?</p>
                <button
                  type="button"
                  onClick={() => {
                    setWalletAddress('Not connected');
                    setCurrentStep(RegistrationStep.Confirmation);
                  }}
                  className="text-amber-500 font-medium hover:text-amber-600 mt-1"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
          
          {/* 确认步骤 - 仅在注册模式下显示 */}
          {mode === 'register' && currentStep === RegistrationStep.Confirmation && (
            <div>
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 text-center mb-4">Almost Done!</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Username:</span>
                  <p className="font-medium">{formData.username}</p>
                </div>
                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Email:</span>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div className="mb-3">
                  <span className="text-gray-500 text-sm">Registration Method:</span>
                  <p className="font-medium capitalize">{registrationType}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Wallet Address:</span>
                  <p className="font-mono text-sm break-all">{walletAddress || 'Not connected'}</p>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-6">
                By completing your registration, you agree to our Terms of Service and Privacy Policy.
              </p>
              
              <button
                onClick={completeRegistration}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Complete Registration
              </button>
            </div>
          )}
        </div>
        
        {/* 模态窗口底部 */}
        <div className="border-t border-gray-200 px-6 py-4">
          {mode === 'register' && currentStep > RegistrationStep.UserInfo && (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 