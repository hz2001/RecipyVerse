//
//
// // ✅ RegisterModal（最终版本）
// // ✅ 连接钱包并注册用户到 Supabase
// // ✅ 用于 ProfilePage 的 modal 弹窗逻辑对齐
// console.log("RegisterModal Loaded")
// import { useState, useEffect } from 'react';
// import { supabase } from '../utils/supabaseClient';
// import UserService from '../services/userService';
//
// interface RegisterModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onComplete: () => void;
//   userType: 'user' | 'merchant';
//   mode?: 'register' | 'login';
// }
//
// const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onComplete, userType }) => {
//   const [walletAddress, setWalletAddress] = useState('');
//   const [status, setStatus] = useState('');
//
//   // 自动连接钱包
//   const connectWallet = async () => {
//     try {
//       if (!(window as any).ethereum) {
//         alert('Please install MetaMask');
//         return;
//       }
//       const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
//       const address = accounts[0];
//       setWalletAddress(address);
//       setStatus('✅ Wallet connected');
//     } catch (err) {
//       console.error(err);
//       setStatus('❌ Failed to connect wallet');
//     }
//   };
//
//   const handleRegister = async () => {
//     if (!walletAddress) return;
//
//     const exists = await UserService.getUserByWallet(walletAddress);
//     if (exists) {
//       setStatus('⚠️ Already registered');
//       UserService.setCurrentUser(exists);
//       onComplete();
//       return;
//     }
//
//     const user = await UserService.registerWithWallet(walletAddress, userType === 'merchant');
//     if (user) {
//       UserService.setCurrentUser(user);
//       setStatus('✅ Registered successfully');
//       onComplete();
//     } else {
//       setStatus('❌ Registration failed');
//     }
//   };
//
//   useEffect(() => {
//     if (isOpen) {
//       setWalletAddress('');
//       setStatus('');
//     }
//   }, [isOpen]);
//
//   if (!isOpen) return null;
//
//   return (
//       <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//         <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
//           <h2 className="text-xl font-semibold mb-4">{walletAddress ? 'Wallet Connected ✅' : 'Register'}</h2>
//
//           <button
//               onClick={connectWallet}
//               className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
//           >
//             {walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Connect Wallet'}
//           </button>
//
//           <button
//               onClick={handleRegister}
//               className="bg-amber-500 text-white px-4 py-2 rounded w-full"
//           >
//             Register
//           </button>
//
//           <p className="mt-3 text-center text-sm text-gray-700">{status}</p>
//
//           <button
//               onClick={onClose}
//               className="mt-4 text-gray-500 hover:text-black text-sm"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//   );
// };
//
// export default RegisterModal;


import { useState } from 'react'
import UserService from '../services/userService'

interface RegisterModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userType: 'user' | 'merchant'
}

const RegisterModal: React.FC<RegisterModalProps> = ({
                                                       isOpen,
                                                       onClose,
                                                       onComplete,
                                                       userType
                                                     }) => {
  const [walletAddress, setWalletAddress] = useState('')
  const [status, setStatus] = useState('')

  const connectWallet = async () => {
    try {
      if (!(window as any).ethereum) {
        alert('Please install MetaMask')
        return
      }

      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      const address = accounts[0]
      setWalletAddress(address)
      setStatus('Wallet connected ✅')
    } catch (error) {
      console.error(error)
      setStatus('❌ Wallet connection failed')
    }
  }

  const handleRegister = async () => {
    if (!walletAddress) {
      alert('Connect wallet first!')
      return
    }

    const existingUser = await UserService.getUserByWallet(walletAddress)
    if (existingUser) {
      UserService.setCurrentUser(existingUser)
      setStatus('✅ Already registered. Logged in.')
      onComplete()
      return
    }

    const newUser = await UserService.registerWithWallet(walletAddress, userType === 'merchant')
    if (newUser) {
      UserService.setCurrentUser(newUser)
      setStatus('✅ Successfully registered!')
      onComplete()
    } else {
      setStatus('❌ Failed to register')
    }
  }

  if (!isOpen) return null

  return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
        <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Register</h2>

          <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full mb-4"
          >
            {walletAddress ? 'Wallet Connected ✅' : 'Connect Wallet'}
          </button>

          <button
              onClick={handleRegister}
              className="bg-amber-500 text-white px-4 py-2 rounded w-full"
          >
            Register
          </button>

          <p className="text-sm text-center mt-3 text-gray-700">{status}</p>

          <button
              onClick={onClose}
              className="mt-4 text-gray-500 hover:text-black text-sm"
          >
            Close
          </button>
        </div>
      </div>
  )
}

export default RegisterModal

