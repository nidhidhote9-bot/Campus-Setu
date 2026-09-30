import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingState, EmptyState } from '../components/BadgesAndStates';
import {
  UserRole,
  CenterVerificationStatus,
  ExamScheduleStatus,
  SeatingAllocationStatus,
  InvigilationDutyStatus,
  MaterialType,
  MaterialBatchStatus,
  MaterialMovementType
} from '@shared/index';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  Users,
  Box,
  Truck,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
  Search,
  Filter,
  RefreshCw,
  PlusCircle,
  Check,
  X,
  FileCheck,
  AlertTriangle,
  UserCheck,
  Sparkles,
  Layers,
  MapPin
} from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bg = '#F1F5F9';
  let color = '#475569';
  let border = '#CBD5E1';

  if (['ACTIVE', 'VERIFIED', 'PUBLISHED', 'ALLOCATED', 'ACKNOWLEDGED', 'COMPLETED', 'RECONCILED'].includes(status)) {
    bg = '#ECFDF5';
    color = '#065F46';
    border = '#A7F3D0';
  } else if (['REJECTED', 'CANCELLED', 'ABSENT', 'DECLINED', 'DISCREPANCY', 'DAMAGE_RECORD'].includes(status)) {
    bg = '#FEF2F2';
    color = '#991B1B';
    border = '#FECACA';
  } else if (['DRAFT', 'PENDING', 'ASSIGNED', 'IN_STOCK', 'DISPATCHED'].includes(status)) {
    bg = '#FFFBEB';
    color = '#92400E';
    border = '#FDE68A';
  } else if (['REALLOCATED', 'RESCHEDULED'].includes(status)) {
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
// 1. EXAM SCHEDULE & CONFLICT BUILDER (/app/exam-operations/schedule)
// ==========================================
export const ExamSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    cycleId: '',
    subjectId: '',
    centerId: '',
    roomIds: ['101'],
    examDate: '2026-11-20',
    startTime: '09:30',
    endTime: '12:30',
    session: 'MORNING' as 'MORNING' | 'AFTERNOON' | 'EVENING'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [cyclesRes, centersRes, coursesRes] = await Promise.all([
        fetch('/api/v1/exam-applications/cycles', { headers }),
        fetch('/api/v1/exam-operations/centers', { headers }),
        fetch('/api/v1/courses', { headers })
      ]);

      const cyclesData = await cyclesRes.json();
      const centersData = await centersRes.json();
      const coursesData = await coursesRes.json();

      setCycles(Array.isArray(cyclesData) ? cyclesData : []);
      setCenters(Array.isArray(centersData) ? centersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);

      const activeCycle = cyclesData[0]?._id || '';
      setSelectedCycleId(activeCycle);

      if (activeCycle) {
        const schedRes = await fetch(`/api/v1/exam-operations/schedule?cycleId=${activeCycle}`, { headers });
        const schedData = await schedRes.json();
        setSchedules(Array.isArray(schedData) ? schedData : []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load scheduling data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCycleChange = async (cId: string) => {
    setSelectedCycleId(cId);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/exam-operations/schedule?cycleId=${cId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...formData,
          cycleId: formData.cycleId || selectedCycleId,
          institutionId: user?.institutionId || 'INST-001'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create exam schedule');

      setSuccessMsg(`Exam schedule created successfully! Conflicts detected: ${data.conflicts?.length || 0}`);
      setShowCreateModal(false);
      handleCycleChange(formData.cycleId || selectedCycleId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handlePublishSchedule = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/exam-operations/schedule/${id}/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to publish schedule');
      setSuccessMsg('Exam timetable instance published for seating and invigilation assignment');
      handleCycleChange(selectedCycleId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
            <Calendar size={18} /> M12 EXAM OPERATIONS
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            Exam Timetable & Conflict Report
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>
            Multi-room examination scheduling with automated room conflict and student collision detection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
            }}
          >
            <PlusCircle size={16} /> Schedule Examination
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Cycle Filter Bar */}
      <div style={{ background: '#FFFFFF', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#334155' }}>Filter by Examination Cycle:</span>
        <select
          value={selectedCycleId}
          onChange={(e) => handleCycleChange(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF', minWidth: '240px' }}
        >
          {cycles.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} — {c.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => handleCycleChange(selectedCycleId)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '6px', background: '#F1F5F9', border: '1px solid #E2E8F0', fontSize: '0.875rem', color: '#475569', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Refresh Roster
        </button>
      </div>

      {/* Schedules List */}
      {loading ? (
        <LoadingState message="Loading timetable schedules..." />
      ) : schedules.length === 0 ? (
        <EmptyState title="No Exam Schedules" subtitle="No papers scheduled for this cycle yet. Click 'Schedule Examination' to begin." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
          {schedules.map((sched) => (
            <div
              key={sched._id}
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
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                    {sched.subjectCode}
                  </span>
                  <StatusBadge status={sched.status} />
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
                  {sched.subjectName}
                </h3>

                <div style={{ fontSize: '0.875rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="#64748B" />
                    <strong>Exam Date:</strong> {sched.examDate} ({sched.session})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={15} color="#64748B" />
                    <strong>Timing:</strong> {sched.startTime} – {sched.endTime}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={15} color="#64748B" />
                    <strong>Center:</strong> {sched.centerId?.name || 'Main Exam Complex'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={15} color="#64748B" />
                    <strong>Allocated Rooms:</strong> {sched.roomIds?.join(', ') || '101'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={15} color="#64748B" />
                    <strong>Enrolled Candidates:</strong> {sched.totalEnrolled || 2} Students
                  </div>
                </div>

                {/* Conflict Warnings */}
                {sched.conflicts && sched.conflicts.length > 0 && (
                  <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#92400E', fontWeight: 600, fontSize: '0.8125rem' }}>
                      <AlertTriangle size={15} /> Scheduling Conflicts Detected:
                    </div>
                    {sched.conflicts.map((conf: any, idx: number) => (
                      <div key={idx} style={{ fontSize: '0.75rem', color: '#78350F', marginTop: '4px' }}>
                        • {conf.description}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {sched.publishedAt ? `Published ${new Date(sched.publishedAt).toLocaleDateString()}` : 'Draft Status'}
                </span>
                {sched.status === ExamScheduleStatus.DRAFT && (
                  <button
                    onClick={() => handlePublishSchedule(sched._id)}
                    style={{
                      padding: '6px 14px',
                      background: '#10B981',
                      color: '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Publish Schedule
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Schedule Examination Paper</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '20px' }}>Assign date, session slot and venue rooms. Conflicts will be calculated automatically.</p>

            <form onSubmit={handleCreateSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Subject Paper</label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  <option value="">Select Course Subject</option>
                  {courses.map((crs) => (
                    <option key={crs._id} value={crs._id}>
                      {crs.code} — {crs.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Exam Center</label>
                <select
                  value={formData.centerId}
                  onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  <option value="">Select Center</option>
                  {centers.map((cnt) => (
                    <option key={cnt._id} value={cnt._id}>
                      {cnt.centerCode} — {cnt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Exam Date</label>
                  <input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Session</label>
                  <select
                    value={formData.session}
                    onChange={(e: any) => setFormData({ ...formData, session: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    <option value="MORNING">Morning (09:30 - 12:30)</option>
                    <option value="AFTERNOON">Afternoon (01:30 - 04:30)</option>
                    <option value="EVENING">Evening (05:00 - 08:00)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Schedule Paper
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
// 2. CENTERS, VERIFICATION & SEATING ALLOCATION (/app/exam-operations/centers)
// ==========================================
export const ExamCentersPage: React.FC = () => {
  const { user } = useAuth();
  const [centers, setCenters] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<any | null>(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');
  const [roomAllocations, setRoomAllocations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [showAllocateModal, setShowAllocateModal] = useState<boolean>(false);
  const [showReallocateModal, setShowReallocateModal] = useState<boolean>(false);
  const [allocationToReallocate, setAllocationToReallocate] = useState<any | null>(null);

  // Verification Form
  const [verifyForm, setVerifyForm] = useState({
    cctvFunctional: true,
    secureStorageAvailable: true,
    powerBackupAvailable: true,
    accessibilityCompliant: true,
    drinkingWaterAndWashrooms: true,
    remarks: 'Physical premises inspected and cleared for winter examinations'
  });

  // Allocation Form
  const [allocateForm, setAllocateForm] = useState({
    roomId: '101',
    studentIds: [] as string[]
  });

  // Reallocation Form
  const [reallocateForm, setReallocateForm] = useState({
    newRoomId: '103',
    reason: 'Air conditioning malfunction in initial room'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [centersRes, cyclesRes, studentsRes] = await Promise.all([
        fetch('/api/v1/exam-operations/centers', { headers }),
        fetch('/api/v1/exam-applications/cycles', { headers }),
        fetch('/api/v1/students', { headers })
      ]);

      const centersData = await centersRes.json();
      const cyclesData = await cyclesRes.json();
      const studentsData = await studentsRes.json();

      setCenters(Array.isArray(centersData) ? centersData : []);
      setCycles(Array.isArray(cyclesData) ? cyclesData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      if (centersData.length > 0) {
        setSelectedCenter(centersData[0]);
      }

      if (cyclesData.length > 0) {
        const schedRes = await fetch(`/api/v1/exam-operations/schedule?cycleId=${cyclesData[0]._id}`, { headers });
        const schedData = await schedRes.json();
        setSchedules(Array.isArray(schedData) ? schedData : []);
        if (schedData.length > 0) {
          setSelectedScheduleId(schedData[0]._id);
          fetchRoomAllocations(schedData[0]._id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load centers data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAllocations = async (schedId: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/v1/exam-operations/seating/schedule/${schedId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRoomAllocations(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerifyCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCenter || !cycles[0]) return;
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/centers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          centerId: selectedCenter._id,
          cycleId: cycles[0]._id,
          checklist: {
            cctvFunctional: verifyForm.cctvFunctional,
            secureStorageAvailable: verifyForm.secureStorageAvailable,
            powerBackupAvailable: verifyForm.powerBackupAvailable,
            accessibilityCompliant: verifyForm.accessibilityCompliant,
            drinkingWaterAndWashrooms: verifyForm.drinkingWaterAndWashrooms
          },
          remarks: verifyForm.remarks,
          status: 'VERIFIED'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record center verification');

      setSuccessMsg('Center verified successfully! Physical inspection checklist signed.');
      setShowVerifyModal(false);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleAllocateSeats = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !selectedCenter) return;
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/seating/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          cycleId: cycles[0]._id,
          scheduleId: selectedScheduleId,
          centerId: selectedCenter._id,
          roomId: allocateForm.roomId,
          studentIds: allocateForm.studentIds.length > 0 ? allocateForm.studentIds : [students[0]?._id]
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to allocate seats');

      setSuccessMsg(`Seating allocation confirmed for ${data.length} candidate(s)!`);
      setShowAllocateModal(false);
      fetchRoomAllocations(selectedScheduleId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleReallocateSeat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationToReallocate) return;
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/seating/reallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          allocationId: allocationToReallocate._id,
          newRoomId: reallocateForm.newRoomId,
          reason: reallocateForm.reason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reallocate candidate seat');

      setSuccessMsg(`Seat reallocated successfully to Room ${data.roomNumber} (${data.seatNumber})! Audit entry recorded.`);
      setShowReallocateModal(false);
      fetchRoomAllocations(selectedScheduleId);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
            <Building size={18} /> M12 CENTERS & ROOMS
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            Center Verification & Seating Allocation
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>
            Manage exam halls, execute physical readiness inspections, and allocate room capacity without overruns.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setShowVerifyModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#059669',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ShieldCheck size={16} /> Verify Center Readiness
          </button>
          <button
            onClick={() => setShowAllocateModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#2563EB',
              color: '#FFFFFF',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Users size={16} /> Allocate Seating
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Center Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {centers.map((cnt) => (
          <div
            key={cnt._id}
            onClick={() => setSelectedCenter(cnt)}
            style={{
              background: '#FFFFFF',
              borderRadius: '12px',
              border: selectedCenter?._id === cnt._id ? '2px solid #2563EB' : '1px solid #E2E8F0',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                {cnt.centerCode}
              </span>
              <StatusBadge status={cnt.status} />
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0F172A', marginBottom: '6px' }}>{cnt.name}</h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748B', marginBottom: '12px' }}>{cnt.address}</p>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: '#334155', borderTop: '1px solid #F1F5F9', paddingTop: '10px' }}>
              <span>Total Capacity: <strong>{cnt.totalCapacity} Seats</strong></span>
              <span>Available Rooms: <strong>{cnt.rooms?.length || 0} Halls</strong></span>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Center Rooms & Live Capacity Matrix */}
      {selectedCenter && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>
            Room Capacity Matrix — {selectedCenter.name}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {selectedCenter.rooms?.map((rm: any) => {
              const allocatedInRoom = roomAllocations.filter(a => a.roomId === rm.roomId).length;
              const pct = Math.min(Math.round((allocatedInRoom / rm.capacity) * 100), 100);
              const isOver = allocatedInRoom >= rm.capacity;

              return (
                <div key={rm.roomId} style={{ border: '1px solid #E2E8F0', borderRadius: '8px', padding: '14px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1E293B' }}>Room {rm.roomNumber}</span>
                    <span style={{ fontSize: '0.75rem', color: isOver ? '#DC2626' : '#059669', fontWeight: 600 }}>
                      {allocatedInRoom} / {rm.capacity} Allocated
                    </span>
                  </div>

                  <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '9999px', overflow: 'hidden', marginBottom: '10px' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: isOver ? '#EF4444' : '#2563EB', transition: 'width 0.3s' }} />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
                    <span>Floor: {rm.floor}</span>
                    <span>•</span>
                    <span>{rm.hasCCTV ? 'CCTV Monitored' : 'No CCTV'}</span>
                    <span>•</span>
                    <span>{rm.isAccessible ? 'Accessible' : 'Standard'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seating Roster & Reallocation Queue */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A' }}>Active Seating Allocations</h2>
            <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>Select schedule paper to view designated seat assignments and perform audited reallocations.</p>
          </div>

          <select
            value={selectedScheduleId}
            onChange={(e) => {
              setSelectedScheduleId(e.target.value);
              fetchRoomAllocations(e.target.value);
            }}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem', background: '#FFFFFF' }}
          >
            {schedules.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectCode} — {s.examDate} ({s.startTime})
              </option>
            ))}
          </select>
        </div>

        {roomAllocations.length === 0 ? (
          <EmptyState title="No Seats Allocated" subtitle="No candidates allocated to this schedule yet. Click 'Allocate Seating' to map student rolls." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Seat Number</th>
                  <th style={{ padding: '12px 16px' }}>Room</th>
                  <th style={{ padding: '12px 16px' }}>Roll Number</th>
                  <th style={{ padding: '12px 16px' }}>Candidate Name</th>
                  <th style={{ padding: '12px 16px' }}>Allocated At</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roomAllocations.map((alloc) => (
                  <tr key={alloc._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#2563EB' }}>{alloc.seatNumber}</td>
                    <td style={{ padding: '12px 16px' }}>Room {alloc.roomNumber}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace' }}>{alloc.studentRollNumber}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{alloc.studentName}</td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>{new Date(alloc.allocatedAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={alloc.status} /></td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setAllocationToReallocate(alloc);
                          setShowReallocateModal(true);
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#F1F5F9',
                          border: '1px solid #CBD5E1',
                          fontSize: '0.8125rem',
                          color: '#334155',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        <ArrowRightLeft size={13} /> Reallocate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verify Center Modal */}
      {showVerifyModal && selectedCenter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Physical Inspection Checklist — {selectedCenter.name}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '18px' }}>
              Confirm all prerequisite physical facilities are verified according to university guidelines.
            </p>

            <form onSubmit={handleVerifyCenter} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { key: 'cctvFunctional', label: 'CCTV Surveillance & Remote Recording Functional' },
                { key: 'secureStorageAvailable', label: 'Double-Locked Strong Room for Answer Books Available' },
                { key: 'powerBackupAvailable', label: 'Dedicated Generator / Uninterrupted Power Backup' },
                { key: 'accessibilityCompliant', label: 'Ramps / Wheelchair Accessible Exam Halls' },
                { key: 'drinkingWaterAndWashrooms', label: 'Clean Drinking Water & Sanitation Facilities Inspected' }
              ].map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', color: '#1E293B', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(verifyForm as any)[item.key]}
                    onChange={(e) => setVerifyForm({ ...verifyForm, [item.key]: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#2563EB' }}
                  />
                  {item.label}
                </label>
              ))}

              <div style={{ marginTop: '8px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Inspection Remarks</label>
                <textarea
                  value={verifyForm.remarks}
                  onChange={(e) => setVerifyForm({ ...verifyForm, remarks: e.target.value })}
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#059669', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Confirm & Certify Center
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {showAllocateModal && selectedCenter && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Allocate Candidate Seats</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '18px' }}>Map enrolled candidates to available hall capacity.</p>

            <form onSubmit={handleAllocateSeats} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Select Hall Room</label>
                <select
                  value={allocateForm.roomId}
                  onChange={(e) => setAllocateForm({ ...allocateForm, roomId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  {selectedCenter.rooms?.map((r: any) => (
                    <option key={r.roomId} value={r.roomId}>
                      Room {r.roomNumber} (Capacity: {r.capacity} Seats)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Candidate Students</label>
                <div style={{ maxHeight: '160px', overflowY: 'auto', border: '1px solid #E2E8F0', borderRadius: '6px', padding: '8px' }}>
                  {students.map((st) => (
                    <label key={st._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', fontSize: '0.8125rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={allocateForm.studentIds.includes(st._id)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...allocateForm.studentIds, st._id]
                            : allocateForm.studentIds.filter(id => id !== st._id);
                          setAllocateForm({ ...allocateForm, studentIds: next });
                        }}
                      />
                      <span>{st.rollNumber} — {st.userId?.name || 'Candidate'}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reallocate Modal */}
      {showReallocateModal && allocationToReallocate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Reallocate Candidate Seat
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '16px' }}>
              Reallocating seat for <strong>{allocationToReallocate.studentName}</strong> ({allocationToReallocate.studentRollNumber}).
            </p>

            <form onSubmit={handleReallocateSeat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Select New Room</label>
                <select
                  value={reallocateForm.newRoomId}
                  onChange={(e) => setReallocateForm({ ...reallocateForm, newRoomId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  {selectedCenter?.rooms?.map((r: any) => (
                    <option key={r.roomId} value={r.roomId}>
                      Room {r.roomNumber} (Capacity: {r.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Audited Justification Reason
                </label>
                <textarea
                  value={reallocateForm.reason}
                  onChange={(e) => setReallocateForm({ ...reallocateForm, reason: e.target.value })}
                  required
                  rows={3}
                  placeholder="e.g. Special accessibility requirement or equipment failure..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowReallocateModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Execute Reallocation
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
// 3. INVIGILATOR DUTY ROSTER (/app/exam-operations/invigilators)
// ==========================================
export const InvigilatorsPage: React.FC = () => {
  const { user } = useAuth();
  const [duties, setDuties] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [facultyUsers, setFacultyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [showAbsentModal, setShowAbsentModal] = useState<boolean>(false);
  const [dutyToMarkAbsent, setDutyToMarkAbsent] = useState<any | null>(null);
  const [absentRemarks, setAbsentRemarks] = useState<string>('Faculty absent on exam day without prior relief');

  const [assignForm, setAssignForm] = useState({
    scheduleId: '',
    centerId: '',
    roomId: '101',
    facultyId: '',
    dutyDate: '2026-11-20',
    startTime: '09:30',
    endTime: '12:30',
    reportingTime: '08:30 AM'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDuties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [dutiesRes, cyclesRes, centersRes, usersRes] = await Promise.all([
        fetch('/api/v1/exam-operations/invigilators/roster', { headers }),
        fetch('/api/v1/exam-applications/cycles', { headers }),
        fetch('/api/v1/exam-operations/centers', { headers }),
        fetch('/api/v1/users', { headers })
      ]);

      const dutiesData = await dutiesRes.json();
      const cyclesData = await cyclesRes.json();
      const centersData = await centersRes.json();
      const usersData = await usersRes.json();

      setDuties(Array.isArray(dutiesData) ? dutiesData : []);
      setCycles(Array.isArray(cyclesData) ? cyclesData : []);
      setCenters(Array.isArray(centersData) ? centersData : []);
      setFacultyUsers(Array.isArray(usersData) ? usersData.filter((u: any) => u.role === UserRole.FACULTY) : []);

      if (cyclesData.length > 0) {
        const schedRes = await fetch(`/api/v1/exam-operations/schedule?cycleId=${cyclesData[0]._id}`, { headers });
        const schedData = await schedRes.json();
        setSchedules(Array.isArray(schedData) ? schedData : []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch duties roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuties();
  }, []);

  const handleAssignInvigilator = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/invigilators/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...assignForm,
          cycleId: cycles[0]?._id
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to appoint invigilator');

      setSuccessMsg('Invigilation duty appointed successfully!');
      setShowAssignModal(false);
      fetchDuties();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleAcknowledge = async (dutyId: string, status: 'ACKNOWLEDGED' | 'DECLINED') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/invigilators/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dutyId, status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to acknowledge duty');

      setSuccessMsg(`Duty ${status.toLowerCase()} confirmed.`);
      fetchDuties();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleMarkAbsent = async () => {
    if (!dutyToMarkAbsent) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/invigilators/mark-absent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ dutyId: dutyToMarkAbsent._id, remarks: absentRemarks })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark invigilator absent');

      setSuccessMsg('Invigilator recorded as ABSENT. Duty flagged for emergency reserve deployment.');
      setShowAbsentModal(false);
      fetchDuties();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
            <Users size={18} /> M12 INVIGILATION DUTY
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            Invigilator Duty Roster & Acknowledgement
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>
            Appoint exam invigilators, track acknowledgement compliance, and record exam-day relief or absences.
          </p>
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: '#2563EB',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <PlusCircle size={16} /> Assign Invigilator
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Roster Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Appointed Duty Roster</h2>

        {loading ? (
          <LoadingState message="Loading invigilator appointments..." />
        ) : duties.length === 0 ? (
          <EmptyState title="No Invigilator Duties" subtitle="No invigilator assignments recorded yet." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Faculty Member</th>
                  <th style={{ padding: '12px 16px' }}>Venue Room</th>
                  <th style={{ padding: '12px 16px' }}>Duty Date</th>
                  <th style={{ padding: '12px 16px' }}>Slot Timing</th>
                  <th style={{ padding: '12px 16px' }}>Reporting Time</th>
                  <th style={{ padding: '12px 16px' }}>Acknowledgement</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {duties.map((duty) => (
                  <tr key={duty._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{duty.facultyName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{duty.facultyEmail}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>Room {duty.roomId}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{duty.dutyDate}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{duty.startTime} – {duty.endTime}</td>
                    <td style={{ padding: '12px 16px', color: '#2563EB', fontWeight: 600 }}>{duty.reportingTime}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={duty.status} />
                      {duty.status === InvigilationDutyStatus.ASSIGNED && (
                        <div style={{ fontSize: '0.75rem', color: '#D97706', marginTop: '2px', fontWeight: 500 }}>
                          • Pending Acknowledgement
                        </div>
                      )}
                      {duty.status === InvigilationDutyStatus.ABSENT && duty.remarks && (
                        <div style={{ fontSize: '0.75rem', color: '#DC2626', marginTop: '2px' }}>
                          {duty.remarks}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        {duty.status === InvigilationDutyStatus.ASSIGNED && (
                          <>
                            <button
                              onClick={() => handleAcknowledge(duty._id, 'ACKNOWLEDGED')}
                              style={{ padding: '5px 10px', borderRadius: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Acknowledge
                            </button>
                            <button
                              onClick={() => {
                                setDutyToMarkAbsent(duty);
                                setShowAbsentModal(true);
                              }}
                              style={{ padding: '5px 10px', borderRadius: '6px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Mark Absent
                            </button>
                          </>
                        )}
                        {duty.status === InvigilationDutyStatus.ACKNOWLEDGED && (
                          <span style={{ fontSize: '0.8125rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> Confirmed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Assign Invigilator Duty</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '18px' }}>Select faculty member and exam paper schedule slot.</p>

            <form onSubmit={handleAssignInvigilator} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Faculty Invigilator</label>
                <select
                  value={assignForm.facultyId}
                  onChange={(e) => setAssignForm({ ...assignForm, facultyId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  <option value="">Select Faculty</option>
                  {facultyUsers.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Exam Schedule Paper</label>
                <select
                  value={assignForm.scheduleId}
                  onChange={(e) => {
                    const s = schedules.find(sched => sched._id === e.target.value);
                    setAssignForm({
                      ...assignForm,
                      scheduleId: e.target.value,
                      centerId: s?.centerId?._id || centers[0]?._id,
                      dutyDate: s?.examDate || '2026-11-20',
                      startTime: s?.startTime || '09:30',
                      endTime: s?.endTime || '12:30'
                    });
                  }}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  <option value="">Select Schedule</option>
                  {schedules.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectCode} — {s.examDate} ({s.startTime} – {s.endTime})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Venue Room</label>
                  <input
                    type="text"
                    value={assignForm.roomId}
                    onChange={(e) => setAssignForm({ ...assignForm, roomId: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Reporting Time</label>
                  <input
                    type="text"
                    value={assignForm.reportingTime}
                    onChange={(e) => setAssignForm({ ...assignForm, reportingTime: e.target.value })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Absent Modal */}
      {showAbsentModal && dutyToMarkAbsent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991B1B', marginBottom: '6px' }}>Record Invigilator Absence</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '16px' }}>
              Confirm non-attendance for <strong>{dutyToMarkAbsent.facultyName}</strong> on {dutyToMarkAbsent.dutyDate}.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Superintendent Remarks</label>
              <textarea
                value={absentRemarks}
                onChange={(e) => setAbsentRemarks(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAbsentModal(false)}
                style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleMarkAbsent}
                style={{ padding: '9px 20px', borderRadius: '6px', background: '#DC2626', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Record Absence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. ANSWER-BOOK STOCK & RECONCILIATION (/app/exam-operations/materials)
// ==========================================
export const MaterialsRegisterPage: React.FC = () => {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [showReconcileModal, setShowReconcileModal] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    batchNumber: 'MB-2026-002',
    materialType: 'MAIN_ANSWER_BOOK' as MaterialType,
    prefix: 'AB-',
    startSerial: 100600,
    endSerial: 101000,
    securityBagSealNumber: 'SEAL-SEC-9903',
    confidentialNotes: 'Watermarked tamper-evident test batch'
  });

  const [dispatchForm, setDispatchForm] = useState({
    centerId: '',
    startSerial: 100600,
    endSerial: 100800,
    quantity: 201,
    sealNumber: 'SEAL-SEC-9903',
    remarks: 'Dispatched with armed courier'
  });

  const [reconcileForm, setReconcileForm] = useState({
    usedCount: 0,
    returnedCount: 0,
    damagedCount: 0,
    notes: 'Reconciliation post exam conclusion'
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [batchRes, cyclesRes, centersRes] = await Promise.all([
        fetch('/api/v1/exam-operations/materials/batches', { headers }),
        fetch('/api/v1/exam-applications/cycles', { headers }),
        fetch('/api/v1/exam-operations/centers', { headers })
      ]);

      const batchData = await batchRes.json();
      const cyclesData = await cyclesRes.json();
      const centersData = await centersRes.json();

      setBatches(Array.isArray(batchData) ? batchData : []);
      setCycles(Array.isArray(cyclesData) ? cyclesData : []);
      setCenters(Array.isArray(centersData) ? centersData : []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load materials data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/materials/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...createForm,
          cycleId: cycles[0]?._id,
          institutionId: user?.institutionId || 'INST-001'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register material batch');

      setSuccessMsg(`Material batch ${data.batchNumber} registered with serials [${data.startSerial} - ${data.endSerial}]!`);
      setShowCreateModal(false);
      fetchBatches();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/materials/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          batchId: selectedBatch._id,
          centerId: dispatchForm.centerId || centers[0]?._id,
          startSerial: Number(dispatchForm.startSerial),
          endSerial: Number(dispatchForm.endSerial),
          quantity: Number(dispatchForm.quantity),
          sealNumber: dispatchForm.sealNumber,
          remarks: dispatchForm.remarks
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch material');

      setSuccessMsg(`Dispatched ${dispatchForm.quantity} booklets to exam center under seal ${dispatchForm.sealNumber}!`);
      setShowDispatchModal(false);
      fetchBatches();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      setErrorMsg(null);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/exam-operations/materials/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          batchId: selectedBatch._id,
          usedCount: Number(reconcileForm.usedCount),
          returnedCount: Number(reconcileForm.returnedCount),
          damagedCount: Number(reconcileForm.damagedCount),
          notes: reconcileForm.notes
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reconcile batch');

      if (data.isReconciled) {
        setSuccessMsg(`Batch successfully reconciled! Dispatched (${data.dispatchedCount}) = Accounted (${data.totalAccounted}).`);
      } else {
        setErrorMsg(`Discrepancy registered! Variance: ${data.variance} booklets. Batch status flagged.`);
      }

      setShowReconcileModal(false);
      fetchBatches();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2563EB', fontWeight: 600, fontSize: '0.875rem' }}>
            <Box size={18} /> M12 MATERIALS & ANSWER BOOKS
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0F172A', marginTop: '4px' }}>
            Answer-Book Stock & Reconciliation
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '2px' }}>
            Numbered serial ranges, security seals, dispatch tracking and post-exam stock reconciliation.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: '#2563EB',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.875rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <PlusCircle size={16} /> Register New Batch
        </button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Batches Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0F172A', marginBottom: '16px' }}>Stock & Serial Inventory</h2>

        {loading ? (
          <LoadingState message="Loading materials inventory..." />
        ) : batches.length === 0 ? (
          <EmptyState title="No Material Batches" subtitle="No answer-book batches registered. Click 'Register New Batch' to start." />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E2E8F0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px' }}>Batch Number</th>
                  <th style={{ padding: '12px 16px' }}>Type</th>
                  <th style={{ padding: '12px 16px' }}>Serial Interval</th>
                  <th style={{ padding: '12px 16px' }}>Total Stock</th>
                  <th style={{ padding: '12px 16px' }}>Dispatched</th>
                  <th style={{ padding: '12px 16px' }}>Used / Ret / Dmg</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b._id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{b.batchNumber}</div>
                      {b.securityBagSealNumber && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Seal: {b.securityBagSealNumber}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{b.materialType?.replace(/_/g, ' ')}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#2563EB', fontWeight: 600 }}>
                      {b.prefix}{b.startSerial} – {b.prefix}{b.endSerial}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{b.totalCount}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#D97706' }}>{b.dispatchedCount}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {b.usedCount} used / {b.returnedCount} ret / {b.damagedCount} dmg
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <StatusBadge status={b.status} />
                      {b.reconciliationNotes && (
                        <div style={{ fontSize: '0.7rem', color: '#64748B', maxWidth: '180px', marginTop: '2px' }}>
                          {b.reconciliationNotes}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setSelectedBatch(b);
                            setDispatchForm({
                              ...dispatchForm,
                              startSerial: b.startSerial,
                              endSerial: b.endSerial,
                              quantity: b.totalCount - b.dispatchedCount
                            });
                            setShowDispatchModal(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#F1F5F9',
                            border: '1px solid #CBD5E1',
                            fontSize: '0.75rem',
                            color: '#334155',
                            cursor: 'pointer'
                          }}
                        >
                          <Truck size={13} /> Dispatch
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBatch(b);
                            setReconcileForm({
                              usedCount: b.usedCount || b.dispatchedCount,
                              returnedCount: b.returnedCount || 0,
                              damagedCount: b.damagedCount || 0,
                              notes: 'Post exam verification'
                            });
                            setShowReconcileModal(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            fontSize: '0.75rem',
                            color: '#1D4ED8',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          <FileCheck size={13} /> Reconcile
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Register Material Batch</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '18px' }}>Define serialized answer booklets. Overlapping intervals will be blocked.</p>

            <form onSubmit={handleCreateBatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Batch Number</label>
                <input
                  type="text"
                  value={createForm.batchNumber}
                  onChange={(e) => setCreateForm({ ...createForm, batchNumber: e.target.value })}
                  required
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Material Type</label>
                  <select
                    value={createForm.materialType}
                    onChange={(e: any) => setCreateForm({ ...createForm, materialType: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  >
                    <option value="MAIN_ANSWER_BOOK">Main Answer Book</option>
                    <option value="SUPPLEMENTARY_SHEET">Supplementary Sheet</option>
                    <option value="GRAPH_SHEET">Graph Sheet</option>
                    <option value="QUESTION_PAPER_PACKET">Question Paper Packet</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Serial Prefix</label>
                  <input
                    type="text"
                    value={createForm.prefix}
                    onChange={(e) => setCreateForm({ ...createForm, prefix: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Start Serial Number</label>
                  <input
                    type="number"
                    value={createForm.startSerial}
                    onChange={(e) => setCreateForm({ ...createForm, startSerial: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>End Serial Number</label>
                  <input
                    type="number"
                    value={createForm.endSerial}
                    onChange={(e) => setCreateForm({ ...createForm, endSerial: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Security Bag Seal Number (Restricted)</label>
                <input
                  type="text"
                  value={createForm.securityBagSealNumber}
                  onChange={(e) => setCreateForm({ ...createForm, securityBagSealNumber: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Register Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && selectedBatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>Dispatch to Examination Center</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '18px' }}>
              Dispatching from batch <strong>{selectedBatch.batchNumber}</strong> ({selectedBatch.prefix}{selectedBatch.startSerial} - {selectedBatch.prefix}{selectedBatch.endSerial}).
            </p>

            <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Destination Center</label>
                <select
                  value={dispatchForm.centerId}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, centerId: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                >
                  {centers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.centerCode} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Start Serial</label>
                  <input
                    type="number"
                    value={dispatchForm.startSerial}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, startSerial: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>End Serial</label>
                  <input
                    type="number"
                    value={dispatchForm.endSerial}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, endSerial: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Quantity Count</label>
                  <input
                    type="number"
                    value={dispatchForm.quantity}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, quantity: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Security Seal</label>
                  <input
                    type="text"
                    value={dispatchForm.sealNumber}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, sealNumber: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Execute Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reconcile Modal */}
      {showReconcileModal && selectedBatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '28px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', marginBottom: '6px' }}>
              Reconcile Batch — {selectedBatch.batchNumber}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '14px' }}>
              Dispatched Count: <strong>{selectedBatch.dispatchedCount} Booklets</strong>. Total used, returned and damaged must match dispatched quantity.
            </p>

            {/* Live Calculation Widget */}
            {(() => {
              const totalAccounted = Number(reconcileForm.usedCount) + Number(reconcileForm.returnedCount) + Number(reconcileForm.damagedCount);
              const variance = selectedBatch.dispatchedCount - totalAccounted;
              const isMatch = variance === 0;

              return (
                <div style={{
                  background: isMatch ? '#ECFDF5' : '#FFFBEB',
                  border: `1px solid ${isMatch ? '#A7F3D0' : '#FDE68A'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Total Accounted</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isMatch ? '#065F46' : '#92400E' }}>
                      {totalAccounted} / {selectedBatch.dispatchedCount}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Balance / Variance</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 700, color: isMatch ? '#059669' : '#DC2626' }}>
                      {isMatch ? '0 (Balanced)' : `${variance > 0 ? `-${variance} Short` : `+${Math.abs(variance)} Excess`}`}
                    </div>
                  </div>
                </div>
              );
            })()}

            <form onSubmit={handleReconcile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Used Count</label>
                  <input
                    type="number"
                    value={reconcileForm.usedCount}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, usedCount: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Returned</label>
                  <input
                    type="number"
                    value={reconcileForm.returnedCount}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, returnedCount: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Damaged / Void</label>
                  <input
                    type="number"
                    value={reconcileForm.damagedCount}
                    onChange={(e) => setReconcileForm({ ...reconcileForm, damagedCount: Number(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Reconciliation Remarks</label>
                <textarea
                  value={reconcileForm.notes}
                  onChange={(e) => setReconcileForm({ ...reconcileForm, notes: e.target.value })}
                  rows={2}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowReconcileModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '6px', background: '#2563EB', color: '#FFFFFF', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >
                  Record Reconciliation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
