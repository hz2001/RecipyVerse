// src/data/dummyUserData.ts
export interface UserData {
  userWalletID: string;
  NFThold: string[]; // Array of NFT IDs (or recipe IDs acting as NFTs for now)
  isMerchant: boolean;
  NFTcreated: string[]; // Array of NFT IDs (or recipe IDs acting as NFTs for now)
  isverified: boolean;
}

export const dummyUserData: UserData[] = [
  {
    userWalletID: "0xMerchantVerified1234567890abcdef12345678", // Example Wallet 1
    NFThold: [], // Holds recipe IDs 1 and 3
    isMerchant: true,
    NFTcreated: ["5", "6"], // Created recipe IDs 5 and 6
    isverified: true,
  },
  {
    userWalletID: "0xUserNumber1234567890abcdef12345678", // Example Wallet 2
    NFThold: ["2"],        // Holds recipe ID 2
    isMerchant: false,
    NFTcreated: [],       // Created no recipes
    isverified: false,
  },
  {
    userWalletID: "0xUserNumber234567890abcdef12345678", // Example Wallet 3 (No NFTs)
    NFThold: [],
    isMerchant: false,
    NFTcreated: ["1","3"],
    isverified: false,
  },
  {
    userWalletID: "0xMerchantUnverified1234567890abcdef00000", // New Unverified Merchant Wallet
    NFThold: [], // Example: No NFTs held yet
    isMerchant: true,
    NFTcreated: [], // Example: No NFTs created yet
    isverified: false, // The crucial part: set to false
  },
];

// Function to simulate fetching user data by wallet ID
export const fetchUserDataByWallet = (walletId: string): UserData | undefined => {
  // In a real app, this would be an API call
  console.log(`Simulating fetch for wallet: ${walletId}`);
  // Case-insensitive comparison for wallet IDs
  return dummyUserData.find(user => user.userWalletID.toLowerCase() === walletId?.toLowerCase());
}; 