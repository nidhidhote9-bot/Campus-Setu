import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@shared/index';
import { Users, UserPlus, Link, ShieldCheck } from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';

export const UsersPage: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<UserRole>(UserRole.FACULTY);
  const [phone, setPhone] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/students', { headers: { Authorization: `Bearer ${token}` } });
      // Also fetch users profile directory
      const uRes = await fetch('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, phone })
      });
      if (res.ok) {
        setShowModal(false);
        setName(''); setEmail(''); setPhone('');
        alert('Account created successfully');
        fetchUsers();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading system users..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>User & RBAC Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Role-based user directory, password hashes & guardian grants</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <UserPlus size={18} /> Provision User
        </button>
      </div>

      {showModal && (
        <div className="glass-card" style={{ borderColor: 'var(--primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>Provision System User</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Default Password</label>
              <input className="form-input" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Create User Account</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} style={{ color: '#6366f1' }} /> Enrolled Students & Guardian Mappings
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Linked Guardian</th>
                <th>Security Scope</th>
              </tr>
            </thead>
            <tbody>
              {users.map(st => (
                <tr key={st._id}>
                  <td><span className="badge badge-idempotency">{st.rollNumber}</span></td>
                  <td style={{ fontWeight: 600 }}>{st.userId?.name || 'Student'}</td>
                  <td>{st.userId?.email}</td>
                  <td>{st.departmentId?.name}</td>
                  <td>Sem {st.currentSemester}</td>
                  <td>
                    {st.guardianUserId ? (
                      <span className="badge badge-paise"><Link size={12} /> {st.guardianUserId.name}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unlinked</span>
                    )}
                  </td>
                  <td><span className="badge badge-simulation"><ShieldCheck size={12} /> STUDENT_SELF_SCOPE</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
