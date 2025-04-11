import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import RegisterModal from '../components/RegisterModal';
import UserService from '../services/userService';
import { recipes } from '../data/dummyData';
import MerchantProfilePage from './MerchantProfilePage';

const ProfilePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMerchant, setIsMerchant] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'user' | 'merchant' | null>(null);
  const [modalMode, setModalMode] = useState<'register' | 'login'>('register');

  useEffect(() => {
    const currentUser = UserService.getCurrentUser();
    if (currentUser) {
      setIsLoggedIn(true);
      // For testing, we'll consider users with usernames starting with 'merchant' as merchants
      setIsMerchant(currentUser.username.startsWith('merchant'));
    }
  }, []);

  const handleRoleSelect = (role: 'user' | 'merchant') => {
    setSelectedRole(role);
    setModalMode('register');
    setShowRegisterModal(true);
  };

  const handleLoginClick = () => {
    setModalMode('login');
    setShowRegisterModal(true);
  };

  const handleRegisterComplete = () => {
    setIsLoggedIn(true);
    setIsMerchant(selectedRole === 'merchant');
    setShowRegisterModal(false);
  };

  const handleLogout = () => {
    UserService.logout();
    setIsLoggedIn(false);
    setSelectedRole(null);
  };

  // If not logged in, show role selection screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Welcome to RecipeVerse
            </h1>
            <p className="text-lg text-gray-600">
              Choose your role to get started with RecipeVerse
            </p>
          </div>

          {/* Add login option */}
          <div className="max-w-4xl mx-auto text-center mb-8">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button 
                onClick={handleLoginClick} 
                className="text-amber-500 hover:text-amber-600 font-medium"
              >
                Log in
              </button>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* User Option */}
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleRoleSelect('user')}
            >
              <div className="bg-gradient-to-r from-amber-500 to-yellow-600 h-40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a User</h2>
                <p className="text-gray-600 mb-4">
                  Join RecipeVerse as a user to discover, save, and create recipes from around the world.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Discover global recipes
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save your favorite recipes
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Create and share your own recipes
                  </li>
                </ul>
                <button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-md font-medium transition-colors"
                  onClick={() => handleRoleSelect('user')}
                >
                  Register as User
                </button>
              </div>
            </div>

            {/* Merchant Option */}
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleRoleSelect('merchant')}
            >
              <div className="bg-gradient-to-r from-amber-500 to-yellow-600 h-40 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">I am a Merchant</h2>
                <p className="text-gray-600 mb-4">
                  Join RecipeVerse as a merchant to showcase your culinary expertise and reach a global audience.
                </p>
                <ul className="text-left text-gray-600 space-y-2 mb-6">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Showcase your recipes to a global audience
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Build your culinary brand
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-amber-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Monetize your recipes through NFTs
                  </li>
                </ul>
                <button 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-md font-medium transition-colors"
                  onClick={() => handleRoleSelect('merchant')}
                >
                  Register as Merchant
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Register Modal */}
        {showRegisterModal && (
          <RegisterModal 
            isOpen={showRegisterModal} 
            onClose={() => setShowRegisterModal(false)}
            onComplete={handleRegisterComplete}
            userType={selectedRole || 'user'}
            mode={modalMode}
          />
        )}
      </div>
    );
  }

  // If logged in as a merchant, redirect to merchant profile
  if (isMerchant) {
    return <MerchantProfilePage />;
  }

  // If logged in as a user, show user profile
  const currentUser = UserService.getCurrentUser();
  const userRecipes = recipes.filter(recipe => recipe.creator === currentUser?.username);

  return (
    <div className="min-h-screen bg-gray-50 py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-600 h-32 md:h-40"></div>
          <div className="px-6 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-3xl md:text-4xl font-bold mb-4 md:mb-0 md:mr-6">
                {currentUser?.username.charAt(0)}
              </div>
              <div className="flex-grow">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{currentUser?.username}</h1>
                <p className="text-gray-600 mb-4">Food enthusiast and recipe collector</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {currentUser?.username}@example.com
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Member
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Favorite Recipes</h3>
            <p className="text-3xl font-bold text-amber-600">8</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Created Recipes</h3>
            <p className="text-3xl font-bold text-amber-600">{userRecipes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h3 className="text-lg font-medium text-gray-600 mb-2">Wallet Address</h3>
            <p className="text-sm font-mono text-gray-800 truncate">Not connected</p>
          </div>
        </div>

        {/* User Recipes */}
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
          
          {userRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRecipes.map(recipe => (
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

        {/* Favorite Recipes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Favorite Recipes</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.slice(0, 3).map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              to="/explore" 
              className="inline-block bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 px-6 py-3 rounded-md font-medium transition-colors"
            >
              Discover More Recipes
            </Link>
          </div>
        </div>

        {/* Add logout button at the bottom */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-center">
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 8a1 1 0 10-2 0v3a1 1 0 102 0v-3z" clipRule="evenodd" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal 
          isOpen={showRegisterModal} 
          onClose={() => setShowRegisterModal(false)}
          onComplete={handleRegisterComplete}
          userType={selectedRole || 'user'}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default ProfilePage; 