import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import InstallAppBanner from './components/common/InstallAppBanner';
import PWAInstallModal from './components/common/PWAInstallModal';
import EntranceVoiceGreeting from './components/common/EntranceVoiceGreeting';
import OfflineIndicator from './components/common/OfflineIndicator';
import MobileQuickNav from './components/common/MobileQuickNav';
import ErrorBoundary from './components/common/ErrorBoundary';
import VoiceAssistantModal from './components/voice/VoiceAssistantModal';
import GPSDebugPanel from './components/debug/GPSDebugPanel';
import Onboarding from './pages/Onboarding';
import InputHub from './pages/InputHub';
import Results from './pages/Results';
import MyApplications from './pages/MyApplications';
import Community from './pages/Community';
import VLEDashboard from './pages/VLEDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import Schemes from './pages/Schemes';
import SchemeDetails from './pages/SchemeDetails';
import Eligibility from './pages/Eligibility';
import Compare from './pages/Compare';
import Locations from './pages/Locations';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

import LanguageSelectionModal from './components/common/LanguageSelectionModal';

export default function App() {
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);

  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <LanguageSelectionModal />
        <InstallAppBanner />
        <OfflineIndicator />
        <Navbar onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} />
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/input" element={<InputHub />} />
            <Route path="/voice" element={<InputHub />} />
            <Route path="/results" element={<Results />} />
            <Route path="/applications" element={<MyApplications />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/nearby" element={<Locations />} />
            <Route path="/community" element={<Community />} />
            <Route path="/vle" element={<VLEDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/schemes/:id" element={<SchemeDetails />} />
            <Route path="/eligibility" element={<Eligibility />} />
            <Route path="/media" element={<Eligibility initialMode="media" />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <MobileQuickNav onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} />
        <PWAInstallModal />
        <EntranceVoiceGreeting />
        <GPSDebugPanel />

        {/* Global Voice Assistant Modal */}
        <VoiceAssistantModal 
          isOpen={voiceAssistantOpen} 
          onClose={() => setVoiceAssistantOpen(false)} 
        />
      </div>
    </ErrorBoundary>
  );
}
