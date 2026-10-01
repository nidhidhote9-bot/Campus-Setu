import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Send,
  Clock,
  UserCheck,
  ShieldCheck,
  Download,
  QrCode,
  Share2,
  XCircle,
  Search,
  Eye,
  FileText,
  FileCheck,
  CheckSquare,
  Lock,
  ExternalLink,
  Copy,
  AlertCircle
} from 'lucide-react';
import {
  CertificateCategory,
  CertificateRequestStatus,
  CertificateStatus,
  formatPaiseToRupees
} from '@shared/index';

interface CertificateType {
  _id: string;
  code: string;
  title: string;
  category: CertificateCategory;
  feeAmountPaise: number;
  processingDays: number;
  requiresNoDuesClearance: boolean;
  templateBody: string;
  isActive: boolean;
}

interface CertificateRequestItem {
  _id: string;
  requestNumber: string;
  studentId: {
    _id: string;
    rollNumber: string;
    enrollmentNumber: string;
    name?: string;
    email?: string;
  } | string;
  certificateTypeId: CertificateType | string;
  certificateTypeCode: string;
  purpose: string;
  deliveryMode: string;
  supportingNotes?: string;
  status: CertificateRequestStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
}

interface IssuedCertificateItem {
  _id: string;
  certificateNumber: string;
  requestId: string;
  studentId: {
    _id: string;
    rollNumber: string;
    enrollmentNumber: string;
    name?: string;
  } | string;
  certificateTypeId: CertificateType | string;
  snapshotData: any;
  documentHash: string;
  verificationToken: string;
  verificationUrl: string;
  issuedAt: string;
  validUntil?: string;
  status: CertificateStatus;
  revocation?: {
    revokedAt: string;
    revocationReason: string;
  } | null;
}

interface EligibilityResult {
  eligible: boolean;
  noDuesClearance: boolean;
  reasons: string[];
  student?: any;
  type?: any;
}

export const CertificatePages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'catalog';
  const paramToken = searchParams.get('token') || '';

  const [types, setTypes] = useState<CertificateType[]>([]);
  const [requests, setRequests] = useState<CertificateRequestItem[]>([]);
  const [myCertificates, setMyCertificates] = useState<IssuedCertificateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [selectedType, setSelectedType] = useState<string>('BONAFIDE');
  const [purpose, setPurpose] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('DIGITAL_ONLY');
  const [supportingNotes, setSupportingNotes] = useState('');
  const [eligibilityCheck, setEligibilityCheck] = useState<EligibilityResult | null>(null);

  // Review & Issue Modal State
  const [reviewModalRequest, setReviewModalRequest] = useState<CertificateRequestItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [validUntilDays, setValidUntilDays] = useState<number>(365);

  // Public Verify State
  const [verifyTokenInput, setVerifyTokenInput] = useState(paramToken);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  // Modal State for Previewing PDF Snapshot
  const [pdfPreviewCert, setPdfPreviewCert] = useState<IssuedCertificateItem | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    fetchTypes();
    if (activeTab === 'catalog' || activeTab === 'review') {
      fetchRequests();
    }
    if (activeTab === 'my-certificates') {
      fetchMyCertificates();
    }
    if (activeTab === 'verify' && paramToken) {
      setVerifyTokenInput(paramToken);
      performVerification(paramToken);
    }
  }, [activeTab, paramToken]);

  const fetchTypes = async () => {
    try {
      const res = await fetch('/api/v1/certificates/types');
      if (res.ok) {
        const data = await res.json();
        setTypes(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/certificates/requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCertificates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/certificates/my-certificates');
      if (res.ok) {
        const data = await res.json();
        setMyCertificates(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (code: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/certificates/eligibility?code=${code}`);
      const data = await res.json();
      if (res.ok) {
        setEligibilityCheck(data);
      } else {
        setError(data.error || 'Failed to check eligibility');
        setEligibilityCheck(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await fetch('/api/v1/certificates/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateTypeCode: selectedType,
          purpose,
          deliveryMode,
          supportingNotes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit certificate request');
      }

      setSuccessMsg(`Certificate request submitted successfully! Request No: ${data.requestNumber}`);
      setPurpose('');
      setSupportingNotes('');
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewRequest = async (requestId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/v1/certificates/requests/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          action,
          rejectionReason: action === 'REJECT' ? rejectionReason : undefined
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to review request');

      setSuccessMsg(`Request ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully.`);
      setReviewModalRequest(null);
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCertificate = async (requestId: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/v1/certificates/requests/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          validUntilDays
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue certificate');

      setSuccessMsg(`Certificate issued successfully! Cert No: ${data.certificate.certificateNumber}`);
      setReviewModalRequest(null);
      fetchRequests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeCertificate = async (certificateId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/v1/certificates/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          certificateId,
          revocationReason: reason
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke certificate');

      setSuccessMsg(`Certificate ${data.certificate.certificateNumber} revoked successfully.`);
      fetchRequests();
      fetchMyCertificates();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const performVerification = async (tokenStr: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/v1/certificates/verify/${tokenStr.trim()}`);
      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      setError('Verification service unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (certId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/certificates/${certId}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to download certificate PDF');

      // Create downloadable JSON simulated PDF file
      const blob = new Blob([JSON.stringify(data.pdfPayload, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${data.certificate.certificateNumber}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyVerificationLink = (token: string) => {
    const fullUrl = `${window.location.origin}/app/certificates/verify?token=${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Award size={280} />
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-400/30 text-xs font-semibold uppercase tracking-wider text-blue-200 mb-2">
              <ShieldCheck size={14} /> M17 Domain Engine
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Certificates & Digital Document Verification</h1>
            <p className="text-blue-200 text-sm mt-1 max-w-2xl">
              Issue, verify, and track digital institutional credentials with immutable snapshot hashes, private downloads, and public QR verification.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 text-xs text-blue-100 flex flex-col gap-1">
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <Lock size={12} /> [DEMO / SIMULATION MODE]
            </span>
            <span>Cryptographic document snapshot & SHA-256 hash preservation.</span>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-blue-800/60">
          <button
            onClick={() => setSearchParams({ tab: 'catalog' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-blue-950 shadow-lg'
                : 'bg-blue-950/40 text-blue-200 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <Award size={16} /> Catalog & Request
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'review' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-white text-blue-950 shadow-lg'
                : 'bg-blue-950/40 text-blue-200 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <UserCheck size={16} /> Staff Review & Issuance
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'my-certificates' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'my-certificates'
                ? 'bg-white text-blue-950 shadow-lg'
                : 'bg-blue-950/40 text-blue-200 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <FileCheck size={16} /> My Certificates
          </button>
          <button
            onClick={() => setSearchParams({ tab: 'verify' })}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'verify'
                ? 'bg-white text-blue-950 shadow-lg'
                : 'bg-blue-950/40 text-blue-200 hover:bg-blue-800/40 hover:text-white'
            }`}
          >
            <QrCode size={16} /> Public QR Verification
          </button>
        </div>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3">
          <AlertTriangle className="shrink-0 text-rose-600" size={20} />
          <div className="flex-1 text-sm font-medium">{error}</div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">×</button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="shrink-0 text-emerald-600" size={20} />
          <div className="flex-1 text-sm font-medium">{successMsg}</div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      {/* TAB 1: CATALOG & REQUEST FORM */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Certificate Types Catalog */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award className="text-indigo-600" size={20} /> Certificate Catalog
            </h2>

            <div className="space-y-3">
              {types.map((type) => (
                <div
                  key={type._id}
                  onClick={() => {
                    setSelectedType(type.code);
                    checkEligibility(type.code);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedType === type.code
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-900 text-sm">{type.title}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                      {type.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mb-2">{type.category}</div>
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
                    <span className="font-semibold text-indigo-900">
                      Fee: {type.feeAmountPaise === 0 ? 'Free' : `₹${formatPaiseToRupees(type.feeAmountPaise)}`}
                    </span>
                    <span className="text-slate-500">{type.processingDays} Days SLA</span>
                  </div>
                  {type.requiresNoDuesClearance && (
                    <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 border border-amber-200">
                      <Lock size={10} /> Requires No-Dues Clearance
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form & Eligibility Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Eligibility Checklist Banner */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                  <UserCheck className="text-indigo-600" size={18} /> Eligibility Checklist: <span className="text-indigo-900">{selectedType}</span>
                </h3>
                <button
                  onClick={() => checkEligibility(selectedType)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline"
                >
                  Re-check Eligibility
                </button>
              </div>

              {eligibilityCheck ? (
                <div className={`p-4 rounded-xl border text-sm ${
                  eligibilityCheck.eligible
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {eligibilityCheck.eligible ? (
                      <>
                        <CheckCircle2 className="text-emerald-600" size={18} /> Student is Eligible for Certificate Request
                      </>
                    ) : (
                      <>
                        <XCircle className="text-rose-600" size={18} /> Student Ineligible for Certificate Request
                      </>
                    )}
                  </div>
                  {eligibilityCheck.reasons.length > 0 && (
                    <ul className="list-disc list-inside text-xs mt-2 space-y-1">
                      {eligibilityCheck.reasons.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" /> Click a certificate type above or submit to verify eligibility.
                </div>
              )}
            </div>

            {/* Request Form */}
            <form onSubmit={handleSubmitRequest} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Send className="text-indigo-600" size={18} /> Certificate Request Form
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value);
                      checkEligibility(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {types.map((t) => (
                      <option key={t._id} value={t.code}>
                        {t.title} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Mode</label>
                  <select
                    value={deliveryMode}
                    onChange={(e) => setDeliveryMode(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="DIGITAL_ONLY">Digital PDF Download & QR Verification</option>
                    <option value="PHYSICAL_COPY">Physical Printed Copy</option>
                    <option value="BOTH">Both Digital & Physical Copy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Reason for Request *</label>
                <textarea
                  required
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="E.g., Higher studies application, Passport verification, Employment onboard..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supporting Notes / Enclosures (Optional)</label>
                <input
                  type="text"
                  value={supportingNotes}
                  onChange={(e) => setSupportingNotes(e.target.value)}
                  placeholder="Reference numbers or specific department instructions..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <div className="text-xs text-slate-500">
                  Credential Notice: All issued certificates marked <span className="font-semibold text-indigo-900">[DEMO / SIMULATION MODE]</span>
                </div>
                <button
                  type="submit"
                  disabled={loading || (eligibilityCheck !== null && !eligibilityCheck.eligible)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Send size={16} /> Submit Certificate Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF REVIEW & ISSUANCE QUEUE */}
      {activeTab === 'review' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UserCheck className="text-indigo-600" size={20} /> Certificate Review & Approval Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Staff authority verification, template preview, approval, and cryptographic snapshot issuance.</p>
            </div>
            <button
              onClick={fetchRequests}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1"
            >
              Refresh Queue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Request No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Certificate Type</th>
                  <th className="py-3 px-4">Purpose</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No certificate requests found in queue.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => {
                    const student = typeof req.studentId === 'object' ? req.studentId : null;
                    const certType = typeof req.certificateTypeId === 'object' ? req.certificateTypeId : null;

                    return (
                      <tr key={req._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs font-bold text-slate-900">{req.requestNumber}</td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-xs">{student?.name || 'Student'}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{student?.rollNumber}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {req.certificateTypeCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">{req.purpose}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{new Date(req.submittedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            req.status === CertificateRequestStatus.SUBMITTED
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : req.status === CertificateRequestStatus.APPROVED
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : req.status === CertificateRequestStatus.ISSUED
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setReviewModalRequest(req)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                            >
                              <Eye size={14} /> Review & Action
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MY CERTIFICATES (STUDENT VIEW) */}
      {activeTab === 'my-certificates' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="text-indigo-600" size={20} /> My Digital Certificates
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Private authenticated downloads, cryptographic snapshot verification, and sharing links.</p>
            </div>
            <button
              onClick={fetchMyCertificates}
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1"
            >
              Refresh My Certificates
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCertificates.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <Award size={48} className="mx-auto text-slate-300 mb-2" />
                <div className="font-semibold text-slate-700">No Issued Certificates Found</div>
                <div className="text-xs text-slate-500 mt-1">Submit a certificate request from the catalog tab to get started.</div>
              </div>
            ) : (
              myCertificates.map((cert) => {
                const certType = typeof cert.certificateTypeId === 'object' ? cert.certificateTypeId : null;
                const isRevoked = cert.status === CertificateStatus.REVOKED;

                return (
                  <div
                    key={cert._id}
                    className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4 relative overflow-hidden transition-all ${
                      isRevoked ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {/* Top Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono font-bold text-slate-500 uppercase">{cert.certificateNumber}</span>
                        <h3 className="text-md font-extrabold text-slate-900 mt-0.5">{certType?.title || 'Digital Certificate'}</h3>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isRevoked
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}>
                        {cert.status}
                      </span>
                    </div>

                    {/* Metadata details */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Issued Date:</span>
                        <span className="font-semibold text-slate-900">{new Date(cert.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Verification Token:</span>
                        <span className="font-mono font-semibold text-indigo-900">{cert.verificationToken}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SHA-256 Hash:</span>
                        <span className="font-mono text-[10px] text-slate-500 truncate max-w-[180px]">{cert.documentHash}</span>
                      </div>
                    </div>

                    {/* Revocation Warning if Revoked */}
                    {isRevoked && cert.revocation && (
                      <div className="bg-rose-100/70 border border-rose-300 text-rose-900 p-3 rounded-xl text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <XCircle size={14} className="text-rose-600" /> Certificate Revoked by Authority
                        </div>
                        <div>Reason: {cert.revocation.revocationReason}</div>
                        <div className="text-[11px] text-rose-700">Revoked At: {new Date(cert.revocation.revokedAt).toLocaleString()}</div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-wrap gap-2 justify-between items-center">
                      <button
                        onClick={() => handleDownloadPdf(cert._id)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Download size={14} /> Download PDF Snapshot
                      </button>

                      <div className="flex gap-2">
                        <button
                          onClick={() => copyVerificationLink(cert.verificationToken)}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border border-slate-200"
                        >
                          <Share2 size={14} /> {copiedToken === cert.verificationToken ? 'Copied!' : 'Copy Link'}
                        </button>

                        <button
                          onClick={() => {
                            setSearchParams({ tab: 'verify', token: cert.verificationToken });
                          }}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 border border-indigo-200"
                        >
                          <QrCode size={14} /> Verify QR
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PUBLIC QR VERIFICATION PAGE */}
      {activeTab === 'verify' && (
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-1">
              <QrCode size={36} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">Public Document Verification Portal</h2>
            <p className="text-slate-500 text-sm max-w-lg mx-auto">
              Scan QR code or enter opaque verification token / certificate number to inspect minimal verified public facts.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                performVerification(verifyTokenInput);
              }}
              className="flex gap-2 max-w-md mx-auto pt-2"
            >
              <input
                type="text"
                required
                value={verifyTokenInput}
                onChange={(e) => setVerifyTokenInput(e.target.value)}
                placeholder="Enter Token (e.g. VRF-A1B2C3) or Cert No..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <Search size={16} /> Verify
              </button>
            </form>
          </div>

          {/* Verification Result Card */}
          {verificationResult && (
            <div className={`bg-white rounded-2xl border p-6 shadow-md space-y-4 ${
              verificationResult.valid
                ? 'border-emerald-300 ring-2 ring-emerald-100'
                : 'border-rose-300 ring-2 ring-rose-100'
            }`}>
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {verificationResult.valid ? (
                    <CheckCircle2 size={24} className="text-emerald-600" />
                  ) : (
                    <XCircle size={24} className="text-rose-600" />
                  )}
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">
                      {verificationResult.valid ? 'Verified Authentic Certificate' : 'Certificate Verification Failed'}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">Status: {verificationResult.status}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  verificationResult.valid
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {verificationResult.status}
                </span>
              </div>

              {verificationResult.message && (
                <div className="p-3 bg-slate-50 text-slate-700 text-xs rounded-xl border border-slate-200">
                  {verificationResult.message}
                </div>
              )}

              {verificationResult.certificateNumber && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Certificate Title</span>
                    <span className="font-bold text-slate-900 text-sm">{verificationResult.certificateTitle}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Certificate Number</span>
                    <span className="font-mono font-bold text-indigo-900">{verificationResult.certificateNumber}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Student Name (Masked for Privacy)</span>
                    <span className="font-bold text-slate-900">{verificationResult.studentNameMasked}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Student Roll Number</span>
                    <span className="font-mono font-semibold text-slate-900">{verificationResult.studentRollNumber}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Issued Date</span>
                    <span className="font-semibold text-slate-900">{new Date(verificationResult.issueDate).toLocaleDateString()}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-slate-500 font-semibold block">Cryptographic SHA-256 Hash</span>
                    <span className="font-mono text-[10px] text-slate-600 truncate block">{verificationResult.documentHash}</span>
                  </div>
                </div>
              )}

              {/* Revocation notice if revoked */}
              {verificationResult.revocation && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-800">
                    <AlertTriangle size={16} /> Verified as REVOKED
                  </div>
                  <div>Revocation Reason: {verificationResult.revocation.revocationReason}</div>
                  <div className="text-[11px] text-rose-700">Revoked On: {new Date(verificationResult.revocation.revokedAt).toLocaleString()}</div>
                </div>
              )}

              {/* Mandatory Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[11px] text-amber-900 flex items-center gap-2">
                <Lock size={14} className="shrink-0 text-amber-700" />
                <span>{verificationResult.disclaimer}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* REVIEW & ISSUE MODAL */}
      {reviewModalRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Certificate Request Review & Issuance</h3>
                <span className="font-mono text-xs font-bold text-indigo-900">{reviewModalRequest.requestNumber}</span>
              </div>
              <button
                onClick={() => setReviewModalRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            {/* Template Body Preview */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Template Body & Purpose Preview</label>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-800 space-y-2">
                <div className="font-semibold text-indigo-950">Purpose: {reviewModalRequest.purpose}</div>
                <div className="font-mono text-[11px] bg-white p-3 rounded border border-slate-200 leading-relaxed">
                  {typeof reviewModalRequest.certificateTypeId === 'object' && reviewModalRequest.certificateTypeId
                    ? (reviewModalRequest.certificateTypeId as CertificateType).templateBody
                    : 'Certificate template preview...'}
                </div>
              </div>
            </div>

            {/* Rejection reason box */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason (If rejecting)</label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Specify reason if rejecting this request..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
              <button
                onClick={() => handleReviewRequest(reviewModalRequest._id, 'REJECT')}
                disabled={loading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                Reject Request
              </button>

              <div className="flex gap-2">
                {reviewModalRequest.status !== CertificateRequestStatus.APPROVED && (
                  <button
                    onClick={() => handleReviewRequest(reviewModalRequest._id, 'APPROVE')}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                  >
                    Approve Request
                  </button>
                )}

                <button
                  onClick={() => handleIssueCertificate(reviewModalRequest._id)}
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                >
                  <Award size={14} /> Issue Certificate Snapshot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
