import React, { useState } from 'react';
import { NFT } from '../services/nftService';

interface NftCardProps {
  nft: NFT;
  onClick?: (nft: NFT) => void;
  isSelected?: boolean;
}

const NftCard: React.FC<NftCardProps> = ({ nft, onClick, isSelected }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick(nft);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!imageError) {
      setImageError(true);
      e.currentTarget.src = '/placeholder-image.png';
    }
  };

  // 解析details JSON字符串
  const details = nft.details ? nft.details : null;

  // 基础样式类
  const baseClasses = "rounded-lg overflow-hidden shadow-md h-full flex flex-col bg-white";
  // 条件样式类（选中和可点击状态）
  const conditionalClasses = `
    ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
    ${isSelected ? 'ring-2 ring-amber-500' : 'border border-gray-200'}
  `;

  return (
    <div 
      className={`${baseClasses} ${conditionalClasses}`}
      onClick={handleClick}
    >
      {/* 图片部分 */}
      <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-500">
        {imageError ? (
          <p className="text-xs">No Image</p>
        ) : (
          <img
            src={imageError ? '/placeholder-image.png' : nft.coupon_image} 
            alt={nft.coupon_name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        )}
      </div>
      
      {/* 内容部分 */}
      <div className="p-3 flex-grow"> 
        <h6 className="font-semibold text-base truncate mb-1"> 
          {nft.coupon_name}
        </h6>
        {nft.coupon_type && (
          <p className="text-gray-600 text-sm mb-1"> 
            Type: {nft.coupon_type} {nft.total_supply > 0 && `· ${nft.total_supply} issued`}
          </p>
        )}
        {details && (
          <>
            {details.benefits && (
              <p className="text-gray-700 text-sm line-clamp-2 mt-2"> 
                {details.benefits}
              </p>
            )}
          </>
        )}
        {nft.expires_at && (
          <p className="text-gray-600 text-sm mb-1"> 
            Expires: {new Date(nft.expires_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

// Interface for the NFT info
interface NftInfo {
  coupon_name: string;
  contract_address: string;
}

// Props for NftCardWithDesiredNfts component
interface NftCardWithDesiredNftsProps {
  nft: NFT;
  onClick?: (nft: NFT) => void;
  isSelected?: boolean;
  getNftInfoByContractAddress?: (contractAddress: string) => NftInfo;
}

// Extended NftCard with desired NFTs display
const NftCardWithDesiredNfts: React.FC<NftCardWithDesiredNftsProps> = (
  { nft, onClick, isSelected, getNftInfoByContractAddress }) => {
  const [showFullAddress, setShowFullAddress] = useState<string | null>(null);
  
  // Parse desired NFTs from swapping field
  let desiredNfts: string[] = [];
  if (nft.swapping) {
    try {
      const parsed = JSON.parse(nft.swapping);
      if (Array.isArray(parsed)) {
        desiredNfts = parsed;
      }
    } catch (error) {
      console.error(`Error parsing swapping field for NFT ${nft.id}:`, error);
    }
  }
  
  return (
    <div className="relative">
      <NftCard nft={nft} onClick={onClick} isSelected={isSelected} />
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      {/* Desired NFTs buttons section */}
      {desiredNfts.length > 0 && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md mb-6">
          <p className="text-xs font-semibold mb-1 text-gray-700">Desired NFTs:</p>
          <div className="flex flex-wrap gap-1">
            {desiredNfts.map((contractAddress, index) => {
              const nftInfo = getNftInfoByContractAddress(contractAddress);
              return (
                <div key={index} className="relative">
                  <button 
                    className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 truncate max-w-[120px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullAddress(prev => prev === contractAddress ? null : contractAddress);
                    }}
                    title={contractAddress}
                  >
                    {nftInfo.coupon_name || 'Unknown NFT'}
                  </button>
                  
                  {/* Pop-up for full contract address */}
                  {showFullAddress === contractAddress && (
                    <div className="absolute top-full left-0 mt-1 p-2 bg-white shadow-md rounded z-20 text-xs w-48" style={{ maxWidth: '90vw' }}>
                      <p className="font-bold mb-1">Contract Address:</p>
                      <p className="break-all">{contractAddress}</p>
                      <button
                        className="mt-2 px-2 py-1 bg-gray-200 rounded w-full hover:bg-gray-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(contractAddress);
                          setShowFullAddress(null);
                          alert("Address copied to clipboard!");
                        }}
                      >
                        Copy Address
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export { NftCardWithDesiredNfts };
export default NftCard; 