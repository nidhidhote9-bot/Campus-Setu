import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, RefreshCw, ShieldCheck, Activity } from 'lucide-react';
import { LoadingState, IdempotencyBadge } from '../components/BadgesAndStates';

export const SystemAdminPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/v1/system/audit-logs', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setLogs(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [token]);

  const handleResetDemo = async () => {
    if (!window.confirm('Are you sure you want to reset the disposable demo dataset? Existing demo data will be re-seeded.')) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/v1/system/reset-demo', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Demo dataset reset successfully!');
        fetchLogs();
      } else {
        alert(data.error || 'Reset failed.');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) return <LoadingState message="Loading system audit logs..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>System Administration & Controls</h1>
          <p style={{ color: 'var(--text-muted)' }}>Durable audit trail, system telemetry & disposable demo dataset reset</p>
        </div>
        <IdempotencyBadge label="ADMIN PRIVILEGED SCOPE" />
      </div>

      <div className="glass-card" style={{ borderColor: 'rgba(239, 68, 68, 0.4)' }}>
        <h3 style={{ marginBottom: '8px', color: '#f87171' }}>Reset Disposable Synthetic Demo Dataset</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
          Resets the local database to the baseline synthetic seed dataset covering all roles, departments, courses, exams, fees, and hostel rooms.
        </p>
        <button onClick={handleResetDemo} disabled={isResetting} className="btn btn-danger">
          <RefreshCw size={16} /> {isResetting ? 'Resetting Database...' : 'Reset Disposable Demo Data'}
        </button>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} style={{ color: '#6366f1' }} /> System Audit Trail Log
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Resource</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(lg => (
                <tr key={lg._id}>
                  <td><span className="badge badge-idempotency">{lg.action}</span></td>
                  <td>{lg.resource}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(lg.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
