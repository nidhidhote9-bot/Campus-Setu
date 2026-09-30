import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext';
import { Users, IndianRupee, Briefcase, Award, Activity, RefreshCw } from 'lucide-react';
import { IdempotencyBadge, SimulationBadge, LoadingState } from '../components/BadgesAndStates';

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useI18n();

  const [metrics, setMetrics] = useState<any>(null);
  const [outbox, setOutbox] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, oRes] = await Promise.all([
        fetch('/api/v1/analytics/dashboard-summary', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/system/outbox', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (mRes.ok) setMetrics(await mRes.json());
      if (oRes.ok) setOutbox(await oRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  if (loading) return <LoadingState message="Fetching system telemetry..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('dashboard')} Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name} ({user?.role})</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <IdempotencyBadge />
          <SimulationBadge />
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('totalStudents')}</span>
            <Users size={22} style={{ color: '#6366f1' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{metrics?.totalStudents || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#10b981' }}>+12% vs last semester</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('feeCollected')}</span>
            <IndianRupee size={22} style={{ color: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>{metrics?.formattedFeeCollected || '₹0.00'}</div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enforced in Integer Paise</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('activeDrives')}</span>
            <Briefcase size={22} style={{ color: '#06b6d4' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{metrics?.activeDrives || 0}</div>
          <span style={{ fontSize: '0.75rem', color: '#22d3ee' }}>Avg package ₹12 LPA</span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{t('attendanceAvg')}</span>
            <Award size={22} style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{metrics?.attendanceAvg || '85.0%'}</div>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>Above threshold</span>
        </div>
      </div>

      {/* Outbox Feed */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Durable Event Outbox & Audit Queue</h2>
          </div>
          <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            <RefreshCw size={14} /> Refresh Feed
          </button>
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Attempts</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {outbox.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No outbox events queued.</td>
                </tr>
              ) : (
                outbox.map((evt) => (
                  <tr key={evt.eventId}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{evt.eventId}</td>
                    <td><span className="badge badge-idempotency">{evt.eventType}</span></td>
                    <td><span className="badge badge-paise">{evt.status}</span></td>
                    <td>{evt.attempts}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(evt.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
