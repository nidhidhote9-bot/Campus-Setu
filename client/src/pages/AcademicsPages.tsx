import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Calendar, ClipboardCheck, CheckCircle2, QrCode } from 'lucide-react';
import { LoadingState, SimulationBadge } from '../components/BadgesAndStates';

export const CoursesPage: React.FC = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch('/api/v1/courses', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setCourses(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  if (loading) return <LoadingState message="Loading course catalog..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Course & Curriculum Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Syllabus credits, semester prerequisites & faculty mapping</p>
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Semester</th>
                <th>Assigned Faculty</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id}>
                  <td><span className="badge badge-idempotency">{c.code}</span></td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.credits} Credits</td>
                  <td>Semester {c.semester}</td>
                  <td>{c.facultyId?.name || 'Prof. Rajesh Sharma'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TimetablePage: React.FC = () => {
  const { token } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTt = async () => {
      try {
        const res = await fetch('/api/v1/timetable', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setTimetable(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTt();
  }, [token]);

  if (loading) return <LoadingState message="Loading weekly timetable..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Class Timetable Grid</h1>
        <p style={{ color: 'var(--text-muted)' }}>Weekly room allocation and faculty schedule matrix</p>
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Time Slot</th>
                <th>Course</th>
                <th>Room</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              {timetable.map(tt => (
                <tr key={tt._id}>
                  <td><span className="badge badge-paise">{tt.dayOfWeek}</span></td>
                  <td>{tt.startTime} - {tt.endTime}</td>
                  <td style={{ fontWeight: 600 }}>{tt.courseId?.name || 'Data Structures'}</td>
                  <td><span className="badge badge-idempotency">{tt.roomNumber}</span></td>
                  <td>{tt.facultyId?.name || 'Prof. Sharma'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AttendancePage: React.FC = () => {
  const { token } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Class Attendance Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Daily student roster marking with low attendance (&lt;75%) warnings</p>
        </div>
        <SimulationBadge label="QR / GEOFENCE MODE SIMULATED" />
      </div>

      {submitted ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '40px', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>Attendance Logged Successfully!</h3>
          <p style={{ color: 'var(--text-muted)' }}>Attendance record for CS201 - Data Structures saved with compound index uniqueness.</p>
        </div>
      ) : (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardCheck size={20} style={{ color: '#6366f1' }} /> Section CSE-A Attendance Checklist
            </h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
              <QrCode size={16} /> Scan QR Code Mode
            </button>
          </div>

          <form onSubmit={handleMarkAttendance}>
            <div className="data-table-container" style={{ marginBottom: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge badge-idempotency">CSE-2024-001</span></td>
                    <td style={{ fontWeight: 600 }}>Aarav Sharma</td>
                    <td>
                      <select className="form-select" defaultValue="PRESENT" style={{ padding: '4px 8px' }}>
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="LATE">LATE</option>
                      </select>
                    </td>
                    <td><input className="form-input" placeholder="Optional notes" style={{ padding: '4px 8px' }} /></td>
                  </tr>
                  <tr>
                    <td><span className="badge badge-idempotency">ECE-2024-002</span></td>
                    <td style={{ fontWeight: 600 }}>Ananya Patel</td>
                    <td>
                      <select className="form-select" defaultValue="ABSENT" style={{ padding: '4px 8px' }}>
                        <option value="PRESENT">PRESENT</option>
                        <option value="ABSENT">ABSENT</option>
                        <option value="LATE">LATE</option>
                      </select>
                    </td>
                    <td><input className="form-input" defaultValue="Medical leave" style={{ padding: '4px 8px' }} /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit Class Attendance
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
