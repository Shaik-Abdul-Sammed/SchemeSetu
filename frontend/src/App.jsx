import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import InstallAppBanner from './components/common/InstallAppBanner';
import PWAInstallModal from './components/common/PWAInstallModal';
import OfflineIndicator from './components/common/OfflineIndicator';
import BottomNavigation from './components/common/BottomNavigation';
import ErrorBoundary from './components/common/ErrorBoundary';
import VoiceAssistantModal from './components/voice/VoiceAssistantModal';
import LoadingSkeleton from './components/common/LoadingSkeleton';

const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const InputHub = React.lazy(() => import('./pages/InputHub'));
const Results = React.lazy(() => import('./pages/Results'));
const MyApplications = React.lazy(() => import('./pages/MyApplications'));
const Community = React.lazy(() => import('./pages/Community'));
const VLEDashboard = React.lazy(() => import('./pages/VLEDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const Home = React.lazy(() => import('./pages/Home'));
const Schemes = React.lazy(() => import('./pages/Schemes'));
const SchemeDetails = React.lazy(() => import('./pages/SchemeDetails'));
const Eligibility = React.lazy(() => import('./pages/Eligibility'));
const Compare = React.lazy(() => import('./pages/Compare'));
const Calculator = React.lazy(() => import('./pages/Calculator'));
const Locations = React.lazy(() => import('./pages/Locations'));
const More = React.lazy(() => import('./pages/More'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const AboutSIH = React.lazy(() => import('./pages/AboutSIH'));



import LanguageSelectionModal from './components/common/LanguageSelectionModal';
import PageTranslator from './components/common/PageTranslator';
import TourGuide from './components/common/TourGuide';
import HelpCenterModal from './components/common/HelpCenterModal';
import TribalSahajModeModal from './components/accessibility/TribalSahajModeModal';
import { setupCapacitorApp } from './utils/capacitorHandler';

export default function App() {
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(() => {
    try {
      return !localStorage.getItem('schemesetu_gate_passed');
    } catch (e) {
      return false;
    }
  });
  const [tourGuideOpen, setTourGuideOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [sahajModalOpen, setSahajModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useRouterLocation();

  useEffect(() => {
    const handleStartTour = () => setTourGuideOpen(true);
    const handleOpenHelp = () => setHelpModalOpen(true);
    const handleOpenSahaj = () => setSahajModalOpen(true);
    window.addEventListener('schemesetu_start_tour', handleStartTour);
    window.addEventListener('schemesetu_open_help', handleOpenHelp);
    window.addEventListener('schemesetu_open_sahaj', handleOpenSahaj);
    return () => {
      window.removeEventListener('schemesetu_start_tour', handleStartTour);
      window.removeEventListener('schemesetu_open_help', handleOpenHelp);
      window.removeEventListener('schemesetu_open_sahaj', handleOpenSahaj);
    };
  }, []);

  useEffect(() => {
    setupCapacitorApp({
      navigate,
      currentPath: location.pathname,
      closeModals: () => {
        setVoiceAssistantOpen(false);
        setLanguageModalOpen(false);
      }
    });
  }, [location.pathname, navigate]);

  return (
    <ErrorBoundary>
      <PageTranslator />
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <LanguageSelectionModal isOpen={languageModalOpen} onClose={() => setLanguageModalOpen(false)} />
        <InstallAppBanner />
        <OfflineIndicator />
        <Navbar 
          onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} 
          onOpenTour={() => setTourGuideOpen(true)}
          onOpenHelp={() => setHelpModalOpen(true)}
        />
        <main style={{ flexGrow: 1, paddingBottom: '70px', paddingTop: '0' }}>
          <React.Suspense fallback={<div className="container py-8" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><LoadingSkeleton count={3} /></div>}>
            <Routes>
              <Route path="/" element={<Home onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} />} />
              <Route path="/home" element={<Home onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} />} />
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
              <Route path="/calculator" element={<Calculator />} />
              <Route path="/emi" element={<Calculator />} />
              <Route path="/more" element={<More onOpenVoiceAssistant={() => setVoiceAssistantOpen(true)} onOpenLanguageModal={() => setLanguageModalOpen(true)} />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Dashboard />} />
              <Route path="/about" element={<AboutSIH />} />
              <Route path="/sih" element={<AboutSIH />} />
              <Route path="*" element={<NotFound />} />

            </Routes>
          </React.Suspense>
        </main>

        <Footer />
        <BottomNavigation />
        <PWAInstallModal />

        {/* Global Voice Assistant Modal */}
        <VoiceAssistantModal 
          isOpen={voiceAssistantOpen} 
          onClose={() => setVoiceAssistantOpen(false)} 
        />

        {/* Interactive Guided Tour Guide with Arrows */}
        <TourGuide 
          isOpen={tourGuideOpen} 
          onClose={() => setTourGuideOpen(false)} 
        />

        {/* Global Help Center & How-To Guide Modal */}
        <HelpCenterModal 
          isOpen={helpModalOpen} 
          onClose={() => setHelpModalOpen(false)} 
          onStartTour={() => setTourGuideOpen(true)}
        />

        {/* Global Samaj / Sahaj Audio-Visual Mode Modal */}
        <TribalSahajModeModal
          isOpen={sahajModalOpen}
          onClose={() => setSahajModalOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}
