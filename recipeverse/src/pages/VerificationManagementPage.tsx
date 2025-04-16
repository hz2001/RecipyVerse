import React, { useState, useEffect } from 'react';
// Import the dummy data directly and the UserData interface
import { dummyUserData, UserData } from '../data/dummyUserData';

// TODO: In a real backend, you'd have an API call to toggle status.
// For simulation, we can add a helper function in dummyUserData.ts or mutate here.
// Let's create a simulated toggle function directly in the component for now.

const VerificationManagementPage: React.FC = () => {
  // Hold the user data list in state
  const [merchants, setMerchants] = useState<UserData[]>([]);

  // Load initial data (and filter for merchants)
  useEffect(() => {
    // Filter only merchants from the dummy data
    setMerchants(dummyUserData.filter(user => user.isMerchant));
  }, []);

  // Function to toggle verification status in the dummy data (simulation)
  const handleToggleVerification = (walletId: string) => {
    const userIndex = dummyUserData.findIndex(user => user.userWalletID === walletId && user.isMerchant);
    
    if (userIndex !== -1) {
        // Mutate the verification status in the original imported array
        dummyUserData[userIndex].isverified = !dummyUserData[userIndex].isverified;
        console.log(`Toggled verification for ${walletId} to ${dummyUserData[userIndex].isverified}`);

        // Update the component state with a fresh copy of the filtered data
        // to trigger a re-render
        setMerchants([...dummyUserData.filter(user => user.isMerchant)]); 
    } else {
        console.error(`Merchant not found with wallet ID: ${walletId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Merchant Verification Management</h1>

      {merchants.length === 0 ? (
        <p className="text-gray-600">No merchants found in the database.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                {/* Optional: Add address if needed 
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr key={merchant.userWalletID}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono" title={merchant.userWalletID}>
                      {`${merchant.userWalletID.substring(0, 6)}...${merchant.userWalletID.substring(merchant.userWalletID.length - 4)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{merchant.merchantName || 'N/A'}</div>
                  </td>
                  {/* Optional Address cell 
                  <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{merchant.merchantAddress || 'N/A'}</div>
                  </td>
                  */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${merchant.isverified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {merchant.isverified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {!merchant.isverified && (
                      <button
                        onClick={() => handleToggleVerification(merchant.userWalletID)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        Grant Access
                      </button>
                    )}
                    {merchant.isverified && (
                       <span className="text-gray-400">Access Granted</span>
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