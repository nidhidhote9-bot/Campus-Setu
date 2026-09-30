import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Plus, Layers } from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';

export const InstitutionsPage: React.FC = () => {
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const [iRes, dRes] = await Promise.all([
        fetch('/api/v1/institutions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/v1/departments', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (iRes.ok) setInstitutions(await iRes.json());
      if (dRes.ok) setDepartments(await dRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [token]);

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code, name, address, contactEmail: email, contactPhone: phone })
      });
      if (res.ok) {
        setShowModal(false);
        setCode(''); setName(''); setAddress(''); setEmail(''); setPhone('');
        fetchItems();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading institutions & departments..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Institution & Department Manager</h1>
          <p style={{ color: 'var(--text-muted)' }}>Multi-tenant campus configuration and department mapping</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add Institution
        </button>
      </div>

      {showModal && (
        <div className="glass-card" style={{ borderColor: 'var(--primary)' }}>
          <h3 style={{ marginBottom: '16px' }}>Register New Campus Institution</h3>
          <form onSubmit={handleCreateInstitution} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Institution Code (e.g. DITS)</label>
              <input className="form-input" value={code} onChange={e => setCode(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Address</label>
              <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Institution</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building2 size={20} style={{ color: '#6366f1' }} /> Active Campus Institutions
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Contact Email</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map(inst => (
                <tr key={inst._id}>
                  <td><span className="badge badge-idempotency">{inst.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{inst.name}</td>
                  <td>{inst.contactEmail}</td>
                  <td>{inst.contactPhone}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{inst.address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={20} style={{ color: '#06b6d4' }} /> Department Mapping
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Department Code</th>
                <th>Department Name</th>
                <th>Institution</th>
                <th>HOD</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(dep => (
                <tr key={dep._id}>
                  <td><span className="badge badge-simulation">{dep.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{dep.name}</td>
                  <td>{dep.institutionId?.name || 'DITS'}</td>
                  <td>{dep.headOfDepartmentId?.name || 'Prof. Rajesh Sharma'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
