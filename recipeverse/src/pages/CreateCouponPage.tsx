import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
// TODO: Import functions to update dummy data (e.g., addCouponNft, updateUserNfts)
// import { addCouponToDummyData, updateUserCreatedNfts, updateUserHeldNfts } from '../data/dummyDataUtils'; // Assuming utility functions exist

// Basic validation for wallet IDs (adjust regex as needed)
const WALLET_ID_REGEX = /^0x[a-fA-F0-9]{40}$/;

const CreateCouponPage: React.FC = () => {
  const navigate = useNavigate();
  const { userData, testMode } = useWallet(); // Get user data from context

  const [couponName, setCouponName] = useState<string>('');
  const [couponType, setCouponType] = useState<'Cash' | 'Discount' | 'Food'>('Cash');
  const [benefit, setBenefit] = useState<string>('');
  const [expireDate, setExpireDate] = useState<string>('');
  const [supply, setSupply] = useState<number>(1);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nftOwners, setNftOwners] = useState<string>(''); // Comma-separated string
  const [otherInfo, setOtherInfo] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if user is not a merchant or not verified (unless in test mode)
  useEffect(() => {
    if (!testMode && (!userData || !userData.isMerchant || !userData.isverified)) {
      console.warn('User is not a verified merchant. Redirecting...');
      // Optionally show a message before redirecting
      // setError('Only verified merchants can create NFTs.');
      // setTimeout(() => navigate('/profile'), 3000);
      navigate('/profile'); // Redirect immediately
    }
  }, [userData, testMode, navigate]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const validateForm = (): boolean => {
    setError(null);
    if (!couponName.trim()) {
      setError('Coupon name is required.');
      return false;
    }
    if (!benefit.trim()) {
      setError('Benefit description is required.');
      return false;
    }
    if (!expireDate) {
      setError('Expiration date is required.');
      return false;
    }
    // Check if expireDate is in the future
    if (new Date(expireDate) <= new Date()) {
        setError('Expiration date must be in the future.');
        return false;
    }
    if (supply < 1) {
      setError('Supply must be at least 1.');
      return false;
    }
    if (!image) {
      setError('Coupon image is required.');
      return false;
    }

    // Validate optional nftOwners
    if (nftOwners.trim()) {
      const ownersArray = nftOwners.split(',').map(owner => owner.trim()).filter(owner => owner);
      if (ownersArray.some(owner => !WALLET_ID_REGEX.test(owner))) {
          setError('One or more provided Wallet IDs for NFT Owners are invalid. Please use comma-separated 0x... addresses.');
          return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Prepare data (simulate what would be sent to backend/smart contract)
    const formData = {
      couponName,
      couponType,
      benefit,
      expireDate,
      supply,
      imageName: image?.name, // Don't send the full file object usually
      initialOwners: nftOwners.split(',').map(owner => owner.trim()).filter(owner => owner && WALLET_ID_REGEX.test(owner)),
      otherInfo,
      creatorId: userData?.userWalletID,
      createdAt: new Date().toISOString(),
    };

    console.log('Simulating Coupon NFT Creation with data:', formData);

    // Simulate backend/blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // --- TODO: Update Dummy Data --- 
      // 1. Generate a unique ID for the new coupon NFT
      const newNftId = `coupon-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
      console.log('Generated new NFT ID:', newNftId);

      // 2. Create the new coupon NFT object
      const newCouponData = {
          id: newNftId,
          type: 'coupon', // Add a type identifier
          name: couponName, // Use the custom coupon name
          description: benefit,
          imageUrl: imagePreview || '/placeholder-image.png', // Use preview or a default
          creator: userData?.userWalletID,
          attributes: {
              couponType: couponType,
              benefit: benefit,
              expireDate: expireDate,
              supply: supply,
              originalSupply: supply,
              otherInfo: otherInfo,
          },
          createdAt: formData.createdAt,
          // Add any other relevant fields matching the existing Recipe structure if extending it
      };

      // 3. Add to dummy data (requires modifying dummyData.ts or using utility functions)
      console.log('TODO: Add the following coupon to dummy data:', newCouponData);
      // Example: addCouponToDummyData(newCouponData);

      // 4. Update creator's NFTcreated list (requires modifying dummyUserData.ts or utils)
      if (userData?.userWalletID) {
          console.log(`TODO: Add ${newNftId} to NFTcreated for user ${userData.userWalletID}`);
          // Example: updateUserCreatedNfts(userData.userWalletID, newNftId);
      }

      // 5. Update initial owners' NFThold list (requires modifying dummyUserData.ts or utils)
      if (formData.initialOwners.length > 0) {
          console.log(`TODO: Add ${newNftId} to NFThold for users: ${formData.initialOwners.join(', ')}`);
          // Example: formData.initialOwners.forEach(ownerId => updateUserHeldNfts(ownerId, newNftId));
      }
      // --- End TODO --- 

      setSuccess('Coupon NFT created successfully! Redirecting...');
      setIsLoading(false);
      // Clear form or redirect after a short delay
      setTimeout(() => {
        navigate('/profile'); // Redirect to profile page
      }, 1500);

    } catch (err: any) {
        console.error('Error during simulated creation:', err);
        setError('An error occurred during creation. Please try again. (Simulation)');
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Coupon NFT</h1>

      {/* Render based on merchant status (redundant due to useEffect redirect, but good practice) */} 
      {(!testMode && (!userData || !userData.isMerchant || !userData.isverified)) ? (
          <p className="text-red-600">Only verified merchants can create Coupon NFTs.</p>
      ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Coupon Name */}
            <div>
              <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-1">Coupon Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                id="couponName"
                value={couponName}
                onChange={(e) => setCouponName(e.target.value)}
                required
                placeholder="e.g., Summer Coffee Discount, Weekend Brunch Special"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Coupon Type */} 
            <div>
              <label htmlFor="couponType" className="block text-sm font-medium text-gray-700 mb-1">Coupon Type <span className="text-red-500">*</span></label>
              <select
                id="couponType"
                value={couponType}
                onChange={(e) => setCouponType(e.target.value as 'Cash' | 'Discount' | 'Food')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="Cash">Cash Voucher</option>
                <option value="Discount">Discount Coupon</option>
                <option value="Food">Specific Food Item</option>
              </select>
            </div>

            {/* Benefit */} 
            <div>
              <label htmlFor="benefit" className="block text-sm font-medium text-gray-700 mb-1">Benefit / Description <span className="text-red-500">*</span></label>
              <textarea
                id="benefit"
                value={benefit}
                onChange={(e) => setBenefit(e.target.value)}
                required
                rows={3}
                placeholder="e.g., $10 off any purchase, 20% discount on main courses, Free Coffee with pastry purchase..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Expire Date */} 
            <div>
              <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">Expiration Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                id="expireDate"
                value={expireDate}
                onChange={(e) => setExpireDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Supply */} 
            <div>
              <label htmlFor="supply" className="block text-sm font-medium text-gray-700 mb-1">Supply (Number to Mint) <span className="text-red-500">*</span></label>
              <input
                type="number"
                id="supply"
                value={supply}
                onChange={(e) => setSupply(Math.max(1, parseInt(e.target.value, 10) || 1))} // Ensure positive integer >= 1
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Image Upload */} 
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">Coupon Image <span className="text-red-500">*</span></label>
              <input
                type="file"
                id="image"
                accept="image/png, image/jpeg, image/gif"
                onChange={handleImageChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Image Preview:</p>
                  <img src={imagePreview} alt="Coupon Preview" className="mt-2 max-h-40 rounded border border-gray-200" />
                </div>
              )}
            </div>

            {/* NFT Owners (Optional Airdrop) */} 
            <div>
              <label htmlFor="nftOwners" className="block text-sm font-medium text-gray-700 mb-1">Initial NFT Owners (Optional Airdrop)</label>
              <textarea
                id="nftOwners"
                value={nftOwners}
                onChange={(e) => setNftOwners(e.target.value)}
                rows={3}
                placeholder="Enter wallet IDs separated by commas (e.g., 0x123..., 0xabc...). Leave blank if none."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
                <p className="mt-1 text-xs text-gray-500">Provide a comma-separated list of wallet IDs (starting with 0x) to directly send the minted NFTs to specific users.</p>
            </div>

            {/* Other Info */} 
            <div>
              <label htmlFor="otherInfo" className="block text-sm font-medium text-gray-700 mb-1">Other Information (Optional)</label>
              <textarea
                id="otherInfo"
                value={otherInfo}
                onChange={(e) => setOtherInfo(e.target.value)}
                rows={3}
                placeholder="Any additional terms, conditions, or details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            {/* Error/Success Messages */} 
            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
            {success && <p className="text-green-600 text-sm text-center">{success}</p>}

            {/* Submit Button */} 
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating NFT...
                  </>
                ) : (
                  'Create Coupon NFT'
                )}
              </button>
            </div>

          </form>
      )}
    </div>
  );
};

export default CreateCouponPage; 