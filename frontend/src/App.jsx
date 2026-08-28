import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import InstallAppBanner from './components/common/InstallAppBanner';
import OfflineIndicator from './components/common/OfflineIndicator';
import MobileQuickNav from './components/common/MobileQuickNav';
import ErrorBoundary from './components/common/ErrorBoundary';
import Onboarding from './pages/Onboarding';
import InputHub from './pages/InputHub';
import Results from './pages/Results';
import MyApplications from './pages/MyApplications';
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import Eligibility from './pages/Eligibility';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <InstallAppBanner />
        <OfflineIndicator />
        <Navbar />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/input" element={<InputHub />} />
            <Route path="/results" element={<Results />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/home" element={<Home />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/schemes/:id" element={<SchemeDetails />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileQuickNav />
      </div>
    </ErrorBoundary>
  );
}
