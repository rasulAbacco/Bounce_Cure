import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import FreeValidation from './pages/FreeValidation';
import IntegrationPage from './pages/IntegrationPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPasswordPage';
function App() {
  return (
    <div>

      <Router>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/validation" element={<FreeValidation />} />
          <Route path="/integrations" element={<IntegrationPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </Router>

    </div>
  )
}

export default App
