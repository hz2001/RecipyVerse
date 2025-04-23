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

/// @title ConditionalNFTSwap - allows NFT swapping based on desired metadata type
contract ConditionalNFTSwap {
    address public immutable factory;   // Factory that created valid NFT collections
    address public immutable deployer;  // Original deployer of this swap contract

    // Structure representing a swap request
    struct SwapRequest {
        address requester;              // Who is offering their NFT
        address collection;             // NFT collection of the offered token
        uint256 offeredTokenId;         // ID of the token being offered
        string desiredType;             // Desired category/type (e.g., "seafood")
        bool deposited;                 // Has the swap been completed
    }

    mapping(uint256 => SwapRequest) public swapRequests; // Maps swap ID to swap info
    uint256 public swapCounter;                          // Global counter for swap IDs

    // Events
    event SwapCreated(uint256 indexed id, address requester, address collection, uint256 tokenId, string desiredType);
    event SwapFulfilled(uint256 indexed id, address fulfiller, uint256 tokenId);
    event SwapCancelled(uint256 indexed id);

    /// @notice Constructor sets the factory and deployer
    constructor(address _factory) {
        factory = _factory;
        deployer = tx.origin;
    }

    /// @notice Modifier to ensure only NFTs deployed by the factory are valid
    modifier onlyValidCollection(address collection) {
        require(IFactoryValidator(factory).isFactoryChild(collection), "Invalid collection");
        _;
    }

    /// @notice Create a swap request offering a token and specifying the desired type
    function createSwap(address collection, uint256 tokenId, string memory desiredType)
        external
        onlyValidCollection(collection)
    {
        require(IERC721WithMetadata(collection).ownerOf(tokenId) == msg.sender, "Not the token owner");

        swapRequests[swapCounter] = SwapRequest({
            requester: msg.sender,
            collection: collection,
            offeredTokenId: tokenId,
            desiredType: desiredType,
            deposited: false
        });

        emit SwapCreated(swapCounter, msg.sender, collection, tokenId, desiredType);
        swapCounter++;
    }

    /// @notice Cancel a swap request that has not been fulfilled
    function cancelSwap(uint256 id) external {
        SwapRequest storage req = swapRequests[id];
        require(req.requester == msg.sender, "Not your swap");
        require(!req.deposited, "Swap already fulfilled");
        delete swapRequests[id];
        emit SwapCancelled(id);
    }

    /// @notice Accept an open swap by offering a matching NFT
    function acceptSwap(
        uint256 swapId,
        address offeredCollection,
        uint256 offeredTokenId
    ) external onlyValidCollection(offeredCollection) {
        // Load the swap request
        SwapRequest storage request = swapRequests[swapId];

        require(request.requester != address(0), "Swap does not exist");
        require(!request.deposited, "Swap already fulfilled");
        require(request.requester != msg.sender, "Cannot accept your own swap");

        IERC721WithMetadata offeredNFT = IERC721WithMetadata(offeredCollection);

        // Validate fulfiller owns the token
        require(offeredNFT.ownerOf(offeredTokenId) == msg.sender, "You don't own the offered token");

        // Get token URI and validate type match
        string memory offeredURI = offeredNFT.tokenURI(offeredTokenId);
        require(contains(offeredURI, request.desiredType), "Offered token does not match desired type");

        // Ensure requester still owns their token
        IERC721WithMetadata requesterNFT = IERC721WithMetadata(request.collection);
        require(requesterNFT.ownerOf(request.offeredTokenId) == request.requester, "Requester no longer owns the token");

        // Transfer both tokens (requires prior approval from both parties)
        requesterNFT.transferFrom(request.requester, msg.sender, request.offeredTokenId);
        offeredNFT.transferFrom(msg.sender, request.requester, offeredTokenId);

        // Mark swap as completed
        request.deposited = true;

        emit SwapFulfilled(swapId, msg.sender, offeredTokenId);
    }

    /// @notice Internal helper to check if `keyword` exists in `fullText`
    function contains(string memory fullText, string memory keyword) internal pure returns (bool) {
        bytes memory fullBytes = bytes(fullText);
        bytes memory keywordBytes = bytes(keyword);

        if (keywordBytes.length > fullBytes.length) return false;

        for (uint i = 0; i <= fullBytes.length - keywordBytes.length; i++) {
            bool matchFound = true;
            for (uint j = 0; j < keywordBytes.length; j++) {
                if (fullBytes[i + j] != keywordBytes[j]) {
                    matchFound = false;
                    break;
                }
            }
            if (matchFound) return true;
        }
        return false;
    }
}
