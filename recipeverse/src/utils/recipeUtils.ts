// src/utils/recipeUtils.ts
import { recipes } from '../data/dummyData'; // Import dummy data for now

// Placeholder function to simulate incrementing views - replace with actual backend logic later
export const incrementRecipeView = (recipeId: string): void => {
  const recipeIndex = recipes.findIndex(r => r.id === recipeId);
  if (recipeIndex !== -1) {
    // In a real app, this would be an API call to update the database or state
    // For this dummy data, we directly increment the views in the array
    recipes[recipeIndex].views += 1;
    console.log(`Simulated view increment for recipe ${recipeId}. New view count: ${recipes[recipeIndex].views} (from recipeUtils.ts)`);
  }
}; 