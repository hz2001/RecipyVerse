import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { UserRole } from '../services/userService';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { connectedWallet, isConnecting, connectWallet, disconnectWallet, userRole, isAdmin, isMerchant } = useWallet();
  
  // 格式化显示的钱包地址
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
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
            <Link to="/swap-market" className="text-white hover:text-amber-100 transition-colors">
              Swap Market
            </Link>
            
            {/* 根据用户角色显示不同的导航链接 */}
            {isMerchant && (
              <Link to="/my-recipes" className="text-white hover:text-amber-100 transition-colors">
                My Recipes
              </Link>
            )}
            
            
            <Link to="/profile" className="text-white hover:text-amber-100 transition-colors">
              Profile
            </Link>
          </div>
          
          {/* 钱包连接按钮 */}
          <div className="hidden md:block">
            {connectedWallet ? (
              <div className="flex items-center space-x-3">
                <div className="text-white bg-amber-600 rounded-full px-3 py-1 text-sm font-medium">
                  {formatAddress(connectedWallet)}
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="bg-white text-amber-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-amber-100 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                disabled={isConnecting}
                className="bg-white text-amber-600 px-4 py-2 rounded-full font-medium hover:bg-amber-100 transition-colors"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
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
              stroke="currentColor"
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
              to="/swap-market"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Swap Market
            </Link>
            
            {isMerchant && (
              <Link
                to="/my-recipes"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
                onClick={() => setIsMenuOpen(false)}
              >
                My Recipes
              </Link>
            )}
            
            {isAdmin ? (
              <Link
                to="/admin/verification"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Verification Management
              </Link>
            ) : (
              <Link
                to="/admin"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            
            <Link
              to="/profile"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-amber-100 hover:bg-amber-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Profile
            </Link>
            
            {/* 移动端的钱包连接按钮 */}
            <div className="mt-4 pt-4 border-t border-amber-400">
              {connectedWallet ? (
                <div className="space-y-2">
                  <div className="text-white text-sm px-3">
                    <span className="font-medium">Connected:</span> {formatAddress(connectedWallet)}
                  </div>
                  <button 
                    onClick={() => {
                      disconnectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-center bg-white text-amber-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    connectWallet();
                    setIsMenuOpen(false);
                  }}
                  disabled={isConnecting}
                  className="w-full text-center bg-white text-amber-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 