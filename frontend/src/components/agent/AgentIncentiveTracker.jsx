import React from 'react';
import { DollarSign, Award, CheckCircle, TrendingUp } from 'lucide-react';

export default function AgentIncentiveTracker() {
  const AGENT_STATS = {
    agentId: 'VLE-AP-9082',
    agentName: 'Suresh Kumar',
    verifiedSubmissions: 42,
    pendingSubmissions: 5,
    commissionEarned: 4200, // ₹100 per verified application
    ranking: '#4 in District',
  };

  return (
    <div style={{
      backgroundColor: '#0F172A',
      border: '1px solid #1E293B',
      borderRadius: '16px',
      padding: '1.25rem',
      margin: '1rem 0 1.5rem',
      color: '#E2E8F0',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1E293B',
        paddingBottom: '0.85rem',
        marginBottom: '1rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Award size={20} style={{ color: '#F59E0B' }} /> Field Agent Incentive & Commission Tracker
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', margin: '0.2rem 0 0' }}>
            Track earnings per verified citizen onboarding and regional agent ranking
          </p>
        </div>
        <span style={{
          fontSize: '0.78rem',
          fontFamily: 'monospace',
          fontWeight: 800,
          backgroundColor: 'rgba(245, 158, 11, 0.15)',
          color: '#F59E0B',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '0.3rem 0.75rem',
          borderRadius: '20px'
        }}>
          {AGENT_STATS.ranking}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.25rem' }}>Total Verified Applications</span>
          <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34D399' }}>{AGENT_STATS.verifiedSubmissions}</strong>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.25rem' }}>Total Incentives Earned</span>
          <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FBBF24' }}>₹{AGENT_STATS.commissionEarned.toLocaleString('en-IN')}</strong>
        </div>

        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid #334155', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.25rem' }}>Pending Verification</span>
          <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60A5FA' }}>{AGENT_STATS.pendingSubmissions}</strong>
        </div>
      </div>
    </div>
  );
}
