import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserData, fetchUserDataByWallet, addNewMerchantToDb, dummyUserData } from '../data/userDataService';
import { recipes, Recipe } from '../data/dummyData'; // Import recipes data
import RecipeCard from '../components/RecipeCard'; // Reuse RecipeCard
import NftCard from '../components/NftCard'; // 导入NftCard组件
import MerchantVerificationInputModal from '../components/MerchantVerificationInputModal'; // Import the new modal
import { useWallet } from '../contexts/WalletContext'; // Import useWallet
import NftTypeSelectionModal from '../components/NftTypeSelectionModal'; // Import the new modal
import { supabase } from '../utils/supabaseClient';
import UserService from '../services/userService';

// Placeholder for MetaMask icon (replace with actual SVG or component later)
const MetaMaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Simple generic wallet icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);


const MyRecipesPage: React.FC = () => {
  // Get global state/functions from WalletContext
  const {
    connectedWallet: globalConnectedWallet,
    userData: globalUserData,
    isLoading: globalIsLoading,
    testMode,
    connectWallet,
    disconnectWallet,
    updateUserData,
  } = useWallet();

  // --- State for TEST MODE Simulation --- 
  const [simulatedWallet, setSimulatedWallet] = useState<string | null>(null);
  const [simulatedUserData, setSimulatedUserData] = useState<UserData | null | undefined>(null);
  const [simulatedIsLoading, setSimulatedIsLoading] = useState<boolean>(false);
  // Predefined wallet addresses for simulation
  const sampleWallets = [
    "0xMerchantVerified1234567890abcdef12345678", // Verified Merchant
    "0xUserNumber1234567890abcdef12345678",      // Regular User with owned NFT
    "0xUserNumber234567890abcdef12345678",      // Regular User who created NFTs
    "0xMerchantUnverified1234567890abcdef00000", // Unverified Merchant
    "0xFakeWalletIdNotInDatabase00000000000000",   // Fake Wallet ID (Not in dummyUserData)
  ];
  // --- End State for TEST MODE --- 

  // --- Supabase related state --- 
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isMerchant, setIsMerchant] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');
  const [nfts, setNfts] = useState<any[]>([]);
  const [createdNfts, setCreatedNfts] = useState<any[]>([]); // 存储用户创建的NFT
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  // --- End Supabase related state --- 

  // State for the verification modals (pre-connect and potentially post-connect)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false); // Post-connect modal (current logic)
  const [isPreVerifyModalOpen, setIsPreVerifyModalOpen] = useState<boolean>(false); // Pre-connect modal
  const [isNftTypeModalOpen, setIsNftTypeModalOpen] = useState<boolean>(false); // New state for NFT type modal
  const [pendingMerchantDetails, setPendingMerchantDetails] = useState<{ name: string; address: string; file: File } | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false); // 注册过程中的加载状态
  const [autoConnecting, setAutoConnecting] = useState<boolean>(false); // 自动连接钱包状态

  // NFT详情模态框的状态
  const [showNftDetailModal, setShowNftDetailModal] = useState<boolean>(false);
  const [selectedNftForDetail, setSelectedNftForDetail] = useState<any | null>(null);

  // --- Determine effective state based on testMode --- 
  const connectedWallet = testMode ? simulatedWallet : globalConnectedWallet;
  let userData = testMode ? simulatedUserData : globalUserData;
  const isLoading = testMode ? simulatedIsLoading : globalIsLoading;

  // --- React Router Navigation ---
  const navigate = useNavigate();

  // --- 自动检查钱包连接状态 ---
  useEffect(() => {
    const autoConnectWallet = async () => {
      // 只在非测试模式、钱包未连接且不在注册过程中时自动连接
      if (!testMode && !globalConnectedWallet && !isRegistering && !autoConnecting) {
        try {
          setAutoConnecting(true);
          console.log('自动检查钱包连接状态...');
          
          // 等待一小段时间，让MetaMask有时间注入window.ethereum
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // 检查是否已安装MetaMask且已登录
          if (window.ethereum) {
            console.log('检测到MetaMask');
            
            // 最多尝试3次获取账户
            let attempts = 0;
            let accounts = [];
            
            while (attempts < 3 && accounts.length === 0) {
              try {
                accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length === 0) {
                  console.log(`尝试获取账户 (${attempts + 1}/3): 未检测到已连接的账户，等待500ms后重试...`);
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              } catch (err) {
                console.error(`尝试获取账户 (${attempts + 1}/3) 失败:`, err);
              }
              attempts++;
            }
            
            if (accounts && accounts.length > 0) {
              console.log('检测到已连接的钱包:', accounts[0]);
              // 调用connectWallet获取数据（不会触发MetaMask弹窗，因为已经连接）
              const result = await connectWallet();
              console.log('自动连接钱包结果:', result);
            } else {
              console.log('多次尝试后仍未检测到已连接的钱包');
            }
          } else {
            console.log('未检测到MetaMask扩展');
          }
        } catch (err) {
          console.error('自动连接钱包时发生错误:', err);
        } finally {
          setAutoConnecting(false);
        }
      }
    };

    autoConnectWallet();
  }, [testMode, globalConnectedWallet, isRegistering, connectWallet]);

  // --- Supabase related functions --- 
  const fetchNfts = async (address: string) => {
    if (!address) {
      console.log('未提供钱包地址，跳过NFT查询');
      return;
    }
    
    try {
      console.log('正在获取用户拥有的NFT，钱包地址:', address);
      
      // 方法1: 直接查询string类型的owner_address (旧数据格式)
      const { data: directOwnedNfts, error: directError } = await supabase
        .from('nfts')
        .select('*')
        .eq('owner_address', address);
        
      if (directError) {
        console.error('直接查询owner_address失败:', directError);
      } else {
        console.log('直接匹配地址的NFT数量:', directOwnedNfts?.length || 0);
      }
      
      // 方法2: 尝试查询JSONB类型的owner_address中的值 (新数据格式)
      // 先检查数据库中是否存在JSON对象结构的NFT
      let jsonOwned = [];
      try {
        // 使用更简单的查询方式
        const { data, error } = await supabase
          .from('nfts')
          .select('*');
          
        if (error) {
          console.error('获取所有NFT失败:', error);
        } else if (data && data.length > 0) {
          // 在客户端筛选JSON对象格式的NFT
          jsonOwned = data.filter(nft => {
            // 判断owner_address是否为JSON对象
            if (typeof nft.owner_address === 'object' && nft.owner_address !== null) {
              // 检查是否有任何属性的值等于当前钱包地址
              return Object.values(nft.owner_address).includes(address);
            }
            return false;
          });
          
          console.log('客户端过滤后匹配JSON格式的NFT数量:', jsonOwned.length);
        }
      } catch (jsonErr) {
        console.error('解析JSON格式NFT失败:', jsonErr);
      }
      
      // 合并结果并去重
      const allNfts = [
        ...(directOwnedNfts || []),
        ...jsonOwned
      ];
      
      // 去重操作
      const uniqueNfts = Array.from(new Set(allNfts.map(nft => nft.id)))
        .map(id => allNfts.find(nft => nft.id === id))
        .filter(Boolean); // 过滤掉undefined
      
      console.log('合并后的用户NFT总数:', uniqueNfts.length);
      setNfts(uniqueNfts);
    } catch (err) {
      console.error('获取NFT失败:', err);
    }
  };

  // 获取用户创建的NFT
  const fetchCreatedNfts = async (address: string) => {
    const { data, error } = await supabase
        .from('nfts')
        .select('*')
        .eq('creator_address', address);
    if (!error && data) {
        console.log('用户创建的NFT:', data);
        setCreatedNfts(data);
    } else if (error) {
        console.error('获取创建的NFT失败:', error);
    }
  };

  const handleLogout = () => {
    UserService.logout();
    setWalletAddress('');
    setIsMerchant(false);
    setUserId('');
    setLoggedIn(false);
    setNfts([]);
  };

  // --- Handler for REAL MODE Wallet Connection ---
  useEffect(() => {
    // 当用户钱包连接成功后，获取NFT数据
    if (connectedWallet && !testMode) {
      console.log('钱包已连接，开始获取NFT数据:', connectedWallet);
      fetchNfts(connectedWallet);
      fetchCreatedNfts(connectedWallet);
    }
  }, [connectedWallet, testMode]);
  
  // 从UserService初始化
  useEffect(() => {
    const init = async () => {
      try {
        const user = await UserService.getCurrentUser();
        if (user && user.wallet_address) {
          console.log('从UserService获取到用户:', user);
          setWalletAddress(user.wallet_address);
          setIsMerchant(user.is_merchant);
          setUserId(user.id);
          setLoggedIn(true);
          
          console.log('通过UserService初始化NFT查询，钱包地址:', user.wallet_address);
          // 首次加载时进行NFT查询
          fetchNfts(user.wallet_address);
          fetchCreatedNfts(user.wallet_address);
        } else {
          console.log('UserService未返回有效用户或钱包地址');
        }
      } catch (err) {
        console.error('初始化用户数据失败:', err);
      }
    };
    
    init();
  }, []);

  // --- Handlers for TEST MODE Simulation --- 
  const handleSimulateConnectWallet = () => {
    if (!testMode) return;
    const currentIndex = simulatedWallet ? sampleWallets.indexOf(simulatedWallet) : -1;
    const nextIndex = (currentIndex + 1) % sampleWallets.length;
    const nextWallet = sampleWallets[nextIndex];
    console.log(`Simulating connection to: ${nextWallet}`);
    setSimulatedWallet(nextWallet);
    setSimulatedUserData(null); // Reset user data on new connection
    setSimulatedIsLoading(true);
    // Fetch data for simulated wallet
    setTimeout(() => {
      const data = fetchUserDataByWallet(nextWallet);
      setSimulatedUserData(data);
      setSimulatedIsLoading(false);
    }, 500);
  };

  const handleSimulateDisconnectWallet = () => {
    if (!testMode) return;
    console.log("Simulating disconnection");
    setSimulatedWallet(null);
    setSimulatedUserData(null);
    setSimulatedIsLoading(false);
  }
  // --- End Handlers for TEST MODE --- 

  // --- Handler for REAL MODE Merchant Registration --- 
  const handleRegisterMerchantClick = () => {
      if (testMode) return;
      setIsPreVerifyModalOpen(true);
  };
  
  // --- 统一处理用户连接逻辑 ---
  const handleConnectAsCustomer = async () => {
    if (testMode) return;
    
    try {
      await connectWallet();
    } catch (err) {
      console.error('连接钱包失败:', err);
    }
  };

  const handlePreVerificationSubmit = async (details: { name: string; address: string; file: File }) => {
      if (testMode) return;

      // 显示加载状态
      setIsRegistering(true);

      // 1. 记录提交信息
      const detailJson = {
          merchantName: details.name,
          address: details.address,
          licenseFilename: `${details.name}-${details.file.name}`,
          submittedAt: new Date().toISOString(),
      };
      console.log("Processing merchant registration:", JSON.stringify(detailJson, null, 2));
      console.log(`Processing license file: '${details.file.name}'`);

      // 2. 关闭模态框
      setIsPreVerifyModalOpen(false);

      // 3. 存储临时商家信息
      const currentRegistrationDetails = details;
      setPendingMerchantDetails(currentRegistrationDetails);

      try {
          // 4. 测试数据库连接
          try {
              const { data: testConnection, error: testConnectionError } = await supabase
                  .from('merchants')
                  .select('count')
                  .limit(1);
                  
              if (testConnectionError) {
                  console.error(">>> [Database Connection Test] Failed:", testConnectionError);
                  alert("无法连接到数据库，注册失败。请稍后重试。");
                  return; // 连接测试失败，终止注册流程
              }
              console.log(">>> [Database Connection Test] Success:", testConnection);
          } catch (dbError) {
              console.error(">>> [Database Connection Test] Exception:", dbError);
              alert("数据库连接异常，注册失败。请稍后重试。");
              return; // 连接测试异常，终止注册流程
          }

          // 4. 连接钱包
          console.log("[Submit] Pending details stored. Calling connectWallet...");
          const connectResult = await connectWallet();
          console.log("[Submit] connectWallet finished. Result:", connectResult);

          // 检查钱包连接结果
          if (!connectResult.walletId) {
              console.error(">>> [Submit Action] Failed to connect wallet");
              alert("钱包连接失败，无法完成注册。请刷新页面重试。");
              return; // 钱包连接失败，终止注册流程
          }

          // 5. 检查钱包连接结果，创建商家记录
          if (connectResult.userData === undefined && currentRegistrationDetails && connectResult.walletId) {
              console.log('>>> [Submit Action] New merchant registration detected. Adding to database... <<<');
              
              // 向merchants表中插入数据
              const { data, error } = await supabase
                  .from('merchants')
                  .insert([{
                      wallet_address: connectResult.walletId,
                      merchant_name: currentRegistrationDetails.name,
                      merchant_address: currentRegistrationDetails.address,
                      is_verified: "false", // 初始设置为未验证
                      created_at: new Date().toISOString()
                  }])
                  .select();
                  
              if (error) {
                  console.error(">>> [Submit Action] Database error adding merchant:", error);
                  
                  // 显示错误消息并终止注册流程
                  if (error.message.includes("row-level security policy")) {
                      alert("注册商家失败: 数据库安全策略限制，请联系管理员解决权限问题。");
                  } else {
                      alert("注册商家失败: " + error.message);
                  }
                  
                  // 断开钱包连接，确保用户不会以错误状态进入profile页面
                  if (!testMode) {
                      console.log(">>> [Security] Disconnecting wallet due to registration failure");
                      disconnectWallet();
                      window.location.reload(); // 强制刷新页面以确保状态重置
                  }
                  
                  return; // 数据库插入失败，终止注册流程
              }
              
              if (!data || data.length === 0) {
                  console.error(">>> [Submit Action] Database returned empty result after insert");
                  alert("注册过程中数据库返回空结果，请刷新页面重试。");
                  // 断开钱包连接
                  if (!testMode) disconnectWallet();
                  return; // 数据库插入后返回空结果，终止注册流程
              }
              
              console.log('>>> [Submit Action] Added new merchant to database:', data);
              
              // 上传文件到存储
              let fileUploadFailed = false;
              if (currentRegistrationDetails.file) {
                  const fileExt = currentRegistrationDetails.file.name.split('.').pop();
                  const fileName = `${connectResult.walletId}_license.${fileExt}`;
                  
                  const { error: uploadError } = await supabase
                      .storage
                      .from('merchant_licenses')
                      .upload(fileName, currentRegistrationDetails.file);
                      
                  if (uploadError) {
                      console.error(">>> [Submit Action] Error uploading license file:", uploadError);
                      fileUploadFailed = true;
                  } else {
                      console.log(`>>> [Submit Action] License file uploaded successfully: ${fileName}`);
                  }
              }
              
              // 数据库确认成功后再更新前端状态
              if (data && data.length > 0) {
                  // 转换为应用数据结构
                  const merchantData = {
                      userWalletID: data[0].wallet_address,
                      merchantName: data[0].merchant_name,
                      merchantAddress: data[0].merchant_address,
                      isMerchant: true,
                      isverified: false, // 初始未验证
                      NFThold: [],
                      NFTcreated: []
                  };
                  
                  // 再次确认数据是否在数据库中存在
                  const { data: verifyData, error: verifyError } = await supabase
                      .from('merchants')
                      .select('*')
                      .eq('wallet_address', connectResult.walletId)
                      .single();
                      
                  if (verifyError || !verifyData) {
                      console.error(">>> [Submit Action] Verification failed, merchant record not found:", verifyError);
                      alert("商家注册可能不完整，数据库验证失败。请刷新页面重试。");
                      if (!testMode) disconnectWallet();
                      return; // 数据库验证失败，终止注册流程
                  } else {
                      console.log(">>> [Submit Action] Merchant record verified in database:", verifyData);
                      updateUserData(merchantData);
                      
                      // 显示成功消息并跳转
                      if (fileUploadFailed) {
                          alert("商家信息注册成功，但证照文件上传失败。您现在可以创建和管理NFT。");
                      } else {
                          alert("商家注册成功！您现在可以创建和管理NFT。");
                      }
                      
                      // 使用navigate进行页面跳转
                      window.setTimeout(() => {
                          navigate('/profile');
                      }, 500);
                  }
              }
          } else {
              // 如果用户已存在或条件不满足
              if (connectResult.userData !== undefined) {
                  alert("此钱包地址已注册。如需修改信息，请联系客服。");
              } else if (!currentRegistrationDetails) {
                  alert("注册信息丢失，请重新填写注册表单。");
              } else if (!connectResult.walletId) {
                  alert("钱包连接失败，请刷新页面重试。");
              }
              
              console.log("[Submit Action] Conditions not met to add new merchant post-connection.", 
                        { 
                          fetchedUserDataExists: connectResult.userData !== undefined, 
                          detailsAvailable: !!currentRegistrationDetails, 
                          walletIdAvailable: !!connectResult.walletId 
                        });
          }
      } catch (err) {
          console.error(">>> [Submit Action] Unexpected error during merchant registration:", err);
          alert("注册过程中发生错误，请稍后重试");
          // 确保在任何异常情况下也断开钱包连接
          if (!testMode) disconnectWallet();
      } finally {
          // 6. 清除临时状态
          console.log("[Submit] Clearing pending merchant details state.");
          setPendingMerchantDetails(null);
          setIsRegistering(false);
      }
  };

  // Handler to open the post-connection verification modal (current logic, might be deprecated soon)
  const handleOpenVerifyModal = () => {
    if (!connectedWallet || !userData?.isMerchant || userData?.isverified) return;
    setIsVerifyModalOpen(true);
  };

  // Handler for submitting verification details (current logic for post-connect)
  const handleVerificationSubmit = (details: { name: string; address: string; file: File }) => {
    if (!connectedWallet || testMode) return;
    
    console.log("Processing merchant verification:", details);
    
    // Update merchant record in database
    const updateMerchantVerification = async () => {
      try {
        // First update the merchants table
        const { error } = await supabase
          .from('merchants')
          .update({
            merchant_name: details.name,
            merchant_address: details.address,
            // Note: We don't update is_verified here as that will be done by admin after review
          })
          .eq('wallet_address', connectedWallet);

        if (error) {
          console.error("Error updating merchant verification details:", error);
          alert("There was an error updating your verification details. Please try again.");
          return;
        }

        // Upload the verification file
        if (details.file) {
          const fileExt = details.file.name.split('.').pop();
          const fileName = `${connectedWallet}_verification.${fileExt}`;
          
          const { error: uploadError } = await supabase
            .storage
            .from('merchant_verifications')
            .upload(fileName, details.file);
            
          if (uploadError) {
            console.error("Error uploading verification file:", uploadError);
            alert("Your details were updated but there was an error uploading your verification file.");
            return;
          }
        }

        // For now we still simulate the verification success in frontend
        // In production, this would be done by admin approval
        if (globalUserData) {
          updateUserData({ ...globalUserData, isverified: true });
        }
        
        alert("Verification details submitted successfully. Your application will be reviewed by our team.");
        setIsVerifyModalOpen(false);
      } catch (err) {
        console.error("Unexpected error during verification update:", err);
        alert("An unexpected error occurred. Please try again later.");
      }
    };

    updateMerchantVerification();
  };

  // --- Handlers for NFT Type Selection ---
  const handleOpenNftTypeModal = () => {
      if (!userData?.isMerchant) return;
      setIsNftTypeModalOpen(true);
  };

  const handleSelectCoupon = () => {
      setIsNftTypeModalOpen(false);
      navigate('/create-coupon');
  };

  const handleSelectMembership = () => {
      setIsNftTypeModalOpen(false);
      alert('Membership NFT creation is coming soon!');
  };
  // --- End Handlers for NFT Type Selection ---

  // Filter recipes based on NFT IDs held or created by the user
  const ownedRecipes = userData ? recipes.filter(recipe => (userData?.NFThold ?? []).includes(recipe.id)) : [];
  const createdRecipes = userData ? recipes.filter(recipe => (userData?.NFTcreated ?? []).includes(recipe.id)) : [];
  
  // 模拟正在交换中的NFT数据 - 实际实现应该从数据库中获取
  const ongoingSwapRecipes = ownedRecipes.slice(0, Math.min(2, ownedRecipes.length));

  // Render Loading State
  const renderLoading = () => (
      <div className="text-center py-16">
          <p className="text-lg text-gray-600">Loading wallet data...</p>
          {/* Basic Spinner */}
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mt-4"></div>
      </div>
  );

  // Render Content based on connection and data
  const renderContent = () => {
    if (isLoading || autoConnecting) {
        return renderLoading();
    }

    if (!connectedWallet) {
      // --- Logged Out View: Test vs Real --- 
      return (
        <div className="text-center py-16">
          <MetaMaskIcon />
          <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">
            {testMode ? 'Connect Your Wallet (Simulated)' : 'Connect or Register'}
          </h2>
          <p className="text-gray-500 mb-6">
            {testMode ? 'Connect your wallet to view your recipes.' : 'Connect as a customer or register as a merchant.'}
          </p>

          {/* MetaMask检测提示 */}
          {!testMode && !window.ethereum && (
            <div className="mb-6 p-4 bg-yellow-100 text-yellow-800 rounded-lg max-w-md mx-auto">
              <p className="font-medium mb-2">未检测到MetaMask</p>
              <p className="text-sm">
                请确保您已安装并解锁<a 
                  href="https://metamask.io/download/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >MetaMask扩展</a>，
                然后<button 
                  onClick={() => window.location.reload()} 
                  className="underline font-medium"
                >刷新页面</button>重试。
              </p>
            </div>
          )}

          {testMode ? (
              // --- Test Mode Button --- 
              <button
                 onClick={handleSimulateConnectWallet}
                 className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors"
              >
                  Connect Wallet (Simulate)
              </button>
          ) : (
              // --- Real Mode Buttons --- 
              <div className="max-w-xs mx-auto space-y-3">
                  <button
                      onClick={handleConnectAsCustomer} // 使用统一的连接函数
                      disabled={isRegistering || autoConnecting || !window.ethereum}
                      className="w-full px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Connect Wallet</span>
                  </button>
                  
                  <button
                      onClick={handleRegisterMerchantClick} // Merchant Register
                      disabled={isRegistering || autoConnecting || !window.ethereum}
                      className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                     </svg>
                     <span>{isRegistering ? "注册中..." : "Register as Merchant"}</span>
                     {isRegistering && (
                       <span className="ml-2 inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                     )}
                  </button>
              </div>
          )}
        </div>
      );
    }

    // <<< This main return block now handles both users and merchants >>>
    console.log("Rendering Connected View for user:", userData); 
    return (
      <div>
        {/* Wallet Info and Disconnect Button */}
        <div className="mb-8 p-4 bg-gray-100 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="flex-grow">
               <p className="text-sm text-gray-600 font-medium">Connected Wallet:</p>
               <p className="text-md text-gray-900 font-mono break-all" title={connectedWallet}>{connectedWallet}</p>
                {/* Display Merchant Status if applicable */}
                {userData?.isMerchant && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${userData.isverified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {userData.isverified ? 'Verified Merchant' : 'Unverified Merchant'}
                    </span>
                )}
                {/* Show not found message */}
                {/* {userData === undefined && !isLoading && (
                    <p className="text-sm text-red-600 mt-1">Wallet data not found in our records.</p>
                )} */}
                {/* Handle initializing state */}
                {userData === null && !isLoading && (
                     <p className="text-sm text-orange-600 mt-1">User data is initializing...</p>
                )}
          </div>
           <div className="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                {/* Test mode button */} 
                {testMode && (
                    <button 
                        onClick={handleSimulateConnectWallet}
                        className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                    >
                        Switch Wallet (Simulate)
                    </button>
                )}
                {/* Disconnect button */} 
                <button 
                    onClick={testMode ? handleSimulateDisconnectWallet : disconnectWallet}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                    Disconnect
                </button>
          </div>
        </div>

        {/* Ongoing Swap Process Section - NEW! */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            <span className="text-amber-500">⟳</span> Ongoing Swap Processes
          </h2>
          {/* 目前仅测试模式支持交换功能，后续可扩展到实际模式 */}
          {testMode && ongoingSwapRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ongoingSwapRecipes.map(recipe => (
                <div key={recipe.id} className="relative">
                  <div className="absolute top-0 right-0 bg-amber-500 text-white p-2 rounded-tr-lg rounded-bl-lg z-10">
                    Swapping
                  </div>
                  <RecipeCard recipe={recipe} />
                  <div className="mt-2 flex justify-end">
                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                      Cancel Swap
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-4">You don't have any ongoing swap processes.</p>
              <Link
                to="/swap-market"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                Browse Swap Market
              </Link>
            </div>
          )}
        </div>

        {/* Owned Recipes Section (Show for everyone) */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            My Owned NFTs
          </h2>
          {/* 测试模式下使用dummy数据，实际模式下使用数据库数据 */}
          {(testMode && userData && ownedRecipes.length > 0) || (!testMode && nfts.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 测试模式下显示dummy数据 */}
              {testMode && userData && ownedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
              
              {/* 实际模式下显示数据库数据 */}
              {!testMode && nfts.map(nft => (
                <div key={nft.id} className="relative">
                  <NftCard 
                    nft={nft} 
                    onClick={() => handleOpenNftDetail(nft)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-4">You don't hold any recipe NFTs associated with this wallet.</p>
              <Link
                to="/swap-market"
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                Browse Swap Market
              </Link>
            </div>
          )}
        </div>

        {/* Created Recipes Section (Adapt title/button based on user type) */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2 flex justify-between items-center">
            {/* Adapt title based on merchant status */}
            <span>{userData?.isMerchant ? 'My Creations' : 'My Created Recipes'}</span>
            
            {/* 添加创建NFT按钮 - 仅对已验证商家显示 */}
            {userData?.isMerchant && userData.isverified && (
              <button
                onClick={handleOpenNftTypeModal}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New NFT
              </button>
            )}
          </h2>
          {/* 使用从数据库获取的NFT数据替代dummy数据 */}
          {((!testMode && createdNfts.length > 0) || (testMode && userData && createdRecipes.length > 0)) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* 测试模式下显示dummy数据 */}
              {testMode && userData && createdRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
              
              {/* 实际模式下显示数据库数据 */}
              {!testMode && createdNfts.map(nft => (
                <div key={nft.id} className="relative">
                  <NftCard 
                    key={nft.id} 
                    nft={nft} 
                    onClick={() => handleOpenNftDetail(nft)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-4">
                {/* Adapt empty state message */}
                {userData?.isMerchant
                  ? "You haven't created any NFTs with this wallet yet."
                  : "You haven't created any recipes with this wallet yet."
                }
              </p>
              <div className="space-x-4">
                {/* Conditional Buttons: Verify for unverified merchants, Create for verified merchants/users */}
                {userData?.isMerchant && !userData.isverified && (
                    <button
                        onClick={() => alert('You can create the first NFT after verification')}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Create The First NFT
                    </button>
                )}
                
                {/* Show Create button for Verified Merchants OR regular users */} 
                {/* Regular users link to /create (old recipe page), Merchants use the modal */}
                {(userData?.isMerchant && userData.isverified) ? (
                    <button
                        onClick={handleOpenNftTypeModal} // Opens Coupon/Membership choice
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        Create New NFT
                    </button>
                ) : (!userData?.isMerchant && (
                    // Link for regular users (if they can create standard recipes)
                    <Link 
                      to="/create" // Assuming /create is for standard recipes
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                      Create Recipe
                    </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 处理函数，用于打开NFT详情模态框
  const handleOpenNftDetail = (nft: any) => {
    setSelectedNftForDetail(nft);
    setShowNftDetailModal(true);
  };

  // 处理函数，用于关闭NFT详情模态框
  const handleCloseNftDetail = () => {
    setShowNftDetailModal(false);
    setSelectedNftForDetail(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
         <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
           My Collection
         </h1>
        {renderContent()}
      </div>

      {/* Modals */}
      {/* Post-Connection Verification Modal (for unverified merchants) */}
      {connectedWallet && userData?.isMerchant && !userData.isverified && !testMode && (
        <MerchantVerificationInputModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          onSubmit={handleVerificationSubmit}
          merchantId={connectedWallet} 
        />
      )}
      {/* Pre-Connection Verification Modal */}
      {!testMode && !globalConnectedWallet && (
          <MerchantVerificationInputModal
            isOpen={isPreVerifyModalOpen}
            onClose={() => setIsPreVerifyModalOpen(false)}
            onSubmit={handlePreVerificationSubmit}
            merchantId={"PRE_VERIFY"}
          />
      )}
       {/* NFT Type Selection Modal (for verified merchants) */}
       {userData?.isMerchant && userData.isverified && (
        <NftTypeSelectionModal
          isOpen={isNftTypeModalOpen}
          onClose={() => setIsNftTypeModalOpen(false)}
          onSelectCoupon={handleSelectCoupon}
          onSelectMembership={handleSelectMembership}
        />
       )}

      {/* 添加NFT详情模态框 */}
      {showNftDetailModal && selectedNftForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-0 max-w-xl w-11/12 max-h-[90vh] overflow-y-auto">
            {/* 上方图片区域 */}
            <div className="w-full h-64 bg-gray-200 relative">
              <img
                src={selectedNftForDetail.coupon_image 
                  ? `/images/${selectedNftForDetail.coupon_image}` 
                  : selectedNftForDetail.imageUrl || '/placeholder-images/nft-default.jpg'}
                alt={selectedNftForDetail.coupon_name || selectedNftForDetail.name || 'NFT'}
                className="w-full h-full object-cover"
              />
              <button 
                onClick={handleCloseNftDetail}
                className="absolute top-3 right-3 bg-white bg-opacity-70 text-gray-700 rounded-full p-1 hover:bg-opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 下方详情区域 */}
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2 text-gray-800">
                {selectedNftForDetail.coupon_name || selectedNftForDetail.name || 'NFT'}
              </h2>
              
              <div className="mb-4 flex items-center">
                <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 text-xs font-semibold rounded">
                  {selectedNftForDetail.coupon_type || 'NFT'}
                </span>
                {selectedNftForDetail.creator_address && (
                  <span className="ml-2 text-sm text-gray-500">
                    Created by {selectedNftForDetail.creator_address?.substring(0, 6)}...{selectedNftForDetail.creator_address?.substring(38) || ''}
                  </span>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Merchant</h3>
                    <p className="text-gray-800">
                      {selectedNftForDetail.details?.merchantName || 
                       selectedNftForDetail.merchantName || 
                       'Unknown Merchant'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Expiration Date</h3>
                    <p className="text-gray-800">
                      {selectedNftForDetail.expires_at 
                        ? new Date(selectedNftForDetail.expires_at).toLocaleDateString() 
                        : selectedNftForDetail.expirationDate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Token ID</h3>
                    <p className="text-gray-800">{selectedNftForDetail.token_id || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Total Supply</h3>
                    <p className="text-gray-800">{selectedNftForDetail.total_supply || 1}</p>
                  </div>
                </div>
              </div>
              
              {/* 描述部分 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700">
                  {selectedNftForDetail.details?.description || 
                   selectedNftForDetail.description || 
                   'No description available.'}
                </p>
              </div>
              
              {/* 优惠内容 */}
              {(selectedNftForDetail.details?.benefits || 
                (selectedNftForDetail.benefits && 
                 selectedNftForDetail.benefits.length > 0)) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Benefits</h3>
                  {Array.isArray(selectedNftForDetail.benefits) ? (
                    <ul className="list-disc pl-5">
                      {selectedNftForDetail.benefits.map((benefit: string, index: number) => (
                        <li key={index} className="text-gray-700 mb-1">{benefit}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-700">{selectedNftForDetail.details?.benefits}</p>
                  )}
                </div>
              )}
              
              {/* 链上信息 */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-2">Blockchain Information</h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Owner Address:</span>
                    <span className="text-gray-800 font-mono text-sm truncate ml-2">
                      {typeof selectedNftForDetail.owner_address === 'string' 
                        ? `${selectedNftForDetail.owner_address.substring(0, 6)}...${selectedNftForDetail.owner_address.substring(38)}`
                        : 'Multiple Owners'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creator Address:</span>
                    <span className="text-gray-800 font-mono text-sm truncate ml-2">
                      {selectedNftForDetail.creator_address 
                        ? `${selectedNftForDetail.creator_address.substring(0, 6)}...${selectedNftForDetail.creator_address.substring(38)}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* 按钮区域 */}
              <div className="flex justify-end mt-6">
                <Link 
                  to={`/nft/${selectedNftForDetail.id}`}
                  className="px-6 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRecipesPage; 