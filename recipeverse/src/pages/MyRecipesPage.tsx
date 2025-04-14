import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserData, fetchUserDataByWallet } from '../data/dummyUserData';
import { recipes, Recipe } from '../data/dummyData'; // Import recipes data
import RecipeCard from '../components/RecipeCard'; // Reuse RecipeCard
import MerchantVerificationInputModal from '../components/MerchantVerificationInputModal'; // Import the new modal

// Placeholder for MetaMask icon (replace with actual SVG or component later)
const MetaMaskIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    {/* Simple generic wallet icon */}
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);


const MyRecipesPage: React.FC = () => {
  // State for wallet connection simulation
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  // State for fetched user data
  const [userData, setUserData] = useState<UserData | null | undefined>(null); // null: initial, undefined: not found
  // State for loading status
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false); // State for the new modal

  // Predefined wallet addresses for simulation - updated to match dummyUserData + fake ID
  const sampleWallets = [
    "0xMerchantVerified1234567890abcdef12345678", // Verified Merchant
    "0xUserNumber1234567890abcdef12345678",      // Regular User with owned NFT
    "0xUserNumber234567890abcdef12345678",      // Regular User who created NFTs
    "0xMerchantUnverified1234567890abcdef00000", // Unverified Merchant
    "0xFakeWalletIdNotInDatabase00000000000000",   // Fake Wallet ID (Not in dummyUserData)
  ];

  // Simulate wallet connection - cycle through sample wallets
  const handleConnectWallet = () => {
    const currentIndex = connectedWallet ? sampleWallets.indexOf(connectedWallet) : -1;
    const nextIndex = (currentIndex + 1) % sampleWallets.length;
    console.log(`Simulating connection to: ${sampleWallets[nextIndex]}`);
    setConnectedWallet(sampleWallets[nextIndex]);
    setUserData(null); // Reset user data on new connection
    setIsLoading(true); // Set loading state
  };

  const handleDisconnectWallet = () => {
    console.log("Simulating disconnection");
    setConnectedWallet(null);
    setUserData(null);
    setIsLoading(false);
  }

  // Handler to open the verification modal
  const handleOpenVerifyModal = () => {
    setIsVerifyModalOpen(true);
  };

  // Handler for submitting verification details
  const handleVerificationSubmit = (details: { name: string; address: string; file: File }) => {
    if (!userData || !connectedWallet) return; // Should not happen if button is shown, but safety check

    const merchantId = userData.userWalletID;
    const filename = `${merchantId}-${details.file.name}`;

    // 1. Simulate creating the detail JSON
    const detailJson = {
      merchantName: details.name,
      address: details.address,
      licenseFilename: filename, // Store the intended filename
      submittedAt: new Date().toISOString(),
    };
    console.log("Simulating backend update with details:", JSON.stringify(detailJson, null, 2));

    // 2. Simulate file save (as we cannot save directly)
    console.log(`Simulating save of file '${filename}' to data/unprocessed/`);
    alert(`Verification details submitted (simulation). File "${filename}" would be processed by the backend.`);

    // 3. Update frontend state to show as verified (locally)
    // IMPORTANT: This does NOT update the actual dummyUserData.ts file.
    // It only changes the state for the current view.
    setUserData(prevData => {
        if (!prevData) return null;
        return { ...prevData, isverified: true }; // Create new object with isverified set to true
    });

    setIsVerifyModalOpen(false); // Close the modal
  };

  // Effect to fetch user data when wallet is connected
  useEffect(() => {
    if (connectedWallet) {
      setIsLoading(true);
      // Simulate API call delay
      const timer = setTimeout(() => {
        const data = fetchUserDataByWallet(connectedWallet);
        setUserData(data); // data will be UserData or undefined
        setIsLoading(false);
      }, 500); // 0.5 second delay

      return () => clearTimeout(timer); // Cleanup timer on unmount or wallet change
    } else {
        setUserData(null); // Clear data if disconnected
        setIsLoading(false);
    }
  }, [connectedWallet]);

  // Filter recipes based on NFT IDs held or created by the user
  const ownedRecipes = userData ? recipes.filter(recipe => userData.NFThold.includes(recipe.id)) : [];
  const createdRecipes = userData ? recipes.filter(recipe => userData.NFTcreated.includes(recipe.id)) : [];

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
      return (
        <div className="text-center py-16">
          <MetaMaskIcon />
          <h2 className="text-2xl font-semibold text-gray-700 mt-4 mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-gray-500 mb-6">
            You haven't connected your wallet yet. Please connect to view your recipes.
          </p>
          <button
            onClick={handleConnectWallet}
            className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg shadow hover:bg-amber-600 transition-colors"
          >
            Connect Wallet (Simulate)
          </button>
        </div>
      );
    }

    // Wallet connected, check userData
    return (
      <div>
         {/* Wallet Info and Disconnect Button */}
         <div className="mb-8 p-4 bg-gray-100 border border-gray-200 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex-grow">
                <p className="text-sm text-gray-600 font-medium">Connected Wallet:</p>
                <p className="text-md text-gray-900 font-mono break-all" title={connectedWallet}>{connectedWallet}</p>
                 {userData && userData.isMerchant && (
                     <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-semibold ${userData.isverified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {userData.isverified ? 'Verified Merchant' : 'Unverified Merchant'}
                     </span>
                 )}
                 {!userData && !isLoading && (
                     <p className="text-sm text-red-600 mt-1">Wallet data not found in our records.</p>
                 )}
            </div>
            <div className="flex-shrink-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <button
                   onClick={handleConnectWallet} // Cycle through wallets
                   className="w-full sm:w-auto px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                >
                    Switch Wallet (Simulate)
                </button>
                 <button
                    onClick={handleDisconnectWallet}
                    className="w-full sm:w-auto px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                 >
                    Disconnect
                 </button>
            </div>
         </div>

        {/* Owned Recipes Section */}
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
                to="/explore" // Link to explore page to find NFTs
                className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
              >
                Go Explore
              </Link>
            </div>
          )}
        </div>

        {/* Created Recipes Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
            {userData?.isMerchant ? 'My Creation' : 'My Created Recipe NFTs'}
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
                {userData?.isMerchant 
                  ? "You haven't listed any creations yet." 
                  : "You haven't created any NFTs with this wallet yet."
                }
              </p>
               <div className="space-x-4">
                 {/* --- Conditional Button Logic --- */}
                 {(userData?.isMerchant && !userData.isverified) ? (
                    // If Unverified Merchant, show Start Verify button
                    <button
                        onClick={handleOpenVerifyModal}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Start Verification
                    </button>
                 ) : (
                    // Otherwise (Verified Merchant or Regular User), show Create NFT button
                    <Link
                        to="/create-nft" // Assuming this is the correct link
                        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                    >
                        {userData?.isMerchant ? 'Create My First NFT' : 'Create My First Recipy'}
                    </Link>
                 )}
                 {/* --- End Conditional Button Logic --- */}
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

      {/* Render the Verification Input Modal */}
      {userData && connectedWallet && (
        <MerchantVerificationInputModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          onSubmit={handleVerificationSubmit}
          merchantId={connectedWallet} // Pass the wallet ID as merchantId
        />
      )}
    </div>
  );
};

export default MyRecipesPage; 