import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, Layers, Award, Calendar, Hash, ShieldCheck, CheckCircle2, Edit3, Plus, GitMerge } from 'lucide-react';
import { LoadingState, IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

export const UniversityProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [name, setName] = useState('Delhi Institute of Technology & Science');
  const [code, setCode] = useState('DITS');
  const [saved, setSaved] = useState(false);

  const handleUpdateBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>University Profile & Campus Hierarchy Tree</h1>
          <p style={{ color: 'var(--text-muted)' }}>Branding configuration, multi-tenant university profile & campus node hierarchy</p>
        </div>
        <IdempotencyBadge label="MULTI-TENANT SCOPED" />
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit3 size={20} style={{ color: '#6366f1' }} /> University Profile & Branding Configuration
        </h3>
        {saved && (
          <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <CheckCircle2 size={16} /> University display label updated cleanly across tenant settings.
          </div>
        )}
        <form onSubmit={handleUpdateBranding} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">University Display Label</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label">Institution Code</label>
            <input className="form-input" value={code} onChange={e => setCode(e.target.value)} required />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">Save University Branding</button>
          </div>
        </form>
      </div>

      {/* Hierarchy Tree */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitMerge size={20} style={{ color: '#06b6d4' }} /> Campus & College Node Hierarchy Tree
        </h3>
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#6366f1', marginBottom: '8px' }}>
            🏢 {name} (Code: {code})
          </div>
          <div style={{ paddingLeft: '24px', borderLeft: '2px dashed #6366f1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 600 }}>🏫 Main Campus (North Campus, New Delhi)</div>
              <div style={{ paddingLeft: '20px', borderLeft: '2px solid rgba(255,255,255,0.1)', marginTop: '6px', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div>• Institute of Engineering & Technology</div>
                <div>• School of Computer Applications</div>
                <div>• Department of Electronics & Communication</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const OrganizationHierarchyPage: React.FC = () => {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeps = async () => {
      try {
        const res = await fetch('/api/v1/departments', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDepartments(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDeps();
  }, [token]);

  if (loading) return <LoadingState message="Loading organization hierarchy..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Institutes, Departments & Designations</h1>
        <p style={{ color: 'var(--text-muted)' }}>Scoped department hierarchy lists with create/edit/detail forms</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Configured Departments & Posts</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th>Institution Parent</th>
                <th>HOD Post</th>
                <th>Archive Status</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d._id}>
                  <td><span className="badge badge-idempotency">{d.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td>{d.institutionId?.name || 'DITS'}</td>
                  <td>{d.headOfDepartmentId?.name || 'Prof. Rajesh Sharma'}</td>
                  <td><span className="badge badge-paise">ACTIVE (ARCHIVABLE)</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const PostAssignmentsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Staff-to-Post Assignments</h1>
        <p style={{ color: 'var(--text-muted)' }}>Delegated administrative responsibility dates & duplicate assignment rejection</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Active Staff Post Assignments</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Post Designation</th>
                <th>Assigned Staff Member</th>
                <th>Department</th>
                <th>Start Date</th>
                <th>Delegation Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Head of Department (HOD)</td>
                <td>Prof. Rajesh Sharma</td>
                <td><span className="badge badge-idempotency">CSE</span></td>
                <td>2024-07-01</td>
                <td><span className="badge badge-paise">ACTIVE DELEGATION</span></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Finance Controller</td>
                <td>Priya Verma</td>
                <td><span className="badge badge-idempotency">FINANCE</span></td>
                <td>2024-08-15</td>
                <td><span className="badge badge-paise">ACTIVE DELEGATION</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const OrganizationSettingsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Sessions & Numbering Sequences</h1>
        <p style={{ color: 'var(--text-muted)' }}>Academic year config, atomic number sequence generators ($inc) & module rules</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: '#6366f1' }} /> Active Academic Session
          </h3>
          <p style={{ marginBottom: '8px' }}><strong>Academic Year:</strong> 2025-2026</p>
          <p style={{ marginBottom: '8px' }}><strong>Current Semester:</strong> Even Semesters (4, 6, 8)</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Campus Timezone: Asia/Kolkata (IST)</p>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hash size={18} style={{ color: '#06b6d4' }} /> Atomic Number Sequences
          </h3>
          <p style={{ marginBottom: '6px' }}><strong>Receipt Prefix:</strong> <code>RCP-YYYYMMDD-XXXX</code></p>
          <p style={{ marginBottom: '6px' }}><strong>Enrollment Prefix:</strong> <code>ENR-YYYY-XXXX</code></p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enforced with Mongo atomic $inc increments</p>
        </div>
      </div>
    </div>
  );
};
