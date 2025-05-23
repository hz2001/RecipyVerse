# RecipeVerse - A Decentralized Culinary Community Platform

RecipeVerse is a blockchain-powered platform where users can freely share, discover, and exchange recipes, ensuring content originality, ownership, and long-term accessibility through NFT technology. The platform also enables businesses to issue utility NFTs representing coupons, memberships, and governance rights.

## Table of Contents
- [Background](#background)
- [Project Objectives](#project-objectives)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation and Setup](#installation-and-setup)
  - [Prerequisites](#prerequisites)
  - [Server Setup](#server-setup)
  - [Client Setup](#client-setup)
- [Usage](#usage)
- [Implementation Details](#implementation-details)
- [Future Work](#future-work)
- [Team Members](#team-members)

## Background

Most mainstream recipe-sharing platforms are centralized, lacking mechanisms for content attribution, persistence, and creator rewards. Recipes, as information-based assets, are difficult to authenticate, attribute, or incentivize. Blockchain offers a powerful solution—NFTs enable verifiable ownership, traceable distribution, and secure content storage.

We also identified a major pain point around digital coupons. Coupons often have expiration dates and go unused:
- Restaurants miss the intended traffic and promotional value.
- Users miss the chance to enjoy discounts.

Our decentralized coupon model allows users to freely trade and transfer unused NFT-based coupons, boosting redemption rates and engagement. These NFTs can be exchanged, gifted, or used for community voting, addressing the limitations of conventional coupons by enabling open utility markets.

## Project Objectives

- Develop a platform that allows users to mint and showcase original recipes as NFTs.
- Design modular smart contracts for restaurants to issue utility NFTs (coupons, memberships, governance rights).
- Support the open circulation and exchange of NFTs for practical purposes like discounts or community input.
- Foster a community ecosystem driven by both creators and businesses within a Web3 culinary network.

## Features

- Recipe NFT creation and display interface for individual users
- Smart contract templates for restaurant-issued NFTs
- Simulated redemption and marketplace view of restaurant coupons
- Frontend implementation including browsing, wallet connection, and governance interfaces
- Technical documentation for contracts and system architecture

## Technology Stack

### Frontend
- React with TypeScript
- Vite as build tool
- Tailwind CSS for styling
- ethers.js for Ethereum interaction
- IPFS HTTP client for decentralized storage

### Backend
- Node.js with Express
- Hardhat for Ethereum development
- OpenZeppelin Contracts for NFT standards (ERC-721, ERC-1155)
- Supabase for additional data storage

### Blockchain
- Ethereum Testnet (Goerli) or Polygon Mumbai
- IPFS/Filecoin for decentralized storage of media content

## Project Structure

```
RecipeVerse/
├── Client/             # Frontend application
│   ├── src/            # Source code
│   ├── package.json    # Frontend dependencies
│   └── ...
├── Server/             # Backend server and smart contracts
│   ├── src/            # Server source code
│   ├── contracts/      # Smart contracts
│   ├── package.json    # Backend dependencies
│   └── ...
└── README.md           # Project documentation
```

## Installation and Setup

### Prerequisites

- Node.js (v22.x or The latest LTS version)
- npm 
- MetaMask browser extension
- Git

### Server Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hz2001/RecipeVerse.git
   ```
   ```bash
   cd RecipyVerse
   ```

2. Install backend dependencies:
   ```bash
   cd Server
   ```
   ```bash
   npm install
   ```

3. Create a `.env` file in the root folder:
   ```bash
   cp ../.env.example ../.env
   ```
   Then copy the needed criteria to the file. 
   
5. Start Local Blockchain Network
   ```bash
   npx hardhat node
   ```
   ```
   Copy any one of the private key into the .env PRIVATE_KEY as the owner contracts
   ```

6. Open a new terminal and go to /Server folder and Start the Server
   ```bash
   npx ts-node src/index.ts
   ```

### MetaMask Extension
1. Open the MetaMask Extension
2. Click left up corn Choose Local network
3. Add Custom Network
4. Network name change to Local
5. Set the RPC into `http://localhost:8545`
6. Set Chian ID into 31337 
7. Currency Sign Set into GO and save it
8. Choose the saved local network
9. Add account by private key generated from the above hardhat node


### Client Setup

1. Open a new terminal window and navigate to the Client directory

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:9000`

## Usage

Our application demo can be viewed here:

[Register as a merchant](https://drive.google.com/file/d/18zW2JZnpxbIP91wubJzkXi9_GLfZJLNU/view?usp=sharing)
[Create NFT as a merchant A](https://drive.google.com/file/d/1GgBcN7x8-qmu0IWZnKzf8bAJKhl0nEVv/view?usp=sharing).
[Search and Swap as A User B](https://drive.google.com/file/d/1SxdeWpIApqDwsw1o4gEhZHXSx8OWRe_6/view?usp=sharing).


The platform provides different functionalities for regular users and business accounts:

### For Regular Users
1. Navigate to Profile
2. Click on the user registration box
3. Connect your MetaMask wallet to complete registration
4. Once registered, you can:
   - View your owned NFT recipes
   - Browse recipes on the homepage
   - View recipe details and ownership information
   - Transfer or trade NFTs with other users
   - Participate in governance voting

### For Merchants
1. Navigate to Profile
2. Click on the Merchant registration box
3. Upload your Merchant credentials/qualifications
4. Connect your MetaMask wallet to complete registration
5. Once verified, you can:
   - View your owned NFTs
   - Create and issue NFT coupons, memberships, or other utilities
   - Set parameters for your NFTs (expiration, utility value, transfer rules)

### Creating NFTs (for verified Merchants)
1. Navigate to your Profile
2. Click "Create First NFT"
3. Fill out the form with your NFT details
4. Follow the prompts to complete the minting process
5. Once completed, your Profile will automatically refresh to display your newly issued NFTs

### Swapping NFTs
Our platform supports NFT swapping functionality, allowing users to exchange their NFTs with others:

#### Accepting a Swap Offer
1. Navigate to the Swap Market
2. Browse available NFTs posted for swap
3. Select an NFT you're interested in
4. If you own the NFT requested by the poster, click "Confirm Deal" to complete the exchange

#### Posting Your NFT for Swap
1. Navigate to the Swap Market
2. Click "Post NFT for Swap"
3. Select one of your owned NFTs to offer
4. Choose the NFT you want in return
5. Click "Post" to publish your swap offer


## Future Work

1. Update the current version
2. Coupon sales and offline redemption verification 
3. Implement the mobile version

## Team Members

- Saiwang Xiang
- Songhan Min
- Jiasheng Qiu
- Jiahe Zhang 
