import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Scale, 
  MapPin, 
  Bot, 
  MessageSquare, 
  Users, 
  Settings, 
  Globe, 
  Mic, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  Building2,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';

export default function More({ onOpenVoiceAssistant, onOpenLanguageModal }) {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();

  const sections = [
    {
      title: 'Financial & Scheme Tools',
      items: [
        { 
          icon: Calculator, 
          color: '#8B5CF6', 
          bg: 'rgba(139, 92, 246, 0.1)', 
          title: t('calculateEMI', 'EMI & Subsidy Calculator'), 
          desc: 'Calculate monthly EMIs, reducing interest, & government subsidies', 
          to: '/results' 
        },
        { 
          icon: Scale, 
          color: '#0284C7', 
          bg: 'rgba(2, 132, 199, 0.1)', 
          title: t('compare', 'Compare Schemes'), 
          desc: 'Side-by-side comparison of loan limits, subsidies, & rates', 
          to: '/compare' 
        },
        { 
          icon: MapPin, 
          color: '#D97706', 
          bg: 'rgba(217, 119, 6, 0.1)', 
          title: t('partners', 'Assistance Center & Bank Locator'), 
          desc: 'Find nearest CSC Seva Kendras & lead district PSB branches', 
          to: '/locations' 
        },
        { 
          icon: Bot, 
          color: '#10B981', 
          bg: 'rgba(16, 185, 129, 0.1)', 
          title: t('agentMode', 'AI Fast-Fill Agent Intake Hub'), 
          desc: 'Automated application draft assistance & document extract', 
          to: '/input' 
        }
      ]
    },
    {
      title: 'Community & Portal Services',
      items: [
        { 
          icon: MessageSquare, 
          color: '#0284C7', 
          bg: 'rgba(2, 132, 199, 0.1)', 
          title: t('community', 'Community Forum & Mentorship'), 
          desc: 'Connect with successful SC entrepreneurs & domain advisors', 
          to: '/community' 
        },
        { 
          icon: Users, 
          color: '#16A34A', 
          bg: 'rgba(22, 163, 74, 0.1)', 
          title: t('vle', 'VLE & CSC Operator Portal'), 
          desc: 'Assisted application submission desk for digital operators', 
          to: '/vle' 
        },
        { 
          icon: Settings, 
          color: '#475569', 
          bg: 'rgba(71, 85, 105, 0.1)', 
          title: t('admin', 'Admin & Institutional Portal'), 
          desc: 'Channel partner fund allocation & verification oversight', 
          to: '/admin' 
        }
      ]
    },
    {
      title: 'Voice & Accessibility Preferences',
      items: [
        { 
          icon: Mic, 
          color: '#F59E0B', 
          bg: 'rgba(245, 158, 11, 0.1)', 
          title: t('voiceAssistant', 'AI Voice Assistant'), 
          desc: 'Multi-turn voice intelligence & audio assistance in 10 languages', 
          action: onOpenVoiceAssistant 
        },
        { 
          icon: Globe, 
          color: '#2563EB', 
          bg: 'rgba(37, 99, 235, 0.1)', 
          title: 'Language Preference (' + lang + ')', 
          desc: 'Switch application language (EN, HI, TE, Gondi, Chenchu)', 
          action: onOpenLanguageModal 
        }
      ]
    }
  ];

  return (
    <div className="container" style={{ padding: '1.5rem 1rem 5rem', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Brand Header */}
      <div style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        borderRadius: '20px',
        padding: '1.5rem',
        marginBottom: '1.75rem',
        border: '1px solid #1E293B',
        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <Logo variant="full" size={42} theme="dark" />
        
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            >
              <UserCheck size={14} /> Profile
            </button>
            <button 
              onClick={logout}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.8rem', color: '#FCA5A5', borderColor: 'rgba(239,68,68,0.3)' }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => navigate('/login')}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.8rem', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.2)' }}
            >
              Login
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="btn btn-sm btn-primary"
              style={{ fontSize: '0.8rem' }}
            >
              Register
            </button>
          </div>
        )}
      </div>

      {/* Feature Groups */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {sections.map((sec, sIdx) => (
          <div key={sIdx}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem', paddingLeft: '0.25rem' }}>
              {sec.title}
            </h3>

            <div className="card-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {sec.items.map((item, iIdx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={iIdx}
                    onClick={() => {
                      if (item.action) item.action();
                      else if (item.to) navigate(item.to);
                    }}
                    className="card"
                    style={{
                      padding: '1rem 1.25rem',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '14px',
                      border: '1px solid #E2E8F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        backgroundColor: item.bg,
                        color: item.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={22} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0F172A' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.15rem', lineHeight: 1.3 }}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: '#94A3B8', flexShrink: 0 }} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Provenance & Info Footer Banner */}
        <div className="card" style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#047857', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
            <ShieldCheck size={18} /> SchemeSetu Official Provenance & SIH 2026 Evaluation
          </div>
          <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
            SchemeSetu enforces deterministic eligibility check rules and scheme data sourced directly from Ministry of Social Justice and Empowerment (MoSJE) & NSFDC guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
