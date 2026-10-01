import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface GuardianLinkData {
  _id: string;
  studentId: {
    _id: string;
    enrollmentNumber: string;
    rollNumber: string;
    departmentId?: { name: string };
    batchYear?: number;
  };
  relationship: string;
  status: string;
  linkedAt: string;
  grant?: {
    permissions: {
      attendance: boolean;
      fees: boolean;
      results: boolean;
      notices: boolean;
    };
  };
}

export const GuardianPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'linking' | 'dashboard' | 'student-summary' | 'permissions'>('dashboard');
  const [links, setLinks] = useState<GuardianLinkData[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [feeData, setFeeData] = useState<any>(null);
  const [resultsData, setResultsData] = useState<any[]>([]);
  const [noticesData, setNoticesData] = useState<any[]>([]);
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  const [ticketAttemptMessage, setTicketAttemptMessage] = useState<string>('');

  // Form states
  const [invitationCode, setInvitationCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [invitePhone, setInvitePhone] = useState('');
  const [inviteStudentId, setInviteStudentId] = useState('');
  const [inviteRelationship, setInviteRelationship] = useState('GUARDIAN');
  const [revokeReason, setRevokeReason] = useState('');

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/linking')) setActiveTab('linking');
    else if (location.pathname.includes('/student-summary')) setActiveTab('student-summary');
    else if (location.pathname.includes('/permissions')) setActiveTab('permissions');
    else setActiveTab('dashboard');
  }, [location.pathname]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/guardians/links', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setLinks(data);
        if (data.length > 0 && !selectedStudentId) {
          const sId = typeof data[0].studentId === 'object' && data[0].studentId ? data[0].studentId._id : String(data[0].studentId);
          setSelectedStudentId(sId);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentSummary = async (sId: string) => {
    if (!sId) return;
    try {
      const res = await fetch(`/api/v1/guardians/student/${sId}/summary`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Failed to fetch student summary');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentAttendance = async (sId: string) => {
    if (!sId) return;
    try {
      const res = await fetch(`/api/v1/guardians/student/${sId}/attendance`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Attendance access denied');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentFees = async (sId: string) => {
    if (!sId) return;
    try {
      const res = await fetch(`/api/v1/guardians/student/${sId}/fees`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setFeeData(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Fee access denied');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentResults = async (sId: string) => {
    if (!sId) return;
    try {
      const res = await fetch(`/api/v1/guardians/student/${sId}/results`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setResultsData(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Results access denied');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchStudentNotices = async (sId: string) => {
    if (!sId) return;
    try {
      const res = await fetch(`/api/v1/guardians/student/${sId}/notices`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNoticesData(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Notices access denied');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchAccessLogs = async () => {
    try {
      const res = await fetch('/api/v1/guardians/access-logs', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setAccessLogs(data);
      }
    } catch (err: any) {}
  };

  useEffect(() => {
    fetchLinks();
    fetchAccessLogs();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentSummary(selectedStudentId);
      fetchStudentAttendance(selectedStudentId);
      fetchStudentFees(selectedStudentId);
      fetchStudentResults(selectedStudentId);
      fetchStudentNotices(selectedStudentId);
    }
  }, [selectedStudentId]);

  const handleVerifyLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/guardians/linking/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ invitationCode })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Guardian link verified and established successfully!');
        setInvitationCode('');
        fetchLinks();
      } else {
        setError(data.error || 'Failed to verify invitation code');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/guardians/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: inviteStudentId,
          guardianEmail: inviteEmail,
          guardianName: inviteName,
          guardianPhone: invitePhone,
          relationship: inviteRelationship
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Invitation created! Code: ${data.invitationCode} (Expires: ${new Date(data.expiresAt).toLocaleDateString()})`);
        setInviteEmail('');
        setInviteName('');
        setInvitePhone('');
      } else {
        setError(data.error || 'Failed to send invitation');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdatePermissionToggle = async (permissionKey: 'attendance' | 'fees' | 'results' | 'notices', currentValue: boolean) => {
    if (!selectedStudentId) return;
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/guardians/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId: selectedStudentId,
          permissions: {
            [permissionKey]: !currentValue
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Permission for ${permissionKey.toUpperCase()} updated successfully!`);
        fetchLinks();
        fetchStudentSummary(selectedStudentId);
      } else {
        setError(data.error || 'Failed to update permission');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRevokeLink = async (guardianLinkId: string) => {
    if (!confirm('Are you sure you want to revoke this guardian relationship? Access will be stopped immediately.')) return;
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('/api/v1/guardians/linking/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          guardianLinkId,
          reason: revokeReason || 'Requested relationship revocation'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Guardian link revoked. All API data requests for this student will now be denied.');
        setRevokeReason('');
        fetchLinks();
        setSummaryData(null);
      } else {
        setError(data.error || 'Failed to revoke link');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAttemptPrivateTickets = async () => {
    if (!selectedStudentId) return;
    setTicketAttemptMessage('');
    try {
      const res = await fetch(`/api/v1/guardians/student/${selectedStudentId}/tickets`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) {
        setTicketAttemptMessage(`🔒 Access Security Gate: ${data.error}`);
      } else {
        setTicketAttemptMessage('Unexpected: Ticket data returned');
      }
    } catch (err: any) {
      setTicketAttemptMessage(`Error: ${err.message}`);
    }
    fetchAccessLogs();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Parent & Guardian Portal (M21)</h1>
          <p className="text-teal-200 text-sm mt-1">
            Authorized student link verification, explicit consent policies, and permitted academic/fee insights.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/app/guardians/dashboard')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-indigo-900 shadow-md' : 'bg-teal-900/50 hover:bg-teal-900 text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/app/guardians/student-summary')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'student-summary' ? 'bg-white text-indigo-900 shadow-md' : 'bg-teal-900/50 hover:bg-teal-900 text-white'
            }`}
          >
            Student Summary
          </button>
          <button
            onClick={() => navigate('/app/guardians/linking')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'linking' ? 'bg-white text-indigo-900 shadow-md' : 'bg-teal-900/50 hover:bg-teal-900 text-white'
            }`}
          >
            Linking & Verification
          </button>
          <button
            onClick={() => navigate('/app/guardians/permissions')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'permissions' ? 'bg-white text-indigo-900 shadow-md' : 'bg-teal-900/50 hover:bg-teal-900 text-white'
            }`}
          >
            Permissions & Revoke
          </button>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-r-lg text-sm shadow-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-800 rounded-r-lg text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Student Switcher Banner */}
      {links.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Linked Student:</span>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 bg-slate-50 focus:bg-white"
            >
              {links.map(l => {
                const sId = typeof l.studentId === 'object' && l.studentId ? l.studentId._id : String(l.studentId);
                return (
                  <option key={l._id} value={sId}>
                    {typeof l.studentId === 'object' ? l.studentId?.enrollmentNumber : 'Student'} ({l.relationship})
                  </option>
                );
              })}
            </select>
          </div>
          <div className="text-xs text-slate-500">
            Total Active Links: <span className="font-bold text-slate-700">{links.length}</span>
          </div>
        </div>
      )}

      {/* TAB 1: DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase">Attendance Status</span>
              <div className="text-2xl font-bold text-teal-600 mt-2">
                {summaryData?.attendanceSummary ? `${summaryData.attendanceSummary.percentage}%` : 'Restricted / N/A'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summaryData?.attendanceSummary ? `${summaryData.attendanceSummary.presentCount} of ${summaryData.attendanceSummary.totalClasses} classes attended` : 'Permission disabled'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase">Pending Fee Dues</span>
              <div className="text-2xl font-bold text-indigo-600 mt-2">
                {summaryData?.feeSummary ? `₹${(summaryData.feeSummary.totalDuesPaise / 100).toLocaleString()}` : 'Restricted / N/A'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summaryData?.feeSummary ? `${summaryData.feeSummary.pendingInvoicesCount} unpaid invoices` : 'Permission disabled'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase">Latest SGPA</span>
              <div className="text-2xl font-bold text-purple-600 mt-2">
                {summaryData?.resultSummary && summaryData.resultSummary.length > 0 ? summaryData.resultSummary[0].sgpa : 'Restricted / N/A'}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {summaryData?.resultSummary ? 'Only published term grade cards' : 'Permission disabled'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs font-medium text-slate-500 uppercase">Recent Notices</span>
              <div className="text-2xl font-bold text-amber-600 mt-2">
                {summaryData?.noticesSummary ? summaryData.noticesSummary.length : 'Restricted / N/A'}
              </div>
              <p className="text-xs text-slate-400 mt-1">Active institutional circulars</p>
            </div>
          </div>

          {/* Student Profile Overview */}
          {summaryData?.student && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-semibold text-slate-800 mb-4">Linked Student Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Name</span>
                  <span className="font-semibold text-slate-800">{summaryData.student.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Enrollment Number</span>
                  <span className="font-semibold text-slate-800">{summaryData.student.enrollmentNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800">{summaryData.student.department || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Batch Year</span>
                  <span className="font-semibold text-slate-800">{summaryData.student.batchYear || 'N/A'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Audit Logs */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Guardian Access Audit Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Category</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Granted</th>
                    <th className="p-3">Details</th>
                    <th className="p-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accessLogs.map(log => (
                    <tr key={log._id}>
                      <td className="p-3 font-medium text-slate-700">{log.accessCategory}</td>
                      <td className="p-3 font-mono text-slate-600">{log.action}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${log.granted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {log.granted ? 'GRANTED' : 'DENIED'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{log.detail || '-'}</td>
                      <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                  {accessLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">No access log entries found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT SUMMARY (DETAILS & TESTS) */}
      {activeTab === 'student-summary' && (
        <div className="space-y-6">
          {/* Security Gate Test Section */}
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-amber-900">Security Gate Test: Private Grievance Restriction</h3>
                <p className="text-xs text-amber-700">
                  Guardians must NEVER be granted access to private student support tickets or unpublished results.
                </p>
              </div>
              <button
                onClick={handleAttemptPrivateTickets}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg shadow-sm"
              >
                Attempt Private Ticket Access
              </button>
            </div>
            {ticketAttemptMessage && (
              <div className="p-3 bg-white border border-amber-300 text-amber-900 rounded-lg text-xs font-mono">
                {ticketAttemptMessage}
              </div>
            )}
          </div>

          {/* Permitted Attendance Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Permitted Attendance Records</h3>
            {attendanceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceRecords.map(rec => (
                      <tr key={rec._id}>
                        <td className="p-3 font-medium text-slate-700">{rec.date}</td>
                        <td className="p-3 text-slate-600">{rec.subjectId?.name || rec.subjectId?.code || 'Subject'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            rec.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No attendance records found or attendance permission disabled.</p>
            )}
          </div>

          {/* Permitted Fee Invoices Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Permitted Fee Invoices</h3>
            {feeData?.invoices?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Invoice #</th>
                      <th className="p-3">Fee Type</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Balance Amount</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {feeData.invoices.map((inv: any) => (
                      <tr key={inv._id}>
                        <td className="p-3 font-mono font-medium text-slate-700">{inv.invoiceNumber}</td>
                        <td className="p-3 text-slate-600">{inv.feeType}</td>
                        <td className="p-3 text-slate-800">₹{(inv.totalAmountPaise / 100).toLocaleString()}</td>
                        <td className="p-3 text-rose-600 font-semibold">₹{(inv.balanceAmountPaise / 100).toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No fee invoices found or fee permission disabled.</p>
            )}
          </div>

          {/* Permitted Published Results Section */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Permitted Published Term Results</h3>
            {resultsData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {resultsData.map(res => (
                  <div key={res._id} className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Term {res.termNumber} Grade Card</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">PUBLISHED</span>
                    </div>
                    <div className="text-2xl font-extrabold text-indigo-700">SGPA: {res.sgpa}</div>
                    <div className="text-xs text-slate-500">CGPA: {res.cgpa}</div>
                    <div className="text-xs text-slate-400">Published: {new Date(res.publishedAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No published term results found or results permission disabled.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LINKING & VERIFICATION */}
      {activeTab === 'linking' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verify Link Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Verify Guardian Invitation Code</h3>
            <p className="text-xs text-slate-500">
              Enter the authorized 6-digit invitation code issued by the institution/student to complete verification and establish link.
            </p>
            <form onSubmit={handleVerifyLink} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Invitation / Verification Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. INV-984210 or INV-DEMO-2026"
                  value={invitationCode}
                  onChange={e => setInvitationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm"
              >
                Verify & Establish Link
              </button>
            </form>
          </div>

          {/* Issue Invitation Form */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Issue Guardian Invitation</h3>
            <p className="text-xs text-slate-500">
              Create an official guardian invitation code under explicit consent policy (Expires in 7 days).
            </p>
            <form onSubmit={handleCreateInvite} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Student ID / Code</label>
                <input
                  type="text"
                  required
                  placeholder="Student Mongoose ID"
                  value={inviteStudentId}
                  onChange={e => setInviteStudentId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
                  <select
                    value={inviteRelationship}
                    onChange={e => setInviteRelationship(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="FATHER">Father</option>
                    <option value="MOTHER">Mother</option>
                    <option value="GUARDIAN">Guardian</option>
                    <option value="SPONSOR">Sponsor</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Email</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Guardian Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="9876543210"
                    value={invitePhone}
                    onChange={e => setInvitePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-lg shadow-sm mt-2"
              >
                Generate Invitation Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: PERMISSIONS & REVOCATION */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          {/* Explicit Permission Grants */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-semibold text-slate-800">Explicit Permission Grants</h3>
            <p className="text-xs text-slate-500">
              Disabling a permission category immediately blocks API data access from the server endpoints.
            </p>
            {summaryData?.permissions ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['attendance', 'fees', 'results', 'notices'] as const).map(key => {
                  const isEnabled = summaryData.permissions[key];
                  return (
                    <div key={key} className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-sm font-bold uppercase text-slate-800">{key} Permission</span>
                        <p className="text-xs text-slate-400">
                          {isEnabled ? 'API data access granted' : 'API data access restricted (403 Forbidden)'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUpdatePermissionToggle(key, isEnabled)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all ${
                          isEnabled ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-300 hover:bg-slate-400 text-slate-700'
                        }`}
                      >
                        {isEnabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a linked student to manage permission grants.</p>
            )}
          </div>

          {/* Revoke Relationship Section */}
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl space-y-4">
            <h3 className="text-base font-semibold text-rose-900">Revoke Guardian Relationship</h3>
            <p className="text-xs text-rose-700">
              Revoking a link permanently terminates guardian access. Next API data requests for this student will return 403 Forbidden.
            </p>
            {links.map(l => (
              <div key={l._id} className="p-4 bg-white border border-rose-200 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="font-bold text-sm text-slate-800">{l.studentId?.enrollmentNumber || 'Student'} ({l.relationship})</span>
                  <p className="text-xs text-slate-500">Linked on {new Date(l.linkedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <input
                    type="text"
                    placeholder="Reason for revocation"
                    value={revokeReason}
                    onChange={e => setRevokeReason(e.target.value)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs flex-grow"
                  />
                  <button
                    onClick={() => handleRevokeLink(l._id)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs rounded-lg shadow-sm whitespace-nowrap"
                  >
                    Revoke Link
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
