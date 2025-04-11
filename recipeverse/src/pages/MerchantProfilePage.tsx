import { Link, useNavigate } from 'react-router-dom';
import { recipes } from '../data/dummyData';
import RecipeCard from '../components/RecipeCard';
import UserService from '../services/userService';

const MerchantProfilePage = () => {
  const navigate = useNavigate();
  
  // Simulating a logged-in merchant
  const merchant = {
    id: 'merchant-1',
    name: 'Culinary Master',
    email: 'contact@culinarymaster.com',
    walletAddress: '0xabcdef1234567890',
    joinedDate: '2023-03-10',
    totalRecipes: 15,
    totalSales: 45,
    rating: 4.8,
    description: 'Professional chef specializing in Mediterranean cuisine with over 15 years of experience.',
    location: 'Barcelona, Spain',
    specialties: ['Mediterranean', 'Seafood', 'Paella'],
    socialMedia: {
      website: 'https://culinarymaster.com',
      instagram: '@culinarymaster',
      twitter: '@culinarymaster'
    }
  };

  // Filter recipes to show only those created by this merchant
  const merchantRecipes = recipes.filter(recipe => recipe.creator === merchant.name);
  
  const handleLogout = () => {
    UserService.logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Merchant Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 h-32 md:h-40"></div>
          <div className="px-6 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl md:text-4xl font-bold mb-4 md:mb-0 md:mr-6">
                {merchant.name.charAt(0)}
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{merchant.name}</h1>
                <p className="text-gray-600 mb-4">{merchant.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {merchant.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {merchant.rating} Rating
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Recipes</h3>
            <p className="text-3xl font-bold text-amber-600">{merchant.totalRecipes}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Total Sales</h3>
            <p className="text-3xl font-bold text-amber-600">{merchant.totalSales}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Wallet Address</h3>
            <p className="text-sm font-mono text-gray-800 truncate">{merchant.walletAddress}</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Specialties</h2>
          <div className="flex flex-wrap gap-2">
            {merchant.specialties.map((specialty, index) => (
              <span 
                key={index}
                className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        {/* Merchant Recipes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">My Recipes</h2>
            <Link 
              to="/create" 
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Create New Recipe
            </Link>
          </div>
          
          {merchantRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchantRecipes.map(recipe => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
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
              <h3 className="text-xl font-medium text-gray-600 mb-2">No recipes yet</h3>
              <p className="text-gray-500 mb-6">Start creating your culinary masterpieces</p>
              <Link 
                to="/create" 
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-md font-medium transition-colors"
              >
                Create Your First Recipe
              </Link>
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Business Details</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {merchant.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <a href={merchant.socialMedia.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600">
                    {merchant.socialMedia.website}
                  </a>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Social Media</h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 7.5h.01M12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm7.5-9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  </svg>
                  <a href={`https://instagram.com/${merchant.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600">
                    {merchant.socialMedia.instagram}
                  </a>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <a href={`https://twitter.com/${merchant.socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600">
                    {merchant.socialMedia.twitter}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-md transition-colors flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default MerchantProfilePage; 