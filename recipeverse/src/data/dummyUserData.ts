// src/data/dummyUserData.ts
import { recipes } from "./dummyData";

export interface UserData {
  userWalletID: string;
  NFThold: string[]; // Array of NFT IDs (or recipe IDs acting as NFTs for now)
  isMerchant: boolean;
  NFTcreated: string[]; // Array of NFT IDs (or recipe IDs acting as NFTs for now)
  isverified: boolean;
  merchantName?: string; // Added optional merchant name
  merchantAddress?: string; // Added optional merchant address
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

// <<< Add function to create and add a new merchant >>>
export const addNewMerchantToDb = (walletId: string, details: { name: string; address: string }): UserData => {
    console.log(`Adding new merchant to dummy DB: ${walletId}, Name: ${details.name}`);
    const newMerchant: UserData = {
        userWalletID: walletId,
        NFThold: [],
        isMerchant: true,
        NFTcreated: [],
        isverified: false, // New merchants start as unverified
        merchantName: details.name,
        merchantAddress: details.address,
    };
    dummyUserData.push(newMerchant); // Add to the array
    // <<< Log the array content after adding >>>
    console.log("Current dummyUserData in memory:", JSON.parse(JSON.stringify(dummyUserData))); // Use JSON stringify/parse for a clean copy
    // In a real app, this would be an API POST request
    // And the dummyUserData array wouldn't be mutated directly like this
    return newMerchant;
};

// Function to simulate updating user's NFT lists (Example)
export const updateUserNftLists = (walletId: string, createdNftId?: string, heldNftId?: string) => {
    const userIndex = dummyUserData.findIndex(user => user.userWalletID.toLowerCase() === walletId?.toLowerCase());
    if (userIndex !== -1) {
        if (createdNftId) {
            // Avoid adding duplicates
            if (!dummyUserData[userIndex].NFTcreated.includes(createdNftId)) {
                dummyUserData[userIndex].NFTcreated.push(createdNftId);
                console.log(`Updated NFTcreated for ${walletId}:`, dummyUserData[userIndex].NFTcreated);
            }
        }
        if (heldNftId) {
            // Avoid adding duplicates
            if (!dummyUserData[userIndex].NFThold.includes(heldNftId)) {
                dummyUserData[userIndex].NFThold.push(heldNftId);
                console.log(`Updated NFThold for ${walletId}:`, dummyUserData[userIndex].NFThold);
            }
        }
    } else {
        console.warn(`User not found for NFT list update: ${walletId}`);
    }
};

// Find recipe details by ID (used potentially in profile page)
export const findRecipeById = (id: string) => {
    return recipes.find(recipe => recipe.id === id);
}; 