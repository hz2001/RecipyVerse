import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import nftService, { CouponNFT } from '../services/nftService';

// Placeholder for fetching function
const fetchNftDetails = async (id: string): Promise<CouponNFT | null> => {
    console.log(`Fetching details for NFT ID: ${id}`);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    // Find in mock data or fetch from backend
    // TODO:Using a combined mock list for simplicity here, replace with actual API
    const mockMarketNfts: CouponNFT[] = [
        { 
            id: 'market1', 
            coupon_name: 'Coffee Coupon', 
            merchant_name: 'Cafe Central', 
            expires_at: '2024-12-31', 
            benefits: 'Free Espresso', 
            owner_addresses: { 'user456': 'owner' }, 
            coupon_image: 'coffee.jpg', 
            description: 'Enjoy a free espresso on us! Valid any day.', 
            token_id: '1',
            coupon_type: 'discount',
            total_supply: 1,
            creator_address: '0x789'
        },
        { 
            id: 'market2', 
            coupon_name: 'Movie Ticket', 
            merchant_name: 'Cinema Plex', 
            expires_at: '2024-11-30', 
            benefits: '50% off Popcorn', 
            owner_addresses: { 'user789': 'owner' }, 
            coupon_image: 'movie.jpg', 
            description: 'One free admission to any regular screening. Excludes 3D/IMAX. Also get 50% off a large popcorn.', 
            token_id: '2',
            coupon_type: 'ticket',
            total_supply: 1,
            creator_address: '0x789'
        },
        { 
            id: 'user1', 
            coupon_name: 'Restaurant Discount', 
            merchant_name: 'Pasta Place', 
            expires_at: '2025-01-15', 
            benefits: '10% off total bill', 
            owner_addresses: { 'user123': 'owner' }, 
            coupon_image: 'restaurant.jpg', 
            description: 'A tasty 10% discount on your entire bill. Max discount $20.', 
            token_id: '4',
            coupon_type: 'discount',
            total_supply: 1,
            creator_address: '0x789'
        }
    ];
    const foundNft = mockMarketNfts.find(nft => nft.id === id);
    return foundNft || null;
};

function NftDetailPage() {
  const { nftId } = useParams<{ nftId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [nftDetails, setNftDetails] = useState<CouponNFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulating logged-in user ID (replace with actual context/auth)
  const currentUserId = 'currentUser123'; 

  useEffect(() => {
    // Check if NFT data was passed via route state (from NftCard click)
    // This is an optimization to avoid re-fetching if we already have the data
    // Note: For a real app, fetching by ID is more robust
    const locationState = location.state as { nftData?: CouponNFT }; 
    if (locationState?.nftData && locationState.nftData.id === nftId) {
        console.log("Using NFT data from location state");
        setNftDetails(locationState.nftData);
        setIsLoading(false);
    } else if (nftId) {
        console.log("Fetching NFT data by ID");
        setIsLoading(true);
        fetchNftDetails(nftId)
            .then(data => {
                if (data) {
                    setNftDetails(data);
                } else {
                    setError('NFT not found.');
                }
            })
            .catch(err => {
                console.error("Error fetching NFT details:", err);
                setError('Failed to load NFT details.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    } else {
        setError('No NFT ID provided.');
        setIsLoading(false);
    }
  }, [nftId, location.state]);

  const handleInitiateSwap = () => {
      if (!nftDetails) return;
      // Navigate back to swap market, passing the target NFT info
      // SwapMarket will use this state to open the 'Select Your NFT' modal
      console.log("Navigating back to Swap Market to initiate swap for:", nftDetails.id);
      navigate('/swap-market', { state: { triggerSwapForNft: nftDetails } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        <p className="text-gray-600 mt-4">Loading NFT details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          onClick={() => navigate('/swap-market')} 
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
        >
          Back to Swap Market
        </button>
      </div>
    );
  }

  if (!nftDetails) {
    // Should be handled by error state, but as a fallback
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">NFT Not Found</h1>
        <p className="text-gray-600 mb-6">The NFT you're looking for doesn't exist or may have been removed.</p>
        <button 
          onClick={() => navigate('/swap-market')} 
          className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors"
        >
          Back to Swap Market
        </button>
      </div>
    );
  }

  // Determine if the current user owns this NFT
  const isOwner = typeof nftDetails.owner_addresses === 'string' 
      ? nftDetails.owner_addresses === currentUserId
      : nftDetails.owner_addresses?.[currentUserId] === 'owner';

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/swap-market')} 
            className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Swap Market
          </button>
        </div>
        
        {/* NFT Header with Image */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Container with fixed width (70% of available space) and 16:9 aspect ratio */}
          <div className="w-[70%] mx-auto relative" style={{ paddingBottom: 'calc(56.25% * 0.7)' }}> {/* 56.25% = 9/16 * 100%, multiply by 0.7 for 70% width */}
            {nftDetails.coupon_image ? (
              <img 
                src={nftDetails.coupon_image} 
                alt={nftDetails.coupon_name} 
                className="absolute inset-0 w-full h-full object-cover bg-gray-100" 
              />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
                No Image Available
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            {/* Text overlay */}
            <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white z-10 w-full">
              <div className="flex flex-wrap items-center mb-2">
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full mr-2 mb-1">
                  {nftDetails.merchant_name || 'NFT'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 line-clamp-2">{nftDetails.coupon_name}</h1>
            </div>
          </div>
        </div>
        
        {/* NFT Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Benefits */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Benefits</h2>
            {nftDetails.benefits ? (
              <div className="flex items-start">
                <span className="bg-amber-100 text-amber-600 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-3 mt-1">
                  •
                </span>
                <span className="text-gray-700">{nftDetails.benefits}</span>
              </div>
            ) : (
              <p className="text-gray-600">No specific benefits listed for this NFT.</p>
            )}
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Merchant</h2>
              <p className="text-gray-700">{nftDetails.merchant_name || 'No merchant information available'}</p>
            </div>
          </div>
          
          {/* Right Column - Description and Actions */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Description</h2>
            <p className="text-gray-700 mb-8">{nftDetails.description || 'No description available.'}</p>
            
            <h2 className="text-xl font-bold text-gray-800 mb-4">Blockchain Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-gray-600 mb-2">Contract Address:</p>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                  {nftDetails.creator_address || 'Not available'}
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Token ID:</p>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                  {nftDetails.token_id || 'Not available'}
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Owner ID:</p>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                  {typeof nftDetails.owner_addresses === 'string' 
                      ? nftDetails.owner_addresses 
                      : Object.keys(nftDetails.owner_addresses || {})[0] || 'Unknown'}
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-2">Expiration Date:</p>
                <div className="bg-gray-100 p-3 rounded-md text-sm">
                  {nftDetails.expires_at || 'No expiration'}
                </div>
              </div>
            </div>
            
            {/* Swap Button Area */}
            <div className="mt-6 flex justify-center">
              {!isOwner ? (
                <button
                  onClick={handleInitiateSwap}
                  className="px-6 py-3 bg-amber-500 text-white rounded-md font-medium hover:bg-amber-600 transition-colors flex items-center"
                >
                  Swap For This NFT
                </button>
              ) : (
                <div className="text-center text-sm text-gray-500 italic">
                  You already own this NFT
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NftDetailPage; 