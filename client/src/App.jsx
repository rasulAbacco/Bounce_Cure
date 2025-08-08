import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 
 
import HomePage from './pages/HomePage';
import About from './pages/About';
import Features from './pages/Features';

function App() {
  return (
    <div>
     
      <Router>
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
        </Routes>
    </Router>

    </div>
  )
}

export default App
