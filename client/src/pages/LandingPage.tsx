import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowRight, ShieldCheck, Cpu, Globe, Users, BookOpen, Award } from 'lucide-react';
import { IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
      {/* Header Bar */}
      <header style={{
        height: '72px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            <GraduationCap size={26} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>CampusSetu</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Higher Education ERP Monolith</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <SimulationBadge label="DEMO MODE DISCLOSURE ACTIVE" />
          <button onClick={() => navigate('/login')} className="btn btn-primary">
            Portal Sign-In <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ flex: 1, padding: '60px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="badge badge-idempotency" style={{ marginBottom: '16px', padding: '6px 14px', fontSize: '0.8rem' }}>
            <ShieldCheck size={14} /> PRODUCTION-GRADE MERN MONOLITH ARCHITECTURE
          </span>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px' }}>
            Next-Generation Governance & Campus Management System
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 24px auto' }}>
            Empowering higher education institutions with real-time academic tracking, integer paise fee precision, AI early warning dropout predictors, and multi-tenant security scopes.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Access Multi-Role Portals <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/app/foundation/components')} className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              Explore UI Design System
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '60px' }}>
          <div className="glass-card">
            <Users size={32} style={{ color: '#6366f1', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Multi-Tenant RBAC & ABAC</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Scoped authorization engine protecting institution data, student self-access, faculty course rosters, and guardian ward grants.
            </p>
          </div>

          <div className="glass-card">
            <Cpu size={32} style={{ color: '#06b6d4', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Integer Paise Financials</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Zero floating-point currency calculations with unique idempotency keys for Razorpay simulated checkouts and staff payroll approvals.
            </p>
          </div>

          <div className="glass-card">
            <Award size={32} style={{ color: '#10b981', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Immutable Gradebook</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Finalized marks locking with appended revision history logs and DigiLocker verification QR code integration.
            </p>
          </div>

          <div className="glass-card">
            <Globe size={32} style={{ color: '#f59e0b', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Bilingual UI (EN / HI)</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Full English and Hindi language translation engine with responsive mobile drawer navigation and high contrast accessibility.
            </p>
          </div>
        </div>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '24px 32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        CampusSetu Prototype Monolith © 2026 | Built for Higher Education Institutions
      </footer>
    </div>
  );
};
