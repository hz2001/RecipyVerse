import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Import hooks
import { Button, CircularProgress, Modal } from '@mui/material';
import NftCard from '../components/NftCard'; 

// Interface potentially moved to a shared types file
interface Nft {
  id: string;
  name: string;
  imageUrl?: string;
  merchantName?: string;
  expirationDate?: string;
  benefits?: string[];
  ownerId?: string; 
  description?: string; // Ensure description is included
  // Add ALL other relevant NFT properties needed for the detail view
  contractAddress?: string;
  tokenId?: string;
  // ... etc
}

function SwapMarket() {
  const navigate = useNavigate(); // Initialize navigate
  const location = useLocation(); // Initialize location

  const [userNFTs, setUserNFTs] = useState<Nft[]>([]);
  const [marketNFTs, setMarketNFTs] = useState<Nft[]>([]);
  const [isLoadingUserNFTs, setIsLoadingUserNFTs] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNFTToPost, setSelectedNFTToPost] = useState<Nft | null>(null);
  
  const [showSwapModal, setShowSwapModal] = useState(false); 
  const [selectedNftToOffer, setSelectedNftToOffer] = useState<Nft | null>(null);

  // Re-introduce state to hold the NFT being targeted for a swap, set from NftDetailPage navigation
  const [targetNftForSwap, setTargetNftForSwap] = useState<Nft | null>(null);

  const userId = 'currentUser123'; // Placeholder

  // --- MOCK DATA (Include description and other fields) ---
  const mockMarketNfts: Nft[] = [
      { id: 'market1', name: 'Coffee Coupon', merchantName: 'Cafe Central', expirationDate: '2024-12-31', benefits: ['Free Espresso'], ownerId: 'user456', imageUrl: '/placeholder-images/coffee.jpg', description: 'Enjoy a free espresso on us! Valid any day.', contractAddress: '0x123', tokenId: '1' },
      { id: 'market2', name: 'Movie Ticket', merchantName: 'Cinema Plex', expirationDate: '2024-11-30', benefits: ['50% off Popcorn'], ownerId: 'user789', imageUrl: '/placeholder-images/movie.jpg', description: 'One free admission to any regular screening. Excludes 3D/IMAX. Also get 50% off a large popcorn.', contractAddress: '0x456', tokenId: '2' },
      { id: 'posted1', name: 'Bookstore Voucher Posted', merchantName: 'Readers Corner', expirationDate: '2024-10-31', benefits: ['$5 off purchase'], ownerId: userId, imageUrl: '/placeholder-images/books.jpg', description: 'Get $5 off any purchase over $20.', contractAddress: '0x789', tokenId: '3' }, 
  ];
  const mockUserNfts: Nft[] = [
      { id: 'user1', name: 'Restaurant Discount', merchantName: 'Pasta Place', expirationDate: '2025-01-15', benefits: ['10% off total bill'], ownerId: userId, imageUrl: '/placeholder-images/restaurant.jpg', description: 'A tasty 10% discount on your entire bill. Max discount $20.', contractAddress: '0xabc', tokenId: '4' },
  ];

  // --- UseEffect to handle navigation state from NftDetailPage ---
  useEffect(() => {
      const locationState = location.state as { triggerSwapForNft?: Nft };
      if (locationState?.triggerSwapForNft) {
          console.log("Swap initiated from Detail Page for:", locationState.triggerSwapForNft);
          // Set the target NFT and immediately open the 'Select Your NFT' modal
          setTargetNftForSwap(locationState.triggerSwapForNft);
          // Clear the state from location history to prevent re-triggering on refresh/back
          navigate(location.pathname, { replace: true, state: {} }); 
          // Call the handler that opens the modal
          handleInitiateSwap(locationState.triggerSwapForNft);
      }
  }, [location.state, navigate]); // Depend on location.state

  // --- Data Fetching & Handlers (Modified/Added) ---
  useEffect(() => {
    loadMarketNFTs();
  }, []);

  const loadMarketNFTs = async () => {
    setIsLoadingMarket(true);
    try {
      setMarketNFTs(mockMarketNfts.filter(nft => nft.ownerId !== userId));
    } catch (error) {
      console.error("Error fetching market NFTs:", error);
      setMarketNFTs([]);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  const loadUserNFTs = async () => {
    setIsLoadingUserNFTs(true);
    try {
      // Filter out NFTs currently in a swap process if the API doesn't
      setUserNFTs(mockUserNfts);
    } catch (error) {
      console.error("Error fetching user NFTs:", error);
      setUserNFTs([]);
    } finally {
      setIsLoadingUserNFTs(false);
    }
  };

  const handleOpenPostModal = () => {
    setSelectedNFTToPost(null); 
    loadUserNFTs(); 
    setIsPostModalOpen(true); 
  };

  const handleClosePostModal = () => {
      setIsPostModalOpen(false);
      setSelectedNFTToPost(null); 
  }

  const handleSelectNFTToPost = (nft: Nft) => {
      setSelectedNFTToPost(nft);
  };

  const handleConfirmPostToMarket = async () => {
    if (!selectedNFTToPost) return;
    console.log("Confirming post to market:", selectedNFTToPost);
    try {
        // await markNFTForSwap(selectedNFTToPost.id, userId);
        alert('NFT posted to swap market!'); 
        handleClosePostModal();
        loadMarketNFTs(); 
    } catch (error) {
        console.error("Error posting NFT to market:", error);
        alert('Failed to post NFT.'); 
    }
  };

  // Updated: Navigates to NftDetailPage
  const handleMarketNFTClick = (nft: Nft) => {
      if (nft.ownerId === userId) return; 
      console.log(`Navigating to detail page for NFT: ${nft.id}`);
      // Pass the NFT data along in state to potentially avoid re-fetch on detail page
      navigate(`/nft/${nft.id}`, { state: { nftData: nft } }); 
  };

  // Updated: Opens the modal to select user's NFT, now takes target NFT as argument
  const handleInitiateSwap = (targetNft: Nft) => {
      // Removed console log from here, already logged in useEffect
      // Removed handleCloseDetailModal call
      setSelectedNftToOffer(null); 
      loadUserNFTs(); // Load user's NFTs to select from
      setTargetNftForSwap(targetNft); // Ensure target is set (might be redundant if called from useEffect)
      setShowSwapModal(true); // Open the modal to select user's NFT
  };

   const handleCloseSwapModal = () => {
        setShowSwapModal(false);
        setSelectedNftToOffer(null);
        setTargetNftForSwap(null); // Clear the target when closing modal
   }

  const handleSelectNFTForSwap = (nftToOffer: Nft) => {
      setSelectedNftToOffer(nftToOffer);
  };

  // Uses selectedNftToOffer (user's) and targetNftForSwap (market's)
  const handleConfirmSwap = async () => {
      if (!targetNftForSwap || !selectedNftToOffer) return;
      console.log(`Confirming swap: Offering ${selectedNftToOffer.name} (${selectedNftToOffer.id}) for ${targetNftForSwap.name} (${targetNftForSwap.id})`);
      try {
          // await initiateSwap(userId, selectedNftToOffer.id, targetNftForSwap.id, targetNftForSwap.ownerId);
           alert('Swap initiated successfully! Ownership will be updated.'); 
          setShowSwapModal(false);
          setSelectedNftToOffer(null);
          setTargetNftForSwap(null); // Clear target state
          loadMarketNFTs(); 
          loadUserNFTs(); 
      } catch (error) {
          console.error("Error initiating swap:", error);
          alert('Swap failed.'); 
      }
  };

  // --- Rendering --- 
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Swap Market
          </h1>
          <p className="text-lg text-gray-600">
            Exchange your NFTs with others in the community
          </p>
        </div>

        {/* Post NFT Button Section */}
        <div className="mb-8">
          <button 
            onClick={handleOpenPostModal} 
            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors shadow-md"
          >
            Post an NFT for Swap
          </button>
        </div>

        {/* Market NFTs Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Available for Swap</h3>
          
          {isLoadingMarket ? (
            <div className="flex justify-center p-5">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : marketNFTs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {marketNFTs.map((nft) => (
                <NftCard 
                  key={nft.id}
                  nft={nft} 
                  onClick={handleMarketNFTClick}
                />
              ))} 
            </div>
          ) : (
            <div className="text-center py-12">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="text-xl font-medium text-gray-600 mb-2">No NFTs available</h3>
              <p className="text-gray-500">There are currently no NFTs available for swap.</p>
            </div>
          )}
        </div>

        {/* Your Posted NFTs Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">Your Posted NFTs</h3>
          
          {isLoadingMarket ? (
            <div className="flex justify-center p-5">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
            </div>
          ) : mockMarketNfts.filter(nft => nft.ownerId === userId).length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {mockMarketNfts.filter(nft => nft.ownerId === userId).map((nft) => (
                <NftCard 
                  key={nft.id}
                  nft={nft}
                  onClick={() => {}}
                />
              ))} 
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">You haven't posted any NFTs for swap yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* Post NFT Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Select Your NFT to Post
            </h2>
            {isLoadingUserNFTs ? (
              <div className="flex justify-center p-5">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {userNFTs.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => handleSelectNFTToPost(nft)}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedNFTToPost?.id === nft.id 
                        ? 'border-amber-500 ring-2 ring-amber-500' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <NftCard 
                      nft={nft} 
                      onClick={handleSelectNFTToPost}
                      isSelected={selectedNFTToPost?.id === nft.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">You don't have any eligible NFTs available to post for swap.</p>
            )}
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleClosePostModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmPostToMarket}
                disabled={!selectedNFTToPost || isLoadingUserNFTs}
                className={`px-6 py-2 bg-amber-500 text-white rounded-md ${
                  !selectedNFTToPost || isLoadingUserNFTs 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-amber-600'
                } transition-colors`}
              >
                Confirm & Post NFT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-11/12 max-h-[80vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Select Your NFT to Offer
            </h2>
            <p className="text-gray-600 mb-6">
              You are offering to swap for: <span className="font-semibold">{targetNftForSwap?.name}</span>
            </p>
            {isLoadingUserNFTs ? (
              <div className="flex justify-center p-5">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : userNFTs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {userNFTs.map((nft) => (
                  <div 
                    key={nft.id}
                    onClick={() => handleSelectNFTForSwap(nft)}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                      selectedNftToOffer?.id === nft.id 
                        ? 'border-amber-500 ring-2 ring-amber-500' 
                        : 'border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    <NftCard 
                      nft={nft} 
                      onClick={handleSelectNFTForSwap}
                      isSelected={selectedNftToOffer?.id === nft.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 mb-6">You don't have any eligible NFTs to offer.</p>
            )}
            <div className="flex justify-end space-x-4">
              <button 
                onClick={handleCloseSwapModal}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmSwap}
                disabled={!selectedNftToOffer || isLoadingUserNFTs}
                className={`px-6 py-2 bg-amber-500 text-white rounded-md ${
                  !selectedNftToOffer || isLoadingUserNFTs 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-amber-600'
                } transition-colors`}
              >
                Confirm Swap Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SwapMarket; 