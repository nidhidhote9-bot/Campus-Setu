import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { HeartHandshake, MessageSquareWarning, Bell, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LoadingState, SimulationBadge, IdempotencyBadge } from '../components/BadgesAndStates';

export const GuardianDashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Guardian / Parent Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Ward academic progress, attendance radar & direct fee payments</p>
        </div>
        <span className="badge badge-idempotency"><ShieldCheck size={14} /> GUARDIAN_WARD_SCOPE</span>
      </div>

      <div className="glass-card" style={{ borderColor: 'rgba(99, 102, 241, 0.4)' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Ward Profile: Aarav Sharma (Roll: CSE-2024-001)</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Delhi Institute of Technology & Science | Semester 4 CSE</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Current CGPA</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>8.80</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Class Attendance Rate</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8' }}>88.5%</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fee Status</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399' }}>PAID</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const GrievancePage: React.FC = () => {
  const { token } = useAuth();
  const [grievances, setGrievances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('ACADEMIC');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchGrievances = async () => {
    try {
      const res = await fetch('/api/v1/support/grievances', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setGrievances(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrievances();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/support/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ category, subject, description, isAnonymous })
      });
      if (res.ok) {
        setSubject(''); setDescription('');
        setSubmitted(true);
        fetchGrievances();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading grievance desk..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Grievance & Helpdesk Desk</h1>
        <p style={{ color: 'var(--text-muted)' }}>Ticketing system with confidential/anonymous submit mode & escalation matrix</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Submit New Grievance Ticket</h3>
        {submitted && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '8px', marginBottom: '16px' }}>
            Grievance ticket logged successfully.
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="HOSTEL">HOSTEL</option>
                <option value="FINANCIAL">FINANCIAL</option>
                <option value="ANTI_RAGGING">ANTI_RAGGING</option>
                <option value="FACILITIES">FACILITIES</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-input" value={subject} onChange={e => setSubject(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea className="form-textarea" rows={3} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
              <span>Submit Anonymously (Identity redacted from logs)</span>
            </label>
            <button type="submit" className="btn btn-primary">Submit Ticket</button>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Logged Tickets</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Subject</th>
                <th>Complainant</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {grievances.map(g => (
                <tr key={g._id}>
                  <td><span className="badge badge-idempotency">{g.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{g.subject}</td>
                  <td>{g.isAnonymous ? <span className="badge badge-evaluation">ANONYMOUS</span> : (g.userId?.name || 'Student')}</td>
                  <td><span className="badge badge-paise">{g.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const NoticeBoardPage: React.FC = () => {
  const { token } = useAuth();
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch('/api/v1/notices', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setNotices(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, [token]);

  if (loading) return <LoadingState message="Loading notice board..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Campus Notice Board & Outbox</h1>
          <p style={{ color: 'var(--text-muted)' }}>Official circular publisher with SMS/WhatsApp notification dispatch</p>
        </div>
        <SimulationBadge label="SMS/WHATSAPP DISPATCH SIMULATION" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {notices.map(n => (
          <div key={n._id} className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{n.title}</h3>
              <span className="badge badge-idempotency">{n.targetRole}</span>
            </div>
            <p style={{ color: 'var(--text-main)', marginBottom: '16px' }}>{n.content}</p>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Published by {n.publishedBy?.name || 'Administrator'} on {new Date(n.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
