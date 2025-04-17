import React from 'react';
// Removed MUI Typography import

// Reusing the Nft interface
interface Nft {
  id: string;
  name: string;
  imageUrl?: string;
  merchantName?: string;
  expirationDate?: string;
  benefits?: string[];
  ownerId?: string;
  description?: string; // Added description for detail view
}

interface NftCardProps {
  nft: Nft;
  onClick?: (nft: Nft) => void;
  isSelected?: boolean;
}

// Refactored to use Tailwind CSS
const NftCard: React.FC<NftCardProps> = ({ nft, onClick, isSelected }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(nft);
    }
  };

  // Base classes
  const baseClasses = "border rounded-lg overflow-hidden shadow-md h-full flex flex-col bg-white";
  // Conditional classes for selection and clickability
  const conditionalClasses = `
    ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
    ${isSelected ? 'border-blue-500 border-2' : 'border-gray-200'}
  `;

  return (
    <div 
        className={`${baseClasses} ${conditionalClasses}`}
        onClick={handleClick}
    >
      {/* Image Section */}
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
        {nft.imageUrl ? (
          <img
            src={nft.imageUrl} 
            alt={nft.name}
            className="w-full h-full object-cover" // Tailwind classes for image cover
          />
        ) : (
           // Use standard p tag with Tailwind classes
           <p className="text-xs">No Image</p>
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-3 flex-grow"> {/* Adjusted padding slightly */} 
         {/* Use h6 tag with Tailwind classes */}
        <h6 className="font-semibold text-base truncate mb-1"> 
          {nft.name}
        </h6>
         {/* Use p tags with Tailwind classes */}
        <p className="text-gray-600 text-sm mb-1"> 
          Merchant: {nft.merchantName || 'N/A'}
        </p>
        <p className="text-gray-600 text-sm mb-1"> 
          Expires: {nft.expirationDate || 'N/A'}
        </p>
        {nft.benefits && nft.benefits.length > 0 && (
            <p className="text-gray-600 text-sm mt-2"> 
                Benefits: {nft.benefits.join(', ')}
            </p>
        )}
         {/* Optionally show truncated description on card */}
         {/* {nft.description && (
            <p className="text-gray-500 text-xs mt-2 line-clamp-2"> 
                {nft.description}
            </p>
         )} */} 
      </div>
    </div>
  );
};

export default NftCard; 