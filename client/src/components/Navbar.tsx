import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { GraduationCap, LogOut, Globe, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();

  return (
    <header className="navbar">
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
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1 }}>{t('appTitle')}</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('subtitle')}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
        >
          <Globe size={16} />
          {lang === 'en' ? 'हिन्दी (HI)' : 'English (EN)'}
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
              <span className="badge badge-idempotency" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>
                <ShieldCheck size={12} /> {user.role}
              </span>
            </div>
            <button
              onClick={logout}
              className="btn btn-danger"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            >
              <LogOut size={16} />
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
