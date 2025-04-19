import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

interface Merchant {
    id: string;
    created_at: string;
    wallet_address: string;
    merchant_name: string;
    merchant_address: string;
    is_verified: string;
}

const VerificationManagementPage: React.FC = () => {
  // Hold the merchant data list in state
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load merchant data from Supabase
  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching merchants:', error.message);
        setError(error.message);
      } else {
        console.log('Fetched merchants:', data);
        setMerchants(data as Merchant[]);
        setError(null);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred while fetching merchants');
    } finally {
      setLoading(false);
    }
  };

  // Function to update merchant verification status
  const handleToggleVerification = async (merchantId: string, currentStatus: string) => {
    try {
      // Determine the new status (toggle between 'true' and 'false')
      const newStatus = currentStatus === 'true' ? 'false' : 'true';
      
      const { error } = await supabase
        .from('merchants')
        .update({ is_verified: newStatus })
        .eq('id', merchantId);
        
      if (error) {
        console.error('Error updating merchant status:', error.message);
        setError(error.message);
        return;
      }
      
      // Refresh the merchant list
      fetchMerchants();
      
    } catch (err) {
      console.error('Unexpected error during status update:', err);
      setError('An unexpected error occurred while updating merchant status');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Merchant Verification Management</h1>
        <button 
          onClick={fetchMerchants}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
        >
          Refresh Data
        </button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading merchants...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && merchants.length === 0 && (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-lg">No merchants found in the database.</p>
        </div>
      )}

      {!loading && !error && merchants.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono truncate max-w-[150px]" title={merchant.wallet_address}>
                      {`${merchant.wallet_address.substring(0, 6)}...${merchant.wallet_address.substring(merchant.wallet_address.length - 4)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{merchant.merchant_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{merchant.merchant_address || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      merchant.is_verified === 'true' 
                        ? 'bg-green-100 text-green-800' 
                        : merchant.is_verified === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {merchant.is_verified === 'true' 
                        ? 'Verified' 
                        : merchant.is_verified === 'rejected'
                          ? 'Rejected'
                          : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(merchant.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {merchant.is_verified !== 'true' && (
                      <button
                        onClick={() => handleToggleVerification(merchant.id, merchant.is_verified)}
                        className="text-green-600 hover:text-green-900 transition-colors mr-2"
                      >
                        Verify
                      </button>
                    )}
                    {merchant.is_verified === 'true' && (
                      <button
                        onClick={() => handleToggleVerification(merchant.id, merchant.is_verified)}
                        className="text-amber-600 hover:text-amber-900 transition-colors mr-2"
                      >
                        Unverify
                      </button>
                    )}
                    {merchant.is_verified !== 'rejected' && (
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from('merchants')
                              .update({ is_verified: 'rejected' })
                              .eq('id', merchant.id);
                              
                            if (error) throw error;
                            fetchMerchants();
                          } catch (err) {
                            console.error('Error rejecting merchant:', err);
                            setError('Failed to reject merchant');
                          }
                        }}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerificationManagementPage; 