import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import SchemeCard from '../components/scheme/SchemeCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import ErrorMessage from '../components/common/ErrorMessage';
import { 
  User, 
  Bookmark, 
  FileCheck2, 
  Bell, 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [savedSchemes, setSavedSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    async function loadDashboardData() {
      setLoading(true);
      try {
        const [savedRes, appsRes, notifsRes] = await Promise.all([
          userService.getSavedSchemes(),
          userService.getApplications(),
          userService.getNotifications()
        ]);
        setSavedSchemes(savedRes.data || []);
        setApplications(appsRes.data || []);
        setNotifications(notifsRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load user dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1.25rem' }}>
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Citizen Welcome Header */}
      <div className="card" style={{ backgroundColor: '#0B192C', color: '#FFFFFF', padding: '2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(217, 119, 6, 0.2)', color: '#F59E0B', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Verified Citizen Account
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#FFFFFF', margin: 0 }}>
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.92rem', marginTop: '0.25rem' }}>
            State: {user?.state || 'Telangana'} | Mobile: {user?.mobile || 'Registered'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/eligibility" className="btn btn-primary btn-sm">
            <Sparkles size={16} /> Re-evaluate Eligibility
          </Link>
          <Link to="/schemes" className="btn btn-secondary btn-sm">
            <Building2 size={16} /> Explore Schemes
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Grid Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Applications Tracker & Saved Schemes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Applications Tracker */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <FileCheck2 style={{ color: '#059669' }} size={22} /> Tracked Applications
              </h2>
              <span className="badge badge-eligible">{applications.length} Active</span>
            </div>

            {applications.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No applications tracked yet. Use scheme details to track your application guidance.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map(app => (
                  <div key={app.id} style={{ padding: '1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: '#64748B', backgroundColor: '#E2E8F0', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                        {app.id}
                      </span>
                      <span className={`badge ${app.status === 'Approved' ? 'badge-eligible' : 'badge-cat'}`}>
                        {app.status}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', color: '#0F172A', marginBottom: '0.35rem' }}>{app.schemeName}</h4>
                    <div style={{ fontSize: '0.85rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
                      <Clock size={14} style={{ color: '#0284C7' }} /> Current Stage: <strong>{app.step}</strong>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', margin: 0 }}>{app.remarks}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bookmarked / Saved Schemes */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#0B192C', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Bookmark style={{ color: '#D97706' }} size={22} /> Bookmarked Schemes
              </h2>
              <span className="badge badge-cat">{savedSchemes.length} Saved</span>
            </div>

            {savedSchemes.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>You haven't bookmarked any schemes yet. Click the bookmark icon on any scheme card to save it here.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {savedSchemes.map(scheme => (
                  <SchemeCard key={scheme.id} scheme={scheme} isSaved={true} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications Feed & Citizen Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Notifications Feed */}
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', color: '#0B192C', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell style={{ color: '#1D4ED8' }} size={22} /> Portal Notifications
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '0.85rem', backgroundColor: n.read ? '#F8FAFC' : '#EFF6FF', borderRadius: '8px', border: `1px solid ${n.read ? '#E2E8F0' : '#BFDBFE'}` }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0F172A', marginBottom: '0.25rem' }}>
                    {n.title}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.35rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Card */}
          <div className="card" style={{ backgroundColor: '#F8FAFC' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0B192C', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} style={{ color: '#D97706' }} /> Profile Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>Full Name:</span>
                <strong>{user?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>Email:</span>
                <strong>{user?.email}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #CBD5E1', paddingBottom: '0.35rem' }}>
                <span style={{ color: '#64748B' }}>Role:</span>
                <strong style={{ textTransform: 'capitalize' }}>{user?.role || 'Citizen'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>State:</span>
                <strong>{user?.state || 'Telangana'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
