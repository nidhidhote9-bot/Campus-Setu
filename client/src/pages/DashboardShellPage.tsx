import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Bell, User, Menu, X, ShieldCheck, Activity, GraduationCap, IndianRupee } from 'lucide-react';
import { IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

export const DashboardShellPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Search Header Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            className="form-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            placeholder="Global Search: Students, Courses, Roll Numbers, Receipt Nos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn btn-secondary"
            style={{ position: 'relative', padding: '10px' }}
            title="Notifications Drawer"
          >
            <Bell size={18} />
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          </button>

          {/* Profile Menu Toggle */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="btn btn-secondary"
            style={{ padding: '10px' }}
            title="Profile Menu"
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="glass-card" style={{ borderColor: '#6366f1' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: '#6366f1' }} /> Recent Notifications Drawer
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <strong>Fee Payment Confirmation:</strong> Receipt RCP-20260930-1001 generated for Aarav Sharma.
            </li>
            <li style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
              <strong>Exam Hall Tickets Released:</strong> Mid-Term 2026 timetable published.
            </li>
          </ul>
        </div>
      )}

      {/* Profile Drawer */}
      {showProfile && (
        <div className="glass-card" style={{ borderColor: '#06b6d4' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Active User Session Profile</h3>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span className="badge badge-idempotency">{user?.role}</span></p>
          <p><strong>Institution ID:</strong> {user?.institutionId || 'DITS-001'}</p>
        </div>
      )}

      {/* Role-Specific Dashboard Shell Content */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>
          Role Dashboard Shell: <span style={{ color: '#818cf8' }}>{user?.role}</span>
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          Configured for institutional timezone `Asia/Kolkata` (+05:30).
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Assigned Role Scope</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>{user?.role}</div>
          </div>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Timezone</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>IST (UTC+5:30)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
