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
- [Challenges and Solutions](#challenges-and-solutions)
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

- Node.js (v16.x or higher)
- npm or yarn
- MetaMask browser extension
- Git

### Server Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/RecipeVerse.git
   cd RecipeVerse
   ```

2. Install backend dependencies:
   ```bash
   cd Server
   npm install
   ```

3. Create a `.env` file in the Server directory with the following variables:
   ```
   PRIVATE_KEY=your_ethereum_private_key
   ALCHEMY_API_KEY=your_alchemy_api_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

4. Compile smart contracts:
   ```bash
   npx hardhat compile
   ```

5. Deploy smart contracts to the test network:
   ```bash
   npx hardhat run scripts/deploy.ts --network mumbai
   ```

6. Start the backend server:
   ```bash
   npm run dev
   ```

### Client Setup

1. Open a new terminal window and navigate to the Client directory:
   ```bash
   cd ../Client
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Client directory with the following variables:
   ```
   VITE_CONTRACT_ADDRESS=deployed_contract_address
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Connect your MetaMask wallet to the application
2. For recipe creators:
   - Navigate to "Create Recipe"
   - Fill in recipe details and upload images
   - Mint your recipe as an NFT

3. For recipe explorers:
   - Browse recipes on the homepage
   - View recipe details and ownership information

4. For restaurants:
   - Create utility NFTs (coupons, memberships)
   - Set parameters like expiration, utility value, and transfer rules

5. For NFT holders:
   - Participate in governance voting
   - Transfer or trade NFTs with other users

## Implementation Details

[This section will be filled out by you]

## Challenges and Solutions

[This section will be filled out by you]

## Future Work

[This section will be filled out by you]

## Team Members

- Saiwang Xiang
- Songhan Min
- Jiasheng Qiu
- Jiahe Zhang 