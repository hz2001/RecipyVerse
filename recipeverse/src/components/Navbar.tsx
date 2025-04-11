import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Simulating a connected wallet
  const connectedWallet = "0xABC123...456";
  
  return (
    <nav className="bg-gradient-to-r from-amber-500 to-yellow-600 shadow-md md:fixed md:top-0 md:left-0 md:right-0 md:z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-white">RecipeVerse</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/explore" className="text-white hover:text-amber-100 transition-colors">
              Explore
            </Link>
            <Link to="/create" className="text-white hover:text-amber-100 transition-colors">
              Create Recipe
            </Link>
            <Link to="/profile" className="text-white hover:text-amber-100 transition-colors">
              My Recipes
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-white hover:text-amber-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-amber-500"
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="rgb(245, 158, 11)" // amber-500 color
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Menu */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-amber-600 border-t border-amber-400">
            <Link
              to="/explore"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore
            </Link>
            <Link
              to="/create"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Create Recipe
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
              onClick={() => setIsMenuOpen(false)}
            >
              My Recipes
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 