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
  const details = nft.description ? JSON.parse(nft.description) : null;

  // 基础样式类
  const baseClasses = "border rounded-lg overflow-hidden shadow-md h-full flex flex-col bg-white";
  // 条件样式类（选中和可点击状态）
  const conditionalClasses = `
    ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
    ${isSelected ? 'border-blue-500 border-2' : 'border-gray-200'}
  `;

  return (
    <div 
      className={`${baseClasses} ${conditionalClasses}`}
      onClick={handleClick}
    >
      {/* 图片部分 */}
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
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
            {details.validity && (
              <p className="text-gray-600 text-sm mb-1"> 
                Validity: {details.validity}
              </p>
            )}
            {details.description && (
              <p className="text-gray-700 text-sm line-clamp-2 mt-2"> 
                {details.description}
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

export default NftCard; 