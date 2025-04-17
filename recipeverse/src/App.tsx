import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import MyRecipesPage from './pages/MyRecipesPage'
import CreateCouponPage from './pages/CreateCouponPage'
import VerificationManagementPage from './pages/VerificationManagementPage'
import SwapMarket from './pages/SwapMarket'
import NftDetailPage from './pages/NftDetailPage'
import { WalletProvider } from './contexts/WalletContext'
import TestSupabaseConnection from './pages/TestSupabaseConnection'
import TestNFTQueryPage from './pages/TestNFTQueryPage'

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow md:pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/recipe/:id" element={<RecipeDetailPage />} />
                <Route path="/profile" element={<MyRecipesPage />} />
                <Route path="/create-coupon" element={<CreateCouponPage />} />
                <Route path="/verification_management" element={<VerificationManagementPage />} />
                <Route path="/swap-market" element={<SwapMarket />} />
                <Route path="/nft/:nftId" element={<NftDetailPage />} />
                <Route path="/test" element={<TestSupabaseConnection />} />
                <Route path="/test-nfts" element={<TestNFTQueryPage />} />
                <Route path="*" element={<div className="p-12 text-center">Page Not Found</div>} />
              </Routes>
            </div>
          </main>
          <footer className="bg-gray-100 py-6 text-center text-gray-600">
            <p>© 2023 RecipeVerse. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </WalletProvider>
  )
}

export default App
