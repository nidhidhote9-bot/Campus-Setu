import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingState, EmptyState } from '../components/BadgesAndStates';
import { UserRole, ExamCycleStatus, ExamStudentCategory, ExamApplicationStatus, EligibilityStatus, formatPaiseToRupees } from '@shared/index';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  Printer,
  ShieldCheck,
  Award,
  ChevronRight,
  Filter,
  RefreshCw,
  PlusCircle,
  Eye,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ExternalLink,
  QrCode
} from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#CBD5E1';

  if (['OPEN', 'APPLICATION_OPEN', 'APPROVED', 'HALL_TICKET_ISSUED', 'ELIGIBLE', 'PAID'].includes(status)) {
    bg = '#ECFDF5';
    color = '#065F46';
    border = '#A7F3D0';
  } else if (['REJECTED', 'INELIGIBLE', 'CLOSED', 'CONCLUDED'].includes(status)) {
    bg = '#FEF2F2';
    color = '#991B1B';
    border = '#FECACA';
  } else if (['SUBMITTED', 'UNDER_REVIEW', 'PENDING', 'REVIEW'].includes(status)) {
    bg = '#FFFBEB';
    color = '#92400E';
    border = '#FDE68A';
  } else if (['CONDITIONAL_EXCEPTION', 'EXCEPTION_APPROVED'].includes(status)) {
    bg = '#EEF2FF';
    color = '#3730A3';
    border = '#C7D2FE';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 10px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: bg,
      color: color,
      border: `1px solid ${border}`
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

// ==========================================
// 1. EXAM CYCLES & POLICY PAGE (/app/exam-applications/cycles)
// ==========================================
export const ExamCyclesPage: React.FC = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showPolicyModal, setShowPolicyModal] = useState<boolean>(false);
  const [selectedCycle, setSelectedCycle] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    code: 'WIN2026',
    name: 'Winter 2026 Regular & Backlog Examinations',
    academicYear: '2026-2027',
    semester: 4,
    startDate: '2026-11-20',
    endDate: '2026-12-10',
    applicationStartDate: '2026-09-01',
    applicationEndDate: '2026-10-31',
    status: ExamCycleStatus.APPLICATION_OPEN
  });

  const [policyData, setPolicyData] = useState({
    minAttendancePercentage: 75,
    requireFeeClearance: true,
    feePerSubjectPaise: 50000,
    lateFeeChargePaise: 20000,
    allowBacklog: true,
    allowPrivate: false
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchCycles();
  }, []);

  const fetchCycles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/exam-applications/cycles', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCycles(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/exam-applications/cycles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create exam cycle');
      setSuccessMsg(`Exam Cycle ${data.code} successfully initialized with default v1 policy.`);
      setShowCreateModal(false);
      fetchCycles();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) return;
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/exam-applications/cycles/${selectedCycle._id}/policy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(policyData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update policy');
      setSuccessMsg(`Policy Version ${data.version} activated for ${selectedCycle.name}.`);
      setShowPolicyModal(false);
      fetchCycles();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Examination Cycles & Policy Engine
          </h1>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '0.9rem' }}>
            Configure regular, backlog, and private candidate examination windows, prerequisites, and evaluation policies.
          </p>
        </div>
        {[UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user?.role as UserRole) && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            <PlusCircle size={18} />
            Create Exam Cycle
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading university examination cycles..." />
      ) : cycles.length === 0 ? (
        <EmptyState title="No Exam Cycles Found" subtitle="Create an exam cycle to open student registration windows." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {cycles.map((cycle) => {
            const policy = cycle.policy || {};
            const isWindowOpen = new Date().toISOString().split('T')[0] >= cycle.applicationStartDate &&
              new Date().toISOString().split('T')[0] <= cycle.applicationEndDate;

            return (
              <div
                key={cycle._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                        {cycle.code}
                      </span>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginTop: '8px', marginBottom: '4px' }}>
                        {cycle.name}
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>
                        Academic Year: <strong>{cycle.academicYear}</strong> • Semester: <strong>{cycle.semester}</strong>
                      </p>
                    </div>
                    <StatusBadge status={cycle.status} />
                  </div>

                  <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px', margin: '14px 0', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Application Window:</span>
                      <span style={{ fontWeight: 600, color: isWindowOpen ? '#059669' : '#DC2626' }}>
                        {cycle.applicationStartDate} to {cycle.applicationEndDate}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Exam Run Window:</span>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>
                        {cycle.startDate} to {cycle.endDate}
                      </span>
                    </div>
                  </div>

                  {/* Policy Summary */}
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px', marginTop: '12px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Policy v{policy.version || 1} Safeguards
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                      <div>Attendance: <strong>≥ {policy.minAttendancePercentage ?? 75}%</strong></div>
                      <div>Fee Clearance: <strong>{policy.requireFeeClearance ? 'Required' : 'Waived'}</strong></div>
                      <div>Fee / Paper: <strong>{formatPaiseToRupees(policy.feePerSubjectPaise || 50000)}</strong></div>
                      <div>Backlog Allowed: <strong>{policy.allowBacklog ? 'Yes' : 'No'}</strong></div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                  {[UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user?.role as UserRole) && (
                    <button
                      onClick={() => {
                        setSelectedCycle(cycle);
                        setPolicyData({
                          minAttendancePercentage: policy.minAttendancePercentage ?? 75,
                          requireFeeClearance: policy.requireFeeClearance ?? true,
                          feePerSubjectPaise: policy.feePerSubjectPaise ?? 50000,
                          lateFeeChargePaise: policy.lateFeeChargePaise ?? 20000,
                          allowBacklog: policy.allowBacklog ?? true,
                          allowPrivate: policy.allowPrivate ?? false
                        });
                        setShowPolicyModal(true);
                      }}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        background: '#FFFFFF',
                        color: '#334155',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Update Policy
                    </button>
                  )}
                  <a
                    href={`/app/exam-applications/apply?cycleId=${cycle._id}`}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: '#2563EB',
                      color: '#FFFFFF',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      textDecoration: 'none'
                    }}
                  >
                    Register Papers
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Cycle Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '540px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
              Create New Examination Cycle
            </h2>
            <form onSubmit={handleCreateCycle} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Cycle Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Cycle Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Application Start</label>
                  <input
                    type="date"
                    required
                    value={formData.applicationStartDate}
                    onChange={(e) => setFormData({ ...formData, applicationStartDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Application End</label>
                  <input
                    type="date"
                    required
                    value={formData.applicationEndDate}
                    onChange={(e) => setFormData({ ...formData, applicationEndDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Exam Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>Exam End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Policy Modal */}
      {showPolicyModal && selectedCycle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
              Configure Policy for {selectedCycle.code}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
              Policies are strictly versioned. Updating creates a new immutable policy record.
            </p>
            <form onSubmit={handleUpdatePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Minimum Attendance Threshold (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={policyData.minAttendancePercentage}
                  onChange={(e) => setPolicyData({ ...policyData, minAttendancePercentage: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Fee Per Subject (Paise: 50000 = ₹500)
                </label>
                <input
                  type="number"
                  min="0"
                  value={policyData.feePerSubjectPaise}
                  onChange={(e) => setPolicyData({ ...policyData, feePerSubjectPaise: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '8px 0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={policyData.requireFeeClearance}
                    onChange={(e) => setPolicyData({ ...policyData, requireFeeClearance: e.target.checked })}
                  />
                  <strong>Enforce Institutional Fee Clearance (M10 Prerequisite)</strong>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={policyData.allowBacklog}
                    onChange={(e) => setPolicyData({ ...policyData, allowBacklog: e.target.checked })}
                  />
                  Allow Backlog / Arrear Paper Registrations
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={policyData.allowPrivate}
                    onChange={(e) => setPolicyData({ ...policyData, allowPrivate: e.target.checked })}
                  />
                  Allow Private / External Candidate Applications
                </label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowPolicyModal(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save New Version
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. STUDENT EXAM APPLY WIZARD (/app/exam-applications/apply)
// ==========================================
export const StudentExamApplyPage: React.FC = () => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [eligibility, setEligibility] = useState<any | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [category, setCategory] = useState<ExamStudentCategory>(ExamStudentCategory.REGULAR);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [cycleRes, courseRes] = await Promise.all([
        fetch('/api/v1/exam-applications/cycles', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      const cyclesData = await cycleRes.json();
      const coursesData = await courseRes.json();
      setCycles(cyclesData);
      setCourses(coursesData);

      if (cyclesData.length > 0) {
        setSelectedCycleId(cyclesData[0]._id);
      }

      if (user?.studentId) {
        fetchStudentApplications(user.studentId);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentApplications = async (sId: string) => {
    try {
      const res = await fetch(`/api/v1/exam-applications/student/${sId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setMyApplications(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedCycleId && user?.studentId) {
      evaluateEligibility(selectedCycleId, user.studentId);
    }
  }, [selectedCycleId, user]);

  const evaluateEligibility = async (cycleId: string, sId: string) => {
    try {
      const res = await fetch(`/api/v1/exam-applications/eligibility/${cycleId}/${sId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setEligibility(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const toggleCourse = (id: string) => {
    if (selectedCourses.includes(id)) {
      setSelectedCourses(selectedCourses.filter(c => c !== id));
    } else {
      setSelectedCourses([...selectedCourses, id]);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedCycleId || !user?.studentId) return;
    if (selectedCourses.length === 0) {
      setErrorMsg('Please select at least one course / paper for examination registration.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/exam-applications/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cycleId: selectedCycleId,
          studentId: user.studentId,
          category,
          subjectIds: selectedCourses
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');
      setSuccessMsg(`Application ${data.applicationNumber} submitted successfully! Examination review pending.`);
      fetchStudentApplications(user.studentId);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayFee = async (appId: string) => {
    try {
      const res = await fetch(`/api/v1/exam-applications/${appId}/pay`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Fee payment processing failed');
      setSuccessMsg('Examination registration fee marked as PAID. Ready for hall ticket issuance!');
      if (user?.studentId) fetchStudentApplications(user.studentId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const selectedCycle = cycles.find(c => c._id === selectedCycleId);
  const feePerPaper = selectedCycle?.policy?.feePerSubjectPaise || 50000;
  const totalFeePaise = selectedCourses.length * feePerPaper;

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
          Student Examination Application Wizard
        </h1>
        <p style={{ color: '#64748B', marginTop: '4px', fontSize: '0.9rem' }}>
          Evaluate prerequisites, select exam papers, settle registration fee, and monitor approval status.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <LoadingState message="Checking student eligibility status..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Column: Application Form */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: '16px' }}>
              Step 1: Select Examination Cycle & Category
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Target Exam Cycle
                </label>
                <select
                  value={selectedCycleId}
                  onChange={(e) => setSelectedCycleId(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem' }}
                >
                  {cycles.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Candidate Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExamStudentCategory)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.9rem' }}
                >
                  <option value={ExamStudentCategory.REGULAR}>REGULAR</option>
                  <option value={ExamStudentCategory.BACKLOG}>BACKLOG / ARREAR</option>
                  <option value={ExamStudentCategory.PRIVATE}>PRIVATE CANDIDATE</option>
                </select>
              </div>
            </div>

            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
              Step 2: Choose Valid Examination Papers
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '12px' }}>
              Select the course papers you are registering for in this cycle.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {courses.map((course) => {
                const isChecked = selectedCourses.includes(course._id);
                return (
                  <div
                    key={course._id}
                    onClick={() => toggleCourse(course._id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      border: isChecked ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      background: isChecked ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#1E293B', fontSize: '0.9rem' }}>
                          <span style={{ color: '#2563EB', marginRight: '6px' }}>[{course.code}]</span>
                          {course.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Credits: {course.credits || 4} • Semester: {course.semester || 4}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                      {formatPaiseToRupees(feePerPaper)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fee summary & Action */}
            <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Selected: <strong>{selectedCourses.length} papers</strong>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B' }}>
                  Total Fee: {formatPaiseToRupees(totalFeePaise)}
                </div>
              </div>
              <button
                onClick={handleSubmitApplication}
                disabled={submitting || (eligibility?.overallStatus === EligibilityStatus.INELIGIBLE && !eligibility?.hasException)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  background: (eligibility?.overallStatus === EligibilityStatus.INELIGIBLE && !eligibility?.hasException) ? '#CBD5E1' : '#2563EB',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  border: 'none',
                  cursor: (eligibility?.overallStatus === EligibilityStatus.INELIGIBLE && !eligibility?.hasException) ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: Real-time Eligibility Breakdown & Applications */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Eligibility Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={18} color="#2563EB" />
                  Prerequisite Eligibility Check
                </h3>
                {eligibility && <StatusBadge status={eligibility.overallStatus} />}
              </div>

              {eligibility ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Attendance Compliance:</span>
                    <span style={{ fontWeight: 600, color: eligibility.attendancePercentage >= 75 ? '#059669' : '#DC2626' }}>
                      {eligibility.attendancePercentage}% (Min. 75%)
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
                    <span style={{ color: '#64748B' }}>Institutional Fee Clearance:</span>
                    <span style={{ fontWeight: 600, color: eligibility.feeCleared ? '#059669' : '#DC2626' }}>
                      {eligibility.feeCleared ? 'Cleared (Nil Arrears)' : 'Outstanding Arrears'}
                    </span>
                  </div>

                  {eligibility.hasException && (
                    <div style={{ background: '#EEF2FF', border: '1px solid #C7D2FE', borderRadius: '6px', padding: '10px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3730A3', fontWeight: 700, fontSize: '0.8rem' }}>
                        <Award size={16} />
                        Audited Academic Exception Granted
                      </div>
                      <p style={{ margin: '4px 0 0 0', color: '#4338CA', fontSize: '0.75rem' }}>
                        Reason: {eligibility.exceptionReason || 'Exemption granted by Controller of Examinations'}
                      </p>
                    </div>
                  )}

                  {eligibility.ineligibilityReasons && eligibility.ineligibilityReasons.length > 0 && !eligibility.hasException && (
                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '6px', padding: '10px', marginTop: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#991B1B', fontWeight: 700, fontSize: '0.8rem' }}>
                        <AlertTriangle size={16} />
                        Registration Blocked:
                      </div>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0, color: '#B91C1C', fontSize: '0.75rem' }}>
                        {eligibility.ineligibilityReasons.map((r: string, idx: number) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#64748B' }}>Select an exam cycle to calculate eligibility.</p>
              )}
            </div>

            {/* My Submissions Card */}
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1E293B', marginBottom: '14px' }}>
                My Exam Applications
              </h3>
              {myApplications.length === 0 ? (
                <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>No previous exam applications submitted.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {myApplications.map((app) => (
                    <div key={app._id} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>{app.applicationNumber}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Cycle: <strong>{app.cycleId?.code || 'CYCLE'}</strong></span>
                        <span>Fee: <strong>{formatPaiseToRupees(app.feeAmountPaise)}</strong> ({app.feePaid ? 'Paid' : 'Unpaid'})</span>
                      </div>

                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        {!app.feePaid && app.feeAmountPaise > 0 && (
                          <button
                            onClick={() => handlePayFee(app._id)}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              background: '#10B981',
                              color: '#FFF',
                              border: 'none',
                              borderRadius: '4px',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            Pay Registration Fee
                          </button>
                        )}
                        {app.hallTicket && (
                          <a
                            href={`/app/exam-applications/hall-tickets?ticketId=${app.hallTicket._id}`}
                            style={{
                              flex: 1,
                              textAlign: 'center',
                              padding: '6px 10px',
                              background: '#EFF6FF',
                              color: '#2563EB',
                              border: '1px solid #BFDBFE',
                              borderRadius: '4px',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              textDecoration: 'none'
                            }}
                          >
                            View Hall Ticket
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. EXAM REVIEW QUEUE & EXCEPTIONS PAGE (/app/exam-applications/review)
// ==========================================
export const ExamReviewQueuePage: React.FC = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [showExceptionModal, setShowExceptionModal] = useState<boolean>(false);
  const [exceptionReason, setExceptionReason] = useState<string>('Verified medical documentation on record. Council resolution AC-2026/89');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/exam-applications/review', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setQueue(data);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (appId: string, decision: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/v1/exam-applications/review/${appId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ decision })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review application');
      setSuccessMsg(`Application marked as ${decision}. Exam enrollment updated.`);
      fetchReviewQueue();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleGrantException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    try {
      const res = await fetch('/api/v1/exam-applications/exceptions/grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          reason: exceptionReason,
          overrideAttendance: true,
          overrideFee: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to grant exception');
      setSuccessMsg(`Audited exception granted for application ${selectedApp.applicationNumber}.`);
      setShowExceptionModal(false);
      fetchReviewQueue();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const filteredQueue = queue.filter(item => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Examination Office Review Queue
          </h1>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '0.9rem' }}>
            Review candidate applications, verify attendance and fee compliance, grant audited exceptions, and approve enrollments.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="HALL_TICKET_ISSUED">HALL TICKET ISSUED</option>
          </select>
          <button
            onClick={fetchReviewQueue}
            style={{ padding: '8px 14px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading review queue..." />
      ) : filteredQueue.length === 0 ? (
        <EmptyState title="Queue Empty" subtitle="No candidate applications match the selected filter." />
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', fontWeight: 700 }}>
                <th style={{ padding: '12px 16px' }}>Application #</th>
                <th style={{ padding: '12px 16px' }}>Candidate</th>
                <th style={{ padding: '12px 16px' }}>Cycle</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Papers</th>
                <th style={{ padding: '12px 16px' }}>Prerequisites</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueue.map((app) => {
                const sName = app.studentId?.userId?.name || app.studentId?.rollNumber || 'Candidate';
                const elig = app.eligibility;
                return (
                  <tr key={app._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1E293B' }}>
                      {app.applicationNumber}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1E293B' }}>{sName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Roll: {app.studentId?.rollNumber || 'Unassigned'}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {app.cycleId?.code || 'WIN2026'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#F1F5F9', borderRadius: '4px', fontWeight: 600 }}>
                        {app.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#1E293B', fontWeight: 600 }}>
                      {app.subjectIds?.length || 0} papers
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {elig?.hasException ? (
                        <span style={{ fontSize: '0.75rem', color: '#4338CA', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Exception Active
                        </span>
                      ) : elig?.overallStatus === 'ELIGIBLE' ? (
                        <span style={{ fontSize: '0.75rem', color: '#059669', background: '#ECFDF5', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Prerequisites Met
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#DC2626', background: '#FEF2F2', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                          Ineligible
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={app.status} />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        {app.status === 'SUBMITTED' && (
                          <>
                            <button
                              onClick={() => handleReview(app._id, 'APPROVE')}
                              style={{ padding: '6px 10px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReview(app._id, 'REJECT')}
                              style={{ padding: '6px 10px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowExceptionModal(true);
                          }}
                          style={{ padding: '6px 10px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Exception
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Exception Grant Modal */}
      {showExceptionModal && selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#FFFFFF', borderRadius: '12px', width: '100%', maxWidth: '520px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
              Grant Audited Examination Exception
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
              For Application <strong>{selectedApp.applicationNumber}</strong>. An official audit log entry will be created.
            </p>
            <form onSubmit={handleGrantException} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Authorized Exemption Justification / Council Resolution
                </label>
                <textarea
                  required
                  rows={3}
                  value={exceptionReason}
                  onChange={(e) => setExceptionReason(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: '6px', fontSize: '0.85rem' }}
                />
              </div>
              <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
                ✓ Overrides minimum attendance gate (M08)<br />
                ✓ Overrides institutional fee clearance gate (M10)<br />
                ✓ Logs actor: <strong>{user?.name || 'CONTROLLER_OF_EXAMINATIONS'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowExceptionModal(false)}
                  style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#2563EB', color: '#FFF', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm & Audit Exception
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. HALL TICKETS & ROLL NUMBER ASSIGNMENT PAGE (/app/exam-applications/hall-tickets)
// ==========================================
export const HallTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [hallTickets, setHallTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchHallTickets();
  }, [user]);

  const fetchHallTickets = async () => {
    setLoading(true);
    try {
      if (user?.role === UserRole.STUDENT && user?.studentId) {
        const res = await fetch(`/api/v1/exam-applications/student/${user.studentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const tickets = data.filter((a: any) => a.hallTicket).map((a: any) => a.hallTicket);
        setHallTickets(tickets);
        if (tickets.length > 0) setSelectedTicket(tickets[0]);
      } else {
        // Staff/Admin view: fetch all via review queue
        const res = await fetch('/api/v1/exam-applications/review', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        const tickets = data.filter((a: any) => a.hallTicket).map((a: any) => a.hallTicket);
        setHallTickets(tickets);
        if (tickets.length > 0) setSelectedTicket(tickets[0]);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Examination Hall Tickets & Roll Numbers
          </h1>
          <p style={{ color: '#64748B', marginTop: '4px', fontSize: '0.9rem' }}>
            Roll-number assignment, verified seating admit cards, timetable paper roster, and QR authentication.
          </p>
        </div>
        {selectedTicket && (
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Printer size={18} />
            Print / Save Hall Ticket
          </button>
        )}
      </div>

      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading hall tickets..." />
      ) : hallTickets.length === 0 ? (
        <EmptyState title="No Hall Tickets Issued" subtitle="Once examination applications are approved and fees are cleared, official admit cards will appear here." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: hallTickets.length > 1 ? '320px 1fr' : '1fr', gap: '24px' }}>
          {/* Ticket Selector sidebar if multiple tickets */}
          {hallTickets.length > 1 && (
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px' }}>
                Issued Admit Cards
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hallTickets.map(t => (
                  <div
                    key={t._id}
                    onClick={() => setSelectedTicket(t)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: selectedTicket?._id === t._id ? '2px solid #2563EB' : '1px solid #E2E8F0',
                      background: selectedTicket?._id === t._id ? '#EFF6FF' : '#FFFFFF',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#1E293B', fontSize: '0.85rem' }}>{t.ticketNumber}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Roll: {t.rollNumber}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Hall Ticket Document Card */}
          {selectedTicket && (
            <div
              className="hall-ticket-printable"
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                border: '2px solid #0F172A',
                padding: '32px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
              }}
            >
              {/* Institution Header */}
              <div style={{ textAlign: 'center', borderBottom: '2px solid #E2E8F0', paddingBottom: '16px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Delhi Institute of Technology & Science
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                  OFFICE OF THE CONTROLLER OF EXAMINATIONS • OFFICIAL ADMISSION TICKET
                </div>
                <div style={{ display: 'inline-block', marginTop: '10px', padding: '4px 14px', background: '#F1F5F9', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#1E293B' }}>
                  WINTER 2026 REGULAR / BACKLOG EXAMINATIONS
                </div>
              </div>

              {/* Candidate Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '20px', marginBottom: '24px', alignItems: 'center' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: '#64748B' }}>Ticket Number:</span><br />
                    <strong style={{ color: '#0F172A', fontSize: '0.95rem' }}>{selectedTicket.ticketNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Exam Roll Number:</span><br />
                    <strong style={{ color: '#2563EB', fontSize: '1.05rem' }}>{selectedTicket.rollNumber}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Center Code:</span><br />
                    <strong>{selectedTicket.centerCode}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B' }}>Reporting Time:</span><br />
                    <strong>{selectedTicket.reportingTime}</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: '#64748B' }}>Assigned Center:</span><br />
                    <strong>{selectedTicket.centerName}</strong>
                  </div>
                </div>

                {/* QR Code Verification Simulation */}
                <div style={{ textAlign: 'center', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px', background: '#F8FAFC' }}>
                  <QrCode size={80} style={{ margin: '0 auto', color: '#0F172A' }} />
                  <div style={{ fontSize: '0.65rem', color: '#64748B', marginTop: '4px', fontWeight: 600 }}>
                    DIGITALLY VERIFIED
                  </div>
                </div>
              </div>

              {/* Paper Roster */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Authorized Examination Papers Roster
                </h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#F1F5F9', borderBottom: '1px solid #CBD5E1', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px' }}>Paper Code</th>
                      <th style={{ padding: '8px 12px' }}>Course Title</th>
                      <th style={{ padding: '8px 12px' }}>Date</th>
                      <th style={{ padding: '8px 12px' }}>Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTicket.papers || []).map((paper: any, idx: number) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#2563EB' }}>
                          {paper.subjectCode}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, color: '#1E293B' }}>
                          {paper.subjectName}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          {paper.examDate}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#475569' }}>
                          {paper.examTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions and Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px dashed #CBD5E1', paddingTop: '16px', fontSize: '0.75rem', color: '#64748B' }}>
                <div style={{ maxWidth: '60%' }}>
                  <strong>Important Instructions for Candidates:</strong>
                  <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    <li>Admit card along with valid student ID card is mandatory for entry.</li>
                    <li>Candidates must occupy allotted seats 15 minutes before exam commencement.</li>
                    <li>Electronic gadgets and unauthorized paper materials are strictly prohibited.</li>
                  </ol>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontStyle: 'italic', marginBottom: '4px' }}>
                    Dr. S. K. Mahapatra
                  </div>
                  <div style={{ borderTop: '1px solid #0F172A', paddingTop: '2px', fontWeight: 600, color: '#334155' }}>
                    Controller of Examinations
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
