import { Link } from 'react-router-dom';
import { Recipe } from '../data/dummyData';

interface RecipeCardProps {
  recipe: Recipe;
}

// Helper function to shorten wallet addresses
const shortenAddress = (address: string | undefined | null): string => {
  if (!address || address.length < 10) { // Basic check for validity
    return address || 'Unknown Creator';
  }
  // Example: 0x1234567890abcdef -> 0x123...cdef
  return `${address.substring(0, 5)}...${address.substring(address.length - 4)}`;
};

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <Link 
      to={`/recipe/${recipe.id}`} 
      className="block h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-48 sm:h-56">
        <img 
          src={recipe.imageUrl} 
          alt={recipe.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-amber-500 text-white px-2 py-1 rounded text-sm">
          {recipe.region}
        </div>
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2">
          {recipe.name}
        </h3>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <span 
              key={index}
              className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
          {recipe.tags.length > 3 && (
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
              +{recipe.tags.length - 3} more
            </span>
          )}
        </div>
        
        <div className="mt-auto">
          <p className="text-sm text-gray-600" title={recipe.creator}>
            By {shortenAddress(recipe.creator)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard; 