import React from 'react';

interface NftTypeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoupon: () => void;
  onSelectMembership: () => void;
}

const NftTypeSelectionModal: React.FC<NftTypeSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectCoupon,
  onSelectMembership,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 text-center">Select NFT Type</h2>

        <div className="space-y-4">
          <button
            onClick={onSelectCoupon}
            className="w-full px-5 py-3 bg-amber-500 text-white font-medium rounded-lg shadow hover:bg-amber-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            Create Coupon NFT
          </button>

          <button
            onClick={onSelectMembership}
            className="w-full px-5 py-3 bg-blue-500 text-white font-medium rounded-lg shadow hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Membership NFT
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default NftTypeSelectionModal; 