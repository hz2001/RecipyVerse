import React, { useState, ChangeEvent } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (status: 'pending') => void; // Indicate upload triggers pending state
  merchantId: string;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ 
  isOpen, 
  onClose, 
  onUploadComplete,
  merchantId 
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null); // Clear previous errors
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      // Basic validation (example: check file type)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
          setError('Invalid file type. Please upload a JPG, PNG, GIF, or PDF.');
          setSelectedFile(null);
          return;
      }
      // Basic validation (example: check file size - 5MB limit)
      if (file.size > 5 * 1024 * 1024) {
          setError('File is too large. Maximum size is 5MB.');
          setSelectedFile(null);
          return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }
    
    setError(null);

    // Construct the filename
    const filename = `${merchantId}-${selectedFile.name}`;
    
    // --- Backend Integration Placeholder ---
    // In a real application, you would use FormData to send the file:
    // const formData = new FormData();
    // formData.append('verificationFile', selectedFile, filename);
    // formData.append('merchantId', merchantId);
    // 
    // fetch('/api/verify-merchant', { // Your API endpoint
    //   method: 'POST',
    //   body: formData, 
    // })
    // .then(response => {
    //   if (!response.ok) { throw new Error('Upload failed'); }
    //   return response.json();
    // })
    // .then(data => {
    //   console.log('Upload successful:', data);
    //   onUploadComplete('pending'); // Set status to pending after successful API call
    //   onClose(); 
    // })
    // .catch(err => {
    //   console.error("Upload error:", err);
    //   setError('Upload failed. Please try again.');
    // });
    // --- End Placeholder ---

    // --- Temporary Local Simulation ---
    // Since we cannot directly save files to a specific local folder from the browser
    // due to security restrictions, we'll just simulate the process.
    console.log(`Simulating upload of ${filename}. In a real app, this would be sent to the backend and saved.`);
    alert(`File "${filename}" would be uploaded and saved to 'data/unprocessed/' (Simulation).`);
    
    // Assume upload is initiated, set status to pending
    onUploadComplete('pending');
    onClose(); // Close modal after initiating upload
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Merchant Verification</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Please upload a document (Image or PDF) for verification purposes. This could be a business license, identification, or other relevant document.
        </p>

        <div className="mb-4">
          <label htmlFor="verificationFile" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Document
          </label>
          <input 
            type="file" 
            id="verificationFile"
            accept="image/jpeg,image/png,image/gif,application/pdf" 
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
          />
          {selectedFile && (
            <p className="text-xs text-gray-500 mt-1">Selected: {selectedFile.name}</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleUpload} 
            disabled={!selectedFile || !!error}
            className={`px-4 py-2 rounded-md text-white transition-colors ${
              !selectedFile || !!error 
              ? 'bg-blue-300 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Upload for Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal; 