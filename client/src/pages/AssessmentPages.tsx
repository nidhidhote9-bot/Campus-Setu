import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UploadCloud,
  FileCheck,
  Lock,
  UserCheck,
  Search,
  Eye,
  Send,
  RotateCcw,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  HelpCircle,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
  FileUp
} from 'lucide-react';
import {
  AssessmentBatchStatus,
  MarkAttendanceStatus
} from '@shared/index';

interface AssessmentBatchItem {
  _id: string;
  componentName: string;
  maxMarks: number;
  academicTerm: string;
  status: AssessmentBatchStatus;
  subjectId?: { _id: string; code: string; name: string; credits: number };
  facultyId?: { _id: string; name: string; email: string };
  cycleId?: { _id: string; name: string; code: string };
  submittedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
}

interface MarkEntryItem {
  _id?: string;
  studentId: { _id: string; rollNumber: string; enrollmentNumber: string; name: string };
  marksObtained: number;
  attendanceStatus: MarkAttendanceStatus;
  remarks?: string;
  correctionReason?: string;
}

interface ModerationHistoryItem {
  _id: string;
  moderatorId: { name: string; email: string; role: string };
  decision: 'APPROVE' | 'RETURN';
  comments: string;
  decidedAt: string;
}

// ==========================================
// 1. FACULTY MARKS ENTRY & ROSTER GRID VIEW
// ==========================================
export const AssessmentMarksPage: React.FC = () => {
  const [batches, setBatches] = useState<AssessmentBatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [batchDetail, setBatchDetail] = useState<{
    batch: AssessmentBatchItem;
    entries: MarkEntryItem[];
    moderationHistory: ModerationHistoryItem[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable local entries
  const [editableEntries, setEditableEntries] = useState<Array<{
    studentId: string;
    studentName: string;
    rollNumber: string;
    marksObtained: number;
    attendanceStatus: MarkAttendanceStatus;
    remarks: string;
  }>>([]);

  // New Batch Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newBatch, setNewBatch] = useState({
    cycleId: '',
    subjectId: '',
    componentName: 'Continuous Evaluation Test 1',
    maxMarks: 30,
    academicTerm: '2026-AUTUMN-SEM3'
  });

  const [cycles, setCycles] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetchBatches();
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [cycleRes, courseRes] = await Promise.all([
        fetch('/api/v1/exam/cycles'),
        fetch('/api/v1/academics/courses')
      ]);
      if (cycleRes.ok) {
        const cData = await cycleRes.json();
        setCycles(cData);
        if (cData.length > 0) setNewBatch(prev => ({ ...prev, cycleId: cData[0]._id }));
      }
      if (courseRes.ok) {
        const crsData = await courseRes.json();
        setCourses(crsData);
        if (crsData.length > 0) setNewBatch(prev => ({ ...prev, subjectId: crsData[0]._id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/assessment/batches');
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
        if (data.length > 0) {
          setSelectedBatchId(data[0]._id);
          fetchBatchDetail(data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/assessment/batches/${id}`);
      if (res.ok) {
        const data = await res.json();
        setBatchDetail(data);
        setEditableEntries(data.entries.map((e: any) => ({
          studentId: e.studentId._id,
          studentName: e.studentId.name,
          rollNumber: e.studentId.rollNumber,
          marksObtained: e.marksObtained,
          attendanceStatus: e.attendanceStatus || MarkAttendanceStatus.PRESENT,
          remarks: e.remarks || ''
        })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBatchSelect = (id: string) => {
    setSelectedBatchId(id);
    fetchBatchDetail(id);
  };

  const handleMarksChange = (index: number, value: string) => {
    const num = parseFloat(value) || 0;
    const updated = [...editableEntries];
    updated[index].marksObtained = num;
    setEditableEntries(updated);
  };

  const handleAttendanceChange = (index: number, status: MarkAttendanceStatus) => {
    const updated = [...editableEntries];
    updated[index].attendanceStatus = status;
    if (status === MarkAttendanceStatus.ABSENT || status === MarkAttendanceStatus.WITHHELD) {
      updated[index].marksObtained = 0;
    }
    setEditableEntries(updated);
  };

  const handleSaveDraft = async () => {
    if (!batchDetail) return;
    setSaving(true);
    setMessage(null);

    // Frontend max validation
    const max = batchDetail.batch.maxMarks;
    const invalid = editableEntries.find(e => e.marksObtained < 0 || e.marksObtained > max);
    if (invalid) {
      setMessage({
        type: 'error',
        text: `Validation Failed: Roll ${invalid.rollNumber} mark ${invalid.marksObtained} exceeds component max (${max})`
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/assessment/marks/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: batchDetail.batch._id,
          entries: editableEntries.map(e => ({
            studentId: e.studentId,
            marksObtained: e.marksObtained,
            attendanceStatus: e.attendanceStatus,
            remarks: e.remarks
          }))
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Draft marks saved successfully for ${data.savedCount} students!` });
        fetchBatchDetail(batchDetail.batch._id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save draft marks' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitBatch = async () => {
    if (!batchDetail) return;
    if (!window.confirm('Submit this assessment batch for moderator review? Further direct edits will be locked.')) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/assessment/batches/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: batchDetail.batch._id })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Assessment batch submitted for moderation review!' });
        fetchBatches();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit batch' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/assessment/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch)
      });
      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        fetchBatches();
      } else {
        alert(data.error || 'Failed to create assessment batch');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-indigo-500/20">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
              <FileSpreadsheet className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Faculty Assessment Marks Grid</h1>
          </div>
          <p className="text-indigo-200 text-sm max-w-2xl">
            Enter component-wise evaluation scores, record explicit absent/withheld states, and submit validated assessment batches for moderation review.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <Layers className="w-4 h-4" />
            <span>Create Assessment Batch</span>
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Main Grid & Selector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Batch Selector */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Assessment Batches</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{batches.length}</span>
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {batches.map(b => {
              const isSelected = b._id === selectedBatchId;
              return (
                <div
                  key={b._id}
                  onClick={() => handleBatchSelect(b._id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition border ${isSelected ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg' : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-semibold text-sm line-clamp-1">{b.componentName}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      b.status === AssessmentBatchStatus.APPROVED || b.status === AssessmentBatchStatus.LOCKED
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : b.status === AssessmentBatchStatus.SUBMITTED
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : b.status === AssessmentBatchStatus.RETURNED
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                    <p className="text-indigo-300 font-mono">{b.subjectId?.code} — {b.subjectId?.name}</p>
                    <p>Max Marks: <strong className="text-slate-200">{b.maxMarks}</strong> | Term: {b.academicTerm}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Marks Entry Grid */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          {batchDetail ? (
            <>
              {/* Batch Header Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>{batchDetail.batch.componentName}</span>
                    <span className="text-xs font-mono px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded-lg">
                      Max: {batchDetail.batch.maxMarks} Marks
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Subject: <strong className="text-slate-200">{batchDetail.batch.subjectId?.code} ({batchDetail.batch.subjectId?.name})</strong> | Faculty: {batchDetail.batch.facultyId?.name}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {batchDetail.batch.status === AssessmentBatchStatus.DRAFT || batchDetail.batch.status === AssessmentBatchStatus.RETURNED ? (
                    <>
                      <button
                        onClick={handleSaveDraft}
                        disabled={saving}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl text-sm border border-slate-700 transition flex items-center space-x-2"
                      >
                        <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                        <span>Save Draft</span>
                      </button>
                      <button
                        onClick={handleSubmitBatch}
                        disabled={submitting}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm shadow-lg transition flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit for Moderation</span>
                      </button>
                    </>
                  ) : (
                    <div className="px-3.5 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center space-x-2">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Batch Locked ({batchDetail.batch.status})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Moderation Review Feedback Banner if RETURNED */}
              {batchDetail.batch.status === AssessmentBatchStatus.RETURNED && batchDetail.moderationHistory.length > 0 && (
                <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1">
                  <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm">
                    <RotateCcw className="w-4 h-4" />
                    <span>Batch Returned by Moderator for Revision</span>
                  </div>
                  <p className="text-xs text-rose-200 italic">
                    "{batchDetail.moderationHistory[0].comments}" — Moderated by {batchDetail.moderationHistory[0].moderatorId?.name}
                  </p>
                </div>
              )}

              {/* Student Roster Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Attendance State</th>
                      <th className="px-4 py-3">Marks Obtained (Max: {batchDetail.batch.maxMarks})</th>
                      <th className="px-4 py-3">Remarks / Correction Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {editableEntries.map((entry, idx) => {
                      const isLocked = batchDetail.batch.status === AssessmentBatchStatus.SUBMITTED ||
                                       batchDetail.batch.status === AssessmentBatchStatus.APPROVED ||
                                       batchDetail.batch.status === AssessmentBatchStatus.LOCKED;
                      const isInvalid = entry.marksObtained < 0 || entry.marksObtained > batchDetail.batch.maxMarks;

                      return (
                        <tr key={entry.studentId} className="hover:bg-slate-800/30 transition">
                          <td className="px-4 py-3 font-mono text-xs text-indigo-300 font-semibold">{entry.rollNumber}</td>
                          <td className="px-4 py-3 font-medium text-white">{entry.studentName}</td>
                          <td className="px-4 py-3">
                            <select
                              disabled={isLocked}
                              value={entry.attendanceStatus}
                              onChange={(e) => handleAttendanceChange(idx, e.target.value as MarkAttendanceStatus)}
                              className="bg-slate-800 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                            >
                              <option value={MarkAttendanceStatus.PRESENT}>PRESENT</option>
                              <option value={MarkAttendanceStatus.ABSENT}>ABSENT</option>
                              <option value={MarkAttendanceStatus.WITHHELD}>WITHHELD</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative max-w-[120px]">
                              <input
                                type="number"
                                disabled={isLocked || entry.attendanceStatus !== MarkAttendanceStatus.PRESENT}
                                value={entry.marksObtained}
                                onChange={(e) => handleMarksChange(idx, e.target.value)}
                                className={`w-full bg-slate-800 border rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none disabled:opacity-50 ${
                                  isInvalid ? 'border-rose-500 text-rose-400' : 'border-slate-700 focus:border-indigo-500'
                                }`}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              disabled={isLocked}
                              value={entry.remarks}
                              placeholder="Optional remarks"
                              onChange={(e) => {
                                const updated = [...editableEntries];
                                updated[idx].remarks = e.target.value;
                                setEditableEntries(updated);
                              }}
                              className="w-full bg-slate-800/50 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Layers className="w-12 h-12 mx-auto text-slate-700" />
              <p>Select an assessment batch from the sidebar or create a new component batch.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>Create New Assessment Batch</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white text-lg">×</button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Cycle</label>
                <select
                  value={newBatch.cycleId}
                  onChange={(e) => setNewBatch({ ...newBatch, cycleId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {cycles.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject Course</label>
                <select
                  value={newBatch.subjectId}
                  onChange={(e) => setNewBatch({ ...newBatch, subjectId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  {courses.map(c => <option key={c._id} value={c._id}>{c.code} — {c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  value={newBatch.componentName}
                  onChange={(e) => setNewBatch({ ...newBatch, componentName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. End-Semester Theory Paper"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBatch.maxMarks}
                    onChange={(e) => setNewBatch({ ...newBatch, maxMarks: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Term</label>
                  <input
                    type="text"
                    required
                    value={newBatch.academicTerm}
                    onChange={(e) => setNewBatch({ ...newBatch, academicTerm: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium shadow-lg"
                >
                  Create Batch
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
// 2. CSV MARKS IMPORT & VALIDATION SUMMARY VIEW
// ==========================================
export const AssessmentImportsPage: React.FC = () => {
  const [batches, setBatches] = useState<AssessmentBatchItem[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [academicTerm, setAcademicTerm] = useState<string>('2026-AUTUMN-SEM3');
  const [csvContent, setCsvContent] = useState<string>(
    'rollNumber,marksObtained,attendanceStatus,remarks\n2026CS101,28,PRESENT,Good\n2026CS102,75,PRESENT,Invalid high score\n2026CS103,0,ABSENT,Medical'
  );

  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/assessment/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data);
        if (data.length > 0) setSelectedBatchId(data[0]._id);
      })
      .catch(console.error);
  }, []);

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return;

    setLoading(true);
    setError(null);
    setImportResult(null);

    // Parse simple CSV text
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      setError('CSV content must have a header row and at least 1 data row');
      setLoading(false);
      return;
    }

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim());
      if (parts.length >= 2) {
        rows.push({
          rollNumber: parts[0],
          marksObtained: parseFloat(parts[1]) || 0,
          attendanceStatus: (parts[2] as MarkAttendanceStatus) || MarkAttendanceStatus.PRESENT,
          remarks: parts[3] || ''
        });
      }
    }

    try {
      const res = await fetch('/api/v1/assessment/marks/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatchId,
          academicTerm,
          filename: 'bulk_marks_import.csv',
          rows
        })
      });

      const data = await res.json();
      if (res.ok) {
        setImportResult(data);
      } else {
        setError(data.error || 'Import failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-teal-500/20">
        <div className="flex items-center space-x-3 mb-2">
          <span className="p-2 bg-teal-500/20 rounded-lg text-teal-300">
            <UploadCloud className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">CSV Bulk Marks Import & Validation</h1>
        </div>
        <p className="text-teal-200 text-sm max-w-2xl">
          Upload bulk assessment CSV records with automated term mismatch validation, out-of-range mark rejection, and row error reporting.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CSV Import Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileUp className="w-5 h-5 text-teal-400" />
            <span>Upload Assessment Batch CSV</span>
          </h2>

          <form onSubmit={handleImportSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Assessment Batch</label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                {batches.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.componentName} — {b.subjectId?.code} (Max: {b.maxMarks} | Term: {b.academicTerm})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Term Verification</label>
              <input
                type="text"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                placeholder="2026-AUTUMN-SEM3"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Must match batch academic term exactly to prevent accidental term overwrites.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CSV Data Input (rollNumber, marksObtained, attendanceStatus, remarks)</label>
              <textarea
                rows={8}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                className="w-full bg-slate-800/80 font-mono text-xs text-teal-300 border border-slate-700 rounded-xl p-3 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
            >
              <UploadCloud className="w-5 h-5" />
              <span>{loading ? 'Validating CSV...' : 'Process & Import CSV Marks'}</span>
            </button>
          </form>
        </div>

        {/* Validation Results & Errors Display */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            <span>Import Validation & Error Summary</span>
          </h2>

          {importResult ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-800 border border-slate-700 rounded-xl text-center">
                  <span className="text-xs text-slate-400 block">Total Rows</span>
                  <span className="text-xl font-bold text-white">{importResult.totalRows}</span>
                </div>
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center">
                  <span className="text-xs text-emerald-400 block">Valid Imported</span>
                  <span className="text-xl font-bold text-emerald-400">{importResult.validRows}</span>
                </div>
                <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-center">
                  <span className="text-xs text-rose-400 block">Rejected Errors</span>
                  <span className="text-xl font-bold text-rose-400">{importResult.errorRows}</span>
                </div>
              </div>

              {importResult.errorDetails.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Row Error Log</h3>
                  <div className="p-3 bg-rose-950/30 border border-rose-500/20 rounded-xl space-y-2 max-h-60 overflow-y-auto">
                    {importResult.errorDetails.map((err: any, idx: number) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-rose-300">
                        <XCircle className="w-4 h-4 flex-shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <strong>Row {err.row} ({err.rollNumber || 'N/A'})</strong>: {err.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>All rows passed validation with 0 errors!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-700" />
              <p>Submit CSV content on the left to view real-time validation results and error logs.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. MODERATOR REVIEW & APPROVAL QUEUE VIEW
// ==========================================
export const AssessmentModerationPage: React.FC = () => {
  const [submittedBatches, setSubmittedBatches] = useState<AssessmentBatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [decision, setDecision] = useState<'APPROVE' | 'RETURN'>('APPROVE');
  const [comments, setComments] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmittedBatches();
  }, []);

  const fetchSubmittedBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/assessment/batches');
      if (res.ok) {
        const data = await res.json();
        setSubmittedBatches(data);
        if (data.length > 0) {
          fetchBatchDetail(data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/assessment/batches/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBatch(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/assessment/batches/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatch.batch._id,
          decision,
          comments
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Moderation decision '${decision}' submitted successfully!`);
        fetchSubmittedBatches();
      } else {
        alert(data.error || 'Moderation decision failed');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleLockBatch = async () => {
    if (!selectedBatch) return;
    if (!window.confirm('Lock this approved assessment component for final grade tabulation?')) return;

    try {
      const res = await fetch('/api/v1/assessment/batches/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId: selectedBatch.batch._id,
          approvalNotes: 'Final exam office lock approved for transcript generation'
        })
      });
      if (res.ok) {
        setMessage('Assessment batch locked for results!');
        fetchSubmittedBatches();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-purple-500/20">
        <div className="flex items-center space-x-3 mb-2">
          <span className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
            <UserCheck className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Assessment Moderation & Approval Queue</h1>
        </div>
        <p className="text-purple-200 text-sm max-w-2xl">
          Review submitted component marks, inspect discrepancies, approve assessment batches or return to faculty with mandatory review comments.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue List */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 px-2">Moderation Queue</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {submittedBatches.map(b => (
              <div
                key={b._id}
                onClick={() => fetchBatchDetail(b._id)}
                className={`p-3.5 rounded-xl cursor-pointer transition border ${
                  selectedBatch?.batch?._id === b._id ? 'bg-purple-950/60 border-purple-500 text-white shadow-lg' : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm line-clamp-1">{b.componentName}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    {b.status}
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-mono mt-1">{b.subjectId?.code} — {b.subjectId?.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detail & Decision Form */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          {selectedBatch ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedBatch.batch.componentName}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Faculty: {selectedBatch.batch.facultyId?.name} | Status: <strong className="text-purple-300">{selectedBatch.batch.status}</strong>
                  </p>
                </div>

                {selectedBatch.batch.status === AssessmentBatchStatus.APPROVED && (
                  <button
                    onClick={handleLockBatch}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-xl text-sm shadow-lg transition flex items-center space-x-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Lock for Tabulation</span>
                  </button>
                )}
              </div>

              {/* Entries Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Marks Summary</h3>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800 text-slate-400 uppercase">
                      <tr>
                        <th className="p-2.5">Roll No</th>
                        <th className="p-2.5">Student Name</th>
                        <th className="p-2.5">Attendance</th>
                        <th className="p-2.5">Marks (Max: {selectedBatch.batch.maxMarks})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {selectedBatch.entries.map((e: any) => (
                        <tr key={e._id}>
                          <td className="p-2.5 font-mono text-purple-300">{e.studentId?.rollNumber}</td>
                          <td className="p-2.5 font-medium text-white">{e.studentId?.name}</td>
                          <td className="p-2.5">{e.attendanceStatus}</td>
                          <td className="p-2.5 font-semibold text-emerald-400">{e.marksObtained}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Moderation Action Form */}
              {(selectedBatch.batch.status === AssessmentBatchStatus.SUBMITTED || selectedBatch.batch.status === AssessmentBatchStatus.RETURNED) && (
                <form onSubmit={handleModerateSubmit} className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <span>Submit Moderator Decision</span>
                  </h3>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-200">
                      <input
                        type="radio"
                        name="decision"
                        value="APPROVE"
                        checked={decision === 'APPROVE'}
                        onChange={() => setDecision('APPROVE')}
                        className="text-purple-600 focus:ring-purple-500"
                      />
                      <span>Approve Component Batch</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer text-sm text-slate-200">
                      <input
                        type="radio"
                        name="decision"
                        value="RETURN"
                        checked={decision === 'RETURN'}
                        onChange={() => setDecision('RETURN')}
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span>Return to Faculty for Correction</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Moderator Review Comments</label>
                    <textarea
                      rows={3}
                      required
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Provide detailed moderation comments..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-sm shadow-lg transition"
                  >
                    Submit Decision
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">Select a batch to review.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. STUDENT PUBLISHED MARKS BREAKDOWN VIEW
// ==========================================
export const StudentMyAssessmentsPage: React.FC = () => {
  const [publishedMarks, setPublishedMarks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/assessment/my-marks')
      .then(res => res.json())
      .then(data => setPublishedMarks(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-blue-500/20">
        <div className="flex items-center space-x-3 mb-2">
          <span className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
            <Award className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Student Published Assessment Breakdown</h1>
        </div>
        <p className="text-blue-200 text-sm max-w-2xl">
          View component-wise marks published by the Examination Office. Unpublished draft or moderation batches remain strictly confidential.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading published scores...</div>
      ) : publishedMarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publishedMarks.map((item, idx) => (
            <div key={idx} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/40 transition shadow-lg">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-indigo-400 font-semibold">{item.subjectCode}</span>
                  <h3 className="text-base font-bold text-white line-clamp-1">{item.subjectName}</h3>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {item.status}
                </span>
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl space-y-1 text-xs text-slate-300">
                <p>Component: <strong className="text-white">{item.componentName}</strong></p>
                <p>Academic Term: <span className="text-indigo-300">{item.academicTerm}</span></p>
              </div>

              <div className="flex items-baseline justify-between pt-2 border-t border-slate-800">
                <span className="text-xs text-slate-400">Marks Obtained</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400">{item.marksObtained}</span>
                  <span className="text-xs text-slate-500 font-semibold"> / {item.maxMarks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-slate-900/80 border border-slate-800 rounded-2xl text-center text-slate-400 space-y-3">
          <BookOpen className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-base font-semibold text-slate-300">No Published Assessment Scores Available Yet</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Marks will appear here once faculty submissions are moderated and approved by the Controller of Examinations.
          </p>
        </div>
      )}
    </div>
  );
};
