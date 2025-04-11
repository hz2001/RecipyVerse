import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { recipes } from '../data/dummyData';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Find recipe by ID
  const recipe = recipes.find(r => r.id === id);
  
  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Recipe Not Found</h1>
        <p className="text-gray-600 mb-6">The recipe you're looking for doesn't exist or may have been removed.</p>
        <Link to="/explore" className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors">
          Explore All Recipes
        </Link>
      </div>
    );
  }

  // Simulate blockchain verification
  const verifyOnBlockchain = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false);
      window.alert(`Recipe verified! NFT minted by ${recipe.creator} on block #1234567`);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-amber-600 hover:text-amber-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>
        
        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="h-64 sm:h-96 relative">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <div className="flex items-center mb-2">
                <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                  {recipe.region}
                </span>
                <span className="text-sm opacity-80">{new Date(recipe.createdAt).toLocaleDateString()}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{recipe.name}</h1>
              <p className="opacity-80">By {recipe.creator}</p>
            </div>
          </div>
        </div>
        
        {/* Recipe Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-amber-100 text-amber-600 h-5 w-5 rounded-full flex items-center justify-center text-xs mr-3 mt-1">
                    •
                  </span>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Instructions */}
          <div className="md:col-span-2 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Instructions</h2>
            <ol className="space-y-6">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="bg-amber-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-sm mr-4 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
        
        {/* Blockchain Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Blockchain Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-2">IPFS Hash:</p>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                {recipe.ipfsHash}
              </div>
            </div>
            <div>
              <p className="text-gray-600 mb-2">Creator Address:</p>
              <div className="bg-gray-100 p-3 rounded-md font-mono text-sm break-all">
                {recipe.creator}
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={verifyOnBlockchain}
              disabled={isLoading}
              className={`px-6 py-3 bg-amber-500 text-white rounded-md font-medium ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-amber-600'
              } transition-colors flex items-center`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify on Blockchain'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage; 