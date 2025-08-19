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

import Chatbot from './pages/Chatbot';

import Dashboard from './pages/Dashboard/Dashboard';

import FaqSection from './pages/FAQSection';

import Settings from './pages/Settings/Settings';
import Contacts from './pages/ContactManagement/ConatctManagement';
import Campaign from './pages/Campaign/Campaign';
import Automation from './pages/Automation/Automation';
import UserAuthentication from './pages/UserAuthentication/UserAuthentication';
import Verification from './pages/Verification/Verification';
import Analytics from './pages/Analytics/Analytics';
import Support from './pages/Support/Support';
import PricingDash from './pages/Pricing/PricingDash';
import PaymentPage from './pages/Pricing/PaymentPage';
import { UserProvider } from "./components/UserContext"; // import context
import NewCampaignWindow from './pages/Campaign/Components/NewCampaignWindow';
import CreateCampaign from './pages/Campaign/pages/CreateCampaign'
import EditorPage from './pages/Campaign/pages/EditorPage'

function App() {
  return (
    <UserProvider>
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
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/services/bulk-verification" element={<BulkVerification />} />


          <Route path="/faq" element={<FaqSection />} />

          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/email-campaign" element={<Campaign />} />
          <Route path="/automation" element={<Automation />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/auth" element={<UserAuthentication />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/support" element={<Support />} />
          <Route path='/pricingdash' element={<PricingDash />} />

          <Route path='/new-campaign' element={<NewCampaignWindow />} />
          <Route path="/create" element={<CreateCampaign />} />
          <Route path="/editor/:id" element={<EditorPage />} />
        </Routes>

        <Chatbot />
      </Router>
    </UserProvider>

  );
}

export default App;
