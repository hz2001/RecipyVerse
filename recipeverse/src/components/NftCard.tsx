import React from 'react';
// Removed MUI Card imports, kept Typography for now
import { Typography } from '@mui/material'; 

// Reusing the Nft interface
interface Nft {
  id: string;
  name: string;
  imageUrl?: string;
  merchantName?: string;
  expirationDate?: string;
  benefits?: string[];
  ownerId?: string;
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
  const baseClasses = "border rounded-lg overflow-hidden shadow-md h-full flex flex-col";
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
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
        {nft.imageUrl ? (
          <img
            src={nft.imageUrl} 
            alt={nft.name}
            className="w-full h-full object-cover" // Tailwind classes for image cover
          />
        ) : (
           <Typography variant="caption" className="text-gray-500">No Image</Typography> // Can replace Typography later if needed
        )}
      </div>
      
      {/* Content Section */}
      <div className="p-4 flex-grow"> {/* Use padding utilities */} 
        <Typography 
            gutterBottom 
            variant="h6" 
            component="div" 
            className="font-semibold truncate" // Tailwind classes for bold text and truncation
        >
          {nft.name}
        </Typography>
        <Typography variant="body2" className="text-gray-600 text-sm mb-1"> {/* Tailwind text style and margin */} 
          Merchant: {nft.merchantName || 'N/A'}
        </Typography>
        <Typography variant="body2" className="text-gray-600 text-sm mb-1"> {/* Tailwind text style and margin */} 
          Expires: {nft.expirationDate || 'N/A'}
        </Typography>
        {nft.benefits && nft.benefits.length > 0 && (
             <Typography variant="body2" className="text-gray-600 text-sm mt-2"> {/* Tailwind text style and margin */} 
                Benefits: {nft.benefits.join(', ')}
            </Typography>
        )}
      </div>
    </div>
  );
};

export default NftCard; 