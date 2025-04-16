// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { UserData, fetchUserDataByWallet } from '../data/dummyUserData';
// import { recipes, Recipe } from '../data/dummyData'; // Import recipes data
// import RecipeCard from '../components/RecipeCard'; // Reuse RecipeCard
//
// // Placeholder for MetaMask icon (replace with actual SVG or component later)
// const MetaMaskIcon = () => (
//   <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//     {/* Simple generic wallet icon */}
//     <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//   </svg>
// );
//
//
// const MyRecipesPage: React.FC = () => {
//   // State for wallet connection simulation
//   const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
//   // State for fetched user data
//   const [userData, setUserData] = useState<UserData | null | undefined>(null); // null: initial, undefined: not found
//   // State for loading status
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//
//   // Predefined wallet addresses for simulation
//   const sampleWallets = [
//     "0x1234567890abcdef1234567890abcdef12345678", // Wallet with owned and created NFTs
//     "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // Wallet with only owned NFTs
//     "0x1111111111111111111111111111111111111111", // Wallet with no NFTs
//     "0xNoSuchWalletExistsInDummyData00000000000", // Wallet not in dummy data
//   ];
//
//   // Simulate wallet connection - cycle through sample wallets
//   const handleConnectWallet = () => {
//     const currentIndex = connectedWallet ? sampleWallets.indexOf(connectedWallet) : -1;
//     const nextIndex = (currentIndex + 1) % sampleWallets.length;
//     console.log(`Simulating connection to: ${sampleWallets[nextIndex]}`);
//     setConnectedWallet(sampleWallets[nextIndex]);
//     setUserData(null); // Reset user data on new connection
//     setIsLoading(true); // Set loading state
//   };
//
//   const handleDisconnectWallet = () => {
//     console.log("Simulating disconnection");
//     setConnectedWallet(null);
//     setUserData(null);
//     setIsLoading(false);
//   }
//
//   // Effect to fetch user data when wallet is connected
//   useEffect(() => {
//     if (connectedWallet) {
//       setIsLoading(true);
//       // Simulate API call delay
//       const timer = setTimeout(() => {
//         const data = fetchUserDataByWallet(connectedWallet);
//         setUserData(data); // data will be UserData or undefined
//         setIsLoading(false);
//       }, 500); // 0.5 second delay
//
//       return () => clearTimeout(timer); // Cleanup timer on unmount or wallet change
//     } else {
//         setUserData(null); // Clear data if disconnected
//         setIsLoading(false);
//     }
//   }, [connectedWallet]);
//
//   // Filter recipes based on NFT IDs held or created by the user
//   const ownedRecipes = userData ? recipes.filter(recipe => userData.NFThold.includes(recipe.id)) : [];
//   const createdRecipes = userData ? recipes.filter(recipe => userData.NFTcreated.includes(recipe.id)) : [];
//
//   // Render Loading State
//   const renderLoading = () => (
//       <div className="text-center py-16">
//           <p className="text-lg text-gray-600">Loading wallet data...</p>
//           {/* Basic Spinner */}
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mt-4"></div>
//       </div>
//   );
//
//   // Render Content based on connection and data
//   const renderContent = () => {
//     if (isLoading) {
//         return renderLoading();
//     }
//
//     if (!connectedWallet) {
//       return (
//         <div className="text-center py-16">
//           <MetaMaskIcon />
//           <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">
//             Connect Your Wallet
//           </h2>
//           <p className="text-gray-500 mb-6">
//             You haven't connected your wallet yet. Please connect to view your recipes.
//           </p>
//           <button
//             onClick={handleConnectWallet}
//             className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors"
//           >
//             Connect Wallet (Simulate)
//           </button>
//         </div>
//       );
//     }
//
//     // Wallet connected, check userData
//     return (
//       <div>
//          {/* Wallet Info and Disconnect Button */}
//          <div className="mb-8 p-4 bg-gray-100 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
//             <div className="flex-grow">
//                 <p className="text-sm text-gray-600 font-medium">Connected Wallet:</p>
//                 <p className="text-md text-gray-900 font-mono break-all" title={connectedWallet}>{connectedWallet}</p>
//                  {userData && userData.isMerchant && (
//                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${userData.isverified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                          {userData.isverified ? 'Verified Merchant' : 'Unverified Merchant'}
//                      </span>
//                  )}
//                  {!userData && !isLoading && (
//                      <p className="text-sm text-red-600 mt-1">Wallet data not found in our records.</p>
//                  )}
//             </div>
//             <div className="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
//                 <button
//                    onClick={handleConnectWallet} // Cycle through wallets
//                    className="w-full sm:w-auto px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
//                 >
//                     Switch Wallet (Simulate)
//                 </button>
//                  <button
//                     onClick={handleDisconnectWallet}
//                     className="w-full sm:w-auto px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
//                  >
//                     Disconnect
//                  </button>
//             </div>
//          </div>
//
//         {/* Owned Recipes Section */}
//         <div className="mb-12">
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
//             My Owned NFTs
//           </h2>
//           {(userData && ownedRecipes.length > 0) ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {ownedRecipes.map(recipe => (
//                 <RecipeCard key={recipe.id} recipe={recipe} />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 bg-gray-100 rounded-lg">
//               <p className="text-gray-600 mb-4">You don't hold any recipe NFTs associated with this wallet.</p>
//               <Link
//                 to="/explore" // Link to explore page to find NFTs
//                 className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
//               >
//                 Go Explore
//               </Link>
//             </div>
//           )}
//         </div>
//
//         {/* Created Recipes Section */}
//         <div>
//           <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
//             {userData?.isMerchant ? 'My Creation' : 'My Created Recipe NFTs'}
//           </h2>
//           {(userData && createdRecipes.length > 0) ? (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {createdRecipes.map(recipe => (
//                 <RecipeCard key={recipe.id} recipe={recipe} />
//               ))}
//             </div>
//           ) : (
//             <div className="text-center py-8 bg-gray-100 rounded-lg">
//               <p className="text-gray-600 mb-4">You haven't created any NFTs with this wallet yet.</p>
//                <div className="space-x-4">
//                  <Link
//                     to="/create-nft"
//                     className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
//                  >
//                     Create NFT
//                  </Link>
//                 </div>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };
//
//
//   return (
//     <div className="min-h-screen bg-gray-50 py-12 px-6">
//       <div className="max-w-7xl mx-auto">
//          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
//            My Recipe Collection
//          </h1>
//         {renderContent()}
//       </div>
//     </div>
//   );
// };
//
// export default MyRecipesPage;

// import React, { useState, useEffect } from 'react';
// import { supabase } from '../utils/supabaseClient';
//
// const MyRecipesPage: React.FC = () => {
//     const [walletAddress, setWalletAddress] = useState<string | null>(null);
//     const [nfts, setNfts] = useState<any[]>([]);
//     const [isLoading, setIsLoading] = useState<boolean>(false);
//
//     // Connect MetaMask and get the user's wallet address
//     const connectWallet = async () => {
//         try {
//             if (!(window as any).ethereum) {
//                 alert('Please install MetaMask');
//                 return;
//             }
//
//             const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
//             const address = accounts[0];
//             setWalletAddress(address);
//         } catch (error) {
//             console.error('Failed to connect wallet:', error);
//         }
//     };
//
//     useEffect(() => {
//         const fetchNFTs = async () => {
//             if (!walletAddress) return;
//             setIsLoading(true);
//             const { data, error } = await supabase
//                 .from('nfts')
//                 .select('*')
//                 .eq('owner_address', walletAddress);
//
//             if (error) {
//                 console.error('Error fetching NFTs:', error);
//             } else {
//                 setNfts(data || []);
//             }
//             setIsLoading(false);
//         };
//
//         fetchNFTs();
//     }, [walletAddress]);
//
//     return (
//         <div className="min-h-screen bg-gray-50 py-12 px-6">
//             <div className="max-w-4xl mx-auto">
//                 <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">My Coupon Collection</h1>
//
//                 {!walletAddress ? (
//                     <div className="text-center py-16">
//                         <p className="text-lg text-gray-600 mb-4">You haven't connected your wallet yet.</p>
//                         <button
//                             onClick={connectWallet}
//                             className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors"
//                         >
//                             Connect MetaMask Wallet
//                         </button>
//                     </div>
//                 ) : isLoading ? (
//                     <div className="text-center py-16">
//                         <p className="text-lg text-gray-600">Loading your NFTs...</p>
//                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mt-4"></div>
//                     </div>
//                 ) : (
//                     <div>
//                         <p className="mb-6 text-gray-700 font-medium">
//                             Wallet Address: <span className="font-mono">{walletAddress}</span>
//                         </p>
//
//                         {nfts.length === 0 ? (
//                             <p className="text-gray-600 text-center">You do not own any NFTs.</p>
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 {nfts.map(nft => (
//                                     <div key={nft.token_id} className="p-4 bg-white shadow rounded-lg border border-gray-200">
//                                         <p className="text-sm text-gray-500 mb-1">Token ID: {nft.token_id}</p>
//                                         <p className="text-sm text-gray-500 mb-1">Created At: {new Date(nft.created_at).toLocaleString()}</p>
//                                         <p className="text-sm text-gray-500 mb-1">Expires At: {nft.expires_at ? new Date(nft.expires_at).toLocaleString() : 'N/A'}</p>
//                                         <p className="text-sm text-gray-500 mb-1">Trade Not Allowed: {nft.trade_not ? 'Yes' : 'No'}</p>
//                                         <p className="text-sm text-gray-500">Metadata URL: {nft.metadata_url}</p>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };
//
// export default MyRecipesPage;


import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import UserService from '../services/userService';
import RegisterModal from '../components/RegisterModal';

const MyRecipesPage: React.FC = () => {
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [isMerchant, setIsMerchant] = useState<boolean>(false);
    const [userId, setUserId] = useState<string>('');
    const [nfts, setNfts] = useState<any[]>([]);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);
    const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

    const fetchNfts = async (address: string) => {
        const { data, error } = await supabase
            .from('nfts')
            .select('*')
            .eq('owner_address', address);
        if (!error && data) {
            setNfts(data);
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

    const handleRegisterComplete = async () => {
        const user = await UserService.getCurrentUser();
        if (user) {
            setWalletAddress(user.wallet_address);
            setIsMerchant(user.is_merchant);
            setUserId(user.id);
            setLoggedIn(true);
            fetchNfts(user.wallet_address);
        }
        setShowRegisterModal(false);
    };

    useEffect(() => {
        const init = async () => {
            const user = await UserService.getCurrentUser();
            if (user) {
                setWalletAddress(user.wallet_address);
                setIsMerchant(user.is_merchant);
                setUserId(user.id);
                setLoggedIn(true);
                fetchNfts(user.wallet_address);
            }
        };
        init();
    }, []);

    if (!loggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">My Coupon Collection</h1>
                    <p className="text-gray-600 mb-4">Please connect your wallet to view your NFTs.</p>
                    <button
                        onClick={() => setShowRegisterModal(true)}
                        className="bg-amber-500 text-white px-4 py-2 rounded hover:bg-amber-600"
                    >
                        Connect Wallet
                    </button>
                </div>
                {showRegisterModal && (
                    <RegisterModal isOpen={true} onClose={() => setShowRegisterModal(false)} onComplete={handleRegisterComplete}  userType={"user"}/>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">My Coupon Collection</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="bg-white shadow p-4 rounded mb-8">
                    <p className="text-sm text-gray-700 font-mono">{walletAddress}</p>
                    <p className="text-sm text-gray-700">User ID: {userId}</p>
                    <p className="text-sm text-gray-700">Merchant: {isMerchant ? 'Yes' : 'No'}</p>
                </div>

                {nfts.length > 0 ? (
                    <ul className="space-y-4">
                        {nfts.map(nft => (
                            <li key={nft.token_id} className="bg-white shadow p-4 rounded">
                                <p><strong>Token ID:</strong> {nft.token_id}</p>
                                <p><strong>Tradeable:</strong> {nft.trade_not ? 'Yes' : 'No'}</p>
                                <p><strong>Created At:</strong> {nft.created_at}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-600">You do not own any NFTs.</p>
                )}
            </div>
        </div>
    );
};

export default MyRecipesPage;
