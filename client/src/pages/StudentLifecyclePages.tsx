import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  GraduationCap,
  Calendar,
  FileText,
  CreditCard,
  UserCheck,
  Award,
  AlertCircle,
  CheckCircle2,
  Lock,
  Download,
  Eye,
  RefreshCw,
  Plus,
  Send,
  Building,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { LoadingState, SimulationBadge } from '../components/BadgesAndStates';

export const StudentOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [student360, setStudent360] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/v1/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) handleFetch360(data[0]._id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleFetch360 = async (id: string) => {
    setSelectedStudentId(id);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/students/360/${id}`);
      const data = await res.json();
      if (res.ok) setStudent360(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Directory & Student 360 Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Live student summaries, unified 360 view composing academics, fees & lifecycle events</p>
        </div>
        <SimulationBadge label="STUDENT 360 UNIFIED RECORD" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' }}>
        {/* Student Directory List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3>Student Directory ({students.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '600px' }}>
            {students.map(s => (
              <div
                key={s._id}
                onClick={() => handleFetch360(s._id)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: selectedStudentId === s._id ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))' : 'rgba(15, 23, 42, 0.5)',
                  border: selectedStudentId === s._id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{(s.userId as any)?.name || 'Student'}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Roll: {s.rollNumber} | Sem {s.currentSemester}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', alignItems: 'center' }}>
                  <span className="badge badge-idempotency" style={{ fontSize: '0.7rem' }}>{s.enrollmentNumber}</span>
                  <span className="badge badge-paise" style={{ fontSize: '0.7rem' }}>{s.status || 'ACTIVE'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student 360 Detail View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {loading && <LoadingState message="Composing Student 360 unified facts..." />}

          {student360 && !loading && (
            <>
              {/* Profile Card Header */}
              <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                      {student360.student.userId?.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{student360.student.userId?.name}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {student360.student.departmentId?.name} | Batch {student360.student.batchYear} | Semester {student360.student.currentSemester}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <span className="badge badge-idempotency">IURN: {student360.student.rollNumber}</span>
                        <span className="badge badge-idempotency">IUEN: {student360.student.enrollmentNumber}</span>
                        <span className="badge badge-paise">STATUS: {student360.lifecycle.status}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399' }}>{student360.academics.cgpa}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cumulative CGPA</div>
                  </div>
                </div>
              </div>

              {/* Grid Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Fee Paid / Total Balance</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{student360.finance.formattedPaid}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Pending Balance: {student360.finance.formattedBalance}</div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Attendance Average</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#34d399' }}>{student360.attendance.attendancePct}%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Present: {student360.attendance.presentClasses} / {student360.attendance.totalClasses} Classes</div>
                </div>

                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Credits Earned</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>{student360.academics.totalCreditsEarned} Credits</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Exam Marksheets: {student360.academics.markSheets.length}</div>
                </div>
              </div>

              {/* Scoped Facts Tabs (Academics, Fees, Facilities, Requests) */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px' }}>Academics & Grade History</h3>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Exam Name</th>
                        <th>Course</th>
                        <th>Marks Obtained</th>
                        <th>Max Marks</th>
                        <th>Grade</th>
                        <th>Finalized</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student360.academics.markSheets.map((ms: any) => (
                        <tr key={ms._id}>
                          <td>{ms.examId?.name || 'Mid-Term Exam'}</td>
                          <td style={{ fontWeight: 600 }}>{ms.courseId?.name || 'Data Structures'} ({ms.courseId?.code})</td>
                          <td><strong>{ms.marksObtained}</strong></td>
                          <td>{ms.maxMarks}</td>
                          <td><span className="badge badge-paise">{ms.grade}</span></td>
                          <td>{ms.isFinalized ? <span className="badge badge-paise">LOCKED</span> : <span className="badge badge-high">DRAFT</span>}</td>
                        </tr>
                      ))}

                      {student360.academics.markSheets.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No exam marksheets recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Fee Transaction Ledger History */}
              <div className="glass-card">
                <h3 style={{ marginBottom: '16px' }}>Fee Collection & Payment Ledger</h3>
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Txn Reference</th>
                        <th>Receipt No</th>
                        <th>Fee Type</th>
                        <th>Payment Mode</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {student360.finance.transactions.map((t: any) => (
                        <tr key={t._id}>
                          <td><code>{t.transactionId}</code></td>
                          <td style={{ fontWeight: 600 }}>{t.receiptNumber}</td>
                          <td>{t.feeType}</td>
                          <td>{t.paymentMode}</td>
                          <td><strong>₹{(t.amountPaise / 100).toFixed(2)}</strong></td>
                          <td><span className="badge badge-paise">{t.status}</span></td>
                        </tr>
                      ))}

                      {student360.finance.transactions.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No fee payments recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const StudentProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('102 Park Avenue, Sector 15, New Delhi');
  const [reason, setReason] = useState('Change of residence address & updated phone number');
  const [requests, setRequests] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');

  const loadRequestsAndDocs = () => {
    if (user?.studentId) {
      fetch(`/api/v1/students/documents/${user.studentId}`)
        .then(res => res.json())
        .then(data => { if (Array.isArray(data)) setDocuments(data); })
        .catch(err => console.error(err));
    }
  };

  useEffect(() => {
    loadRequestsAndDocs();
  }, [user]);

  const handleCreateRequest = async () => {
    try {
      const payload = {
        studentId: user?.studentId || '600000000000000000000020',
        requestedChanges: { phone, address },
        reason
      };

      const res = await fetch('/api/v1/students/profile-change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setRequests([data, ...requests]);
      setMessage('Profile change request submitted to Administrator for approval!');
    } catch (err: any) {
      setMessage(`Request Error: ${err.message}`);
    }
  };

  const handleSelfApproveAttempt = async (reqId: string) => {
    try {
      const res = await fetch(`/api/v1/students/profile-change-requests/${reqId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: 'Attempting self approval' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
    } catch (err: any) {
      setMessage(`Self-Approval Security Gate Triggered: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Profile, ID Card & Document Locker</h1>
        <p style={{ color: 'var(--text-muted)' }}>Profile correction request workspace, digital ID preview & private document locker</p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: message.includes('Forbidden') || message.includes('Triggered') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Profile Correction Request Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3>Request Profile Correction</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Governance Gate: Profile updates require administrator approval. Student self-approval is rejected.
          </p>

          <div>
            <label className="form-label">New Contact Phone Number</label>
            <input type="text" className="form-input" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div>
            <label className="form-label">New Residential Address</label>
            <input type="text" className="form-input" value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div>
            <label className="form-label">Justification Reason</label>
            <textarea className="form-input" rows={2} value={reason} onChange={e => setReason(e.target.value)} />
          </div>

          <button onClick={handleCreateRequest} className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            <Send size={16} /> Submit Correction Request
          </button>

          {requests.length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h4>My Change Requests</h4>
              {requests.map(r => (
                <div key={r._id} style={{ padding: '10px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '6px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>Reason: {r.reason}</strong>
                    <span className="badge badge-paise">{r.status}</span>
                  </div>
                  {r.status === 'PENDING' && (
                    <button onClick={() => handleSelfApproveAttempt(r._id)} className="btn btn-secondary" style={{ padding: '2px 6px', fontSize: '0.7rem', marginTop: '6px' }}>
                      Test Self Approval (Should Fail 403)
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Digital Campus Student ID Card Preview */}
        <div className="glass-card" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 800, letterSpacing: '0.05em', color: 'var(--accent-color)' }}>DELHI INSTITUTE OF TECH & SCIENCE</div>
              <ShieldCheck size={20} color="#34d399" />
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', fontWeight: 800 }}>
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{user?.name || 'Aarav Sharma'}</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>B.Tech Computer Science</div>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '4px' }}>Roll No: CSE-2024-001</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '8px' }}>
              <div><strong>Enrollment ID:</strong> ENR2024001</div>
              <div><strong>Valid Until:</strong> MAY 2028</div>
              <div><strong>Blood Group:</strong> O+ POSITIVE</div>
              <div><strong>Emergency:</strong> +91 98765 43210</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OFFICIAL DIGITAL CAMPUS PASS</span>
            <button onClick={() => alert('Digital ID Card PDF Download Initiated')} className="btn btn-secondary">
              <Download size={14} /> Download ID Card PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StudentLifecyclePage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [gradCheck, setGradCheck] = useState<any | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) setSelectedStudentId(data[0]._id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleProgressTerm = async () => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch('/api/v1/students/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId, reason: 'Regular term progression' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`Term Progressed! Student now in Semester ${data.currentSemester}`);
    } catch (err: any) {
      setMessage(`Progress Error: ${err.message}`);
    }
  };

  const handleTransfer = async () => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch('/api/v1/students/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: selectedStudentId, transferReason: 'Inter-university migration' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`Student Transferred! Status updated to 'TRANSFERRED'. Past results & fee receipts preserved in DB.`);
    } catch (err: any) {
      setMessage(`Transfer Error: ${err.message}`);
    }
  };

  const handleRunGradCheck = async () => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch(`/api/v1/students/graduation-check/${selectedStudentId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGradCheck(data);
      setMessage(`Graduation Check Complete: Total Credits ${data.totalCredits}/${data.requiredCredits}, Fee Clearance: ${data.feeClearance ? 'YES' : 'NO'}`);
    } catch (err: any) {
      setMessage(`Check Error: ${err.message}`);
    }
  };

  const handleGraduate = async () => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch(`/api/v1/students/graduate/${selectedStudentId}`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`Student Successfully Graduated & Converted to Alumni Profile! Degree Certificate No: ${data.graduationRecord.degreeCertificateNumber}`);
    } catch (err: any) {
      setMessage(`Graduation Error: ${err.message}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Lifecycle, Progression & Graduation Desk</h1>
        <p style={{ color: 'var(--text-muted)' }}>Term progression, subject enrollment, authorized transfer/withdrawal & graduation clearance checks</p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: message.includes('Error') || message.includes('failed') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.9rem' }}>
          {message}
        </div>
      )}

      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3>Select Student for Lifecycle Operations</h3>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select className="form-input" style={{ maxWidth: '400px' }} value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
            {students.map(s => (
              <option key={s._id} value={s._id}>
                {(s.userId as any)?.name} ({s.rollNumber}) - Sem {s.currentSemester} [{s.status || 'ACTIVE'}]
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
          <button onClick={handleProgressTerm} className="btn btn-primary">
            <GraduationCap size={16} /> Progress Term (+1 Semester)
          </button>
          <button onClick={handleTransfer} className="btn btn-secondary">
            Transfer Student (Preserve History)
          </button>
          <button onClick={handleRunGradCheck} className="btn btn-secondary">
            Run Graduation Clearance Check
          </button>
          <button onClick={handleGraduate} className="btn btn-primary" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
            <Award size={16} /> Graduate & Convert to Alumni
          </button>
        </div>

        {gradCheck && (
          <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <h4>Graduation Clearance Evaluation Report</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '12px', fontSize: '0.85rem' }}>
              <div><strong>Credits Earned:</strong> {gradCheck.totalCredits} / {gradCheck.requiredCredits}</div>
              <div><strong>Fee Clearance:</strong> {gradCheck.feeClearance ? <span className="badge badge-paise">PAID IN FULL</span> : <span className="badge badge-high">BALANCE DUE</span>}</div>
              <div><strong>Library Clearance:</strong> {gradCheck.libraryClearance ? <span className="badge badge-paise">CLEARED</span> : <span className="badge badge-high">DUES</span>}</div>
              <div><strong>Eligibility Result:</strong> {gradCheck.isEligible ? <span className="badge badge-paise">ELIGIBLE FOR DEGREE</span> : <span className="badge badge-high">INELIGIBLE</span>}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AlumniDirectoryPage: React.FC = () => {
  const [alumniList, setAlumniList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/alumni')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlumniList(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Alumni Profile & Service Eligibility</h1>
        <p style={{ color: 'var(--text-muted)' }}>Graduated alumni directory, current organization, and portal service eligibility</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Alumni Directory & Network ({alumniList.length})</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Alumni Name</th>
                <th>Graduation Year</th>
                <th>Current Organization</th>
                <th>Designation</th>
                <th>Service Eligibility</th>
              </tr>
            </thead>
            <tbody>
              {alumniList.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 600 }}>{(a.userId as any)?.name || 'Alumni Scholar'}</td>
                  <td><span className="badge badge-idempotency">{a.graduationYear}</span></td>
                  <td>{a.currentCompany}</td>
                  <td>{a.designation}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <span className="badge badge-paise" style={{ fontSize: '0.7rem' }}>LIBRARY ACCESS</span>
                      <span className="badge badge-paise" style={{ fontSize: '0.7rem' }}>TRANSCRIPTS</span>
                    </div>
                  </td>
                </tr>
              ))}

              {alumniList.length === 0 && (
                <>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Vikramaditya Rao</td>
                    <td><span className="badge badge-idempotency">2024</span></td>
                    <td>Microsoft India</td>
                    <td>Senior Software Engineer</td>
                    <td>
                      <span className="badge badge-paise" style={{ fontSize: '0.7rem' }}>LIBRARY & TRANSCRIPT ELIGIBLE</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Neha Verma</td>
                    <td><span className="badge badge-idempotency">2025</span></td>
                    <td>Amazon Web Services</td>
                    <td>Solutions Architect</td>
                    <td>
                      <span className="badge badge-paise" style={{ fontSize: '0.7rem' }}>CAREER SUPPORT ELIGIBLE</span>
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
