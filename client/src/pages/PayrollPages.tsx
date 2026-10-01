import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IndianRupee,
  Layers,
  PlayCircle,
  FileText,
  Receipt,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Send,
  Building,
  ShieldAlert,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';

const formatPaiseToRupees = (paise: number) => {
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  });
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStyle = (s: string) => {
    switch (s) {
      case 'APPROVED':
      case 'DISBURSED':
      case 'REIMBURSED':
      case 'SUCCESS':
      case 'ACTIVE':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'DRAFT':
      case 'SUBMITTED':
      case 'VALIDATED':
      case 'PENDING':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'REJECTED':
      case 'CANCELLED':
      case 'FAILED':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(status)}`}>
      {status}
    </span>
  );
};

interface SalaryStructure {
  _id: string;
  code: string;
  title: string;
  version: number;
  effectiveFrom: string;
  totalGrossPaise: number;
  totalDeductionsPaise: number;
  netPayablePaise: number;
  components: Array<{
    name: string;
    category: string;
    componentType: string;
    amountPaise: number;
  }>;
  status: string;
}

interface PayrollRun {
  _id: string;
  runNumber: string;
  year: number;
  month: number;
  payPeriod: string;
  totalEmployees: number;
  totalGrossPaise: number;
  totalDeductionsPaise: number;
  totalNetPaise: number;
  status: string;
  disbursedAt?: string;
  approvedAt?: string;
}

interface Payslip {
  _id: string;
  payslipNumber: string;
  payPeriod: string;
  grossEarningsPaise: number;
  totalDeductionsPaise: number;
  netPayablePaise: number;
  basicPaise: number;
  hraPaise: number;
  allowancesPaise: number;
  pfDeductionPaise: number;
  taxDeductionPaise: number;
  otherDeductionsPaise: number;
  isDisbursed: boolean;
  credentialNotice: string;
}

interface ExpenseClaim {
  _id: string;
  claimNumber: string;
  category: string;
  description: string;
  amountPaise: number;
  status: string;
  attachmentUrl?: string;
  createdAt: string;
  reimbursementReference?: string;
  rejectionReason?: string;
  employeeId?: { employeeCode: string; designation: string };
  userId?: { name: string; email: string };
}

export const PayrollPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const getTabFromPath = (pathname: string) => {
    if (pathname.includes('/runs')) return 'runs';
    if (pathname.includes('/my-payslips')) return 'my-payslips';
    if (pathname.includes('/claims')) return 'claims';
    return 'structures';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/app/payroll/${tab}`);
  };

  // State
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [expenseClaims, setExpenseClaims] = useState<ExpenseClaim[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modals
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [newStructure, setNewStructure] = useState({
    code: 'SAL-CUSTOM-2026',
    title: 'Custom Staff Structure',
    basicPaise: 12000000,
    hraPaise: 2880000,
    pfPaise: 1440000,
    taxPaise: 800000
  });

  const [showDraftModal, setShowDraftModal] = useState(false);
  const [newDraft, setNewDraft] = useState({
    year: 2026,
    month: 10,
    payPeriod: 'October 2026'
  });

  const [showClaimModal, setShowClaimModal] = useState(false);
  const [newClaim, setNewClaim] = useState({
    category: 'SEMINAR_FEE',
    amountRupees: 5500,
    description: 'Conference Registration & Research Travel Paper Fee',
    attachmentUrl: '/docs/conference_receipt.pdf'
  });

  const [rejectionRemarks, setRejectionRemarks] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'structures') {
        const res = await fetch('/api/v1/payroll/structures');
        const data = await res.json();
        setStructures(Array.isArray(data) ? data : []);
      } else if (activeTab === 'runs') {
        const res = await fetch('/api/v1/payroll/runs');
        const data = await res.json();
        setPayrollRuns(Array.isArray(data) ? data : []);
      } else if (activeTab === 'my-payslips') {
        const res = await fetch('/api/v1/payroll/my-payslips');
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setPayslips(list);
        if (list.length > 0 && !selectedPayslip) {
          fetchPayslipDetail(list[0]._id);
        }
      } else if (activeTab === 'claims') {
        const res = await fetch('/api/v1/payroll/claims');
        const data = await res.json();
        setExpenseClaims(Array.isArray(data) ? data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payroll data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchPayslipDetail = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/payroll/payslips/${id}`);
      const data = await res.json();
      if (res.ok) setSelectedPayslip(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        code: newStructure.code,
        title: newStructure.title,
        components: [
          { name: 'Basic Pay', category: 'EARNING', componentType: 'BASIC', amountPaise: Number(newStructure.basicPaise) },
          { name: 'House Rent Allowance', category: 'EARNING', componentType: 'HRA', amountPaise: Number(newStructure.hraPaise) },
          { name: 'Provident Fund', category: 'DEDUCTION', componentType: 'PF_DEDUCTION', amountPaise: Number(newStructure.pfPaise) },
          { name: 'Income Tax', category: 'DEDUCTION', componentType: 'TAX_DEDUCTION', amountPaise: Number(newStructure.taxPaise) }
        ]
      };
      const res = await fetch('/api/v1/payroll/structures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create salary structure');
      setActionSuccess('Salary structure created!');
      setShowStructureModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreatePayrollDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/payroll/runs/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDraft)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate payroll draft');
      setActionSuccess('Monthly payroll draft generated!');
      setShowDraftModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApprovePayroll = async (runId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/payroll/runs/${runId}/approve`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve payroll run');
      setActionSuccess('Payroll run approved!');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDisbursePayroll = async (runId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/payroll/runs/${runId}/disburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Simulated salary disbursement via direct bank credit' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to disburse payroll');
      setActionSuccess('Simulated salary disbursement completed successfully!');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        category: newClaim.category,
        description: newClaim.description,
        amountPaise: Math.round(Number(newClaim.amountRupees) * 100),
        attachmentUrl: newClaim.attachmentUrl
      };
      const res = await fetch('/api/v1/payroll/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit expense claim');
      setActionSuccess('Expense claim submitted!');
      setShowClaimModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReviewClaim = async (claimId: string, decision: 'APPROVE' | 'REJECT') => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/payroll/claims/${claimId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, remarks: rejectionRemarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${decision.toLowerCase()} claim`);
      setActionSuccess(`Expense claim ${decision.toLowerCase()}d!`);
      setRejectionRemarks('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReimburseClaim = async (claimId: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/payroll/claims/${claimId}/reimburse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: `SIM-REIMB-REF-${Date.now()}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reimburse expense claim');
      setActionSuccess('Expense claim reimbursed!');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDownloadPayslip = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/payroll/payslips/${id}/download`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to download payslip');
      alert(`[DEMO PAYSLIP ISSUED]\n\nPayslip #: ${data.pdfPayload.payslipNumber}\nPeriod: ${data.pdfPayload.payPeriod}\nNet Payable: ${formatPaiseToRupees(data.pdfPayload.netPayablePaise)}\nNotice: ${data.pdfPayload.credentialNotice}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <IndianRupee className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Payroll & Expenditure Prototype
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Salary structures, monthly payroll runs, simulated bank disbursement & expense claims (Integer Paise Enforcement)
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'structures' && (
            <button
              onClick={() => setShowStructureModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              New Salary Structure
            </button>
          )}
          {activeTab === 'runs' && (
            <button
              onClick={() => setShowDraftModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              Draft Monthly Payroll Run
            </button>
          )}
          {activeTab === 'claims' && (
            <button
              onClick={() => setShowClaimModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition text-sm"
            >
              <Plus className="w-4 h-4" />
              Submit Expense Claim
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl px-4 pt-2">
        <button
          onClick={() => handleTabChange('structures')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'structures'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Salary Structures & Assignments
        </button>
        <button
          onClick={() => handleTabChange('runs')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'runs'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <PlayCircle className="w-4 h-4" />
          Monthly Payroll Runs & Disbursement
        </button>
        <button
          onClick={() => handleTabChange('my-payslips')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'my-payslips'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          My Payslips & History
        </button>
        <button
          onClick={() => handleTabChange('claims')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'claims'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Expense Claims & Reimbursements
        </button>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <LoadingState message="Loading payroll domain data..." />
      ) : (
        <>
          {/* TAB 1: SALARY STRUCTURES & ASSIGNMENTS */}
          {activeTab === 'structures' && (
            <div className="space-y-6">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4 rounded-xl text-amber-800 dark:text-amber-200 text-xs">
                <strong>Simulated Statutory Notice:</strong> All monetary values are processed in Integer Paise. No real tax, provident fund, or statutory compliance filing is claimed or transmitted.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {structures.map((s) => (
                  <div key={s._id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 font-bold">
                          {s.code} (v{s.version})
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">{s.title}</h3>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>

                    <div className="space-y-2 text-xs border-t border-b border-slate-100 dark:border-slate-700 py-3">
                      {s.components.map((c, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className={c.category === 'EARNING' ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-rose-600 font-medium'}>
                            {c.name} ({c.category})
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {c.category === 'DEDUCTION' ? '-' : '+'}{formatPaiseToRupees(c.amountPaise)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 text-center text-xs pt-1">
                      <div>
                        <span className="text-slate-400 block">Gross</span>
                        <span className="font-bold text-emerald-600">{formatPaiseToRupees(s.totalGrossPaise)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Deductions</span>
                        <span className="font-bold text-rose-600">{formatPaiseToRupees(s.totalDeductionsPaise)}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Net Pay</span>
                        <span className="font-bold text-indigo-600">{formatPaiseToRupees(s.netPayablePaise)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MONTHLY PAYROLL RUNS & DISBURSEMENT */}
          {activeTab === 'runs' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Payroll Runs Register</h3>
              {payrollRuns.length === 0 ? (
                <p className="text-sm text-slate-500">No payroll runs created yet.</p>
              ) : (
                <div className="space-y-4">
                  {payrollRuns.map((run) => (
                    <div key={run._id} className="p-5 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-lg">{run.runNumber}</span>
                            <StatusBadge status={run.status} />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">Pay Period: {run.payPeriod} • Staff Count: {run.totalEmployees}</p>
                        </div>
                        <div className="flex gap-2">
                          {run.status === 'DRAFT' && (
                            <button
                              onClick={() => handleApprovePayroll(run._id)}
                              className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                            >
                              Approve Payroll Run
                            </button>
                          )}
                          {run.status === 'APPROVED' && (
                            <button
                              onClick={() => handleDisbursePayroll(run._id)}
                              className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Simulate Disbursement
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-100 dark:border-slate-700 text-sm">
                        <div>
                          <span className="text-xs text-slate-400 block">Total Gross Salary</span>
                          <span className="font-bold text-emerald-600">{formatPaiseToRupees(run.totalGrossPaise)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Total Deductions</span>
                          <span className="font-bold text-rose-600">{formatPaiseToRupees(run.totalDeductionsPaise)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Total Net Disbursement</span>
                          <span className="font-bold text-indigo-600">{formatPaiseToRupees(run.totalNetPaise)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY PAYSLIPS & HISTORY */}
          {activeTab === 'my-payslips' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* List */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Issued Payslips</h3>
                {payslips.length === 0 ? (
                  <p className="text-sm text-slate-500">No payslips issued for user.</p>
                ) : (
                  <div className="space-y-2">
                    {payslips.map((slip) => (
                      <div
                        key={slip._id}
                        onClick={() => fetchPayslipDetail(slip._id)}
                        className={`p-3 rounded-lg cursor-pointer border transition text-sm ${
                          selectedPayslip?._id === slip._id
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                            : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex justify-between font-medium text-slate-900 dark:text-white">
                          <span>{slip.payPeriod}</span>
                          <span className="text-indigo-600 font-bold">{formatPaiseToRupees(slip.netPayablePaise)}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{slip.payslipNumber}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail Payslip Preview */}
              <div className="lg:col-span-2">
                {selectedPayslip ? (
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6 shadow-sm">
                    <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 block">{selectedPayslip.credentialNotice}</span>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Salary Payslip — {selectedPayslip.payPeriod}</h2>
                        <p className="text-xs text-slate-500">Payslip No: {selectedPayslip.payslipNumber}</p>
                      </div>
                      <button
                        onClick={() => handleDownloadPayslip(selectedPayslip._id)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download DEMO Payslip
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-2 bg-slate-50 dark:bg-slate-750 p-4 rounded-xl border">
                        <h4 className="font-bold text-emerald-700 dark:text-emerald-400 border-b pb-1">Earnings</h4>
                        <div className="flex justify-between text-xs">
                          <span>Basic Salary</span>
                          <span>{formatPaiseToRupees(selectedPayslip.basicPaise)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>House Rent Allowance (HRA)</span>
                          <span>{formatPaiseToRupees(selectedPayslip.hraPaise)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Allowances</span>
                          <span>{formatPaiseToRupees(selectedPayslip.allowancesPaise)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold border-t pt-2 text-slate-900 dark:text-white">
                          <span>Total Gross Earnings</span>
                          <span className="text-emerald-600">{formatPaiseToRupees(selectedPayslip.grossEarningsPaise)}</span>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-50 dark:bg-slate-750 p-4 rounded-xl border">
                        <h4 className="font-bold text-rose-700 dark:text-rose-400 border-b pb-1">Deductions</h4>
                        <div className="flex justify-between text-xs">
                          <span>Provident Fund (PF)</span>
                          <span>{formatPaiseToRupees(selectedPayslip.pfDeductionPaise)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Income & Professional Tax</span>
                          <span>{formatPaiseToRupees(selectedPayslip.taxDeductionPaise)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Other Deductions</span>
                          <span>{formatPaiseToRupees(selectedPayslip.otherDeductionsPaise)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold border-t pt-2 text-slate-900 dark:text-white">
                          <span>Total Deductions</span>
                          <span className="text-rose-600">{formatPaiseToRupees(selectedPayslip.totalDeductionsPaise)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-indigo-50 dark:bg-indigo-950/40 p-5 rounded-xl border border-indigo-200 dark:border-indigo-800 flex justify-between items-center">
                      <div>
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-medium block">Net Salary Credit (Integer Paise)</span>
                        <span className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-100">
                          {formatPaiseToRupees(selectedPayslip.netPayablePaise)}
                        </span>
                      </div>
                      <StatusBadge status={selectedPayslip.isDisbursed ? 'DISBURSED' : 'PENDING'} />
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-xl text-center text-slate-500">
                    Select a payslip to view detail.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EXPENSE CLAIMS & REIMBURSEMENTS */}
          {activeTab === 'claims' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Claims & Reimbursements Queue</h3>
              {expenseClaims.length === 0 ? (
                <p className="text-sm text-slate-500">No expense claims filed.</p>
              ) : (
                <div className="space-y-4">
                  {expenseClaims.map((claim) => (
                    <div key={claim._id} className="p-5 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                            {claim.claimNumber}
                          </span>
                          <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{claim.description}</h4>
                          <span className="text-xs text-slate-400">Category: {claim.category} • Filed: {new Date(claim.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-slate-900 dark:text-white block">{formatPaiseToRupees(claim.amountPaise)}</span>
                          <StatusBadge status={claim.status} />
                        </div>
                      </div>

                      {claim.status === 'SUBMITTED' && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => handleReviewClaim(claim._id, 'APPROVE')}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                          >
                            Approve Claim
                          </button>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Rejection remarks..."
                              value={rejectionRemarks}
                              onChange={(e) => setRejectionRemarks(e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                            <button
                              onClick={() => handleReviewClaim(claim._id, 'REJECT')}
                              className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}

                      {claim.status === 'APPROVED' && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => handleReimburseClaim(claim._id)}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Simulate Reimbursement Disbursement
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {showStructureModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Salary Structure</h3>
            <form onSubmit={handleCreateStructure} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Structure Code</label>
                <input
                  type="text"
                  required
                  value={newStructure.code}
                  onChange={(e) => setNewStructure({ ...newStructure, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Structure Title</label>
                <input
                  type="text"
                  required
                  value={newStructure.title}
                  onChange={(e) => setNewStructure({ ...newStructure, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Basic Pay (Paise)</label>
                  <input
                    type="number"
                    required
                    value={newStructure.basicPaise}
                    onChange={(e) => setNewStructure({ ...newStructure, basicPaise: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">HRA (Paise)</label>
                  <input
                    type="number"
                    required
                    value={newStructure.hraPaise}
                    onChange={(e) => setNewStructure({ ...newStructure, hraPaise: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">PF Deduction (Paise)</label>
                  <input
                    type="number"
                    required
                    value={newStructure.pfPaise}
                    onChange={(e) => setNewStructure({ ...newStructure, pfPaise: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Tax Deduction (Paise)</label>
                  <input
                    type="number"
                    required
                    value={newStructure.taxPaise}
                    onChange={(e) => setNewStructure({ ...newStructure, taxPaise: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStructureModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Create Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDraftModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Draft Monthly Payroll Run</h3>
            <form onSubmit={handleCreatePayrollDraft} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Year</label>
                  <input
                    type="number"
                    required
                    value={newDraft.year}
                    onChange={(e) => setNewDraft({ ...newDraft, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Month (1-12)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={12}
                    value={newDraft.month}
                    onChange={(e) => setNewDraft({ ...newDraft, month: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Pay Period Label</label>
                <input
                  type="text"
                  required
                  value={newDraft.payPeriod}
                  onChange={(e) => setNewDraft({ ...newDraft, payPeriod: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDraftModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Generate Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showClaimModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Expense Claim</h3>
            <form onSubmit={handleSubmitClaim} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Expense Category</label>
                <select
                  value={newClaim.category}
                  onChange={(e) => setNewClaim({ ...newClaim, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="TRAVEL">Travel Expenses</option>
                  <option value="SUPPLIES">Lab & Office Supplies</option>
                  <option value="EQUIPMENT">Equipment & Consumables</option>
                  <option value="SEMINAR_FEE">Seminar / Conference Fee</option>
                  <option value="OTHER">Other Expense</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Amount (INR ₹)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={newClaim.amountRupees}
                  onChange={(e) => setNewClaim({ ...newClaim, amountRupees: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Claim Description</label>
                <textarea
                  required
                  value={newClaim.description}
                  onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollPages;
