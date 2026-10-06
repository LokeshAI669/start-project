import React, { useState } from 'react';
import { api } from '../utils/api';
import { X, Smartphone, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

/**
 * UpiPaymentModal
 * Shows the PhonePe QR code, amount, and UTR submission form.
 * Props:
 *   project     — { id, title, price }
 *   buyerName   — pre-filled name
 *   buyerEmail  — pre-filled email
 *   onClose()   — called when modal dismissed
 *   onSuccess() — called after successful UTR submission
 */
export default function UpiPaymentModal({ project, buyerName: initName, buyerEmail: initEmail, onClose, onSuccess }) {
  const [step, setStep]         = useState('qr');       // 'qr' → 'form' → 'done'
  const [buyerName, setName]    = useState(initName || '');
  const [buyerEmail, setEmail]  = useState(initEmail || '');
  const [utrId, setUtrId]       = useState('');
  const [submitting, setSub]    = useState(false);
  const [error, setError]       = useState('');
  const [copied, setCopied]     = useState(false);

  const amount = Number(project?.price || 0);

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(String(amount)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitUTR = async (e) => {
    e.preventDefault();
    setError('');
    if (!buyerEmail.includes('@')) return setError('Enter a valid email address.');
    if (utrId.trim().length < 8)  return setError('Enter the full UTR / Transaction ID from your PhonePe app.');
    setSub(true);
    try {
      await api('POST', '/api/orders/upi', {
        projectId:  project.id,
        buyerName:  buyerName.trim() || 'Student',
        buyerEmail: buyerEmail.trim().toLowerCase(),
        utrId:      utrId.trim(),
      });
      setStep('done');
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSub(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--surface, #0f1117)',
        border: '1px solid var(--border, rgba(255,255,255,0.1))',
        borderRadius: '20px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        animation: 'slideUp 0.25s ease',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '18px 20px 16px',
          borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Smartphone size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #fff)' }}>
                Pay via UPI / PhonePe
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-faint, #6b7280)' }}>
                Instant Digital Delivery after verification
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--text-faint, #6b7280)', padding: '4px', borderRadius: '6px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Step: QR Code ── */}
        {step === 'qr' && (
          <div style={{ padding: '20px' }}>
            {/* Amount badge */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: '10px', padding: '10px 14px', marginBottom: '16px',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount to Pay</div>
                <div style={{ fontSize: '22px', fontWeight: 900, color: '#F59E0B' }}>₹{amount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Project name */}
            <div style={{
              fontSize: '12px', color: 'var(--text-secondary, #9ca3af)',
              marginBottom: '14px', textAlign: 'center',
            }}>
              Payment for: <strong style={{ color: 'var(--text-primary, #fff)' }}>{project?.title}</strong>
            </div>

            {/* QR image */}
            <div style={{
              display: 'flex', justifyContent: 'center', marginBottom: '14px',
            }}>
              <div style={{
                background: '#000', borderRadius: '14px', padding: '10px',
                border: '2px solid rgba(124,58,237,0.4)',
                boxShadow: '0 0 24px rgba(124,58,237,0.2)',
                width: '100%', maxWidth: '400px'
              }}>
                <img
                  src="/phonepe-qr.jpg"
                  alt="PhonePe QR Code"
                  style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
                />
              </div>
            </div>

            <div style={{
              textAlign: 'center', fontSize: '12px',
              color: 'var(--text-faint, #6b7280)', marginBottom: '16px', lineHeight: 1.5,
            }}>
              Scan this QR using any UPI app (PhonePe, GPay, Paytm).<br />
              <span style={{ color: '#F59E0B', fontWeight: 600 }}>Pay exactly ₹{amount.toLocaleString('en-IN')}</span> and note your UTR Number.<br/>
              <span style={{ fontSize: '11px', display: 'block', marginTop: '6px' }}>
                <em>(If you are on mobile, take a screenshot of this QR and use the "Scan from Gallery" option in PhonePe)</em>
              </span>
            </div>

            <button
              onClick={() => setStep('form')}
              style={{
                width: '100%', padding: '12px',
                background: 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontWeight: 700, fontSize: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              I've Paid — Enter Transaction ID →
            </button>
          </div>
        )}

        {/* ── Step: UTR Form ── */}
        {step === 'form' && (
          <form onSubmit={handleSubmitUTR} style={{ padding: '20px' }}>
            <button
              type="button"
              onClick={() => setStep('qr')}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-faint, #6b7280)', fontSize: '12px',
                marginBottom: '14px', padding: 0, display: 'flex', alignItems: 'center', gap: '4px',
              }}
            >
              ← Back to QR code
            </button>

            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary, #fff)', marginBottom: '4px' }}>
              Enter Payment Details
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-faint, #6b7280)', marginBottom: '16px' }}>
              We'll verify your UTR and activate your download within minutes.
            </div>

            {/* Name */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                Your Name
              </label>
              <input
                type="text"
                value={buyerName}
                onChange={e => setName(e.target.value)}
                placeholder="Full name"
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'var(--input-bg, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border, rgba(255,255,255,0.12))',
                  color: 'var(--text-primary, #fff)', fontSize: '13px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                Email Address <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'var(--input-bg, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border, rgba(255,255,255,0.12))',
                  color: 'var(--text-primary, #fff)', fontSize: '13px',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-faint, #6b7280)', marginTop: '3px' }}>
                Download link will be sent to this email after verification.
              </div>
            </div>

            {/* UTR */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>
                UTR / Transaction ID <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                value={utrId}
                onChange={e => setUtrId(e.target.value.replace(/\s/g, ''))}
                placeholder="e.g. 426851234567"
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px',
                  background: 'var(--input-bg, rgba(255,255,255,0.05))',
                  border: `1px solid ${error ? '#ef4444' : 'rgba(124,58,237,0.4)'}`,
                  color: 'var(--text-primary, #fff)', fontSize: '14px',
                  outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', letterSpacing: '0.05em',
                }}
              />
              <div style={{ fontSize: '10px', color: 'var(--text-faint, #6b7280)', marginTop: '3px' }}>
                Find this in PhonePe → History → tap the transaction → "UTR Number"
              </div>
            </div>

            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px', padding: '8px 12px', marginBottom: '12px',
                color: '#f87171', fontSize: '12px',
              }}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', padding: '12px',
                background: submitting ? 'rgba(124,58,237,0.4)' : 'linear-gradient(135deg, #5B21B6, #7C3AED)',
                border: 'none', borderRadius: '10px', color: '#fff',
                fontWeight: 700, fontSize: '14px', cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Payment for Verification'}
            </button>
          </form>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={30} color="#10B981" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #fff)', marginBottom: '8px' }}>
              Payment Submitted!
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary, #9ca3af)', lineHeight: 1.6, marginBottom: '20px' }}>
              We've received your UTR and notified our team.<br />
              You'll get an email at <strong style={{ color: 'var(--text-primary, #fff)' }}>{buyerEmail}</strong> once verified (usually within 30 minutes).
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '10px 28px',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px', color: 'var(--text-primary, #fff)',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
