import React from 'react';

/**
 * SchemeSetu Brand Logo Component
 * 
 * Concept: SCHEME + SETU ("Setu" = Bridge connecting citizens to financial welfare).
 * Visual Motif: A stylized arching bridge curve combining an "S" pathway, node connectivity,
 * and an upward financial growth arc.
 */
export default function Logo({ 
  variant = 'full', // 'full' | 'symbol' | 'horizontal' | 'splash'
  size = 36,
  showDescriptor = true,
  theme = 'dark' // 'dark' | 'light'
}) {
  const isLight = theme === 'light';
  const textColor = isLight ? '#0F172A' : '#FFFFFF';
  const subtitleColor = isLight ? '#64748B' : '#94A3B8';

  const SymbolSVG = (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="setuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="bridgeArch" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>

      {/* Outer Glow / Ring */}
      <circle cx="24" cy="24" r="22" fill="url(#setuGradient)" fillOpacity="0.12" stroke="url(#setuGradient)" strokeWidth="1.5" strokeDasharray="3 3" />
      
      {/* Setu Arch Bridge 1 */}
      <path 
        d="M 10 32 C 16 18, 32 18, 38 32" 
        stroke="url(#setuGradient)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none" 
      />
      
      {/* S-Pathway Bridge Layer 2 */}
      <path 
        d="M 14 26 C 18 16, 24 20, 28 22 C 32 24, 34 32, 34 32" 
        stroke="#F59E0B" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* Connection Nodes (Citizen -> Bridge -> Scheme) */}
      <circle cx="10" cy="32" r="3" fill="#3B82F6" />
      <circle cx="24" cy="19" r="3.5" fill="#10B981" />
      <circle cx="38" cy="32" r="3" fill="#F59E0B" />
    </svg>
  );

  if (variant === 'symbol') {
    return SymbolSVG;
  }

  if (variant === 'splash') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
        <div style={{
          padding: '1.25rem',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(16, 185, 129, 0.2))',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)'
        }}>
          <Logo variant="symbol" size={80} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#FFFFFF', margin: 0, letterSpacing: '-0.02em' }}>
            SchemeSetu
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#94A3B8', margin: '0.35rem 0 0', fontWeight: 500 }}>
            Smart Access to Government Financial Schemes
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
      {SymbolSVG}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
        <span style={{ 
          fontSize: `${Math.max(size * 0.52, 16)}px`, 
          fontWeight: 900, 
          color: textColor, 
          letterSpacing: '-0.02em',
          fontFamily: 'Outfit, sans-serif'
        }}>
          SchemeSetu
        </span>
        {showDescriptor && (
          <span style={{ 
            fontSize: `${Math.max(size * 0.28, 10)}px`, 
            fontWeight: 600, 
            color: subtitleColor,
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}>
            Financial Welfare Portal
          </span>
        )}
      </div>
    </div>
  );
}
