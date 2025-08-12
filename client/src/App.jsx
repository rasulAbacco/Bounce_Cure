import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

import FreeValidation from './pages/FreeValidation';
import IntegrationPage from './pages/IntegrationPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPasswordPage';
import Pricing from './pages/Pricing';
import Contact from './components/Contact';
import About from './pages/About';
import Features from './pages/Features';
import BulkVerification from './pages/BulkVerification';
import Dashboard from './pages/Dashboard/Dashboard';
import FaqSection from './pages/FAQSection';

function App() {
  return (

    <Router>

      <Routes>

        <Route path="/services/email-verification" element={<FreeValidation />} />
        <Route path="/services/integrations" element={<IntegrationPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/services/bulk-verification" element={<BulkVerification />} />
        <Route path="/faq" element={<FaqSection />} />

        <Route path="/dashboard" element={<Dashboard />} />

      </Routes>


    </Router>
  );
}

export default App;
