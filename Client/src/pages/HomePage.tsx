import { Link } from 'react-router-dom';

const HomePage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">

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
                    <Link to="/profile" className="w-full sm:w-auto text-center bg-white text-amber-600 px-6 py-3 rounded-md font-medium hover:bg-amber-100 transition-colors">
                      Start Journey
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
    </div>
  );
};

export default HomePage; 