// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CouponNFT.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/// @title Factory for deploying various NFT contract types with off-chain approval
contract NFTFactory {
    using ECDSA for bytes32;  // only for .recover; we’ll do the prefix manually

    address public owner;
    address[] public allCollections;
    mapping(address => address[]) public ownerToCollections;

    event CollectionDeployed(address indexed owner, address collection);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Deploys a new NFT collection, but only if `owner` has signed off-chain
     * @param name           ERC-721 name
     * @param symbol         ERC-721 symbol
     * @param maxSupply      cap on mintable tokens
     * @param expiration_date timestamp baked into the child contract
     * @param contractType   1 = CouponNFT, 2 = (future) MemberNFT, etc
     * @param signature      signature by `owner` over the packed payload
     */
    function deployCollection(
        string memory name,
        string memory symbol,
        uint256 maxSupply,
        uint256 expiration_date,
        uint256 contractType,
        bytes calldata signature
    ) external returns (address) {
        // 1) Recreate the exact 32-byte payload that was signed off-chain:
        bytes32 payloadHash = keccak256(
            abi.encodePacked(
                msg.sender,
                name,
                symbol,
                maxSupply,
                expiration_date,
                contractType,
                block.chainid
            )
        );

        // 2) Manually apply the EIP-191 prefix:
        bytes32 ethSignedHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                payloadHash
            )
        );

        // 3) Recover who signed it and require it to be `owner`
        address signer = ethSignedHash.recover(signature);
        require(signer == owner, "NFTFactory: unauthorized");

        // 4) Deploy the right contract
        address collectionAddress;
        if (contractType == 1) {
            CouponNFT col = new CouponNFT(
                name,
                symbol,
                maxSupply,
                expiration_date,
                msg.sender
            );
            collectionAddress = address(col);
        } else if (contractType == 2) {
            revert("NFTFactory: unsupported contract type");
        } else {
            revert("NFTFactory: invalid contract type");
        }

        // 5) Track & emit
        allCollections.push(collectionAddress);
        ownerToCollections[msg.sender].push(collectionAddress);
        emit CollectionDeployed(msg.sender, collectionAddress);

        return collectionAddress;
    }

    function getCollectionsByOwner(address ownerAddr) external view returns (address[] memory) {
        return ownerToCollections[ownerAddr];
    }

    function isFactoryChild(address collectionAddr) external view returns (bool) {
        for (uint256 i = 0; i < allCollections.length; i++) {
            if (allCollections[i] == collectionAddr) {
                return true;
            }
        }
        return false;
    }
}
