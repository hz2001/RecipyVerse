// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ERC‑721 interface with metadata
interface IERC721WithMetadata {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

// Your factory‐validator interface
interface IFactoryValidator {
    function isFactoryChild(address collectionAddr) external view returns (bool);
}

contract NewConditionalSwap {
    /// @notice Only collections deployed by this factory are allowed
    address public immutable factory;

    struct SwapRequest {
        address requester;
        address collection;
        uint256 offeredTokenId;
        address[] desiredtype;
    }

    mapping(uint256 => SwapRequest) public swapRequests;
    uint256 public swapCounter;

    event SwapCreated(
        uint256 indexed id,
        address indexed requester,
        address indexed collection,
        uint256 tokenId
    );
    event SwapFulfilled(
        uint256 indexed id,
        address indexed fulfiller,
        uint256 tokenId
    );
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
    }

    /// @notice Create a swap: escrow your NFT and specify the list of acceptable collections
    function createSwap(
        address collection,
        uint256 tokenId,
        address[] calldata desiredtype
    ) external onlyValidCollection(collection) {
        require(
            IERC721WithMetadata(collection).ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        // Escrow the token
        IERC721WithMetadata(collection).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        // Store the request
        SwapRequest storage req = swapRequests[swapCounter];
        req.requester = msg.sender;
        req.collection = collection;
        req.offeredTokenId = tokenId;
        for (uint i = 0; i < desiredtype.length; i++) {
            req.desiredtype.push(desiredtype[i]);
        }

        emit SwapCreated(swapCounter, msg.sender, collection, tokenId);
        swapCounter++;
    }

    /// @notice Cancel an open swap and return your NFT
    function cancelSwap(uint256 swapId) external {
        SwapRequest storage req = swapRequests[swapId];
        require(req.requester == msg.sender, "Not your swap");

        IERC721WithMetadata(req.collection).transferFrom(
            address(this),
            msg.sender,
            req.offeredTokenId
        );

        delete swapRequests[swapId];
        emit SwapCancelled(swapId);
    }

    /// @notice Accept a swap by directly exchanging NFTs
    function acceptSwap(
        uint256 swapId,
        address offeredCollection,
        uint256 offeredTokenId
    ) external onlyValidCollection(offeredCollection) {
        SwapRequest storage req = swapRequests[swapId];
        require(req.requester != address(0), "Swap not exist");
        require(req.requester != msg.sender, "Cannot accept own swap");
        require(
            _isAllowed(offeredCollection, req.desiredtype),
            "Collection not allowed"
        );
        require(
            IERC721WithMetadata(offeredCollection).ownerOf(offeredTokenId) == msg.sender,
            "Not owner of offered token"
        );

        // Direct swap
        IERC721WithMetadata(offeredCollection).transferFrom(
            msg.sender, req.requester, offeredTokenId
        );
        IERC721WithMetadata(req.collection).transferFrom(
            address(this), msg.sender, req.offeredTokenId
        );

        emit SwapFulfilled(swapId, msg.sender, offeredTokenId);
        delete swapRequests[swapId];
    }

    /// @dev Checks storage array for allowed collections
    function _isAllowed(
        address collection,
        address[] storage list
    ) internal view returns (bool) {
        for (uint i = 0; i < list.length; i++) {
            if (list[i] == collection) return true;
        }
        return false;
    }
}
