import { Link } from 'react-router-dom';
import { useState } from 'react';
import RecipeCard from '../components/RecipeCard';
import { recipes } from '../data/dummyData';

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof recipes>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState('all');

  // Get ALL recipes sorted by date (don't slice yet)
  const latestRecipesSorted = [...recipes].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // --- Add new featured recipe logic based on date ---
  const topViewedRecipes = [...recipes].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setIsSearching(false);
      return;
    }
    
    const term = searchTerm.toLowerCase();
    let results: typeof recipes = [];
    
    switch (searchFilter) {
      case 'title':
        results = recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(term)
        );
        break;
      case 'ingredients':
        results = recipes.filter(recipe => 
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(term)
          )
        );
        break;
      case 'tags':
        results = recipes.filter(recipe => 
          recipe.tags.some(tag => 
            tag.toLowerCase().includes(term)
          )
        );
        break;
      case 'all':
      default:
        results = recipes.filter(recipe => 
          recipe.title.toLowerCase().includes(term) ||
          recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(term)) ||
          recipe.tags.some(tag => tag.toLowerCase().includes(term)) ||
          recipe.category.toLowerCase().includes(term)
        );
        break;
    }
    
    setSearchResults(results);
    setIsSearching(true);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchFilter('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Search Section - Moved to top for mobile */}
      <section className="py-4 md:py-8 bg-white shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 md:mb-6 text-center">
            Find Exclusive Coupon NFTs
          </h2>
          
          <form onSubmit={handleSearch} className="space-y-4 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search coupons, merchants, benefits..."
                className="flex-grow px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-2">
                <button 
                  type="submit"
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Search
                </button>
                {isSearching && (
                  <button 
                    type="button"
                    onClick={clearSearch}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center">
                <input 
                  type="radio"
                  id="all"
                  name="searchFilter"
                  value="all"
                  checked={searchFilter === 'all'}
                  onChange={() => setSearchFilter('all')}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="all" className="ml-2 text-gray-700">
                  All
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio"
                  id="title"
                  name="searchFilter"
                  value="title"
                  checked={searchFilter === 'title'}
                  onChange={() => setSearchFilter('title')}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="title" className="ml-2 text-gray-700">
                  Coupon Name
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio"
                  id="ingredients"
                  name="searchFilter"
                  value="ingredients"
                  checked={searchFilter === 'ingredients'}
                  onChange={() => setSearchFilter('ingredients')}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="ingredients" className="ml-2 text-gray-700">
                  Merchants
                </label>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="radio"
                  id="tags"
                  name="searchFilter"
                  value="tags"
                  checked={searchFilter === 'tags'}
                  onChange={() => setSearchFilter('tags')}
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="tags" className="ml-2 text-gray-700">
                  Benefits
                </label>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Search Results */}
      {isSearching && (
        <section className="py-8 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                Search Results
              </h2>
              <p className="text-gray-600">
                Found {searchResults.length} {searchResults.length === 1 ? 'coupon' : 'coupons'} matching "{searchTerm}"
                {searchFilter !== 'all' && ` in ${searchFilter}`}
              </p>
            </div>
            
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {searchResults.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 md:py-16 bg-gray-50 rounded-lg">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-16 w-16 mx-auto text-gray-400 mb-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No coupons found</h3>
                <p className="text-gray-500 mb-6">Try a different search term or filter</p>
                <Link 
                  to="/swap-market" 
                  className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
                >
                  Browse Swap Market
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Only show Latest and Featured sections if not searching */}
      {!isSearching && (
        <>
          {/* Featured Recipes - Updated */}
          <section className="py-8 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-8 text-center">
                🔥 Featured Offers
              </h2>

              {/* Responsive Grid for Top Viewed Recipes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {/* Show top 2 on md, top 3 on lg, top 4 on xl */} 
                {topViewedRecipes.slice(0, 4).map((recipe, index) => (
                  <div 
                    key={recipe.id}
                    className={[
                      "", // Default: always show first card
                      "md:block", // MD+: always show second card
                      "lg:block", // LG+: always show third card
                      "xl:block"  // XL+: always show fourth card
                    ][index] || 'hidden'} // Hide based on index and breakpoint
                   >
                     <RecipeCard recipe={recipe} />
                   </div>
                ))}
              </div>
            </div>
          </section>

          {/* Hero Section - Hidden on mobile */}
          <section className="hidden md:block relative bg-amber-600 text-white py-12 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-full md:w-1/2 mb-10 md:mb-0 md:pr-10">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                    Decentralized Coupon Exchange Platform
                  </h1>
                  <p className="text-base md:text-lg mb-8">
                    RecipeVerse connects merchants and customers through blockchain-powered NFT coupons and memberships, enabling secure, transparent swapping without intermediaries.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link to="/swap-market" className="w-full sm:w-auto text-center bg-white text-amber-600 px-6 py-3 rounded-md font-medium hover:bg-amber-100 transition-colors">
                      Swap Market
                    </Link>
                  </div>
                </div>
                <div className="w-full md:w-1/2 mt-10 md:mt-0">
                  <div className="bg-white p-2 rounded-lg shadow-xl transform rotate-3">
                    <img 
                      src="https://images.unsplash.com/photo-1606787366850-de6330128bfc" 
                      alt="Food from around the world" 
                      className="rounded-md w-full h-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Latest Recipes - Updated */}
          <section className="py-8 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-0">✨ Latest Coupons</h2>
              </div>

              {/* Update grid layout and mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {/* Map over the first 4 latest recipes */}
                {latestRecipesSorted.slice(0, 4).map((recipe, index) => (
                  <div 
                    key={recipe.id}
                    // Apply conditional visibility based on index and breakpoint
                    className={[
                      "", // Default: always show first card
                      "md:block", // MD+: always show second card
                      "lg:block", // LG+: always show third card
                      "xl:block"  // XL+: always show fourth card
                    ][index] || 'hidden'} // Hide based on index and breakpoint
                  >
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works - Hidden on mobile */}
          <section className="hidden md:block py-8 md:py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 text-center mb-8 md:mb-12">
                How RecipeVerse Works
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-xl font-bold mb-3">Merchants Create</h3>
                  <p className="text-gray-600">
                    Merchants mint coupon or membership NFTs with benefits and expiration dates
                  </p>
                </div>
                
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-xl font-bold mb-3">Users Exchange</h3>
                  <p className="text-gray-600">
                    Users buy or swap NFTs directly with merchants or other users using blockchain technology
                  </p>
                </div>
                
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-xl font-bold mb-3">Everyone Benefits</h3>
                  <p className="text-gray-600">
                    Merchants gain exposure while users enjoy and trade exclusive perks with complete transparency
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="py-8 md:py-16 bg-amber-500 text-white text-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Join Our Decentralized Coupon Community
                </h2>
                <p className="text-lg md:text-xl mb-8">
                  Experience a truly decentralized platform where all transactions happen on the blockchain with complete transparency. We only intervene to protect your rights when benefits can't be redeemed.
                </p>
                <Link 
                  to="/swap-market" 
                  className="inline-block bg-white text-amber-600 px-6 md:px-8 py-3 md:py-4 rounded-md font-medium text-lg hover:bg-amber-100 transition-colors"
                >
                  Start Swapping
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage; 