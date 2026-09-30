import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingState, EmptyState, ForbiddenState } from '../components/BadgesAndStates';
import { AttendanceStatus, UserRole } from '@shared/index';
import {
  ClipboardCheck,
  AlertCircle,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  Download,
  AlertTriangle
} from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bg = 'rgba(255,255,255,0.1)';
  let color = 'var(--text-muted)';

  if (status === 'PRESENT' || status === 'APPROVED' || status === 'COMPLETED') {
    bg = 'rgba(16, 185, 129, 0.15)';
    color = '#10B981';
  } else if (status === 'ABSENT' || status === 'REJECTED') {
    bg = 'rgba(239, 68, 68, 0.15)';
    color = '#EF4444';
  } else if (status === 'LATE' || status === 'PENDING') {
    bg = 'rgba(245, 158, 11, 0.15)';
    color = '#F59E0B';
  } else if (status === 'EXCUSED') {
    bg = 'rgba(99, 102, 241, 0.15)';
    color = '#6366F1';
  }

  return (
    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>
      {status}
    </span>
  );
};

// ==========================================
// 1. ATTENDANCE CAPTURE PAGE (/app/attendance/capture)
// ==========================================
export const AttendanceCapturePage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [section, setSection] = useState<string>('A');
  const [topicCovered, setTopicCovered] = useState<string>('Data Structures Graph Algorithms');
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceState, setAttendanceState] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [courseRes, studentRes, sessionRes] = await Promise.all([
        fetch('/api/v1/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/students', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/attendance/sessions', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);

      if (courseRes.ok && studentRes.ok) {
        const cData = await courseRes.json();
        const sData = await studentRes.json();
        setCourses(cData);
        setStudents(sData);

        if (cData.length > 0) setSelectedCourse(cData[0]._id);

        const initialMap: Record<string, AttendanceStatus> = {};
        sData.forEach((s: any) => {
          initialMap[s._id] = AttendanceStatus.PRESENT;
        });
        setAttendanceState(initialMap);
      }

      if (sessionRes.ok) {
        const sessData = await sessionRes.json();
        setSessionHistory(sessData);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceState(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    students.forEach(s => { updated[s._id] = status; });
    setAttendanceState(updated);
  };

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const entries = Object.entries(attendanceState).map(([sId, status]) => ({
        studentId: sId,
        status
      }));

      const payload = {
        institutionId: user?.institutionId || '100000000000000000000001',
        courseId: selectedCourse,
        section,
        date: sessionDate,
        topicCovered,
        entries
      };

      const res = await fetch('/api/v1/attendance/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to capture attendance');

      setSuccessMsg(`Attendance successfully recorded for ${data.recordedEntries} students!`);
      fetchInitialData();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading class roster & attendance sessions..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ClipboardCheck size={28} color="var(--primary-color)" /> Attendance Roster Capture
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Mark class session attendance for enrolled students. Restricted to assigned faculty and administrators.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', marginBottom: '20px', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444', marginBottom: '20px', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
        {/* Main Roster Panel */}
        <div className="card" style={{ padding: '24px' }}>
          <form onSubmit={handleSubmitAttendance}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 140px', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label className="form-label">Course Subject</label>
                <select className="form-input" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                  {courses.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Topic Covered</label>
                <input className="form-input" value={topicCovered} onChange={e => setTopicCovered(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Section</label>
                <select className="form-input" value={section} onChange={e => setSection(e.target.value)}>
                  <option value="A">Sec A</option>
                  <option value="B">Sec B</option>
                  <option value="C">Sec C</option>
                </select>
              </div>
              <div>
                <label className="form-label">Session Date</label>
                <input type="date" className="form-input" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', background: 'var(--surface-hover)', padding: '12px 16px', borderRadius: '8px' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                Class Roster ({students.length} Enrolled)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => markAll(AttendanceStatus.PRESENT)}>
                  Mark All Present
                </button>
                <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => markAll(AttendanceStatus.ABSENT)}>
                  Mark All Absent
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: '20px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status Selection</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => {
                    const status = attendanceState[student._id] || AttendanceStatus.PRESENT;
                    return (
                      <tr key={student._id}>
                        <td style={{ fontWeight: 700 }}>{student.rollNumber}</td>
                        <td>{student.userId?.name || 'Student Candidate'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                              { label: 'Present', val: AttendanceStatus.PRESENT, color: '#10B981' },
                              { label: 'Absent', val: AttendanceStatus.ABSENT, color: '#EF4444' },
                              { label: 'Late', val: AttendanceStatus.LATE, color: '#F59E0B' },
                              { label: 'Excused', val: AttendanceStatus.EXCUSED, color: '#6366F1' }
                            ].map((opt) => (
                              <button
                                key={opt.val}
                                type="button"
                                style={{
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  border: status === opt.val ? `2px solid ${opt.color}` : '1px solid var(--border-color)',
                                  background: status === opt.val ? `${opt.color}20` : 'transparent',
                                  color: status === opt.val ? opt.color : 'var(--text-muted)'
                                }}
                                onClick={() => handleStatusChange(student._id, opt.val)}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 700 }} disabled={saving}>
              {saving ? 'Recording Session...' : 'Submit Session Attendance'}
            </button>
          </form>
        </div>

        {/* Sidebar: Session History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Recent Conducted Sessions
            </h3>
            {sessionHistory.length === 0 ? (
              <EmptyState title="No Sessions Found" subtitle="No previous attendance sessions recorded." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sessionHistory.slice(0, 5).map((sess: any) => (
                  <div key={sess._id} style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', background: 'var(--surface-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-color)' }}>
                      {sess.courseId?.code || 'CRS'} - Sec {sess.section}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0' }}>
                      {sess.topicCovered || 'Regular Session'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>📅 {sess.date}</span>
                      <span style={{ color: '#10B981', fontWeight: 700 }}>COMPLETED</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. ATTENDANCE CORRECTIONS PAGE (/app/attendance/corrections)
// ==========================================
export const AttendanceCorrectionsPage: React.FC = () => {
  const { user } = useAuth();
  const [corrections, setCorrections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState<string>('Verified roll call register & medical note.');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Bulk Import state
  const [showBulkModal, setShowBulkModal] = useState<boolean>(false);
  const [bulkCsvText, setBulkCsvText] = useState<string>('CSE-2024-001,PRESENT\nECE-2024-002,EXCUSED');
  const [bulkCourseId, setBulkCourseId] = useState<string>('');
  const [bulkDate, setBulkDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchCorrections();
    fetchCourses();
  }, []);

  const fetchCorrections = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/attendance/corrections', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCorrections(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/v1/courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
        if (data.length > 0) setBulkCourseId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (correctionId: string, decision: 'APPROVED' | 'REJECTED') => {
    setActionLoading(correctionId);
    setMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/attendance/corrections/${correctionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ decision, reviewComments })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review correction');

      setMessage(`Correction ${decision.toLowerCase()} successfully! Prior value preserved in audit log.`);
      fetchCorrections();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setMessage(null);

    try {
      const lines = bulkCsvText.trim().split('\n');
      const records = lines.map(line => {
        const [rollNumber, status] = line.split(',');
        return {
          rollNumber: rollNumber?.trim() || '',
          status: (status?.trim() as AttendanceStatus) || AttendanceStatus.PRESENT
        };
      });

      const payload = {
        institutionId: user?.institutionId || '100000000000000000000001',
        courseId: bulkCourseId,
        sessionDate: bulkDate,
        records
      };

      const res = await fetch('/api/v1/attendance/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk upload failed');

      setMessage(`Bulk upload committed! ${data.recordedEntries} student records updated.`);
      setShowBulkModal(false);
      fetchCorrections();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading correction queue & requests..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={28} color="var(--primary-color)" /> Attendance Corrections & Bulk Upload
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Review student correction applications and import CSV roster attendance batches.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowBulkModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={18} /> Bulk CSV Upload
        </button>
      </div>

      {message && (
        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', marginBottom: '20px', fontWeight: 600 }}>
          ✓ {message}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444', marginBottom: '20px', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          Correction Review Queue ({corrections.length} Pending/Historical)
        </h3>

        {corrections.length === 0 ? (
          <EmptyState title="No Corrections Pending" subtitle="No attendance correction requests submitted." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Session Date</th>
                  <th>Prior Status</th>
                  <th>Requested Status</th>
                  <th>Reason Given</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {corrections.map((corr: any) => (
                  <tr key={corr._id}>
                    <td>
                      <div style={{ fontWeight: 700 }}>{corr.studentId?.userId?.name || 'Student Candidate'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{corr.studentId?.rollNumber}</div>
                    </td>
                    <td>{corr.sessionId?.date || '2026-09-29'}</td>
                    <td>
                      <StatusBadge status={corr.priorStatus} />
                    </td>
                    <td>
                      <StatusBadge status={corr.requestedStatus} />
                    </td>
                    <td style={{ maxWidth: '280px', fontSize: '0.85rem' }}>{corr.reason}</td>
                    <td>
                      <StatusBadge status={corr.status} />
                    </td>
                    <td>
                      {corr.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#10B981', borderColor: '#10B981' }}
                            onClick={() => handleReview(corr._id, 'APPROVED')}
                            disabled={actionLoading === corr._id}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', color: '#EF4444', borderColor: '#EF4444' }}
                            onClick={() => handleReview(corr._id, 'REJECTED')}
                            disabled={actionLoading === corr._id}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Reviewed by {corr.reviewedBy?.name || 'Officer'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '540px', padding: '24px', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Bulk CSV Roster Import
            </h2>
            <form onSubmit={handleBulkUploadSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Target Course</label>
                <select className="form-input" value={bulkCourseId} onChange={e => setBulkCourseId(e.target.value)} required>
                  {courses.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Session Date</label>
                <input type="date" className="form-input" value={bulkDate} onChange={e => setBulkDate(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Roster Lines (rollNumber, status)</label>
                <textarea
                  className="form-input"
                  rows={5}
                  value={bulkCsvText}
                  onChange={e => setBulkCsvText(e.target.value)}
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Format: RollNumber,Status (e.g. CSE-2024-001,PRESENT)
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Validate & Import Batch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. MY ATTENDANCE PAGE (/app/attendance/my-attendance)
// ==========================================
export const MyAttendancePage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [correctionReason, setCorrectionReason] = useState<string>('Present in class; absent entry recorded erroneously.');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [showCorrectionModal, setShowCorrectionModal] = useState<boolean>(false);
  const [requestedStatus, setRequestedStatus] = useState<AttendanceStatus>(AttendanceStatus.PRESENT);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMyAttendance();
  }, []);

  const fetchMyAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/attendance/my-attendance', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/attendance/corrections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          requestedStatus,
          reason: correctionReason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Correction request failed');

      setMessage('Correction application submitted! Pending faculty review.');
      setShowCorrectionModal(false);
      fetchMyAttendance();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <LoadingState message="Calculating attendance metrics & shortage rules..." />;
  if (!summary) return <ForbiddenState message="Could not retrieve attendance record." />;

  const pct = summary.overallPercentage || 0;
  const isShortage = summary.isShortage;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={28} color="var(--primary-color)" /> My Course Attendance & Shortage Status
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Live semester aggregate attendance, course breakdown, and correction filing.
        </p>
      </div>

      {message && (
        <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981', border: '1px solid #10B981', marginBottom: '20px', fontWeight: 600 }}>
          ✓ {message}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Overall Percentage</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: isShortage ? '#EF4444' : '#10B981', marginTop: '4px' }}>
            {pct}%
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Required Minimum: {summary.minRequired}%</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Total Conducted</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px' }}>
            {summary.totalSessions}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class Sessions</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Attended</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#10B981', marginTop: '4px' }}>
            {summary.presentCount + summary.lateCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{summary.presentCount} Present / {summary.lateCount} Late</span>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Absences & Excused</span>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: summary.absentCount > 0 ? '#EF4444' : '#6366F1', marginTop: '4px' }}>
            {summary.absentCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{summary.excusedCount} Medical/Duty Excused</span>
        </div>
      </div>

      {/* Shortage Explanation Alert */}
      {isShortage && (
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #EF4444', color: '#EF4444', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={32} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem' }}>ATTENDANCE SHORTAGE WARNING</div>
            <div style={{ fontSize: '0.85rem' }}>
              Your attendance ({pct}%) is below the statutory requirement of {summary.minRequired}%. You risk debarment from end-semester examinations unless approved duty leaves or medical corrections are submitted.
            </div>
          </div>
        </div>
      )}

      {/* Recent Class Entries */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          Recent Class Attendance Entries
        </h3>
        {summary.recentEntries.length === 0 ? (
          <EmptyState title="No Attendance Recorded" subtitle="No attendance sessions recorded for your profile yet." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session Date</th>
                  <th>Course Code</th>
                  <th>Topic Covered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentEntries.map((entry: any) => (
                  <tr key={entry._id}>
                    <td>{entry.date}</td>
                    <td style={{ fontWeight: 700 }}>{entry.courseId?.code || 'CRS'}</td>
                    <td>{entry.sessionId?.topicCovered || 'Regular Lecture'}</td>
                    <td>
                      <StatusBadge status={entry.status} />
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                        onClick={() => {
                          setSelectedSessionId(entry.sessionId?._id || entry.sessionId);
                          setShowCorrectionModal(true);
                        }}
                      >
                        Request Correction
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Correction Modal */}
      {showCorrectionModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              Submit Attendance Correction
            </h3>
            <form onSubmit={handleCorrectionSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label">Requested Status</label>
                <select className="form-input" value={requestedStatus} onChange={e => setRequestedStatus(e.target.value as AttendanceStatus)}>
                  <option value={AttendanceStatus.PRESENT}>PRESENT</option>
                  <option value={AttendanceStatus.EXCUSED}>EXCUSED (Medical/Duty)</option>
                  <option value={AttendanceStatus.LATE}>LATE</option>
                </select>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label className="form-label">Explanation & Reason</label>
                <textarea className="form-input" rows={4} value={correctionReason} onChange={e => setCorrectionReason(e.target.value)} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCorrectionModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. ATTENDANCE REPORTS PAGE (/app/attendance/reports)
// ==========================================
export const AttendanceReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/attendance/reports?institutionId=${user?.institutionId || '100000000000000000000001'}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Generating attendance analytics & report metrics..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileSpreadsheet size={28} color="var(--primary-color)" /> Attendance Analytics & Scoped Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Institutional attendance averages, shortage tracking, and exportable reports.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => alert('Exporting attendance report as CSV/PDF...')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={18} /> Download Scoped Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Overall Institution Average</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '8px' }}>
            {reports?.overallAverage || 0}%
          </div>
          <span style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: 600 }}>Calculated across all active sections</span>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Conducted Sessions</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>
            {reports?.totalSessions || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified session logs</span>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700 }}>Pending Correction Requests</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#F59E0B', marginTop: '8px' }}>
            {reports?.pendingCorrectionsCount || 0}
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Awaiting review</span>
        </div>
      </div>
    </div>
  );
};
