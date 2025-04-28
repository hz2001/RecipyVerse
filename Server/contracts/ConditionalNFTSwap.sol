// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Interface for ERC721 with metadata
interface IERC721WithMetadata {
    function ownerOf(uint256 tokenId) external view returns (address);
    function tokenURI(uint256 tokenId) external view returns (string memory);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

/// @title Interface for verifying NFT collection was deployed by the Factory
interface IFactoryValidator {
    function isFactoryChild(address collectionAddr) external view returns (bool);
}

/// @title ConditionalNFTSwap - escrow-based NFT swapping by metadata type
contract ConditionalNFTSwap {
    address public immutable factory;   // Factory that created valid NFT collections
    address public immutable deployer;  // Original deployer of this swap contract

    // Represents a swap offer escrowing one token
    struct SwapRequest {
        address requester;              // Who offered their NFT
        address collection;             // Collection of offered token
        uint256 offeredTokenId;         // ID of the offered token
        string desiredType;             // Desired metadata keyword
        bool fulfilled;                 // Has the swap been completed?
    }

    mapping(uint256 => SwapRequest) public swapRequests;
    uint256 public swapCounter;

    event SwapCreated(
        uint256 indexed id,
        address indexed requester,
        address indexed collection,
        uint256 tokenId,
        string desiredType
    );
    event SwapFulfilled(uint256 indexed id, address indexed fulfiller, uint256 tokenId);
    event SwapCancelled(uint256 indexed id);

    modifier onlyValidCollection(address collection) {
        require(
            IFactoryValidator(factory).isFactoryChild(collection),
            "Invalid collection"
        );
        _;
    }

    constructor(address _factory) {
        factory = _factory;
        deployer = tx.origin;
    }

    /// @notice Create a swap: escrow your NFT and specify the desired metadata keyword
    function createSwap(
        address collection,
        uint256 tokenId,
        string memory desiredType
    ) external onlyValidCollection(collection) {
        require(
            IERC721WithMetadata(collection).ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        // Escrow the token in this contract
        IERC721WithMetadata(collection).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        swapRequests[swapCounter] = SwapRequest({
            requester: msg.sender,
            collection: collection,
            offeredTokenId: tokenId,
            desiredType: desiredType,
            fulfilled: false
        });

        emit SwapCreated(
            swapCounter,
            msg.sender,
            collection,
            tokenId,
            desiredType
        );
        swapCounter++;
    }

    /// @notice Cancel an open swap and return your NFT
    function cancelSwap(uint256 swapId) external {
        SwapRequest storage req = swapRequests[swapId];
        require(req.requester == msg.sender, "Not your swap");
        require(!req.fulfilled, "Already fulfilled");

        // Return escrowed NFT
        IERC721WithMetadata(req.collection).transferFrom(
            address(this),
            msg.sender,
            req.offeredTokenId
        );

        delete swapRequests[swapId];
        emit SwapCancelled(swapId);
    }

    /// @notice Accept a swap by escrowing your NFT and atomically exchanging
    function acceptSwap(
        uint256 swapId,
        address offeredCollection,
        uint256 offeredTokenId
    ) external onlyValidCollection(offeredCollection) {
        SwapRequest storage req = swapRequests[swapId];
        require(req.requester != address(0), "Swap not exist");
        require(!req.fulfilled, "Swap fulfilled");
        require(req.requester != msg.sender, "Cannot accept own swap");

        IERC721WithMetadata offeredNFT = IERC721WithMetadata(offeredCollection);
        require(
            offeredNFT.ownerOf(offeredTokenId) == msg.sender,
            "Not owner of offered token"
        );

        require(
            contains(offeredNFT.tokenURI(offeredTokenId), req.desiredType),
            "Token type mismatch"
        );

        // Escrow fulfiller's token
        offeredNFT.transferFrom(
            msg.sender,
            address(this),
            offeredTokenId
        );

        // Transfer original to fulfiller
        IERC721WithMetadata(req.collection).transferFrom(
            address(this),
            msg.sender,
            req.offeredTokenId
        );

        // Transfer fulfiller's token to requester
        offeredNFT.transferFrom(
            address(this),
            req.requester,
            offeredTokenId
        );

        req.fulfilled = true;
        emit SwapFulfilled(swapId, msg.sender, offeredTokenId);
    }

    /// @dev Checks if `keyword` is a substring of `fullText`
    function contains(
        string memory fullText,
        string memory keyword
    ) internal pure returns (bool) {
        bytes memory fullBytes = bytes(fullText);
        bytes memory keyBytes = bytes(keyword);
        if (keyBytes.length > fullBytes.length) return false;
        for (uint256 i = 0; i <= fullBytes.length - keyBytes.length; i++) {
            bool match_ = true;
            for (uint256 j = 0; j < keyBytes.length; j++) {
                if (fullBytes[i + j] != keyBytes[j]) {
                    match_ = false;
                    break;
                }
            }
            if (match_) return true;
        }
        return false;
    }
}
