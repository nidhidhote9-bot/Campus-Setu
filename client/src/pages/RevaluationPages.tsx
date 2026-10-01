import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  CreditCard,
  Search,
  Eye,
  ArrowRight,
  Sparkles,
  FileCheck,
  CheckSquare,
  XCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';
import {
  ReviewType,
  ReviewFeeStatus,
  ReviewRequestStatus,
  ReviewOutcomeType,
  ReviewOutcomeStatus,
  formatPaiseToRupees
} from '@shared/index';

// Interface Types
interface EligibleSubject {
  termResultId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examCycleId: string;
  academicTerm: string;
  originalMarks: number;
  originalGrade: string;
  retotallingEligible: boolean;
  revaluationEligible: boolean;
  windowExpiresAt: string;
}

interface ReviewRequestItem {
  _id: string;
  studentId: { _id: string; rollNumber: string; enrollmentNumber?: string; name?: string } | string;
  examCycleId: { _id: string; name: string; code: string } | string;
  subjectId: { _id: string; code: string; name: string } | string;
  reviewType: ReviewType;
  feeStatus: ReviewFeeStatus;
  feeAmountPaise: number;
  status: ReviewRequestStatus;
  originalMarksObtained: number;
  originalLetterGrade: string;
  reason?: string;
  requestedAt: string;
  paymentReference?: string;
  paidAt?: string;
}

interface ReviewAssignmentItem {
  _id: string;
  requestId: string;
  reviewerId: { _id: string; name: string; email: string } | string;
  assignedAt: string;
  deadlineDate: string;
  status: string;
}

interface ReviewOutcomeItem {
  _id: string;
  requestId: ReviewRequestItem;
  assignmentId?: string;
  reviewerId: { _id: string; name: string } | string;
  outcomeType: ReviewOutcomeType;
  originalMarks: number;
  newMarks: number;
  originalGrade: string;
  newGrade: string;
  reason: string;
  status: ReviewOutcomeStatus;
  approvedAt?: string;
  supersedingResultRevisionId?: string;
}

interface StudentDecisionItem {
  request: ReviewRequestItem;
  outcome?: ReviewOutcomeItem;
  beforeAfter?: {
    originalMarks: number;
    newMarks: number;
    originalGrade: string;
    newGrade: string;
    termResultId: string;
    supersedingRevisionId?: string;
    feeStatus: string;
  };
}

// ==========================================
// 1. STUDENT ELIGIBLE-PAPER LIST & REQUEST APPLY
// ==========================================
export const RevaluationApplyPage: React.FC = () => {
  const [eligibleSubjects, setEligibleSubjects] = useState<EligibleSubject[]>([]);
  const [existingRequests, setExistingRequests] = useState<ReviewRequestItem[]>([]);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [reviewType, setReviewType] = useState<ReviewType>(ReviewType.RETOTALLING);
  const [reason, setReason] = useState<string>('');

  const [payModalRequestId, setPayModalRequestId] = useState<string | null>(null);
  const [paymentRefInput, setPaymentRefInput] = useState<string>('');

  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resSub, resReq, resPol] = await Promise.all([
        fetch('/api/v1/revaluation/eligible-subjects'),
        fetch('/api/v1/revaluation/requests'),
        fetch('/api/v1/revaluation/policies')
      ]);

      if (resSub.ok) {
        const data = await resSub.json();
        setEligibleSubjects(data.eligibleSubjects || (Array.isArray(data) ? data : []));
      }
      if (resReq.ok) setExistingRequests(await resReq.json());
      if (resPol.ok) setPolicies(await resPol.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const sub = eligibleSubjects.find((s) => s.subjectId === selectedSubjectId);
    if (!sub) {
      setMsg({ type: 'error', text: 'Please select an eligible subject paper.' });
      return;
    }

    try {
      const res = await fetch('/api/v1/revaluation/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examCycleId: sub.examCycleId,
          subjectId: sub.subjectId,
          reviewType,
          termResultId: sub.termResultId,
          reason
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to submit review request.' });
      } else {
        setMsg({ type: 'success', text: `Review request submitted successfully! Request ID: ${data._id}` });
        setReason('');
        setSelectedSubjectId('');
        fetchData();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handlePayFee = async (requestId: string) => {
    const mockRef = paymentRefInput || `TXN-REV-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/v1/revaluation/requests/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          paymentReference: mockRef
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Payment settlement failed.' });
      } else {
        setMsg({ type: 'success', text: 'Fee settled successfully via payment simulator!' });
        setPayModalRequestId(null);
        setPaymentRefInput('');
        fetchData();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const activePolicyRetotal = policies.find((p) => p.reviewType === ReviewType.RETOTALLING);
  const activePolicyReval = policies.find((p) => p.reviewType === ReviewType.REVALUATION);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
            <FileSearch className="w-4 h-4" /> MODULE 16 &bull; STUDENT PORTAL
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Apply for Revaluation & Retotalling</h1>
          <p className="text-slate-400 text-sm mt-1">
            Request independent mark verification or complete re-evaluation for published examination papers.
          </p>
        </div>

        {/* Policy Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400 block">Retotalling Fee</span>
            <span className="font-bold text-amber-400 text-sm">
              {activePolicyRetotal ? `₹${formatPaiseToRupees(activePolicyRetotal.feeAmountPaise)}` : '₹300.00'}
            </span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl text-xs">
            <span className="text-slate-400 block">Revaluation Fee</span>
            <span className="font-bold text-blue-400 text-sm">
              {activePolicyReval ? `₹${formatPaiseToRupees(activePolicyReval.feeAmountPaise)}` : '₹750.00'}
            </span>
          </div>
        </div>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" /> New Review Application
          </h2>

          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">SELECT PUBLISHED PAPER</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
              >
                <option value="">-- Choose Eligible Subject --</option>
                {eligibleSubjects.map((sub) => (
                  <option key={sub.subjectId} value={sub.subjectId}>
                    {sub.subjectCode} - {sub.subjectName} ({sub.originalMarks} marks, Grade {sub.originalGrade})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">PROCEDURE TYPE</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setReviewType(ReviewType.RETOTALLING)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                    reviewType === ReviewType.RETOTALLING
                      ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="block text-sm font-bold">Retotalling</span>
                  <span className="text-[11px] opacity-80">Check totaling & missing marks</span>
                </button>
                <button
                  type="button"
                  onClick={() => setReviewType(ReviewType.REVALUATION)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                    reviewType === ReviewType.REVALUATION
                      ? 'bg-blue-950/40 border-blue-500 text-blue-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <span className="block text-sm font-bold">Revaluation</span>
                  <span className="text-[11px] opacity-80">Full paper regrading</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">REASON / JUSTIFICATION</label>
              <textarea
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="Mention question numbers or totaling discrepancy..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Submit Request
            </button>
          </form>
        </div>

        {/* Existing Requests Table & Eligible List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Submitted Applications */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Submitted Review Requests
            </h2>

            {existingRequests.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No active revaluation or retotalling requests submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Paper / Subject</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Fee Status</th>
                      <th className="p-3">Workflow Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {existingRequests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-medium text-slate-200">
                          {typeof req.subjectId === 'object' ? `${req.subjectId.code} - ${req.subjectId.name}` : req.subjectId}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              req.reviewType === ReviewType.RETOTALLING
                                ? 'bg-amber-950 border border-amber-800 text-amber-300'
                                : 'bg-blue-950 border border-blue-800 text-blue-300'
                            }`}
                          >
                            {req.reviewType}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              req.feeStatus === ReviewFeeStatus.PAID
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : req.feeStatus === ReviewFeeStatus.PENDING
                                ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {req.feeStatus} (₹{formatPaiseToRupees(req.feeAmountPaise)})
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-slate-400 font-mono">{req.status}</span>
                        </td>
                        <td className="p-3 text-right">
                          {req.feeStatus === ReviewFeeStatus.PENDING && (
                            <button
                              onClick={() => setPayModalRequestId(req._id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow flex items-center gap-1 ml-auto"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> Pay Fee
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Modal Simulator */}
      {payModalRequestId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" /> Fee Payment Settlement Simulator
            </h3>
            <p className="text-slate-400 text-sm">
              Settle payment for review request ID: <span className="font-mono text-emerald-400">{payModalRequestId}</span>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">TRANSACTION REFERENCE</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                placeholder="TXN-SIMULATOR-12345"
                value={paymentRefInput}
                onChange={(e) => setPaymentRefInput(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setPayModalRequestId(null)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayFee(payModalRequestId)}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirm & Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 2. EXAM OFFICE ASSIGNMENTS & DEADLINE TRACKING
// ==========================================
export const RevaluationAssignmentsPage: React.FC = () => {
  const [requests, setRequests] = useState<ReviewRequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [reviewerId, setReviewerId] = useState<string>('');
  const [deadlineDays, setDeadlineDays] = useState<number>(7);
  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/revaluation/requests');
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + Number(deadlineDays));

    try {
      const res = await fetch('/api/v1/revaluation/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequestId,
          reviewerId,
          deadlineDate: deadlineDate.toISOString()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to assign reviewer.' });
      } else {
        setMsg({ type: 'success', text: 'Reviewer assigned successfully and request moved to UNDER_REVIEW.' });
        setSelectedRequestId('');
        setReviewerId('');
        fetchRequests();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-1">
          <UserCheck className="w-4 h-4" /> MODULE 16 &bull; EXAM OFFICE QUEUE
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Reviewer Assignments & Deadline Tracking</h1>
        <p className="text-slate-400 text-sm mt-1">
          Assign subject matter expert reviewers to fee-settled retotalling and revaluation requests.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assign Form */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-400" /> Assign Evaluator / Reviewer
          </h2>

          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">SELECT REQUEST</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
              >
                <option value="">-- Paid Requests Pending Assignment --</option>
                {requests
                  .filter((r) => r.status === ReviewRequestStatus.FEE_PAID || r.status === ReviewRequestStatus.SUBMITTED)
                  .map((r) => (
                    <option key={r._id} value={r._id}>
                      [{r.reviewType}] {typeof r.subjectId === 'object' ? r.subjectId.code : r.subjectId} - Fee: {r.feeStatus}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">REVIEWER / FACULTY USER ID</label>
              <input
                type="text"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                placeholder="Mongo User ID for evaluator..."
                value={reviewerId}
                onChange={(e) => setReviewerId(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">REVIEW DEADLINE (DAYS)</label>
              <input
                type="number"
                min={1}
                max={30}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(Number(e.target.value))}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" /> Confirm Assignment
            </button>
          </form>
        </div>

        {/* Queue Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" /> Exam Office Request Queue
          </h2>

          {requests.length === 0 ? (
            <p className="text-slate-500 text-sm py-4 text-center">No revaluation requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase">
                  <tr>
                    <th className="p-3">Request ID</th>
                    <th className="p-3">Paper</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Fee Gate</th>
                    <th className="p-3">Workflow State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {requests.map((r) => (
                    <tr key={r._id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono text-xs text-slate-400">{r._id.substring(0, 8)}...</td>
                      <td className="p-3 font-medium text-slate-200">
                        {typeof r.subjectId === 'object' ? `${r.subjectId.code} - ${r.subjectId.name}` : r.subjectId}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-300">
                          {r.reviewType}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            r.feeStatus === ReviewFeeStatus.PAID
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {r.feeStatus}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-amber-400">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. REVIEWER OUTCOMES ENTRY & APPROVAL LINK
// ==========================================
export const RevaluationOutcomesPage: React.FC = () => {
  const [requests, setRequests] = useState<ReviewRequestItem[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [newMarks, setNewMarks] = useState<number>(0);
  const [outcomeType, setOutcomeType] = useState<ReviewOutcomeType>(ReviewOutcomeType.MARKS_INCREASED);
  const [outcomeReason, setOutcomeReason] = useState<string>('');
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');

  const [lastSubmittedOutcome, setLastSubmittedOutcome] = useState<ReviewOutcomeItem | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/revaluation/requests');
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOutcomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    try {
      const res = await fetch('/api/v1/revaluation/outcomes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequestId,
          newMarksObtained: Number(newMarks),
          outcomeType,
          outcomeReason,
          notes: outcomeNotes
        })
      });

      const outcome = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: outcome.error || 'Failed to submit review outcome.' });
      } else {
        setMsg({ type: 'success', text: `Outcome submitted successfully! Outcome ID: ${outcome._id}` });
        setLastSubmittedOutcome(outcome);
        fetchRequests();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleApproveOutcome = async (outcomeId: string) => {
    setMsg(null);
    try {
      const res = await fetch('/api/v1/revaluation/outcomes/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcomeId })
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Failed to approve review outcome.' });
      } else {
        setMsg({
          type: 'success',
          text: `Review outcome approved! Superseding revision v2 created with ID: ${data.supersedingResultRevisionId || 'v2-revision'}`
        });
        setLastSubmittedOutcome(null);
        fetchRequests();
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mb-1">
          <RotateCcw className="w-4 h-4" /> MODULE 16 &bull; EVALUATOR & EXAM OFFICE OUTCOMES
        </div>
        <h1 className="text-2xl font-bold text-slate-100">Review Outcome Entry & Revision Approval</h1>
        <p className="text-slate-400 text-sm mt-1">
          Record evaluation changes and approve outcomes to generate superseding result revisions.
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300' : 'bg-rose-950/80 border border-rose-800 text-rose-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcome Form */}
        <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg space-y-4">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-purple-400" /> Enter Review Outcome
          </h2>

          <form onSubmit={handleOutcomeSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">SELECT REVIEW REQUEST</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
              >
                <option value="">-- Active Assigned Requests --</option>
                {requests
                  .filter((r) => r.status === ReviewRequestStatus.IN_REVIEW || r.status === ReviewRequestStatus.ASSIGNED || r.status === ReviewRequestStatus.FEE_PAID)
                  .map((r) => (
                    <option key={r._id} value={r._id}>
                      [{r.reviewType}] {typeof r.subjectId === 'object' ? r.subjectId.code : r.subjectId} (Orig: {r.originalMarksObtained})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">REVISED MARKS OBTAINED</label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500 font-mono text-lg text-emerald-400"
                value={newMarks}
                onChange={(e) => setNewMarks(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">OUTCOME TYPE</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                value={outcomeType}
                onChange={(e) => setOutcomeType(e.target.value as ReviewOutcomeType)}
              >
                <option value={ReviewOutcomeType.MARKS_INCREASED}>MARKS_INCREASED</option>
                <option value={ReviewOutcomeType.NO_CHANGE}>NO_CHANGE</option>
                <option value={ReviewOutcomeType.MARKS_DECREASED}>MARKS_DECREASED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">JUSTIFICATION / REASON</label>
              <textarea
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
                placeholder="Reason for mark change or confirmation..."
                value={outcomeReason}
                onChange={(e) => setOutcomeReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" /> Record Reviewer Outcome
            </button>
          </form>
        </div>

        {/* Outcome Approval & Action Queue */}
        <div className="lg:col-span-2 space-y-6">
          {lastSubmittedOutcome && (
            <div className="bg-purple-950/40 border border-purple-800 p-6 rounded-2xl shadow-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">PENDING EXAM OFFICE APPROVAL</span>
                <span className="font-mono text-xs text-purple-300">ID: {lastSubmittedOutcome._id}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400 text-xs block">Original Score:</span>
                  <span className="font-bold text-slate-200">{lastSubmittedOutcome.originalMarks} ({lastSubmittedOutcome.originalGrade})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-xs block">Revised Score:</span>
                  <span className="font-bold text-emerald-400">{lastSubmittedOutcome.newMarks} ({lastSubmittedOutcome.newGrade})</span>
                </div>
              </div>

              <button
                onClick={() => handleApproveOutcome(lastSubmittedOutcome._id)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition shadow-lg flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" /> Approve Outcome & Generate Revision v2
              </button>
            </div>
          )}

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" /> Completed & Pending Outcomes
            </h2>

            {requests.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No outcome records to display.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs text-slate-400 uppercase">
                    <tr>
                      <th className="p-3">Request</th>
                      <th className="p-3">Paper</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {requests.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono text-xs text-slate-400">{r._id.substring(0, 8)}...</td>
                        <td className="p-3 font-medium text-slate-200">
                          {typeof r.subjectId === 'object' ? `${r.subjectId.code} - ${r.subjectId.name}` : r.subjectId}
                        </td>
                        <td className="p-3">{r.reviewType}</td>
                        <td className="p-3 font-mono text-xs text-purple-300">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. STUDENT DECISION NOTICE BOARD & COMPARISON
// ==========================================
export const StudentMyDecisionsPage: React.FC = () => {
  const [decisions, setDecisions] = useState<StudentDecisionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDecisions();
  }, []);

  const fetchDecisions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/revaluation/my-decisions');
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.decisions || (Array.isArray(data) ? data : []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
          <Sparkles className="w-4 h-4" /> MODULE 16 &bull; STUDENT DECISION NOTICE
        </div>
        <h1 className="text-2xl font-bold text-slate-100">My Revaluation & Retotalling Decisions</h1>
        <p className="text-slate-400 text-sm mt-1">
          Official decision notices, before/after score comparisons, and fee refund statuses.
        </p>
      </div>

      {decisions.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 p-12 rounded-2xl text-center">
          <FileSearch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No Revaluation Decisions Available</h3>
          <p className="text-slate-500 text-sm mt-1">
            Submit a retotalling or revaluation application from the Apply tab once examination results are published.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {decisions.map((item, idx) => (
            <div key={idx} className="bg-slate-900/70 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    OFFICIAL DECISION NOTICE &bull; {item.request.reviewType}
                  </span>
                  <h3 className="text-xl font-bold text-slate-100 mt-1">
                    {typeof item.request.subjectId === 'object'
                      ? `${item.request.subjectId.code} - ${item.request.subjectId.name}`
                      : item.request.subjectId}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-800 text-emerald-300">
                    Status: {item.request.status}
                  </span>
                </div>
              </div>

              {item.beforeAfter ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Before */}
                  <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl space-y-1">
                    <span className="text-xs text-slate-400 uppercase font-semibold">ORIGINAL SCORE (v1)</span>
                    <div className="text-2xl font-bold text-slate-200">
                      {item.beforeAfter.originalMarks} <span className="text-sm font-normal text-slate-400">marks</span>
                    </div>
                    <div className="text-xs text-slate-400">Grade: {item.beforeAfter.originalGrade}</div>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center">
                    <div className="bg-slate-800 border border-slate-700 p-3 rounded-full text-emerald-400">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>

                  {/* After */}
                  <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl space-y-1">
                    <span className="text-xs text-emerald-400 uppercase font-semibold">REVISED SCORE (v2 SUPERSEDING)</span>
                    <div className="text-2xl font-bold text-emerald-300">
                      {item.beforeAfter.newMarks} <span className="text-sm font-normal text-emerald-400">marks</span>
                    </div>
                    <div className="text-xs text-emerald-400">Revised Grade: {item.beforeAfter.newGrade}</div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">Decision outcome pending reviewer evaluation and exam office approval.</p>
              )}

              {item.outcome && (
                <div className="bg-slate-800/40 p-4 rounded-xl text-xs space-y-1">
                  <span className="text-slate-400 block font-semibold">Evaluator Reason:</span>
                  <p className="text-slate-300">{item.outcome.reason || 'No specific reason entered.'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
