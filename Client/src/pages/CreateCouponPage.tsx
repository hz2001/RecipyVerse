import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import nftService from '../services/nftService';
import contractService from '../services/contractService';
import merchantService from '../services/merchantService';
import { CreateCouponNFTData } from '../services/nftService';


// Basic validation for wallet IDs
const WALLET_ID_REGEX = /^0x[a-fA-F0-9]{40}$/;

const CreateCouponPage: React.FC = () => {
  const navigate = useNavigate();
  const { connectedWallet, sessionId } = useWallet();

  const [couponName, setCouponName] = useState<string>('');
  const [couponType, setCouponType] = useState<'Cash' | 'Discount' | 'Food'>('Cash');
  const [benefit, setBenefit] = useState<string>('');
  const [expireDate, setExpireDate] = useState<string>('');
  const [supply, setSupply] = useState<number>(1);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [nftOwners, setNftOwners] = useState<string>('');
  const [otherInfo, setOtherInfo] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string>('');

  // Redirect if user is not a verified merchant
  useEffect(() => {
    const checkMerchantStatus = async () => {

      // 如果是商家，检查验证状态
      try {
        const merchantInfo = await merchantService.getMerchantInfo();
        if (!merchantInfo?.is_verified) {
          navigate('/profile');
        }
      } catch (err) {
        console.error('Error checking merchant status:', err);
        navigate('/profile');
      }
    };

    checkMerchantStatus();
  }, []);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
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

    if (nftOwners.trim()) {
      const ownersArray = nftOwners.split(',').map(owner => owner.trim()).filter(owner => owner);
      if (ownersArray.some(owner => !WALLET_ID_REGEX.test(owner))) {
        setError('One or more provided Wallet IDs are invalid.');
        return false;
      }
    }

    return true;
  };

  

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading || !validateForm() || !connectedWallet || !sessionId) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    setTransactionStatus('Initializing transaction...');

    try {
      // 1. Upload image to backend and get image URL
      setTransactionStatus('Preparing to create NFT collection...');

      // 2. Create NFT collection using smart contract
      const factoryContract = await contractService.createContract();
      
      if (!factoryContract) {
        throw new Error('Failed to create factory contract');
      }

      // Convert expiration date to timestamp
      const expirationTimestamp = Math.floor(new Date(expireDate).getTime() / 1000);

      setTransactionStatus('Please confirm the transaction in your wallet...');
      
      // Deploy new NFT collection
      const deployTx = await factoryContract.deployCollection(
        couponName,
        'CPN', // Symbol
        supply,
        expirationTimestamp,
        1, // CouponNFT type
      );

      setTransactionStatus('Transaction submitted. Waiting for confirmation...');
      const receipt = await deployTx.wait();
      const collectionAddress = receipt.logs[1].args[1];

      setTransactionStatus('Creating NFT record in database...');
      
      // 3. Create NFT record in database with new structure
      const nftData: CreateCouponNFTData = {
        coupon_name: couponName,
        coupon_type: couponType,
        coupon_image: "imageData.url",//TODO:
        expires_at: expireDate,//TODO CHANGE TO TIMESTAMP
        total_supply: supply,
        creator_address: connectedWallet,
        contract_address: collectionAddress,
        owner_address: nftOwners,
        is_used: false,
        details: {
          benefits: benefit,
          other_info: otherInfo || ""
        }
      };

      await nftService.createCouponNFT(nftData, image!);

      setTransactionStatus('NFT created successfully!');
      setSuccess('Coupon NFT created successfully!');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      if (err.message.includes("user rejected action")) {
        setError("You have rejected the transaction. Please try again.");
      } else {
        console.error('Error creating NFT:', err);
        setError(err.message || 'Failed to create NFT');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create Coupon NFT</h1>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-amber-600 transition-colors"
          disabled={isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Coupon Name */}
        <div>
          <label htmlFor="couponName" className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="couponName"
            value={couponName}
            onChange={(e) => setCouponName(e.target.value)}
            required
            placeholder="e.g., Summer Coffee Discount"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          />
        </div>

        {/* Coupon Type */}
        <div>
          <label htmlFor="couponType" className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Type <span className="text-red-500">*</span>
          </label>
          <select
            id="couponType"
            value={couponType}
            onChange={(e) => setCouponType(e.target.value as 'Cash' | 'Discount' | 'Food')}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          >
            <option value="Cash">Cash Voucher</option>
            <option value="Discount">Discount Coupon</option>
            <option value="Food">Specific Food Item</option>
          </select>
        </div>

        {/* Benefit */}
        <div>
          <label htmlFor="benefit" className="block text-sm font-medium text-gray-700 mb-1">
            Benefit / Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="benefit"
            value={benefit}
            onChange={(e) => setBenefit(e.target.value)}
            required
            rows={3}
            placeholder="e.g., $10 off any purchase"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          />
        </div>

        {/* Expire Date */}
        <div>
          <label htmlFor="expireDate" className="block text-sm font-medium text-gray-700 mb-1">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="expireDate"
            value={expireDate}
            onChange={(e) => setExpireDate(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          />
        </div>

        {/* Supply */}
        <div>
          <label htmlFor="supply" className="block text-sm font-medium text-gray-700 mb-1">
            Supply (Number to Mint) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="supply"
            value={supply}
            onChange={(e) => setSupply(Math.max(1, parseInt(e.target.value, 10) || 1))}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Image <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleImageChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
            disabled={isLoading}
          />
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Image Preview:</p>
              <img src={imagePreview} alt="Coupon Preview" className="mt-2 max-h-40 rounded border border-gray-200" />
            </div>
          )}
        </div>

        {/* NFT Owners */}
        <div>
          <label htmlFor="nftOwners" className="block text-sm font-medium text-gray-700 mb-1">
            Initial NFT Owners (Optional Airdrop)
          </label>
          <textarea
            id="nftOwners"
            value={nftOwners}
            onChange={(e) => setNftOwners(e.target.value)}
            rows={3}
            placeholder="Enter wallet IDs separated by commas (e.g., 0x123..., 0xabc...)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide a comma-separated list of wallet IDs to directly send the minted NFTs to specific users.
          </p>
        </div>

        {/* Other Info */}
        <div>
          <label htmlFor="otherInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Other Information (Optional)
          </label>
          <textarea
            id="otherInfo"
            value={otherInfo}
            onChange={(e) => setOtherInfo(e.target.value)}
            rows={3}
            placeholder="Any additional terms, conditions, or details..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            disabled={isLoading}
          />
        </div>

        {/* Error/Success Messages */}
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center">{success}</p>}

        {/* Submit and Cancel Buttons */}
        <div className="pt-4 flex justify-between gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-1/3 px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="w-2/3 flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-400 disabled:cursor-wait"
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

      {/* Full-screen Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-11/12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Transaction</h2>
            <div className="mb-4 p-3 bg-gray-100 rounded-lg text-left">
              <p className="font-medium text-gray-700">Current Status:</p>
              <p className="text-gray-800">{transactionStatus}</p>
            </div>
            <p className="text-gray-600 mb-4">
              Please confirm the transaction in your wallet and wait for it to be processed.
              Do not close this window or navigate away from the page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCouponPage;
