import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Committee {
  _id: string;
  code: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  members?: any[];
}

interface GovernanceTask {
  _id: string;
  taskNumber: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  assignedToUserId?: any;
  createdByUserId?: any;
  committeeId?: any;
}

interface NotesheetStep {
  stepNumber: number;
  actorUserId?: any;
  action: string;
  remarks?: string;
  priorAssigneeUserId?: any;
  nextAssigneeUserId?: any;
  actedAt: string;
}

interface Notesheet {
  _id: string;
  trackingNumber: string;
  subject: string;
  category: string;
  content: string;
  amount?: number;
  status: string;
  creatorUserId?: any;
  currentAssigneeUserId?: any;
  version: number;
  steps: NotesheetStep[];
  attachments?: string[];
  createdAt: string;
}

export const GovernancePages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'committees' | 'tasks' | 'notesheets' | 'approvals'>('committees');
  
  // Data states
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [tasks, setTasks] = useState<GovernanceTask[]>([]);
  const [notesheets, setNotesheets] = useState<Notesheet[]>([]);
  const [selectedNotesheet, setSelectedNotesheet] = useState<Notesheet | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<Notesheet[]>([]);

  // Form states
  const [newCommittee, setNewCommittee] = useState({ code: '', name: '', type: 'ACADEMIC_COUNCIL', description: '' });
  const [newMember, setNewMember] = useState({ userId: '', role: 'MEMBER' });
  
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToUserId: '' });
  
  const [newNotesheet, setNewNotesheet] = useState({ subject: '', category: 'PURCHASE', content: '', amount: 50000, initialAssigneeUserId: '' });
  const [notesheetAction, setNotesheetAction] = useState({ action: 'FORWARD', remarks: '', targetUserId: '' });

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.pathname.includes('/committees')) setActiveTab('committees');
    else if (location.pathname.includes('/tasks')) setActiveTab('tasks');
    else if (location.pathname.includes('/notesheets')) setActiveTab('notesheets');
    else if (location.pathname.includes('/approvals')) setActiveTab('approvals');
  }, [location.pathname]);

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'committees') {
        const res = await fetch('/api/v1/governance/committees', { headers });
        if (res.ok) setCommittees(await res.json());
      } else if (activeTab === 'tasks') {
        const res = await fetch('/api/v1/governance/tasks', { headers });
        if (res.ok) setTasks(await res.json());
      } else if (activeTab === 'notesheets') {
        const res = await fetch('/api/v1/governance/notesheets', { headers });
        if (res.ok) setNotesheets(await res.json());
      } else if (activeTab === 'approvals') {
        const res = await fetch('/api/v1/governance/approvals/my-pending', { headers });
        if (res.ok) {
          const data = await res.json();
          setPendingApprovals(data.notesheets || []);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);
    try {
      const res = await fetch('/api/v1/governance/committees', {
        method: 'POST',
        headers,
        body: JSON.stringify(newCommittee)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create committee');
      setMessage(`Committee ${data.name} created successfully!`);
      setNewCommittee({ code: '', name: '', type: 'ACADEMIC_COUNCIL', description: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);
    try {
      const res = await fetch('/api/v1/governance/tasks', {
        method: 'POST',
        headers,
        body: JSON.stringify(newTask)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create task');
      setMessage(`Task ${data.taskNumber} created successfully!`);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', assignedToUserId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    setError(null); setMessage(null);
    try {
      const res = await fetch(`/api/v1/governance/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update task');
      setMessage(`Task status updated to ${status}`);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateNotesheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setMessage(null);
    try {
      const res = await fetch('/api/v1/governance/notesheets', {
        method: 'POST',
        headers,
        body: JSON.stringify(newNotesheet)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create notesheet');
      setMessage(`Notesheet ${data.trackingNumber} composed and submitted!`);
      setNewNotesheet({ subject: '', category: 'PURCHASE', content: '', amount: 50000, initialAssigneeUserId: '' });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleProcessAction = async (notesheetId: string) => {
    setError(null); setMessage(null);
    try {
      const payload: any = {
        action: notesheetAction.action,
        remarks: notesheetAction.remarks,
        expectedVersion: selectedNotesheet?.version
      };
      if (notesheetAction.action === 'FORWARD') {
        payload.targetUserId = notesheetAction.targetUserId;
      }
      const res = await fetch(`/api/v1/governance/notesheets/${notesheetId}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process notesheet action');
      setMessage(`Notesheet action ${notesheetAction.action} processed successfully!`);
      setSelectedNotesheet(data);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Institutional Governance & Workflow Portal</h1>
          <p className="text-indigo-200 text-sm mt-1">
            Committees, Meeting Decisions, Governance Tasks, Notesheets & Approval Workflows
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-indigo-500/30 border border-indigo-400/40 rounded-full text-xs font-mono text-indigo-200">
            M23 Active
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => { setActiveTab('committees'); navigate('/app/governance/committees'); }}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'committees'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Committees & Meetings
        </button>
        <button
          onClick={() => { setActiveTab('tasks'); navigate('/app/governance/tasks'); }}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'tasks'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Governance Tasks
        </button>
        <button
          onClick={() => { setActiveTab('notesheets'); navigate('/app/governance/notesheets'); }}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'notesheets'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Notesheets & Workflows
        </button>
        <button
          onClick={() => { setActiveTab('approvals'); navigate('/app/governance/approvals'); }}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'approvals'
              ? 'border-indigo-600 text-indigo-600 font-semibold'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          My Pending Approvals
        </button>
      </div>

      {/* Alerts */}
      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-rose-600 hover:text-rose-900 font-bold">×</button>
        </div>
      )}

      {/* Tab 1: Committees */}
      {activeTab === 'committees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Committee Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Create New Committee</h2>
            <form onSubmit={handleCreateCommittee} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Committee Code</label>
                <input
                  type="text"
                  required
                  placeholder="ACAD-COUNCIL-01"
                  value={newCommittee.code}
                  onChange={(e) => setNewCommittee({ ...newCommittee, code: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Committee Name</label>
                <input
                  type="text"
                  required
                  placeholder="Academic & Examination Council"
                  value={newCommittee.name}
                  onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Type</label>
                <select
                  value={newCommittee.type}
                  onChange={(e) => setNewCommittee({ ...newCommittee, type: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                >
                  <option value="ACADEMIC_COUNCIL">Academic Council</option>
                  <option value="FINANCE_COMMITTEE">Finance Committee</option>
                  <option value="DISCIPLINARY">Disciplinary Committee</option>
                  <option value="BOARD_OF_STUDIES">Board of Studies</option>
                  <option value="PURCHASE_COMMITTEE">Purchase Committee</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Apex academic governance body..."
                  value={newCommittee.description}
                  onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Create Committee
              </button>
            </form>
          </div>

          {/* Committee List & Members */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Institutional Committees</h2>
            {committees.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl text-center text-gray-500 text-sm">
                No committees found.
              </div>
            ) : (
              committees.map((comm) => (
                <div key={comm._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base">{comm.name}</h3>
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-mono rounded">
                          {comm.code}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{comm.description}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                      {comm.type}
                    </span>
                  </div>

                  {/* Members Tenure */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Member Tenure & Roles</h4>
                    <div className="space-y-2">
                      {comm.members?.map((m: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-lg text-xs">
                          <div>
                            <span className="font-semibold text-gray-800">{m.userId?.name || m.userId?.email || 'User'}</span>
                            <span className="text-gray-500 ml-2">({m.role})</span>
                          </div>
                          <div className="text-gray-400">
                            Status: <span className={m.isActive ? 'text-emerald-600 font-semibold' : 'text-rose-600 font-semibold'}>{m.isActive ? 'Active Member' : 'Deactivated'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Governance Tasks */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Task Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Create Governance Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="Audit Q3 Expenditure"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Detailed instructions for assignee..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Create Task
              </button>
            </form>
          </div>

          {/* Task Board / List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Task Board</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map((statusKey) => (
                <div key={statusKey} className="bg-gray-50 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="font-bold text-xs text-gray-700 uppercase tracking-wide">{statusKey}</span>
                    <span className="px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border">
                      {tasks.filter(t => t.status === statusKey).length}
                    </span>
                  </div>

                  {tasks.filter(t => t.status === statusKey).map((t) => (
                    <div key={t._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-xs text-indigo-600 font-semibold">{t.taskNumber}</span>
                        <span className={`px-2 py-0.5 text-xs rounded font-semibold ${
                          t.priority === 'URGENT' ? 'bg-rose-100 text-rose-700' :
                          t.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.priority}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900 text-sm">{t.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
                      <div className="flex justify-between items-center pt-2 text-xs">
                        <select
                          value={t.status}
                          onChange={(e) => handleUpdateTaskStatus(t._id, e.target.value)}
                          className="p-1 border rounded bg-gray-50 text-xs"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Notesheets */}
      {activeTab === 'notesheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Compose New Notesheet</h2>
            <form onSubmit={handleCreateNotesheet} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Approval for Lab Equipment Purchase"
                  value={newNotesheet.subject}
                  onChange={(e) => setNewNotesheet({ ...newNotesheet, subject: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={newNotesheet.category}
                  onChange={(e) => setNewNotesheet({ ...newNotesheet, category: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm bg-white"
                >
                  <option value="PURCHASE">Purchase & Procurement</option>
                  <option value="FINANCE">Financial Approval</option>
                  <option value="ACADEMIC">Academic Policy</option>
                  <option value="INFRASTRUCTURE">Infrastructure</option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (INR)</label>
                <input
                  type="number"
                  value={newNotesheet.amount}
                  onChange={(e) => setNewNotesheet({ ...newNotesheet, amount: Number(e.target.value) })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Content / Justification</label>
                <textarea
                  required
                  placeholder="Detailed justification for request..."
                  value={newNotesheet.content}
                  onChange={(e) => setNewNotesheet({ ...newNotesheet, content: e.target.value })}
                  className="w-full p-2.5 border rounded-lg text-sm"
                  rows={4}
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition"
              >
                Compose & Submit Notesheet
              </button>
            </form>
          </div>

          {/* Notesheet List & Detail */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Notesheet Registry & History</h2>
            <div className="space-y-4">
              {notesheets.map((ns) => (
                <div key={ns._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-600 font-bold">{ns.trackingNumber}</span>
                        <h3 className="font-bold text-gray-900 text-base">{ns.subject}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Category: {ns.category} | Version: v{ns.version}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      ns.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      ns.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                      ns.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ns.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{ns.content}</p>

                  {/* Decision Timeline */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Decision Timeline</h4>
                    <div className="space-y-2 border-l-2 border-indigo-200 pl-4">
                      {ns.steps.map((step, idx) => (
                        <div key={idx} className="text-xs space-y-1">
                          <div className="flex items-center gap-2 font-semibold text-gray-800">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded font-mono">Step #{step.stepNumber}</span>
                            <span className="text-indigo-900">{step.action}</span>
                            <span className="text-gray-400 font-normal">at {new Date(step.actedAt).toLocaleString()}</span>
                          </div>
                          {step.remarks && <p className="text-gray-600 italic">"{step.remarks}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Controls for Assignee */}
                  {ns.status === 'UNDER_REVIEW' && (
                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2 items-center">
                      <select
                        value={notesheetAction.action}
                        onChange={(e) => setNotesheetAction({ ...notesheetAction, action: e.target.value })}
                        className="p-2 border rounded-lg text-xs bg-white font-medium"
                      >
                        <option value="FORWARD">Forward to Role</option>
                        <option value="APPROVE">Approve</option>
                        <option value="REJECT">Reject</option>
                        <option value="RETURN">Return for Revision</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Remarks..."
                        value={notesheetAction.remarks}
                        onChange={(e) => setNotesheetAction({ ...notesheetAction, remarks: e.target.value })}
                        className="p-2 border rounded-lg text-xs flex-1"
                      />

                      <button
                        onClick={() => {
                          setSelectedNotesheet(ns);
                          handleProcessAction(ns._id);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Process Action
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Approvals Dashboard */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">My Pending Approvals & Action Items</h2>
            {pendingApprovals.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                No pending approvals currently assigned to your account.
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((ns) => (
                  <div key={ns._id} className="p-4 border rounded-xl bg-gray-50 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-600 font-bold">{ns.trackingNumber}</span>
                        <h4 className="font-bold text-gray-900 text-sm">{ns.subject}</h4>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Amount: INR {ns.amount} | Submitted: {new Date(ns.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('notesheets');
                        navigate('/app/governance/notesheets');
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
                    >
                      Review & Act
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
