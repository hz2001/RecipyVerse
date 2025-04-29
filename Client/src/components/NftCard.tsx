import React from 'react';
import { CouponNFT } from '../services/nftService';

interface NftCardProps {
  nft: CouponNFT;
  onClick?: (nft: CouponNFT) => void;
  isSelected?: boolean;
}

// 重构以适应新的数据结构
const NftCard: React.FC<NftCardProps> = ({ nft, onClick, isSelected }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(nft);
    }
  };

  // 基础样式类
  const baseClasses = "border rounded-lg overflow-hidden shadow-md h-full flex flex-col bg-white";
  // 条件样式类（选中和可点击状态）
  const conditionalClasses = `
    ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow duration-200' : ''}
    ${isSelected ? 'border-blue-500 border-2' : 'border-gray-200'}
  `;

  // 兼容新旧数据结构
  const name = nft.coupon_name || 'Unnamed NFT';
  const imageUrl = nft.coupon_image ? `/images/${nft.coupon_image}` : '';
  const merchantName = nft.merchant_name || 'Unknown Merchant';
  const expirationDate = nft.expires_at ? new Date(nft.expires_at).toLocaleDateString() : 'N/A';
  const description = nft.description || '';
  const couponType = nft.coupon_type || '';
  const totalSupply = nft.total_supply || 0;

  return (
    <div 
        className={`${baseClasses} ${conditionalClasses}`}
        onClick={handleClick}
    >
      {/* 图片部分 */}
      <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
        {imageUrl ? (
          <img
            src={imageUrl} 
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.png'; // 图片加载失败时显示占位图
            }}
          />
        ) : (
           <p className="text-xs">No Image</p>
        )}
      </div>
      
      {/* 内容部分 */}
      <div className="p-3 flex-grow"> 
        <h6 className="font-semibold text-base truncate mb-1"> 
          {name}
        </h6>
        {couponType && (
          <p className="text-gray-600 text-sm mb-1"> 
            Type: {couponType} {totalSupply > 0 && `· ${totalSupply} issued`}
          </p>
        )}
        <p className="text-gray-600 text-sm mb-1"> 
          Merchant: {merchantName}
        </p>
        <p className="text-gray-600 text-sm mb-1"> 
          Expires: {expirationDate}
        </p>
        {description && (
          <p className="text-gray-700 text-sm line-clamp-2 mt-2"> 
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default NftCard; 