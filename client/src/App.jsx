import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';

import Contact from './components/Contact';

import About from './pages/About';
import Features from './pages/Features';


function App() {
  return (
    <Router>
     

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>

    </Router>
  );
}

export default App;
