// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CouponNFT.sol";

// Factory wallet to deploy and manage individual NFT collections (RestaurantNFTs)
contract NFTFactory {
    address public owner;                        // Owner of the factory (platform owner)
    address[] public allCollections;             // All deployed collection addresses

    // Mapping from user address (restaurant) to their deployed collections
    mapping(address => address[]) public ownerToCollections;

    // Emitted when a new collection is deployed
    event CollectionDeployed(address indexed owner, address collection);

    constructor() {
        owner = msg.sender;                      // Initialize factory owner
    }

    // Deploys a new NFT collection with a custom name, symbol, and supply limit
    function deployCollection(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 expiration_date
    ) external returns (address) {
        // Create new RestaurantNFT and set caller as the owner
        CouponNFT collection = new CouponNFT(name, symbol, maxSupply, expiration_date, msg.sender);
        address collectionAddress = address(collection);

        // Track the deployed collection
        allCollections.push(collectionAddress);
        ownerToCollections[msg.sender].push(collectionAddress);

        emit CollectionDeployed(msg.sender, collectionAddress);
        return collectionAddress;
    }

    // Get all NFT collections deployed by a specific owner (restaurant)
    function getCollectionsByOwner(address ownerAddr) external view returns (address[] memory) {
        return ownerToCollections[ownerAddr];
    }

    // Check if an address is one of the deployed NFT collections
    function isFactoryChild(address collectionAddr) external view returns (bool) {
        for (uint i = 0; i < allCollections.length; i++) {
            if (allCollections[i] == collectionAddr) return true;
        }
        return false;
    }
}