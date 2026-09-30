import React from 'react';
import { ShieldCheck, Cpu, AlertOctagon, Loader2, FileQuestion, Lock } from 'lucide-react';

export const IdempotencyBadge: React.FC<{ label?: string }> = ({ label }) => (
  <span className="badge badge-idempotency" title="Financial operations enforce integer paise and unique idempotency keys">
    <ShieldCheck size={14} />
    {label || 'IDEMPOTENCY SAFE (INTEGER PAISE)'}
  </span>
);

export const SimulationBadge: React.FC<{ label?: string }> = ({ label }) => (
  <span className="badge badge-simulation" title="External API call simulated via explicit server domain service">
    <Cpu size={14} />
    {label || 'SIMULATION MODE (REAL DOMAIN LOGIC)'}
  </span>
);

export const EvaluationLimitBadge: React.FC<{ label?: string }> = ({ label }) => (
  <span className="badge badge-evaluation" title="Model evaluation limit: Synthetic statistical baseline rules">
    <AlertOctagon size={14} />
    {label || 'SYNTHETIC DATASET EVALUATION LIMITS'}
  </span>
);

export const LoadingState: React.FC<{ message?: string }> = ({ message }) => (
  <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
    <Loader2 size={36} className="spin-loader" style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
    <p style={{ fontSize: '0.95rem' }}>{message || 'Loading domain data...'}</p>
    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

export const EmptyState: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="glass-card" style={{ padding: '48px', textAlign: 'center', margin: '20px 0' }}>
    <FileQuestion size={48} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
    <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>{title || 'No Records Found'}</h3>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle || 'There are no active records in this view currently.'}</p>
  </div>
);

export const ForbiddenState: React.FC<{ message?: string }> = ({ message }) => (
  <div className="glass-card" style={{ padding: '48px', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)', margin: '40px auto', maxWidth: '600px' }}>
    <Lock size={54} style={{ color: '#ef4444', marginBottom: '16px' }} />
    <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#f87171' }}>Access Restricted</h2>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{message || 'Your current user role does not have authorization to view or edit this domain scope.'}</p>
  </div>
);
