import React, { useState, ChangeEvent, FormEvent } from 'react';

interface MerchantVerificationInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: { name: string; address: string; file: File }) => void;
  merchantId: string; // We might need this for context or filename generation
}

const MerchantVerificationInputModal: React.FC<MerchantVerificationInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  merchantId
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear previous errors on new file selection
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid file type. Please upload a JPG, PNG, GIF, or PDF.');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Maximum size is 5MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    if (!name.trim()) {
      setError('Merchant Name is required.');
      return;
    }
    if (!address.trim()) {
      setError('Address is required.');
      return;
    }
    if (!selectedFile) {
      setError('Business License file is required.');
      return;
    }

    // All fields are valid, call the onSubmit prop
    onSubmit({ name: name.trim(), address: address.trim(), file: selectedFile });
    // Optionally clear form, though onClose usually handles this
    // setName('');
    // setAddress('');
    // setSelectedFile(null);
  };

  // Determine if the form is valid to enable the submit button
  const isFormValid = name.trim() !== '' && address.trim() !== '' && selectedFile !== null;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-5 border-b pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Merchant Verification Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <p className="text-gray-600 mb-4 text-sm">
            Please provide your business details and upload a verification document (e.g., business license). All fields are required.
          </p>

          {/* Merchant Name */}
          <div className="mb-4">
            <label htmlFor="merchantName" className="block text-sm font-medium text-gray-700 mb-1">
              Merchant Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="merchantName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              placeholder="Your official business name"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label htmlFor="merchantAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Business Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="merchantAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              placeholder="Your primary business location"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label htmlFor="verificationFile" className="block text-sm font-medium text-gray-700 mb-1">
              Business License (PDF, JPG, PNG, GIF - Max 5MB) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="verificationFile"
              accept="image/jpeg,image/png,image/gif,application/pdf"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
            />
            {selectedFile && (
              <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button
              type="button" // Important: type="button" to prevent form submission
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`px-4 py-2 rounded-md text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                isFormValid
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-amber-300 cursor-not-allowed'
              }`}
            >
              Confirm and Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MerchantVerificationInputModal; 