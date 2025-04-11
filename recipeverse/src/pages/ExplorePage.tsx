import { useState, useEffect } from 'react';
import { recipes, Recipe } from '../data/dummyData';
import RecipeCard from '../components/RecipeCard';

const ExplorePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(recipes);

  // Extract all unique regions and tags
  const regions = Array.from(new Set(recipes.map(recipe => recipe.region)));
  const allTags = Array.from(new Set(recipes.flatMap(recipe => recipe.tags)));

  // Apply filters whenever search/filter criteria change
  useEffect(() => {
    let result = [...recipes];
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(recipe => 
        recipe.name.toLowerCase().includes(search) || 
        recipe.ingredients.some(i => i.toLowerCase().includes(search)) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (selectedRegion) {
      result = result.filter(recipe => recipe.region === selectedRegion);
    }
    
    if (selectedTag) {
      result = result.filter(recipe => recipe.tags.includes(selectedTag));
    }
    
    setFilteredRecipes(result);
  }, [searchTerm, selectedRegion, selectedTag]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedTag('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Explore Recipe NFTs
          </h1>
          <p className="text-lg text-gray-600">
            Discover culinary treasures from around the world, preserved as NFTs
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Recipes
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ingredient, or tag..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Region
              </label>
              <select
                id="region"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Regions</option>
                {regions.map((region, index) => (
                  <option key={index} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Tag
              </label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Tags</option>
                {allTags.map((tag, index) => (
                  <option key={index} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found
          </p>
        </div>
        
        {/* Recipe Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No recipes found</h3>
            <p className="text-gray-500">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplorePage; 