import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Modal } from '@mui/material';
// Use the newly created NftCard
import NftCard from '../components/NftCard'; 
// Placeholder for fetching functions and types
// import { fetchUserNFTs, fetchMarketNFTs, markNFTForSwap, initiateSwap } from '../utils/api'; // Placeholder
// import { Nft } from '../types'; // Placeholder for NFT type

// Placeholder Type for NFT data - Replace with actual type
// Consider moving this to a shared types file (e.g., src/types/index.ts)
interface Nft {
  id: string;
  name: string;
  imageUrl?: string;
  merchantName?: string;
  expirationDate?: string;
  benefits?: string[];
  ownerId?: string; // Needed to differentiate user's NFTs and check ownership
  // Add other relevant NFT properties
}

function SwapMarket() {
  const [userNFTs, setUserNFTs] = useState<Nft[]>([]);
  const [marketNFTs, setMarketNFTs] = useState<Nft[]>([]);
  const [isLoadingUserNFTs, setIsLoadingUserNFTs] = useState(false);
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [selectedNFTToPost, setSelectedNFTToPost] = useState<Nft | null>(null);
  const [selectedMarketNFT, setSelectedMarketNFT] = useState<Nft | null>(null);
  const [showSwapModal, setShowSwapModal] = useState(false); 
  const [selectedNftToOffer, setSelectedNftToOffer] = useState<Nft | null>(null);

  // Placeholder for user ID - replace with actual user context/auth
  const userId = 'currentUser123'; 

  // --- Data Fetching Effects ---
  useEffect(() => {
    loadMarketNFTs();
  }, []);

  const loadMarketNFTs = async () => {
    setIsLoadingMarket(true);
    console.log("Fetching market NFTs..."); // Placeholder log
    try {
        // Mock Data
        const mockMarketNfts: Nft[] = [
            { id: 'market1', name: 'Coffee Coupon', merchantName: 'Cafe Central', expirationDate: '2024-12-31', benefits: ['Free Espresso'], ownerId: 'user456', imageUrl: '/placeholder-images/coffee.jpg' },
            { id: 'market2', name: 'Movie Ticket', merchantName: 'Cinema Plex', expirationDate: '2024-11-30', benefits: ['50% off Popcorn'], ownerId: 'user789', imageUrl: '/placeholder-images/movie.jpg' },
            { id: 'posted1', name: 'Bookstore Voucher Posted', merchantName: 'Readers Corner', expirationDate: '2024-10-31', benefits: ['$5 off purchase'], ownerId: userId, imageUrl: '/placeholder-images/books.jpg' }, // Example of user's own posted item
        ];
        // const nfts = await fetchMarketNFTs(); // Real API call
        // Filter out NFTs owned by the current user for the main market view
        setMarketNFTs(mockMarketNfts.filter(nft => nft.ownerId !== userId)); 
        // Note: The logic might need adjustment based on how "posted" NFTs are handled by the backend
    } catch (error) {
      console.error("Error fetching market NFTs:", error);
      setMarketNFTs([]); // Clear on error
    } finally {
      setIsLoadingMarket(false);
    }
  };

  const loadUserNFTs = async () => {
    if (!userId) return; // Or handle anonymous users
    setIsLoadingUserNFTs(true);
    console.log("Fetching user NFTs..."); // Placeholder log
    try {
        // Mock Data - Should ideally filter out NFTs already posted for swap
         const mockUserNfts: Nft[] = [
            { id: 'user1', name: 'Restaurant Discount', merchantName: 'Pasta Place', expirationDate: '2025-01-15', benefits: ['10% off total bill'], ownerId: userId, imageUrl: '/placeholder-images/restaurant.jpg' },
            // { id: 'user2', name: 'Bookstore Voucher', merchantName: 'Readers Corner', expirationDate: '2024-10-31', benefits: ['$5 off purchase'], ownerId: userId, imageUrl: '/placeholder-images/books.jpg' }, // This one is potentially posted
        ];
      // const nfts = await fetchUserNFTs(userId); // Real API call
      // Filter out NFTs currently in a swap process if the API doesn't
      setUserNFTs(mockUserNfts);
    } catch (error) {
      console.error("Error fetching user NFTs:", error);
      setUserNFTs([]); // Clear on error
    } finally {
      setIsLoadingUserNFTs(false);
    }
  };

  // --- Event Handlers ---
  const handleOpenPostModal = () => {
    setSelectedNFTToPost(null); // Reset selection when opening
    loadUserNFTs(); // Fetch user NFTs when modal is opened
    setIsPostModalOpen(true); // Open the modal
  };

  const handleClosePostModal = () => {
      setIsPostModalOpen(false);
      setSelectedNFTToPost(null); // Clear selection on close
  }

  const handleSelectNFTToPost = (nft: Nft) => {
      setSelectedNFTToPost(nft);
      console.log("Selected NFT to post:", nft); 
  };

  const handleConfirmPostToMarket = async () => {
    if (!selectedNFTToPost) return;
    console.log("Confirming post to market:", selectedNFTToPost); 
    // Add loading state specific to modal if needed
    try {
        // await markNFTForSwap(selectedNFTToPost.id, userId); // Real API call
        console.log("Simulating marking NFT for swap...");
        alert('NFT posted to swap market!'); 
        
        // Close modal first
        handleClosePostModal();
        
        // Refresh market NFTs
        loadMarketNFTs(); 

    } catch (error) {
        console.error("Error posting NFT to market:", error);
        alert('Failed to post NFT.'); 
        // Keep modal open on error?
    } finally {
        // Stop loading state here
    }
  };

  const handleMarketNFTClick = (nft: Nft) => {
      if (nft.ownerId === userId) return; // Should already be filtered, but double-check
      setSelectedMarketNFT(nft);
      console.log("Selected market NFT:", nft); 
  };

   const handleCancelMarketSelection = () => {
        setSelectedMarketNFT(null);
   }
  
  const handleInitiateSwapClick = () => {
      if (!selectedMarketNFT) return;
      console.log("Initiating swap for:", selectedMarketNFT); 
      setSelectedNftToOffer(null); // Reset selection
      loadUserNFTs(); // Ensure user NFTs are loaded for the modal
      setShowSwapModal(true); 
  };

   const handleCloseSwapModal = () => {
        setShowSwapModal(false);
        setSelectedNftToOffer(null);
   }

  const handleSelectNFTForSwap = (nftToOffer: Nft) => {
      setSelectedNftToOffer(nftToOffer);
      console.log("Selected own NFT to offer:", nftToOffer); 
  };

  const handleConfirmSwap = async () => {
      if (!selectedMarketNFT || !selectedNftToOffer) return;
      console.log(`Confirming swap: Offering ${selectedNftToOffer.name} (${selectedNftToOffer.id}) for ${selectedMarketNFT.name} (${selectedMarketNFT.id})`);
       // Add loading state here
      try {
          // await initiateSwap(userId, selectedNftToOffer.id, selectedMarketNFT.id, selectedMarketNFT.ownerId); // Real API Call
           console.log("Simulating swap execution...");
           alert('Swap initiated successfully! Ownership will be updated.'); // Placeholder feedback
          // Reset state and refresh data
          setShowSwapModal(false);
          setSelectedMarketNFT(null);
          setSelectedNftToOffer(null);
          loadMarketNFTs(); // Refresh market (removes swapped item)
          loadUserNFTs(); // Refresh user NFTs (removes offered item, potentially adds received item)
      } catch (error) {
          console.error("Error initiating swap:", error);
          alert('Swap failed.'); // Placeholder feedback
      } finally {
          // Stop loading state here
      }
  };


  // --- Rendering --- 
  return (
    <div className="flex-grow p-3 md:p-6">
      <Typography variant="h4" gutterBottom className="mb-4">
        Swap Market
      </Typography>

      {/* --- Begin Swap Section Trigger --- */}
      <div className="mb-6">
           {/* Button now opens the modal */}
            <Button variant="contained" onClick={handleOpenPostModal} className="bg-amber-500 hover:bg-amber-600 text-white">
                Begin a Swap (Post Your NFT)
            </Button>
      </div>

       {/* --- Post NFT Modal --- */}
       <Modal
            open={isPostModalOpen}
            onClose={handleClosePostModal} // Close when clicking backdrop
            aria-labelledby="post-nft-modal-title"
            aria-describedby="post-nft-modal-description"
       >
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white border-2 border-gray-300 shadow-xl p-4 md:p-6 max-h-[80vh] overflow-y-auto rounded-md">
                <Typography id="post-nft-modal-title" variant="h6" component="h2" className="mb-4">
                    Select Your NFT to Post
                </Typography>
                <div id="post-nft-modal-description" className="mt-2">
                    {isLoadingUserNFTs ? (
                        <div className="flex justify-center p-3">
                           <CircularProgress className="text-amber-500" />
                        </div>
                    ) : userNFTs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {userNFTs.map((nft) => (
                                <NftCard 
                                    key={nft.id}
                                    nft={nft} 
                                    onClick={handleSelectNFTToPost} 
                                    isSelected={selectedNFTToPost?.id === nft.id}
                                />
                            ))} 
                        </div>
                    ) : (
                        <Typography>You don't have any eligible NFTs available to post for swap.</Typography>
                    )}
                </div>
                {/* Modal Footer Buttons */} 
                 {userNFTs.length > 0 && !isLoadingUserNFTs && (
                    <div className="mt-5 flex justify-end gap-2">
                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={handleClosePostModal}
                            disabled={isLoadingUserNFTs}
                            className="border-gray-500 text-gray-600 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                         <Button 
                            variant="contained" 
                            color="primary" 
                            onClick={handleConfirmPostToMarket}
                            disabled={!selectedNFTToPost || isLoadingUserNFTs}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Confirm & Post NFT
                        </Button>
                    </div>
                )}
                {userNFTs.length === 0 && !isLoadingUserNFTs && (
                    <div className="mt-5 text-right">
                        <Button 
                            variant="outlined" 
                            color="secondary" 
                            onClick={handleClosePostModal}
                            className="border-gray-500 text-gray-600 hover:bg-gray-100"
                        >
                            Close
                        </Button>
                    </div>
                )}
           </div>
       </Modal>

      {/* --- Section to display NFTs available on the market --- */}
      <Typography variant="h5" gutterBottom className="mt-6 mb-3">Available for Swap</Typography>
      {isLoadingMarket ? (
        <div className="flex justify-center p-5">
             <CircularProgress className="text-amber-500" />
        </div>
      ) : marketNFTs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
           {marketNFTs.map((nft) => (
            <NftCard 
                key={nft.id}
                nft={nft} 
                onClick={handleMarketNFTClick}
                isSelected={selectedMarketNFT?.id === nft.id} 
            />
           ))} 
        </div>
      ) : (
          <Typography className="text-gray-500">No NFTs currently available for swap.</Typography>
      )}

       {/* --- Swap Initiation Button Area (shown when a market NFT is selected) --- */}
       {selectedMarketNFT && (
           <div className="mt-6 text-center p-4 border border-dashed border-blue-300 rounded-md bg-blue-50">
                <Typography gutterBottom className="mb-3">Selected for Swap: <strong className="font-semibold">{selectedMarketNFT.name}</strong> from {selectedMarketNFT.merchantName || 'Unknown Merchant'}</Typography> 
               <Button 
                   variant="contained" 
                   color="success" 
                   onClick={handleInitiateSwapClick}
                   className="mr-2 bg-green-600 hover:bg-green-700 text-white"
               >
                   Swap For This
               </Button>
                <Button 
                    variant="outlined" 
                    color="secondary" 
                    onClick={handleCancelMarketSelection}
                    className="border-gray-500 text-gray-600 hover:bg-gray-100"
                >
                    Cancel Selection
                </Button>
           </div>
       )}

       {/* --- Swap Modal --- */}
       <Modal
            open={showSwapModal}
            onClose={handleCloseSwapModal}
            aria-labelledby="swap-modal-title"
            aria-describedby="swap-modal-description"
        >
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 max-w-2xl bg-white border-2 border-gray-300 shadow-xl p-4 md:p-6 max-h-[80vh] overflow-y-auto rounded-md">
               <Typography id="swap-modal-title" variant="h6" component="h2" className="mb-4">
                   Select Your NFT to Offer for {selectedMarketNFT?.name || 'the selected NFT'}
               </Typography>
               <div id="swap-modal-description" className="mt-2">
                   {isLoadingUserNFTs ? (
                        <div className="flex justify-center p-3">
                           <CircularProgress className="text-amber-500" />
                        </div>
                   ) : userNFTs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {userNFTs.map((nft) => (
                                <NftCard 
                                    key={nft.id}
                                    nft={nft}
                                    onClick={handleSelectNFTForSwap}
                                    isSelected={selectedNftToOffer?.id === nft.id}
                                />
                            ))} 
                        </div>
                   ) : (
                       <Typography className="text-gray-500">You have no eligible NFTs to offer for swap.</Typography>
                   )}
               </div>
               <div className="mt-5 flex justify-end gap-2">
                   <Button 
                        variant="outlined" 
                        onClick={handleCloseSwapModal}
                         className="border-gray-500 text-gray-600 hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                   <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleConfirmSwap}
                        disabled={!selectedNftToOffer || isLoadingUserNFTs}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Confirm Swap Offer
                    </Button>
               </div>
           </div>
       </Modal>

    </div>
  );
}

export default SwapMarket; 