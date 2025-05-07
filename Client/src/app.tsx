import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import SwapMarket from './pages/SwapMarket'
import ProfilePage from './pages/ProfilePage'
import NftDetailPage from './pages/NftDetailPage'
import UserProfilePage from './pages/UserProfilePage'
import MerchantProfilePage from './pages/MerchantProfilePage'
import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'
import CreateCouponPage from './pages/CreateCouponPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow md:pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/swap-market" element={<SwapMarket />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/user_profile" element={<UserProfilePage />} />
              <Route path="/merchant_profile" element={<MerchantProfilePage />} />
              <Route path="/nft/:nftId" element={<NftDetailPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/create-coupon" element={<CreateCouponPage />} />
              <Route path="*" element={<div className="p-12 text-center">Page Not Found</div>} />
            </Routes>
          </div>
        </main>
        
        <footer className="bg-gray-100 py-6 text-center text-gray-600">
          <p>© 2025 RecipeVerse. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App