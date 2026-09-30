import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCheck, Upload, CheckCircle2, ShieldCheck } from 'lucide-react';
import { IdempotencyBadge, SimulationBadge } from '../components/BadgesAndStates';

export const AdmissionsPage: React.FC = () => {
  const { token } = useAuth();

  const [name, setName] = useState('Rohan Sen');
  const [email, setEmail] = useState('rohan.sen@example.com');
  const [phone, setPhone] = useState('+91 98112 34567');
  const [department, setDepartment] = useState('CSE');
  const [submitted, setSubmitted] = useState(false);
  const [digilockerVerified, setDigilockerVerified] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Admissions Portal</h1>
          <p style={{ color: 'var(--text-muted)' }}>Online application form, DigiLocker verification & fee payment</p>
        </div>
        <SimulationBadge label="DIGILOCKER API SIMULATION" />
      </div>

      {submitted ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '48px', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <CheckCircle2 size={56} style={{ color: '#10b981', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Application Submitted Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Your application reference is <strong>APP-2026-9921</strong>. Verified via DigiLocker.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <IdempotencyBadge label="FEE PAID: ₹1,000.00 (100000 PAISE)" />
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} style={{ color: '#6366f1' }} /> Applicant Enrollment Form
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Full Candidate Name</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Target Department</label>
              <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="CSE">Computer Science & Engineering</option>
                <option value="ECE">Electronics & Communication</option>
                <option value="ME">Mechanical Engineering</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Academic Document Verification</label>
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                textAlign: 'center',
                background: 'rgba(15, 23, 42, 0.4)'
              }}>
                <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Class 12th Marksheet & Aadhaar Card</p>
                {digilockerVerified && (
                  <span className="badge badge-paise">
                    <ShieldCheck size={14} /> DIGILOCKER VERIFIED (GOVT OF INDIA)
                  </span>
                )}
              </div>
            </div>

            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Application Fee: </span>
                <strong style={{ fontSize: '1.1rem', color: '#34d399' }}>₹1,000.00 (100000 Paise)</strong>
              </div>
              <button type="submit" className="btn btn-primary">
                Pay Application Fee & Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const AdmissionReviewPage: React.FC = () => {
  const applications = [
    { id: 'APP-2026-9921', name: 'Rohan Sen', email: 'rohan.sen@example.com', dep: 'CSE', score: '94.2%', status: 'VERIFIED' },
    { id: 'APP-2026-9922', name: 'Kavya Verma', email: 'kavya.v@example.com', dep: 'ECE', score: '89.5%', status: 'UNDER_REVIEW' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Admissions Review & Seat Allocation</h1>
        <p style={{ color: 'var(--text-muted)' }}>Verification checklist, seat offers & enrollment issuance</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Pending Applications</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>Candidate</th>
                <th>Email</th>
                <th>Department</th>
                <th>Academic Score</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td><span className="badge badge-idempotency">{app.id}</span></td>
                  <td style={{ fontWeight: 600 }}>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.dep}</td>
                  <td><strong style={{ color: '#34d399' }}>{app.score}</strong></td>
                  <td><span className="badge badge-paise">{app.status}</span></td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => alert(`Seat allocated for ${app.name}!`)}>
                      Allocate Seat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
