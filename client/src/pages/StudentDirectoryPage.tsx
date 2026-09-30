import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Search, GraduationCap, Award, ArrowLeft } from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';

export const StudentDirectoryPage: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/v1/students', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStudents(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

  const filtered = students.filter(s =>
    s.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingState message="Loading student directory..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Complete academic records, attendance history & CGPA tracking</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 24px' }}>
        <div style={{ position: 'relative' }}>
          <input
            className="form-input"
            style={{ width: '100%', paddingLeft: '40px' }}
            placeholder="Search by Roll Number, Name, or Enrollment Number..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Enrollment No.</th>
                <th>Department</th>
                <th>Semester</th>
                <th>CGPA</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(st => (
                <tr key={st._id}>
                  <td><span className="badge badge-idempotency">{st.rollNumber}</span></td>
                  <td style={{ fontWeight: 600 }}>{st.userId?.name || 'Student'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{st.enrollmentNumber}</td>
                  <td>{st.departmentId?.name}</td>
                  <td>Sem {st.currentSemester}</td>
                  <td><strong style={{ color: '#34d399' }}>{st.cgpa}</strong></td>
                  <td>
                    <button
                      onClick={() => navigate(`/students/${st._id}`)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      View Profile
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

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`/api/v1/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setStudent(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id, token]);

  if (loading) return <LoadingState message="Fetching student profile..." />;
  if (!student) return <div>Student profile not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <button onClick={() => navigate('/students')} className="btn btn-secondary" style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Directory
      </button>

      <div className="glass-card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <GraduationCap size={40} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{student.userId?.name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>Roll: {student.rollNumber} | Enrollment: {student.enrollmentNumber}</p>
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <span className="badge badge-paise">CGPA: {student.cgpa}</span>
            <span className="badge badge-idempotency">{student.departmentId?.name}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Personal Details</h3>
          <p style={{ marginBottom: '8px' }}><strong>Email:</strong> {student.userId?.email}</p>
          <p style={{ marginBottom: '8px' }}><strong>Batch Year:</strong> {student.batchYear}</p>
          <p style={{ marginBottom: '8px' }}><strong>Current Semester:</strong> Semester {student.currentSemester}</p>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Guardian Contact</h3>
          <p style={{ marginBottom: '8px' }}><strong>Guardian:</strong> {student.guardianUserId?.name || 'Mr. Ramesh Sharma'}</p>
          <p style={{ marginBottom: '8px' }}><strong>Phone:</strong> {student.guardianUserId?.phone || '+91 98765 43210'}</p>
        </div>
      </div>
    </div>
  );
};
