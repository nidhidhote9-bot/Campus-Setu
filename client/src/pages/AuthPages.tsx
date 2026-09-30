import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@shared/index';
import { Lock, Mail, ShieldAlert, AlertOctagon, HelpCircle, RefreshCw, Home } from 'lucide-react';
import { IdempotencyBadge } from '../components/BadgesAndStates';

export const AuthPages: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState('admin@campussetu.edu');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);
  const [activeTab, setActiveTab] = useState<'signin' | 'session-expired' | 'forbidden' | 'not-found' | 'error'>('signin');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Foundation Authentication & Error Suite</h1>
        <p style={{ color: 'var(--text-muted)' }}>Session management, expired token handlers, 403 forbidden & 404/500 recovery views</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button onClick={() => setActiveTab('signin')} className={`btn ${activeTab === 'signin' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          Sign-In Form
        </button>
        <button onClick={() => setActiveTab('session-expired')} className={`btn ${activeTab === 'session-expired' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          Session Expired
        </button>
        <button onClick={() => setActiveTab('forbidden')} className={`btn ${activeTab === 'forbidden' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          403 Forbidden
        </button>
        <button onClick={() => setActiveTab('not-found')} className={`btn ${activeTab === 'not-found' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          404 Not Found
        </button>
        <button onClick={() => setActiveTab('error')} className={`btn ${activeTab === 'error' ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          500 Error
        </button>
      </div>

      {activeTab === 'signin' && (
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Portal Authentication</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Enter credentials for scoped portal access</p>

          {errorMsg && (
            <div style={{ padding: '10px 14px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>Sign In</button>
          </form>
        </div>
      )}

      {activeTab === 'session-expired' && (
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px', borderColor: 'rgba(245, 158, 11, 0.4)' }}>
          <RefreshCw size={48} style={{ color: '#f59e0b', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Session Expired</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Your authentication token has expired. Please re-authenticate to continue.</p>
          <button onClick={() => navigate('/login')} className="btn btn-primary">Re-authenticate</button>
        </div>
      )}

      {activeTab === 'forbidden' && (
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <Lock size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#f87171' }}>403 Access Forbidden</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Your current user role does not possess permissions for this domain resource.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">Return to Dashboard</button>
        </div>
      )}

      {activeTab === 'not-found' && (
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
          <HelpCircle size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>404 Page Not Found</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>The requested route path does not exist in the navigation register.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary"><Home size={16} /> Back Home</button>
        </div>
      )}

      {activeTab === 'error' && (
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
          <AlertOctagon size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: '#f87171' }}>500 Recoverable Error</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>An unhandled exception occurred. System state is preserved in MongoDB.</p>
          <button onClick={() => window.location.reload()} className="btn btn-secondary">Reload Application</button>
        </div>
      )}
    </div>
  );
};
