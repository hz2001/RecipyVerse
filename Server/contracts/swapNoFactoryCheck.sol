// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721WithMetadata {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract ConditionalNFTSwap {
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

    constructor() {
        // no factory, open to any ERC‑721
    }

    function createSwap(
        address collection,
        uint256 tokenId,
        address[] calldata desiredtype
    ) external {
        require(
            IERC721WithMetadata(collection).ownerOf(tokenId) == msg.sender,
            "Not token owner"
        );

        IERC721WithMetadata(collection).transferFrom(
            msg.sender,
            address(this),
            tokenId
        );

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

    function acceptSwap(
        uint256 swapId,
        address offeredCollection,
        uint256 offeredTokenId
    ) external {
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

        IERC721WithMetadata(offeredCollection).transferFrom(
            msg.sender, req.requester, offeredTokenId
        );
        IERC721WithMetadata(req.collection).transferFrom(
            address(this), msg.sender, req.offeredTokenId
        );

        emit SwapFulfilled(swapId, msg.sender, offeredTokenId);
        delete swapRequests[swapId];
    }

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
