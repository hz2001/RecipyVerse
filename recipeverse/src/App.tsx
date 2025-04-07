import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          {/* Add more routes here */}
        </Routes>
      </div>
    </Router>
  )
}

export default App
