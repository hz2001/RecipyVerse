import React from 'react';
import { Recipe } from '../data/dummyData';

interface RecipeCardProps {
  recipe: Recipe;
}

// 简单的RecipeCard占位组件
const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Recipe Placeholder</p>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{recipe.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{recipe.category} · {recipe.duration}</p>
      </div>
    </div>
  );
};

export default RecipeCard; 