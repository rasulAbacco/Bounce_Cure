import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 
 
import HomePage from './pages/HomePage';
import Pricing from './pages/Pricing';

function App() {
  return (
    <div>
     
      <Router>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pricing" element={<Pricing />} />
        </Routes>
    </Router>

    </div>
  )
}

export default App
