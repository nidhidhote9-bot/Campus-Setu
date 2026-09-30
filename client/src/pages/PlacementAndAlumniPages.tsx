import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Users2, IndianRupee, ExternalLink, CheckCircle2 } from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';
import { formatPaiseToRupees } from '@shared/index';

export const PlacementDrivesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [appliedDrives, setAppliedDrives] = useState<string[]>([]);

  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const res = await fetch('/api/v1/placement/drives', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setDrives(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, [token]);

  const handleApply = async (driveId: string) => {
    try {
      const studentId = user?.studentId || '600000000000000000000008';
      const res = await fetch('/api/v1/placement/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ driveId, studentId })
      });
      if (res.ok) {
        setAppliedDrives(prev => [...prev, driveId]);
        alert('Applied to placement drive successfully!');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to apply.');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <LoadingState message="Loading placement drives..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Training & Placement Cell</h1>
        <p style={{ color: 'var(--text-muted)' }}>Corporate recruitment drives, eligibility scanning & 1-click applications</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {drives.map(d => {
          const isApplied = appliedDrives.includes(d._id);
          return (
            <div key={d._id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{d.companyName}</h3>
                  <span className="badge badge-paise">{d.status}</span>
                </div>
                <h4 style={{ color: '#818cf8', marginBottom: '12px', fontSize: '1rem' }}>{d.jobTitle}</h4>
                <p style={{ marginBottom: '8px' }}>
                  <strong>Package:</strong> <span style={{ color: '#34d399', fontWeight: 700 }}>{formatPaiseToRupees(d.packageLpaPaise)}</span>
                </p>
                <p style={{ marginBottom: '8px' }}><strong>Eligibility Cutoff:</strong> Min CGPA {d.eligibilityMinCgpa}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Deadline: {d.deadline}</p>
              </div>

              <button
                onClick={() => handleApply(d._id)}
                disabled={isApplied}
                className={`btn ${isApplied ? 'btn-secondary' : 'btn-primary'}`}
                style={{ marginTop: '20px', width: '100%' }}
              >
                {isApplied ? (
                  <> <CheckCircle2 size={16} /> Application Submitted </>
                ) : (
                  <> Apply for Drive </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AlumniPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Alumni Network & Contributions</h1>
        <p style={{ color: 'var(--text-muted)' }}>Alumni directory, mentorship bookings & donation portal</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Distinguished Alumni Directory</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alumnus Name</th>
                <th>Graduation Year</th>
                <th>Company</th>
                <th>Designation</th>
                <th>LinkedIn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Vikram Roy</td>
                <td>Batch of 2018</td>
                <td><span className="badge badge-idempotency">Microsoft AI</span></td>
                <td>Senior Staff Engineer</td>
                <td><a href="#" style={{ color: '#818cf8' }}>Profile <ExternalLink size={12} /></a></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Megha Sen</td>
                <td>Batch of 2020</td>
                <td><span className="badge badge-idempotency">Amazon Web Services</span></td>
                <td>Solutions Architect</td>
                <td><a href="#" style={{ color: '#818cf8' }}>Profile <ExternalLink size={12} /></a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
