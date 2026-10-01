import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Calendar,
  CheckSquare,
  Building,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  Plus,
  Search,
  ShieldAlert,
  Award,
  CalendarDays,
  FileCheck
} from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStyle = (s: string) => {
    switch (s) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'PENDING':
      case 'INITIATED':
      case 'UNDER_REVIEW':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'REJECTED':
      case 'CANCELLED':
      case 'INACTIVE':
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

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 flex items-center gap-2">
    <AlertCircle className="w-5 h-5 flex-shrink-0" />
    <span>{message}</span>
  </div>
);


interface Employee {
  _id: string;
  employeeCode: string;
  name: string;
  email: string;
  designation: string;
  departmentName: string;
  employmentType: string;
  joiningDate: string;
  dob: string;
  retirementDate: string;
  status: string;
  serviceDocuments?: Array<{ docType: string; docName: string; fileUrl: string; uploadedAt: string }>;
}

interface Appointment {
  _id: string;
  employeeId: string;
  postTitle: string;
  departmentName: string;
  startDate: string;
  payScale: string;
  status: string;
}

interface LeavePolicy {
  _id: string;
  policyCode: string;
  leaveType: string;
  name: string;
  annualQuota: number;
  carryForwardMax: number;
}

interface LeaveBalance {
  _id: string;
  employeeId: string;
  year: number;
  leaveType: string;
  totalAccrued: number;
  usedDays: number;
  pendingDays: number;
  remainingDays: number;
}

interface LeaveRequest {
  _id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  appliedAt: string;
  rejectionReason?: string;
  employeeName?: string;
  employeeCode?: string;
}

interface Vacancy {
  _id: string;
  postTitle: string;
  departmentName: string;
  sanctionedSeats: number;
  filledSeats: number;
  vacantSeats: number;
}

interface EstablishmentCase {
  _id: string;
  caseNumber: string;
  caseType: string;
  employeeId: string;
  title: string;
  description: string;
  status: string;
  timelineSteps: Array<{ title: string; remarks: string; timestamp: string; actorName: string }>;
  createdAt: string;
}

export const StaffPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active tab derived from path
  const getTabFromPath = (pathname: string) => {
    if (pathname.includes('/my-leave')) return 'my-leave';
    if (pathname.includes('/approvals')) return 'approvals';
    if (pathname.includes('/establishment')) return 'establishment';
    return 'employees';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath(location.pathname));

  // Sync state if route changes
  useEffect(() => {
    setActiveTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(`/app/hr/${tab}`);
  };

  // State for data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeAppointments, setEmployeeAppointments] = useState<Appointment[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [establishmentCases, setEstablishmentCases] = useState<EstablishmentCase[]>([]);
  const [selectedCase, setSelectedCase] = useState<EstablishmentCase | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Forms state
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    employeeCode: '',
    name: '',
    email: '',
    designation: 'Assistant Professor',
    departmentName: 'Computer Science',
    employmentType: 'PERMANENT',
    joiningDate: '2026-01-15',
    dob: '1990-05-15'
  });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    employeeId: '',
    postTitle: 'Assistant Professor',
    departmentName: 'Computer Science',
    payScale: 'Level 10 (57700-182400)',
    startDate: '2026-01-15'
  });

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leaveType: 'CASUAL_LEAVE',
    startDate: '2026-10-10',
    endDate: '2026-10-12',
    reason: 'Personal matters'
  });

  const [showCaseModal, setShowCaseModal] = useState(false);
  const [newCase, setNewCase] = useState({
    caseType: 'PENSION_TRACKING',
    employeeId: '',
    title: 'Pension Case Initiation',
    description: 'Processing initial service record verification for retirement clearance.'
  });

  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch data on load/tab change
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'employees') {
        const res = await fetch('/api/v1/hr/employees');
        const data = await res.json();
        if (data.success) {
          setEmployees(data.employees || []);
          if (data.employees && data.employees.length > 0 && !selectedEmployee) {
            fetchEmployeeDetail(data.employees[0]._id);
          }
        }
      } else if (activeTab === 'my-leave') {
        const [polRes, balRes, reqRes] = await Promise.all([
          fetch('/api/v1/hr/leave/policies'),
          fetch('/api/v1/hr/leave/balances'),
          fetch('/api/v1/hr/leave/requests')
        ]);
        const polData = await polRes.json();
        const balData = await balRes.json();
        const reqData = await reqRes.json();
        if (polData.success) setLeavePolicies(polData.policies || []);
        if (balData.success) setLeaveBalances(balData.balances || []);
        if (reqData.success) setLeaveRequests(reqData.requests || []);
      } else if (activeTab === 'approvals') {
        const reqRes = await fetch('/api/v1/hr/leave/requests');
        const reqData = await reqRes.json();
        if (reqData.success) setLeaveRequests(reqData.requests || []);
      } else if (activeTab === 'establishment') {
        const [vacRes, caseRes, empRes] = await Promise.all([
          fetch('/api/v1/hr/establishment/vacancies'),
          fetch('/api/v1/hr/establishment/cases'),
          fetch('/api/v1/hr/employees')
        ]);
        const vacData = await vacRes.json();
        const caseData = await caseRes.json();
        const empData = await empRes.json();
        if (vacData.success) setVacancies(vacData.vacancies || []);
        if (caseData.success) {
          setEstablishmentCases(caseData.cases || []);
          if (caseData.cases && caseData.cases.length > 0 && !selectedCase) {
            setSelectedCase(caseData.cases[0]);
          }
        }
        if (empData.success) setEmployees(empData.employees || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch HR data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchEmployeeDetail = async (empId: string) => {
    try {
      const res = await fetch(`/api/v1/hr/employees/${empId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedEmployee(data.employee);
        setEmployeeAppointments(data.appointments || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Actions
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/hr/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create employee');
      setActionSuccess('Employee created successfully!');
      setShowEmployeeModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/hr/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to assign post');
      setActionSuccess('Post appointment assigned successfully!');
      setShowAppointmentModal(false);
      if (selectedEmployee) fetchEmployeeDetail(selectedEmployee._id);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/hr/leave/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to submit leave request');
      setActionSuccess('Leave request submitted successfully!');
      setShowLeaveModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleApproveRejectLeave = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    setError(null);
    try {
      const res = await fetch('/api/v1/hr/leave/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status, rejectionReason: status === 'REJECTED' ? rejectionReason : undefined })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || `Failed to ${status.toLowerCase()} leave`);
      setActionSuccess(`Leave request ${status.toLowerCase()} successfully!`);
      setRejectionReason('');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelLeave = async (requestId: string) => {
    setError(null);
    try {
      const res = await fetch('/api/v1/hr/leave/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to cancel leave');
      setActionSuccess('Leave request cancelled and balance restored!');
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/v1/hr/establishment/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCase)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to create establishment case');
      setActionSuccess('Establishment case registered!');
      setShowCaseModal(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Staff Establishment & Leave
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage employee service records, post appointments, leave balances & establishment registers
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'employees' && (
            <button
              onClick={() => setShowEmployeeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              New Employee
            </button>
          )}
          {activeTab === 'my-leave' && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              Apply Leave
            </button>
          )}
          {activeTab === 'establishment' && (
            <button
              onClick={() => {
                if (employees.length > 0) {
                  setNewCase({ ...newCase, employeeId: employees[0]._id });
                }
                setShowCaseModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              <Plus className="w-4 h-4" />
              New Establishment Case
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-t-xl px-4 pt-2">
        <button
          onClick={() => handleTabChange('employees')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'employees'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          Employee Directory
        </button>
        <button
          onClick={() => handleTabChange('my-leave')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'my-leave'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          My Leave & Balances
        </button>
        <button
          onClick={() => handleTabChange('approvals')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Manager Approvals Queue
        </button>
        <button
          onClick={() => handleTabChange('establishment')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition ${
            activeTab === 'establishment'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building className="w-4 h-4" />
          Establishment & Vacancies
        </button>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {error && <ErrorState message={error} />}

      {loading ? (
        <LoadingState message="Loading staff data..." />
      ) : (
        <>
          {/* TAB 1: EMPLOYEES DIRECTORY & DETAIL */}
          {activeTab === 'employees' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Directory Sidebar */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Employee Roster</h3>
                <div className="space-y-2">
                  {employees.length === 0 ? (
                    <p className="text-sm text-slate-500">No employees found.</p>
                  ) : (
                    employees.map((emp) => (
                      <div
                        key={emp._id}
                        onClick={() => fetchEmployeeDetail(emp._id)}
                        className={`p-3 rounded-lg cursor-pointer border transition ${
                          selectedEmployee?._id === emp._id
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                            : 'border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-medium text-slate-900 dark:text-white">{emp.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {emp.employeeCode}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{emp.designation} • {emp.departmentName}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Detail Main Panel */}
              <div className="lg:col-span-2 space-y-6">
                {selectedEmployee ? (
                  <>
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedEmployee.name}</h2>
                          <p className="text-sm text-slate-500">{selectedEmployee.employeeCode} • {selectedEmployee.designation}</p>
                        </div>
                        <button
                          onClick={() => {
                            setNewAppointment({ ...newAppointment, employeeId: selectedEmployee._id });
                            setShowAppointmentModal(true);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition"
                        >
                          + Assign Post
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-700 pt-4 text-sm">
                        <div>
                          <span className="text-slate-500 text-xs block">Department</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.departmentName}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block">Employment Type</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{selectedEmployee.employmentType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block">Joining Date</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(selectedEmployee.joiningDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block">Date of Birth</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{new Date(selectedEmployee.dob).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block">Retirement Date</span>
                          <span className="font-medium text-indigo-600 dark:text-indigo-400">{new Date(selectedEmployee.retirementDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-xs block">Status</span>
                          <StatusBadge status={selectedEmployee.status} />
                        </div>
                      </div>
                    </div>

                    {/* Appointment / Post History */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-indigo-600" />
                        Appointment & Post History
                      </h3>
                      {employeeAppointments.length === 0 ? (
                        <p className="text-sm text-slate-500">No active post appointments found.</p>
                      ) : (
                        <div className="space-y-3">
                          {employeeAppointments.map((apt) => (
                            <div key={apt._id} className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                              <div>
                                <span className="font-semibold text-slate-900 dark:text-white">{apt.postTitle}</span>
                                <p className="text-xs text-slate-500">{apt.departmentName} • {apt.payScale}</p>
                              </div>
                              <div className="text-right">
                                <StatusBadge status={apt.status} />
                                <p className="text-xs text-slate-400 mt-1">From {new Date(apt.startDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Restricted Service Documents */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                        <FileCheck className="w-5 h-5 text-indigo-600" />
                        Sensitive Service Documents (Restricted)
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">Access restricted to HR/Admin officers and the individual employee.</p>
                      {selectedEmployee.serviceDocuments && selectedEmployee.serviceDocuments.length > 0 ? (
                        <div className="space-y-2">
                          {selectedEmployee.serviceDocuments.map((doc, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium text-slate-800 dark:text-slate-200">{doc.docName}</span>
                                <span className="text-xs text-slate-400 block">{doc.docType} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                              </div>
                              <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline">
                                View File
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">No service documents filed.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-xl text-center text-slate-500">
                    Select an employee from the roster to view detail.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MY LEAVE & BALANCES */}
          {activeTab === 'my-leave' && (
            <div className="space-y-6">
              {/* Balances Grid */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Accrued Leave Balances (Year 2026)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {leaveBalances.map((bal) => (
                    <div key={bal._id} className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{bal.leaveType.replace('_', ' ')}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold">
                          {bal.remainingDays} Days Left
                        </span>
                      </div>
                      <div className="grid grid-cols-3 text-center pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                        <div>
                          <span className="text-slate-400 block">Accrued</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{bal.totalAccrued}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Used</span>
                          <span className="font-semibold text-amber-600">{bal.usedDays}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Pending</span>
                          <span className="font-semibold text-blue-600">{bal.pendingDays}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Leave History */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Leave Applications</h3>
                {leaveRequests.length === 0 ? (
                  <p className="text-sm text-slate-500">No leave applications submitted.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3">Start Date</th>
                          <th className="py-2 px-3">End Date</th>
                          <th className="py-2 px-3">Days</th>
                          <th className="py-2 px-3">Reason</th>
                          <th className="py-2 px-3">Status</th>
                          <th className="py-2 px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                        {leaveRequests.map((req) => (
                          <tr key={req._id}>
                            <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">{req.leaveType.replace('_', ' ')}</td>
                            <td className="py-3 px-3">{new Date(req.startDate).toLocaleDateString()}</td>
                            <td className="py-3 px-3">{new Date(req.endDate).toLocaleDateString()}</td>
                            <td className="py-3 px-3 font-semibold">{req.totalDays}</td>
                            <td className="py-3 px-3 text-slate-500">{req.reason}</td>
                            <td className="py-3 px-3">
                              <StatusBadge status={req.status} />
                            </td>
                            <td className="py-3 px-3">
                              {(req.status === 'PENDING' || req.status === 'APPROVED') && (
                                <button
                                  onClick={() => handleCancelLeave(req._id)}
                                  className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition"
                                >
                                  Cancel Request
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
          )}

          {/* TAB 3: MANAGER APPROVALS QUEUE */}
          {activeTab === 'approvals' && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Leave Approval Queue</h3>
              <p className="text-xs text-slate-500 mb-4">Review team leave applications. Note: Self-approval is strictly forbidden by policy.</p>

              {leaveRequests.length === 0 ? (
                <p className="text-sm text-slate-500">No pending or historical leave requests found in queue.</p>
              ) : (
                <div className="space-y-4">
                  {leaveRequests.map((req) => (
                    <div key={req._id} className="p-4 bg-slate-50 dark:bg-slate-750 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {req.employeeName || 'Staff Member'} ({req.employeeCode || 'EMP'})
                          </span>
                          <span className="text-xs text-slate-500 block">
                            Requested {req.leaveType.replace('_', ' ')} for <strong className="text-slate-700 dark:text-slate-300">{req.totalDays} day(s)</strong>
                          </span>
                        </div>
                        <StatusBadge status={req.status} />
                      </div>

                      <div className="text-sm grid grid-cols-2 sm:grid-cols-3 gap-2 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                        <div>
                          <span className="text-xs text-slate-400 block">Dates</span>
                          <span>{new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Reason</span>
                          <span className="text-slate-600 dark:text-slate-300">{req.reason}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block">Applied At</span>
                          <span>{new Date(req.appliedAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {req.status === 'PENDING' && (
                        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button
                            onClick={() => handleApproveRejectLeave(req._id, 'APPROVED')}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition"
                          >
                            Approve Leave
                          </button>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Rejection reason..."
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                            <button
                              onClick={() => handleApproveRejectLeave(req._id, 'REJECTED')}
                              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ESTABLISHMENT & VACANCIES */}
          {activeTab === 'establishment' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Vacancies Register */}
              <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  Establishment Vacancy Register
                </h3>
                <p className="text-xs text-slate-500">Vacancy counts derive automatically from active post appointments.</p>
                <div className="space-y-3">
                  {vacancies.map((vac) => (
                    <div key={vac._id} className="p-3 bg-slate-50 dark:bg-slate-750 rounded-lg border border-slate-200 dark:border-slate-700 text-sm space-y-1">
                      <div className="flex justify-between font-semibold text-slate-900 dark:text-white">
                        <span>{vac.postTitle}</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{vac.vacantSeats} Vacant</span>
                      </div>
                      <p className="text-xs text-slate-500">{vac.departmentName}</p>
                      <div className="flex justify-between text-xs text-slate-400 pt-1">
                        <span>Sanctioned: {vac.sanctionedSeats}</span>
                        <span>Filled: {vac.filledSeats}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Establishment Cases & Pension Cases */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Establishment & Pension Cases Register</h3>
                  {establishmentCases.length === 0 ? (
                    <p className="text-sm text-slate-500">No establishment cases registered.</p>
                  ) : (
                    <div className="space-y-3">
                      {establishmentCases.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => setSelectedCase(c)}
                          className={`p-4 rounded-xl border cursor-pointer transition ${
                            selectedCase?._id === c._id
                              ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800'
                              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 font-bold">
                                {c.caseNumber}
                              </span>
                              <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{c.title}</h4>
                            </div>
                            <StatusBadge status={c.status} />
                          </div>
                          <p className="text-xs text-slate-500 mt-2">{c.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Case Timeline */}
                {selectedCase && (
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                    <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      Case Timeline: {selectedCase.caseNumber}
                    </h3>
                    <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800 ml-3 space-y-6 pl-6 py-2">
                      {selectedCase.timelineSteps.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white" />
                          <h4 className="font-medium text-slate-900 dark:text-white text-sm">{step.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{step.remarks}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">
                            {new Date(step.timestamp).toLocaleString()} • {step.actorName}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* MODALS */}
      {/* 1. Create Employee Modal */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Staff Record</h3>
            <form onSubmit={handleCreateEmployee} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Employee Code</label>
                <input
                  type="text"
                  required
                  value={newEmployee.employeeCode}
                  onChange={(e) => setNewEmployee({ ...newEmployee, employeeCode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="EMP001"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Full Name</label>
                <input
                  type="text"
                  required
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Designation</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Department</label>
                  <input
                    type="text"
                    required
                    value={newEmployee.departmentName}
                    onChange={(e) => setNewEmployee({ ...newEmployee, departmentName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={newEmployee.joiningDate}
                    onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={newEmployee.dob}
                    onChange={(e) => setNewEmployee({ ...newEmployee, dob: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Create Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Assign Post Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Post Appointment</h3>
            <form onSubmit={handleAssignAppointment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Post Title</label>
                <input
                  type="text"
                  required
                  value={newAppointment.postTitle}
                  onChange={(e) => setNewAppointment({ ...newAppointment, postTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Department</label>
                <input
                  type="text"
                  required
                  value={newAppointment.departmentName}
                  onChange={(e) => setNewAppointment({ ...newAppointment, departmentName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Pay Scale</label>
                <input
                  type="text"
                  required
                  value={newAppointment.payScale}
                  onChange={(e) => setNewAppointment({ ...newAppointment, payScale: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Start Date</label>
                <input
                  type="date"
                  required
                  value={newAppointment.startDate}
                  onChange={(e) => setNewAppointment({ ...newAppointment, startDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAppointmentModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Assign Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Apply Leave Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply for Leave</h3>
            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Leave Type</label>
                <select
                  value={newLeave.leaveType}
                  onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="CASUAL_LEAVE">Casual Leave</option>
                  <option value="EARNED_LEAVE">Earned Leave</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="MATERNITY_LEAVE">Maternity Leave</option>
                  <option value="DUTY_LEAVE">Duty Leave</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-600">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.startDate}
                    onChange={(e) => setNewLeave({ ...newLeave, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600">End Date</label>
                  <input
                    type="date"
                    required
                    value={newLeave.endDate}
                    onChange={(e) => setNewLeave({ ...newLeave, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Reason</label>
                <textarea
                  required
                  value={newLeave.reason}
                  onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Create Establishment Case Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register Establishment Case</h3>
            <form onSubmit={handleCreateCase} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Case Type</label>
                <select
                  value={newCase.caseType}
                  onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="PENSION_TRACKING">Pension / Retirement Tracking</option>
                  <option value="PROMOTION_CASE">Promotion & Assessment Case</option>
                  <option value="DISCIPLINARY_CASE">Disciplinary Enquiry Case</option>
                  <option value="REGULARIZATION">Service Regularization</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Target Employee</label>
                <select
                  value={newCase.employeeId}
                  onChange={(e) => setNewCase({ ...newCase, employeeId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Case Title</label>
                <input
                  type="text"
                  required
                  value={newCase.title}
                  onChange={(e) => setNewCase({ ...newCase, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Description</label>
                <textarea
                  required
                  value={newCase.description}
                  onChange={(e) => setNewCase({ ...newCase, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCaseModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700"
                >
                  Register Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPages;
