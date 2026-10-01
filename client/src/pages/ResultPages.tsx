import React, { useState, useEffect } from 'react';
import {
  Award,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Send,
  FileCheck,
  Lock,
  Search,
  Eye,
  RefreshCw,
  Clock,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Download,
  FileText,
  PieChart,
  TrendingUp,
  UserCheck,
  Layers,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import {
  ResultStatus,
  ProgressionStatus
} from '@shared/index';

interface ResultRunItem {
  _id: string;
  academicTerm: string;
  semester: number;
  status: ResultStatus;
  totalStudents: number;
  passedCount: number;
  backlogCount: number;
  failedCount: number;
  cycleId?: { _id: string; name: string; code: string };
  calculatedAt: string;
  approvedAt?: string;
  publishedAt?: string;
}

interface SubjectResultItem {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  totalMarksObtained: number;
  totalMaxMarks: number;
  percentage: number;
  letterGrade: string;
  gradePoint: number;
  isPassed: boolean;
}

interface TermResultItem {
  _id: string;
  academicTerm: string;
  semester: number;
  subjectResults: SubjectResultItem[];
  totalCredits: number;
  earnedCredits: number;
  sgpa: number;
  cgpa: number;
  progressionStatus: ProgressionStatus;
  versionNumber: number;
  isLatest: boolean;
  studentId?: { _id: string; rollNumber: string; enrollmentNumber: string; name: string };
}

// ==========================================
// 1. TABULATION PREVIEW & RESULT CALCULATION QUEUE
// ==========================================
export const ResultsTabulationPage: React.FC = () => {
  const [runs, setRuns] = useState<ResultRunItem[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [runDetail, setRunDetail] = useState<{
    run: ResultRunItem;
    termResults: TermResultItem[];
  } | null>(null);

  const [cycles, setCycles] = useState<any[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>('');
  const [academicTerm, setAcademicTerm] = useState<string>('2026-AUTUMN-SEM3');
  const [semester, setSemester] = useState<number>(3);

  const [calculating, setCalculating] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRuns();
    fetch('/api/v1/exam/cycles')
      .then(res => res.json())
      .then(data => {
        setCycles(data);
        if (data.length > 0) setSelectedCycleId(data[0]._id);
      })
      .catch(console.error);
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/v1/results/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
        if (data.length > 0) {
          setSelectedRunId(data[0]._id);
          fetchRunDetail(data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRunDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/results/runs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRunDetail(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCalculateRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setCalculating(true);
    setMessage(null);

    try {
      const res = await fetch('/api/v1/results/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cycleId: selectedCycleId,
          academicTerm,
          semester
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: `Result run calculated for ${data.resultRun.totalStudents} students! Status: ${data.resultRun.status}` });
        fetchRuns();
      } else {
        setMessage({ type: 'error', text: data.error || 'Calculation failed' });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setCalculating(false);
    }
  };

  const handleApproveRun = async () => {
    if (!runDetail) return;
    if (!window.confirm('Approve this result run for publication?')) return;

    setApproving(true);
    try {
      const res = await fetch('/api/v1/results/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: runDetail.run._id,
          notes: 'Approved by Controller of Examinations for official release'
        })
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Result run approved successfully!' });
        fetchRuns();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-indigo-500/20">
        <div className="flex items-center space-x-3 mb-2">
          <span className="p-2 bg-indigo-500/20 rounded-lg text-indigo-300">
            <Calculator className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Semester Results Tabulation & Calculation Engine</h1>
        </div>
        <p className="text-indigo-200 text-sm max-w-2xl">
          Automated SGPA/CGPA grade calculation, progression status determination (PASS / PROMOTED_WITH_BACKLOG / FAILED), and tabulation validation queue.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Calculate Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <form onSubmit={handleCalculateRun} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Exam Cycle</label>
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {cycles.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Term</label>
            <input
              type="text"
              required
              value={academicTerm}
              onChange={(e) => setAcademicTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Semester</label>
            <input
              type="number"
              min="1"
              max="10"
              required
              value={semester}
              onChange={(e) => setSemester(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={calculating}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
          >
            <Calculator className={`w-4 h-4 ${calculating ? 'animate-spin' : ''}`} />
            <span>{calculating ? 'Calculating...' : 'Run Tabulation Engine'}</span>
          </button>
        </form>
      </div>

      {/* Main Tabulation Display */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Runs Selector */}
        <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Result Runs</span>
            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">{runs.length}</span>
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {runs.map(r => (
              <div
                key={r._id}
                onClick={() => {
                  setSelectedRunId(r._id);
                  fetchRunDetail(r._id);
                }}
                className={`p-3.5 rounded-xl cursor-pointer transition border ${
                  selectedRunId === r._id ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg' : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-semibold text-sm">{r.academicTerm}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    r.status === ResultStatus.PUBLISHED ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    r.status === ResultStatus.APPROVED ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-400 space-y-0.5">
                  <p>Semester: {r.semester} | Students: <strong className="text-white">{r.totalStudents}</strong></p>
                  <p className="text-emerald-400 font-mono">Passed: {r.passedCount} | Backlog: {r.backlogCount} | Failed: {r.failedCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabulation Table Detail */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          {runDetail ? (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <span>{runDetail.run.academicTerm} Tabulation Sheet</span>
                    <span className="text-xs font-mono px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded-lg">
                      Sem {runDetail.run.semester}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Status: <strong className="text-indigo-300">{runDetail.run.status}</strong> | Total Evaluated: {runDetail.run.totalStudents} Students
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {(runDetail.run.status === ResultStatus.DRAFT || runDetail.run.status === ResultStatus.VALIDATED) && (
                    <button
                      onClick={handleApproveRun}
                      disabled={approving}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-sm shadow-lg transition flex items-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Result Run</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Student Grade Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Subject Grades Breakdown</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">SGPA</th>
                      <th className="px-4 py-3">Progression Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {runDetail.termResults.map(tr => (
                      <tr key={tr._id} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-300 font-semibold">{tr.studentId?.rollNumber}</td>
                        <td className="px-4 py-3 font-medium text-white">{tr.studentId?.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            {tr.subjectResults.map((s, idx) => (
                              <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200">
                                {s.subjectCode}: <strong className={s.isPassed ? 'text-emerald-400' : 'text-rose-400'}>{s.letterGrade}</strong> ({s.totalMarksObtained}m)
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">{tr.earnedCredits} / {tr.totalCredits}</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-400 text-base">{tr.sgpa.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                            tr.progressionStatus === ProgressionStatus.PASS ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            tr.progressionStatus === ProgressionStatus.PROMOTED_WITH_BACKLOG ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {tr.progressionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">Select or calculate a result run.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. PUBLICATION DASHBOARD & REVISION COMPARISON VIEW
// ==========================================
export const ResultsPublicationPage: React.FC = () => {
  const [runs, setRuns] = useState<ResultRunItem[]>([]);
  const [selectedRun, setSelectedRun] = useState<ResultRunItem | null>(null);

  const [publishing, setPublishing] = useState<boolean>(false);
  const [publishTitle, setPublishTitle] = useState<string>('Official Semester 3 Main Examination Results');
  const [message, setMessage] = useState<string | null>(null);

  // Revision comparison state
  const [comparison, setComparison] = useState<any>(null);
  const [correctionModal, setCorrectionModal] = useState<boolean>(false);
  const [correctionData, setCorrectionData] = useState({
    termResultId: '',
    subjectCode: 'CS201',
    newMarksObtained: 95,
    correctionReason: 'Authorized re-evaluation correction by HOD'
  });

  useEffect(() => {
    fetchRuns();
  }, []);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/v1/results/runs');
      if (res.ok) {
        const data = await res.json();
        setRuns(data);
        if (data.length > 0) setSelectedRun(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublish = async () => {
    if (!selectedRun) return;
    if (!window.confirm(`Publish result for ${selectedRun.academicTerm}? Transcripts will refer to this published revision.`)) return;

    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/v1/results/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: selectedRun._id,
          publishTitle
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.alreadyPublished) {
          setMessage('Result run is already published! Duplicate publish request handled idempotently.');
        } else {
          setMessage('Results officially published to student portal!');
        }
        fetchRuns();
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setPublishing(false);
    }
  };

  const handleApplyCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/results/correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(correctionData)
      });
      const data = await res.json();
      if (res.ok) {
        setCorrectionModal(false);
        setMessage(`Revision v${data.supersedingRevision.versionNumber} generated! Previous published version retained without deletion.`);
        fetchComparison(data.supersedingRevision._id);
      } else {
        alert(data.error || 'Correction failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const fetchComparison = async (termResultId: string) => {
    try {
      const res = await fetch(`/api/v1/results/revision/${termResultId}`);
      if (res.ok) {
        const data = await res.json();
        setComparison(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-teal-500/20">
        <div className="flex items-center space-x-3 mb-2">
          <span className="p-2 bg-teal-500/20 rounded-lg text-teal-300">
            <Send className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Results Publication & Superseding Revision Audit</h1>
        </div>
        <p className="text-teal-200 text-sm max-w-2xl">
          Publish validated result runs idempotently, apply authorized corrections with version audit trails (v1 → v2), and compare original vs revised grade cards.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publication Control Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Send className="w-5 h-5 text-teal-400" />
            <span>Publish Results to Student Portal</span>
          </h2>

          {selectedRun ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl space-y-2 text-xs text-slate-300">
                <p>Term: <strong className="text-white">{selectedRun.academicTerm}</strong> (Semester {selectedRun.semester})</p>
                <p>Current Status: <span className="font-semibold text-emerald-400">{selectedRun.status}</span></p>
                <p>Total Evaluated: {selectedRun.totalStudents} Students</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Announcement Title</label>
                <input
                  type="text"
                  value={publishTitle}
                  onChange={(e) => setPublishTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{publishing ? 'Publishing...' : 'Publish Results Idempotently'}</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No result run available for publication.</p>
          )}
        </div>

        {/* Revision Comparison Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <RotateCcw className="w-5 h-5 text-indigo-400" />
              <span>Revision Comparison (v1 vs v2)</span>
            </h2>

            <button
              onClick={() => setCorrectionModal(true)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium"
            >
              Apply Test Correction
            </button>
          </div>

          {comparison ? (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                <p>Correction Reason: <strong>"{comparison.revisionLog?.correctionReason}"</strong></p>
                <p>Corrected By: {comparison.revisionLog?.correctedBy?.name} | Date: {new Date(comparison.revisionLog?.correctedAt).toLocaleDateString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase">Original Published (v{comparison.original?.versionNumber})</h4>
                  <p className="text-sm font-semibold text-white">SGPA: {comparison.original?.sgpa}</p>
                  <p className="text-xs text-slate-400">Status: {comparison.original?.progressionStatus}</p>
                </div>

                <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">Revised Superseding (v{comparison.revised?.versionNumber})</h4>
                  <p className="text-sm font-semibold text-white">SGPA: {comparison.revised?.sgpa}</p>
                  <p className="text-xs text-emerald-300">Status: {comparison.revised?.progressionStatus}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <RotateCcw className="w-12 h-12 mx-auto text-slate-700" />
              <p>Apply an authorized correction to generate a superseding revision and compare original vs revised version.</p>
            </div>
          )}
        </div>
      </div>

      {/* Correction Modal */}
      {correctionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Apply Authorized Result Correction</h3>
            <form onSubmit={handleApplyCorrection} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Term Result ID</label>
                <input
                  type="text"
                  required
                  value={correctionData.termResultId}
                  onChange={(e) => setCorrectionData({ ...correctionData, termResultId: e.target.value })}
                  placeholder="Paste published TermResult ID"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Subject Code</label>
                <input
                  type="text"
                  required
                  value={correctionData.subjectCode}
                  onChange={(e) => setCorrectionData({ ...correctionData, subjectCode: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">New Total Marks Obtained</label>
                <input
                  type="number"
                  required
                  value={correctionData.newMarksObtained}
                  onChange={(e) => setCorrectionData({ ...correctionData, newMarksObtained: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Correction Audit Reason</label>
                <textarea
                  required
                  rows={2}
                  value={correctionData.correctionReason}
                  onChange={(e) => setCorrectionData({ ...correctionData, correctionReason: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setCorrectionModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Generate Revision</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. STUDENT GRADE CARD & TRANSCRIPT VIEW
// ==========================================
export const StudentMyResultsPage: React.FC = () => {
  const [publishedResults, setPublishedResults] = useState<TermResultItem[]>([]);
  const [transcript, setTranscript] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/v1/results/my-results')
      .then(res => res.json())
      .then(data => setPublishedResults(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleGenerateTranscript = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/results/transcripts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'me',
          purpose: 'Official Transcript Snapshot Download'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTranscript(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="p-2 bg-blue-500/20 rounded-lg text-blue-300">
              <Award className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Student Academic Grade Card & Transcript Portal</h1>
          </div>
          <p className="text-blue-200 text-sm max-w-2xl">
            Official published semester grade sheets, SGPA/CGPA breakdown, progression status, and digitally signed PDF transcript snapshots.
          </p>
        </div>

        <button
          onClick={handleGenerateTranscript}
          disabled={generating}
          className="mt-4 md:mt-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>{generating ? 'Signing Transcript...' : 'Generate Official Transcript'}</span>
        </button>
      </div>

      {/* Transcript Snapshot Modal / Download Display */}
      {transcript && (
        <div className="p-6 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-emerald-400 font-semibold">{transcript.snapshot.snapshotCode}</span>
              <h2 className="text-lg font-bold text-white">Digital Transcript Snapshot</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Cumulative CGPA</span>
              <span className="text-2xl font-black text-emerald-400">{transcript.snapshot.cumulativeCgpa.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl space-y-1 font-mono text-xs text-slate-300">
            <p>Digital Signature (SHA-256): <span className="text-emerald-400 break-all">{transcript.snapshot.digitalSignature}</span></p>
            <p>Total Earned Credits: {transcript.snapshot.totalEarnedCredits} | Progression: <strong className="text-white">{transcript.snapshot.finalProgressionStatus}</strong></p>
          </div>
        </div>
      )}

      {/* Grade Cards List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading official grade cards...</div>
      ) : publishedResults.length > 0 ? (
        <div className="space-y-6">
          {publishedResults.map(tr => (
            <div key={tr._id} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white">{tr.academicTerm} Grade Card</h3>
                  <span className="text-xs text-slate-400">Semester {tr.semester} | Revision v{tr.versionNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-400">{tr.sgpa.toFixed(2)}</span>
                  <span className="text-xs text-slate-400 block">SGPA</span>
                </div>
              </div>

              {/* Subject Scores */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Subject Name</th>
                      <th className="p-2.5">Credits</th>
                      <th className="p-2.5">Marks Obtained</th>
                      <th className="p-2.5">Letter Grade</th>
                      <th className="p-2.5">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tr.subjectResults.map((s, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-mono text-indigo-300 font-semibold">{s.subjectCode}</td>
                        <td className="p-2.5 font-medium text-white">{s.subjectName}</td>
                        <td className="p-2.5">{s.credits}</td>
                        <td className="p-2.5 font-semibold text-white">{s.totalMarksObtained} / {s.totalMaxMarks}</td>
                        <td className="p-2.5">
                          <span className={`font-bold px-2 py-0.5 rounded ${s.isPassed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                            {s.letterGrade}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono font-bold text-emerald-400">{s.gradePoint}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-slate-900/80 border border-slate-800 rounded-2xl text-center text-slate-400 space-y-3">
          <Award className="w-12 h-12 mx-auto text-slate-700" />
          <p className="text-base font-semibold text-slate-300">No Published Semester Grade Cards Found</p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. RESULTS REPORTS & PASS/WITHHELD LIST VIEW
// ==========================================
export const ResultsReportsPage: React.FC = () => {
  const [runs, setRuns] = useState<ResultRunItem[]>([]);
  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [reportDetail, setReportDetail] = useState<any>(null);

  useEffect(() => {
    fetch('/api/v1/results/runs')
      .then(res => res.json())
      .then(data => {
        setRuns(data);
        if (data.length > 0) {
          setSelectedRunId(data[0]._id);
          fetchReport(data[0]._id);
        }
      })
      .catch(console.error);
  }, []);

  const fetchReport = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/results/runs/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReportDetail(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-950 p-6 rounded-2xl text-white shadow-xl border border-purple-500/20 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="p-2 bg-purple-500/20 rounded-lg text-purple-300">
              <PieChart className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">University Result Summary & Pass/Withheld Register</h1>
          </div>
          <p className="text-purple-200 text-sm max-w-2xl">
            Statistical pass percentage summary, backlog rosters, withheld lists, and institutional governance export feeds.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl shadow-lg transition flex items-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print Gazette Report</span>
        </button>
      </div>

      {reportDetail ? (
        <div className="space-y-6">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 block">Total Appeared</span>
              <span className="text-2xl font-bold text-white">{reportDetail.run.totalStudents}</span>
            </div>
            <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl">
              <span className="text-xs text-emerald-400 block">Passed</span>
              <span className="text-2xl font-bold text-emerald-400">{reportDetail.run.passedCount}</span>
            </div>
            <div className="p-4 bg-amber-950/40 border border-amber-500/30 rounded-2xl">
              <span className="text-xs text-amber-400 block">Promoted w/ Backlog</span>
              <span className="text-2xl font-bold text-amber-400">{reportDetail.run.backlogCount}</span>
            </div>
            <div className="p-4 bg-rose-950/40 border border-rose-500/30 rounded-2xl">
              <span className="text-xs text-rose-400 block">Failed / Withheld</span>
              <span className="text-2xl font-bold text-rose-400">{reportDetail.run.failedCount}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500">Loading result reports...</div>
      )}
    </div>
  );
};
