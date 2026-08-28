import React from 'react';
import { ShieldCheck, QrCode, Lock } from 'lucide-react';

export default function DocumentVerification({ docId = 'APP-2026-8891' }) {
  const mockHash = '0x8f3c7a9b1e2d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a';

  return (
    <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ fontSize: '1.05rem', color: '#0B192C', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ShieldCheck style={{ color: '#059669' }} size={20} /> Blockchain Document Authenticity Stamp
        </h4>
        <span className="badge badge-state">Verified Block #18420911</span>
      </div>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ background: '#F8FAFC', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(mockHash)}`}
            alt="Blockchain QR Verification Code"
            style={{ width: '100px', height: '100px', display: 'block' }}
          />
        </div>

        <div style={{ flexGrow: 1, fontSize: '0.85rem', color: '#334155' }}>
          <div><strong>Document Reference:</strong> {docId}</div>
          <div style={{ margin: '0.25rem 0', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.78rem', color: '#0284C7' }}>
            Hash: {mockHash}
          </div>
          <div style={{ color: '#64748B', fontSize: '0.78rem' }}>
            🔒 Immutable cryptographic proof stored on distributed ledger for bank anti-fraud audit.
          </div>
        </div>
      </div>
    </div>
  );
}
