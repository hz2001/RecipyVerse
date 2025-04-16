import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import RecipeDetailPage from './pages/RecipeDetailPage'
import CreateRecipePage from './pages/CreateRecipePage'
import MyRecipesPage from './pages/MyRecipesPage'
import CreateNftPage from './pages/CreateNftPage'
import ExchangeNftPage from './pages/ExchangeNftPage'
import TestSupabaseConnection from "./pages/TestSupabaseConnection.tsx";
import TestNFTQueryPage from "./pages/TestNFTQueryPage.tsx";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow md:pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/recipe/:id" element={<RecipeDetailPage />} />
              <Route path="/create" element={<CreateRecipePage />} />
              <Route path="/profile" element={<MyRecipesPage />} />
              <Route path="/create-nft" element={<CreateNftPage />} />
              <Route path="/exchange-nft" element={<ExchangeNftPage />} />
              <Route path="*" element={<div className="p-12 text-center">Page Not Found</div>} />
              <Route path="/test" element={<TestSupabaseConnection />} /> {/* ✅ 新加的测试数据库连接入口 */}
              <Route path="/test-nfts" element={<TestNFTQueryPage />} />
            </Routes>
          </div>
        </main>
        <footer className="bg-gray-100 py-6 text-center text-gray-600">
          <p>© 2023 RecipeVerse. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
