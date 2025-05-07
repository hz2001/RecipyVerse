# RecipyVerse Backend API Documentation

## Table of Contents
- [Authentication APIs](#authentication-apis)
- [Contract APIs](#contract-apis)
- [Merchant APIs](#merchant-apis)
- [NFT APIs](#nft-apis)
- [User APIs](#user-apis)
- [Admin APIs](#admin-apis)
- [Database Services](#database-services)

## Authentication APIs

### GET `/wallet/get_verify_message`
- **Description**: Creates a timestamp message for wallet verification and uploads it to the database
- **Request Parameters**:
  - `address` (query string): User's wallet address
- **Response**:
  - Success: Status code 200, returns verification message
  - Failure: Status code 403, returns error message "Failed to update verify message: [error details]"
- **Implementation**: `sendTimeStamp` function

### POST `/wallet/verify_signature`
- **Description**: Verifies user signature to confirm wallet address ownership
- **Request Body**:
  ```json
  {
    "sign": "data returned from metamask personal_sign",
    "account": "user's wallet address"
  }
  ```
- **Response**:
  - Success: Status code 200, returns sessionId
  - Failure: Status code 403, returns "Signature does not match" or "Failed to update verify message: [error details]"
- **Implementation**: `verifyCheck` function
- **Process Flow**:
  1. Retrieves verification message for the user address
  2. Verifies if signature matches
  3. Generates sessionId and expiration time
  4. Updates verification information in database
  5. Updates user information

## Contract APIs

### GET `/contract/get_nft_factory_abi`
- **Description**: Returns the NFTFactory ABI file for frontend contract interactions
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Merchant
- **Response**: NFTFactory ABI file content
- **Implementation**: `getNFTFactoryContractAbi` function

### GET `/contract/get_nft_coupon_abi`
- **Description**: Returns the NFT Coupon contract ABI
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: NFT Coupon ABI file content
- **Implementation**: `getNFTCouponContractAbi` function

### GET `/contract/get_nft_swap_abi`
- **Description**: Returns the NFT Swap contract ABI
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: NFT Swap ABI file content
- **Implementation**: `getNFTSwapContractAbi` function

## Merchant APIs

### POST `/merchant/upload_qualification`
- **Description**: Uploads merchant qualification documents
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Request Body** (multipart/form-data):
  - `merchantName` (string): Merchant name
  - `merchantAddress` (string): Merchant address
  - `file` (file): Qualification document
- **Response**:
  - Success: Status code 200, returns "OK"
  - Failure: Status code 400, returns "Failed to upload"
- **Implementation**: `uploadQualification` function

### GET `/merchant/my_nft_contracts`
- **Description**: Retrieves NFT contracts published by the merchant
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Merchant
- **Response**: List of NFT contracts
- **Implementation**: `getAllContracts` function

### GET `/merchant/get_merchant_detail`
- **Description**: Retrieves merchant details using session ID
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Merchant
- **Response**: Merchant information
- **Implementation**: `getInfoBySessionId` function

### GET `/merchant/get_merchant_info/:address`
- **Description**: Retrieves merchant details by wallet address
- **Path Parameters**:
  - `address`: Merchant's wallet address
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: Merchant information
- **Implementation**: `getInfoByAddress` function

## NFT APIs

### POST `/nft/create_nft`
- **Description**: Creates a new NFT
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Merchant
- **Request Body** (multipart/form-data):
  - `file`: NFT image file
  - Other NFT metadata fields
- **Response**: Created NFT details
- **Implementation**: `createNFT` function

### PUT `/nft/update/:id`
- **Description**: Updates an existing NFT
- **Path Parameters**:
  - `id`: NFT ID
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Request Body** (multipart/form-data):
  - `file`: Updated NFT image file (optional)
  - Other NFT metadata fields to update
- **Response**: Updated NFT details
- **Implementation**: `updateNFT` function

### GET `/nft/get_swapping`
- **Description**: Retrieves all pending NFT swaps
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: List of pending NFT swaps
- **Implementation**: `getAllPendingSwapping` function

### GET `/nft/get_all`
- **Description**: Retrieves all NFTs
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: List of all NFTs
- **Implementation**: `getAllNFTs` function

### PUT `/nft/swap_nft`
- **Description**: Swaps NFT ownership
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Request Body**:
  - NFT swap details
- **Response**: Swap operation result
- **Implementation**: `swapOwner` function

## User APIs

### GET `/user/get_info`
- **Description**: Retrieves user information
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: User information
- **Implementation**: `getUserInfo` function

### GET `/user/get_nfts`
- **Description**: Retrieves all NFTs owned by the user
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: List of user's NFTs
- **Implementation**: `getAllNFTs` function

### GET `/user/get_nft_detail/:nftId`
- **Description**: Retrieves detailed information about a specific NFT
- **Path Parameters**:
  - `nftId`: NFT ID
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Response**: Detailed NFT information
- **Implementation**: `getDetailedNFT` function

## Admin APIs

### GET `/admin/get_all_users`
- **Description**: Retrieves all users
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Response**: List of all users
- **Implementation**: `getAllUsers` function

### GET `/admin/get_all_merchants`
- **Description**: Retrieves all merchants
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Response**: List of all merchants
- **Implementation**: `getAllMerchants` function

### GET `/admin/get_all_nfts`
- **Description**: Retrieves all NFTs in the system
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Response**: List of all NFTs
- **Implementation**: `getAllNFTs` function

### GET `/admin/get_all_files`
- **Description**: Retrieves all files in the system
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Response**: List of all files
- **Implementation**: `getAllFiles` function

### POST `/admin/update_merchant`
- **Description**: Updates merchant information
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Request Body**: Merchant information to update
- **Response**: Update operation result
- **Implementation**: `updateMerchant` function

### POST `/admin/update_nft`
- **Description**: Updates NFT information
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Request Body**: NFT information to update
- **Response**: Update operation result
- **Implementation**: `updateNFT` function

### POST `/admin/update_user`
- **Description**: Updates user information
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Request Body**: User information to update
- **Response**: Update operation result
- **Implementation**: `updateUser` function

### POST `/admin/update_file`
- **Description**: Updates file information
- **Request Parameters**:
  - `sessionId` (query string): Session ID for authentication
- **Required Role**: Admin
- **Request Body** (multipart/form-data):
  - `file`: File to update
  - Other file metadata
- **Response**: Update operation result
- **Implementation**: `updateFile` function

## Database Services

The following are internal database service functions not directly exposed as API endpoints:

### Authentication Related

#### `getVerifyMessage(address: string)`
- **Description**: Retrieves verification message for a specific address
- **Parameters**: 
  - `address` (string): Wallet address
- **Returns**: Verification message string

#### `getRoleBySessionId(sessionId: string)`
- **Description**: Retrieves user role based on session ID
- **Parameters**: 
  - `sessionId` (string): Session ID
- **Returns**: User role (admin/user/merchant)

#### `getAddressBySessionId(sessionId: string)`
- **Description**: Retrieves wallet address based on session ID
- **Parameters**: 
  - `sessionId` (string): Session ID
- **Returns**: Wallet address

#### `getISSessionExpired(sessionId: string)`
- **Description**: Checks if session has expired
- **Parameters**: 
  - `sessionId` (string): Session ID
- **Returns**: Boolean indicating session validity

#### `updateVerifyMessage(address: string, message?: string, sessionId?: string, expireAt?: string)`
- **Description**: Updates verification message
- **Parameters**: 
  - `address` (string): Wallet address
  - `message` (string, optional): Verification message
  - `sessionId` (string, optional): Session ID
  - `expireAt` (string, optional): Expiration time
- **Returns**: Operation result object `{ success: boolean, message: string }`

### User Management

#### `updateUser(address: string, role: UserRole = UserRole.USER)`
- **Description**: Updates user role
- **Parameters**: 
  - `address` (string): Wallet address
  - `role` (UserRole, optional): User role, defaults to USER
- **Returns**: Operation result object `{ success: boolean, message: string }`

### Merchant Related

#### `uploadFile(address: string, file: Express.Multer.File)`
- **Description**: Uploads file to storage bucket
- **Parameters**: 
  - `address` (string): Wallet address
  - `file` (Express.Multer.File): Uploaded file
- **Returns**: Operation result object `{ success: boolean, message: string }`

#### `updateMerchant(merchantAddress: string, merchantName?: string, walletAddress?: string, isVerified: boolean = false)`
- **Description**: Updates merchant information
- **Parameters**: 
  - `merchantAddress` (string): Merchant address
  - `merchantName` (string, optional): Merchant name
  - `walletAddress` (string, optional): Wallet address
  - `isVerified` (boolean, optional): Verification status, defaults to false
- **Returns**: Operation result object `{ success: boolean, message: string }`

## System Features

### Scheduled Tasks

The system runs `updateSessionIds` function every 15 minutes to clean up expired session IDs.

### Contract Deployment

The system executes `deployContract` function at startup to check and deploy the NFTFactory contract if needed.

## Data Types

### UserRole Enum
```typescript
enum UserRole {
    ADMIN = "admin",
    USER = "user",
    MERCHANT = "merchant",
}
```

### User Interface
```typescript
interface User {
    wallet_address: string;
    created_at: string;
    user_id: string;
    role: UserRole;
}
```

### Verification Interface
```typescript
interface Verification {
    address: string;
    message: string;
    sessionId: string;
    expire_at: string;
}
```

### Merchant Interface
```typescript
interface Merchant {
    id: string;
    created_at: string;
    wallet_address: string;
    is_verified: boolean;
    merchant_name: string;
    merchant_address: string;
}
```
