import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import axiosInstance from '../services/api';

const AdminPage: React.FC = () => {
  const { 
    connectedWallet, 
    isConnecting, 
    connectWallet, 
    isAdmin 
  } = useWallet();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect to verification page if already authenticated as admin
  useEffect(() => {
    if (connectedWallet && isAdmin) {
      navigate('/admin/verification');
    }
  }, [connectedWallet, isAdmin, navigate]);

  // Handle wallet connection and admin verification
  const handleConnectWallet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await connectWallet();
      
      if (connectedWallet) {
        // Get session ID from localStorage
        const sessionId = localStorage.getItem('sessionId');
        if (!sessionId) {
          throw new Error('No active session found');
        }

        // Verify admin role with backend using the new endpoint
        const response = await axiosInstance.get('/api/admin/verify', {
          params: { sessionId }
        });
        
        if (response.data.success) {
          navigate('/admin/verification');
        } else {
          setError('You do not have admin permissions.');
        }
      }
    } catch (err) {
      console.error('Admin verification error:', err);
      setError('Failed to verify admin status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Admin Panel</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}
      
      {!connectedWallet ? (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <p className="mb-6 text-gray-600 text-center">
            Please connect your wallet to access the admin panel.
          </p>
          <button
            onClick={handleConnectWallet}
            disabled={isConnecting || loading}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting || loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            Wallet connected: {connectedWallet.substring(0, 6)}...{connectedWallet.substring(connectedWallet.length - 4)}
          </p>
          <p className="mb-6 text-gray-600">
            Verifying admin permissions...
          </p>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
        </div>
      )}
    </div>
  );
};

export default AdminPage; 