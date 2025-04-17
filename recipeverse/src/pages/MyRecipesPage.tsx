import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserData, fetchUserDataByWallet, addNewMerchantToDb, dummyUserData } from '../data/dummyUserData';
import { recipes, Recipe } from '../data/dummyData'; // Import recipes data
import RecipeCard from '../components/RecipeCard'; // Reuse RecipeCard
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
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  // --- End Supabase related state --- 

  // State for the verification modals (pre-connect and potentially post-connect)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false); // Post-connect modal (current logic)
  const [isPreVerifyModalOpen, setIsPreVerifyModalOpen] = useState<boolean>(false); // Pre-connect modal
  const [isNftTypeModalOpen, setIsNftTypeModalOpen] = useState<boolean>(false); // New state for NFT type modal
  const [pendingMerchantDetails, setPendingMerchantDetails] = useState<{ name: string; address: string; file: File } | null>(null);

  // --- Determine effective state based on testMode --- 
  const connectedWallet = testMode ? simulatedWallet : globalConnectedWallet;
  let userData = testMode ? simulatedUserData : globalUserData;
  const isLoading = testMode ? simulatedIsLoading : globalIsLoading;

  // --- React Router Navigation ---
  const navigate = useNavigate();

  // --- Supabase related functions --- 
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
  // --- End Supabase related functions --- 

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

  const handlePreVerificationSubmit = async (details: { name: string; address: string; file: File }) => {
      if (testMode) return;

      // 1. Log simulation
      const detailJson = {
          merchantName: details.name,
          address: details.address,
          licenseFilename: `${details.name}-${details.file.name}`,
          submittedAt: new Date().toISOString(),
      };
      console.log("Simulating pre-verification submission (logging only):", JSON.stringify(detailJson, null, 2));
      console.log(`Simulating save of file '${details.file.name}'`);

      // 2. Close modal
      setIsPreVerifyModalOpen(false);

      // 3. Store details LOCALLY for check after connect
      const currentRegistrationDetails = details;
      // We still set the state, might be useful, but primary check uses local const
      setPendingMerchantDetails(currentRegistrationDetails);

      // 4. Connect wallet and wait for data fetch result
      console.log("[Submit] Pending details stored. Calling connectWallet...");
      const connectResult = await connectWallet();
      console.log("[Submit] connectWallet finished. Result:", connectResult);

      // 5. <<< Check conditions AFTER connectWallet completes >>>
      // Use local `currentRegistrationDetails` for the check to avoid state timing issues
      if (connectResult.userData === undefined && currentRegistrationDetails) {
          console.log('>>> [Submit Action] New merchant registration detected AFTER connection. Adding to dummy DB... <<<');
          // Ensure wallet ID is available from context AFTER connection attempt
          if (connectResult.walletId) {
               // Add as unverified first
               const newUnverifiedMerchant = addNewMerchantToDb(connectResult.walletId, {
                   name: currentRegistrationDetails.name,
                   address: currentRegistrationDetails.address
               });
               console.log('>>> [Submit Action] Added new UNVERIFIED merchant:', newUnverifiedMerchant);
               console.log('>>> [Submit Action] Updating context (unverified)...');
               updateUserData(newUnverifiedMerchant); 
               console.log('>>> [Submit Action] updateUserData (unverified) called.');

               // --- TEMPORARY HACK FOR TESTING: Immediately verify --- 
               console.warn('>>> [TESTING HACK] Attempting immediate verification... <<<');
               const userIndex = dummyUserData.findIndex(user => user.userWalletID === connectResult.walletId);
               if (userIndex !== -1) {
                   dummyUserData[userIndex].isverified = true;
                   // Create a *new* object reference for the context update
                   const verifiedMerchant = { ...dummyUserData[userIndex] }; 
                   console.log('>>> [TESTING HACK] Merchant verified in dummyData. Updating context again...');
                   updateUserData(verifiedMerchant); // Update context with verified status
                   console.log('>>> [TESTING HACK] Context updated with verified merchant.', verifiedMerchant);
               } else {
                   console.error('>>> [TESTING HACK] Failed to find newly added merchant in dummyUserData for verification hack.');
               }
               // --- END TEMPORARY HACK --- 

          } else {
              console.error(">>> [Submit Action] Cannot add merchant, walletId from connectResult is null/undefined even though userData was undefined.");
              // Optionally: Show an error message to the user via state
          }
      } else {
          console.log("[Submit Action] Conditions not met to add new merchant post-connection.", 
                      { 
                        fetchedUserDataExists: connectResult.userData !== undefined, 
                        detailsAvailable: !!currentRegistrationDetails, 
                        walletIdAvailable: !!connectResult.walletId 
                      });
      }

      // 6. Clear pending details state as this attempt is done
      console.log("[Submit] Clearing pending merchant details state.");
      setPendingMerchantDetails(null);
  };
  // --- End Handlers for REAL MODE Merchant Registration ---

  // Handler to open the post-connection verification modal (current logic, might be deprecated soon)
  const handleOpenVerifyModal = () => {
    if (!connectedWallet || !userData?.isMerchant || userData?.isverified) return;
    setIsVerifyModalOpen(true);
  };

  // Handler for submitting verification details (current logic for post-connect)
  const handleVerificationSubmit = (details: { name: string; address: string; file: File }) => {
    if (!connectedWallet || testMode) return;
    // Simulate submission
    console.log("Simulating post-connection verification submission:", details);
    alert(`Verification details submitted (simulation). File "${details.file.name}" would be processed.`);
    // Update context state to show verified (simulation)
    if (globalUserData) {
        updateUserData({ ...globalUserData, isverified: true });
    }
    setIsVerifyModalOpen(false);
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
    if (isLoading) {
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
                      onClick={connectWallet} // Customer Connect
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>I'm a Customer</span>
                  </button>
                  
                  <button
                      onClick={handleRegisterMerchantClick} // Merchant Register
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                     </svg>
                      <span>Register as Merchant</span>
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
                {userData === undefined && !isLoading && (
                    <p className="text-sm text-red-600 mt-1">Wallet data not found in our records.</p>
                )}
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
          {ongoingSwapRecipes.length > 0 ? (
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
          {(userData && ownedRecipes.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {ownedRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
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
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            {/* Adapt title based on merchant status */}
            {userData?.isMerchant ? 'My Creations' : 'My Created Recipe NFTs'}
          </h2>
          {(userData && createdRecipes.length > 0) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {createdRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 rounded-lg">
              <p className="text-gray-600 mb-4">
                {/* Adapt empty state message */}
                {userData?.isMerchant
                  ? "You haven't listed any creations yet."
                  : "You haven't created any NFTs with this wallet yet."
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
                      Create Recipe NFT
                    </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
         <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
           My Recipe Collection
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
    </div>
  );
};

export default MyRecipesPage; 