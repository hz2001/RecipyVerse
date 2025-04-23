// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CouponNFT is ERC721, Ownable {

    uint256 private _nextTokenId;
    uint256 public currentCircuration;
    uint256 public totalSupply; // total minted supply
    uint256 public collectionExpiry; // Expiration timestamp for all coupons
    string public collectionName;
    uint256 public maxMint;
    mapping(uint256 => Coupon) private _coupons;

    struct Coupon {
        string name;
        address creator;           // Merchant
        string benefitHash;        // Off-chain metadata (e.g., IPFS)
        uint256 expiryTimestamp;   // Expiration time
        bool isUsed;               // Redeemed?
        uint256 createdTime;       // When minted
    }

    constructor(
        string memory Name,
        string memory symbol,
        uint256 maxSupply,
        uint256 expirationTimestamp,
        address _owner
    ) ERC721(Name, symbol) Ownable(_owner) {
        require(expirationTimestamp > block.timestamp, "Expiration must be in the future");
        collectionExpiry = expirationTimestamp;
        collectionName = Name;
        maxMint = maxSupply;
        //_transferOwnership(_owner); // sets the OpenZeppelin owner
    }

    function mint(
        address to,
        string calldata benefitHash
    //uint256 expiryTimestamp
    ) external onlyOwner {
        require(totalSupply<maxMint, "Max supply reached");
        require(collectionExpiry > block.timestamp, "Expiration must be in the future");
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        _coupons[tokenId] = Coupon({
            name: collectionName,
            creator: msg.sender,
            benefitHash: benefitHash,
            expiryTimestamp: collectionExpiry,
            isUsed: false,
            createdTime: block.timestamp
        });

        currentCircuration++;
        totalSupply++;
    }


    // return to the restaurant to be used and burned
    function returnCoupon(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");

        Coupon storage coupon = _coupons[tokenId];

        require(!coupon.isUsed, "Coupon already used");
        require(coupon.expiryTimestamp == collectionExpiry, "Coupon expiration modified");
        require(block.timestamp <= collectionExpiry, "Coupon expired");

        _transfer(msg.sender, owner(), tokenId);
        //coupon.isUsed = true;
        currentCircuration--;
        _burn(tokenId); // burn the token, when it is returned to the owner
    }

    // use the coupon, but not transfering it to the store
    function redeemCoupon(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not token owner");
        Coupon storage coupon = _coupons[tokenId];

        require(!coupon.isUsed, "Coupon already used");
        require(coupon.expiryTimestamp == collectionExpiry, "Coupon expiration modified");
        require(block.timestamp <= collectionExpiry, "Coupon expired");

        coupon.isUsed = true;
        currentCircuration--;
    }

    function isUsed(uint256 tokenId) external view returns (bool) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _coupons[tokenId].isUsed;
    }

    function getCoupon(uint256 tokenId) external view returns (Coupon memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return _coupons[tokenId];
    }

    function isExpired(uint256 tokenId) public view returns (bool) {
        return block.timestamp > _coupons[tokenId].expiryTimestamp;
    }
}