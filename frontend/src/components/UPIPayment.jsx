import React, { useState } from 'react';
import { Smartphone, CheckCircle, ShieldCheck } from 'lucide-react';

export default function UPIPayment({ amount = 25, serviceName = 'Express Document Verification' }) {
  const [upiId, setUpiId] = useState('citizen@upi');
  const [paid, setPaid] = useState(false);

  const handlePay = (e) => {
    e.preventDefault();
    setPaid(true);
  };

  return (
    <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', marginTop: '1rem' }}>
      <h4 style={{ fontSize: '1.05rem', color: '#0B192C', margin: '0 0 0.85rem 0', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
        <Smartphone style={{ color: '#059669' }} size={20} /> UPI Direct & Offline SMS Payment
      </h4>

      {!paid ? (
        <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.88rem', color: '#64748B' }}>
            Service Fee: <strong style={{ color: '#0F172A' }}>₹{amount}</strong> ({serviceName})
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="user@upi or mobile@paytm"
              className="form-control"
              required
            />
            <button type="submit" className="btn btn-green" style={{ flexShrink: 0 }}>
              Pay ₹{amount}
            </button>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            Offline Option: Dial <strong>*99#</strong> (USSD UPI) on feature phones without internet.
          </div>
        </form>
      ) : (
        <div style={{ background: '#ECFDF5', padding: '0.85rem', borderRadius: '8px', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={20} style={{ color: '#059669' }} />
          <span>Payment Successful! Reference ID: UPI2026{Date.now().toString().slice(-6)}</span>
        </div>
      )}
    </div>
  );
}
