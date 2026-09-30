import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { UserRole } from '@shared/index';
import { GraduationCap, Lock, Mail, ShieldAlert } from 'lucide-react';
import { IdempotencyBadge } from '../components/BadgesAndStates';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [email, setEmail] = useState('superadmin@campussetu.edu');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<UserRole>(UserRole.SUPER_ADMIN);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rolesList = [
    { value: UserRole.SUPER_ADMIN, label: 'Super Admin', defaultEmail: 'superadmin@campussetu.edu' },
    { value: UserRole.ADMIN, label: 'Campus Admin', defaultEmail: 'admin@campussetu.edu' },
    { value: UserRole.FACULTY, label: 'Faculty (Prof. Sharma)', defaultEmail: 'faculty.cse@campussetu.edu' },
    { value: UserRole.STUDENT, label: 'Student (Aarav Sharma)', defaultEmail: 'student.aarav@campussetu.edu' },
    { value: UserRole.GUARDIAN, label: 'Guardian (Parent)', defaultEmail: 'guardian.sharma@campussetu.edu' },
    { value: UserRole.FINANCE, label: 'Finance Head', defaultEmail: 'finance@campussetu.edu' },
    { value: UserRole.WARDEN, label: 'Hostel Warden', defaultEmail: 'warden@campussetu.edu' },
    { value: UserRole.PLACEMENT_OFFICER, label: 'Placement Officer', defaultEmail: 'placement@campussetu.edu' }
  ];

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    const item = rolesList.find(r => r.value === selectedRole);
    if (item) setEmail(item.defaultEmail);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password, role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(6, 182, 212, 0.1), transparent 40%)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '480px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            margin: '0 auto 16px auto'
          }}>
            <GraduationCap size={34} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>{t('appTitle')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('subtitle')}</p>
          <div style={{ marginTop: '12px' }}>
            <IdempotencyBadge label="CSRF & SESSION PROTECTED" />
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px'
          }}>
            <ShieldAlert size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('selectRole')}</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => handleRoleSelect(e.target.value as UserRole)}
            >
              {rolesList.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '12px', padding: '14px' }}
          >
            {isSubmitting ? 'Authenticating...' : t('login')}
          </button>
        </form>
      </div>
    </div>
  );
};
