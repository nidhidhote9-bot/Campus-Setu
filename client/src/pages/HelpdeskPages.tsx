import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  MessageSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Send,
  PlusCircle,
  Paperclip,
  RotateCcw,
  ShieldAlert,
  Search,
  BookOpen,
  Filter,
  Eye,
  Lock,
  ChevronRight,
  FileText,
  AlertCircle,
  Zap,
  Tag
} from 'lucide-react';
import {
  TicketPriority,
  HelpdeskTicketStatus,
  EscalationType
} from '@shared/index';

interface ServiceCategory {
  _id: string;
  code: string;
  name: string;
  description?: string;
  defaultSlaHours: number;
  isSensitive: boolean;
  isActive: boolean;
}

interface SLAPolicy {
  _id: string;
  policyCode: string;
  name: string;
  priority: TicketPriority;
  responseTimeHours: number;
  resolutionTimeHours: number;
  workingHoursOnly: boolean;
}

interface TicketItem {
  _id: string;
  ticketNumber: string;
  studentId: {
    _id: string;
    rollNumber: string;
    userId?: {
      name: string;
      email: string;
    };
  } | string;
  studentRollNumber: string;
  categoryCode: string;
  subCategory?: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: HelpdeskTicketStatus;
  isSensitive: boolean;
  assignedStaffId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  slaDeadline: string;
  escalated: boolean;
  attachments?: string[];
  reopenCount: number;
  createdAt: string;
}

interface TicketMessage {
  _id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  isInternalNote: boolean;
  attachments?: string[];
  createdAt: string;
}

export const HelpdeskPages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'my-tickets';
  const activeTicketId = searchParams.get('id');

  // State
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [slaPolicies, setSlaPolicies] = useState<SLAPolicy[]>([]);
  const [myTickets, setMyTickets] = useState<TicketItem[]>([]);
  const [staffInbox, setStaffInbox] = useState<TicketItem[]>([]);
  const [ticketDetail, setTicketDetail] = useState<{
    ticket: TicketItem;
    messages: TicketMessage[];
    assignments: any[];
    escalations: any[];
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    categoryCode: 'CAT-HOSTEL',
    subCategory: 'Plumbing & Water Supply',
    title: '',
    description: '',
    priority: TicketPriority.MEDIUM,
    isSensitive: false,
    attachments: ''
  });

  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [showReopenModal, setShowReopenModal] = useState(false);

  const [assignStaffId, setAssignStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [inboxStatusFilter, setInboxStatusFilter] = useState<string>('');
  const [inboxCategoryFilter, setInboxCategoryFilter] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'my-tickets') {
      fetchMyTickets();
    } else if (activeTab === 'staff-inbox') {
      fetchStaffInbox();
    } else if (activeTab === 'ticket-detail' && activeTicketId) {
      fetchTicketDetail(activeTicketId);
    }
  }, [activeTab, activeTicketId, inboxStatusFilter, inboxCategoryFilter]);

  const fetchInitialData = async () => {
    try {
      const [catRes, slaRes] = await Promise.all([
        fetch('/api/v1/helpdesk/categories'),
        fetch('/api/v1/helpdesk/sla-policies')
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (slaRes.ok) setSlaPolicies(await slaRes.json());
    } catch (err: any) {
      console.error('Failed to load helpdesk metadata', err);
    }
  };

  const fetchMyTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/helpdesk/tickets/my-tickets');
      if (res.ok) {
        setMyTickets(await res.json());
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch tickets');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/helpdesk/tickets/staff-inbox?';
      if (inboxStatusFilter) url += `status=${inboxStatusFilter}&`;
      if (inboxCategoryFilter) url += `categoryCode=${inboxCategoryFilter}&`;
      const res = await fetch(url);
      if (res.ok) {
        setStaffInbox(await res.json());
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch staff inbox');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/helpdesk/tickets/${id}`);
      if (res.ok) {
        setTicketDetail(await res.json());
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to fetch ticket detail');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const attachments = newTicket.attachments
        ? newTicket.attachments.split(',').map(s => s.trim())
        : [];
      const res = await fetch('/api/v1/helpdesk/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTicket,
          attachments
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create ticket');

      setSuccess(`Ticket ${data.ticketNumber} created successfully!`);
      setShowNewTicketModal(false);
      setNewTicket({
        categoryCode: 'CAT-HOSTEL',
        subCategory: 'Plumbing & Water Supply',
        title: '',
        description: '',
        priority: TicketPriority.MEDIUM,
        isSensitive: false,
        attachments: ''
      });
      fetchMyTickets();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyMessage.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/helpdesk/tickets/${activeTicketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyMessage,
          isInternalNote,
          attachments: []
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setReplyMessage('');
      fetchTicketDetail(activeTicketId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (status: HelpdeskTicketStatus) => {
    if (!activeTicketId) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/helpdesk/tickets/${activeTicketId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes: `Status changed to ${status}` })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      setSuccess(`Ticket status updated to ${status}`);
      fetchTicketDetail(activeTicketId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReopenTicket = async () => {
    if (!activeTicketId || !reopenReason.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/helpdesk/tickets/${activeTicketId}/reopen`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reopenReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reopen ticket');

      setSuccess('Ticket reopened successfully. Status changed to REOPENED.');
      setShowReopenModal(false);
      setReopenReason('');
      fetchTicketDetail(activeTicketId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAssignTicket = async () => {
    if (!activeTicketId || !assignStaffId.trim()) return;
    setError(null);
    try {
      const res = await fetch(`/api/v1/helpdesk/tickets/${activeTicketId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedToStaffId: assignStaffId,
          notes: assignNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign ticket');

      setSuccess('Staff assigned successfully.');
      setShowAssignModal(false);
      setAssignStaffId('');
      setAssignNotes('');
      fetchTicketDetail(activeTicketId);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckSLAEscalation = async () => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/helpdesk/tickets/escalate-check', {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger SLA check');

      setSuccess(`SLA check complete. ${data.escalatedCount} ticket(s) escalated to URGENT priority.`);
      if (activeTab === 'staff-inbox') fetchStaffInbox();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusBadge = (status: HelpdeskTicketStatus) => {
    switch (status) {
      case HelpdeskTicketStatus.OPEN:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">OPEN</span>;
      case HelpdeskTicketStatus.TRIAGED:
      case HelpdeskTicketStatus.ASSIGNED:
      case HelpdeskTicketStatus.IN_PROGRESS:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">{status}</span>;
      case HelpdeskTicketStatus.RESOLVED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">RESOLVED</span>;
      case HelpdeskTicketStatus.CLOSED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/20 text-slate-300 border border-slate-500/30">CLOSED</span>;
      case HelpdeskTicketStatus.REOPENED:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">REOPENED</span>;
      default:
        return <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-300">{status}</span>;
    }
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case TicketPriority.URGENT:
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-500/30 text-rose-300 border border-rose-500/40">URGENT</span>;
      case TicketPriority.HIGH:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">HIGH</span>;
      case TicketPriority.MEDIUM:
        return <span className="px-2 py-0.5 text-xs font-medium rounded bg-cyan-500/20 text-cyan-300">MEDIUM</span>;
      case TicketPriority.LOW:
        return <span className="px-2 py-0.5 text-xs rounded bg-slate-500/20 text-slate-400">LOW</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900/40 p-6 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <LifeBuoy className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Student Helpdesk & Service Desk
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  [DEMO / SIMULATION MODE]
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Unified service catalog, sensitive grievances, SLA escalation management & student ticket tracking.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewTicketModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Ticket
            </button>
            <button
              onClick={handleCheckSLAEscalation}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 border border-amber-500/30 transition-all cursor-pointer text-xs"
              title="Triggers automatic SLA breach detection for overdue tickets"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Simulate SLA Check
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-1 overflow-x-auto">
        <button
          onClick={() => setSearchParams({ tab: 'my-tickets' })}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'my-tickets'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          My Support Tickets
        </button>

        {activeTicketId && (
          <button
            onClick={() => setSearchParams({ tab: 'ticket-detail', id: activeTicketId })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'ticket-detail'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Ticket Detail #{activeTicketId.slice(-6)}
          </button>
        )}

        <button
          onClick={() => setSearchParams({ tab: 'staff-inbox' })}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'staff-inbox'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Staff Service Desk Inbox
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'knowledge' })}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
            activeTab === 'knowledge'
              ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Knowledge Base & SLA Config
        </button>
      </div>

      {/* TAB 1: MY TICKETS */}
      {activeTab === 'my-tickets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Tickets</p>
                <p className="text-2xl font-bold text-white">{myTickets.length}</p>
              </div>
              <LifeBuoy className="w-8 h-8 text-blue-400 opacity-60" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active / In Progress</p>
                <p className="text-2xl font-bold text-amber-300">
                  {myTickets.filter(t => t.status !== HelpdeskTicketStatus.RESOLVED && t.status !== HelpdeskTicketStatus.CLOSED).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-amber-400 opacity-60" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Resolved</p>
                <p className="text-2xl font-bold text-emerald-300">
                  {myTickets.filter(t => t.status === HelpdeskTicketStatus.RESOLVED || t.status === HelpdeskTicketStatus.CLOSED).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Escalated Overdue</p>
                <p className="text-2xl font-bold text-rose-300">
                  {myTickets.filter(t => t.escalated).length}
                </p>
              </div>
              <ShieldAlert className="w-8 h-8 text-rose-400 opacity-60" />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-blue-400" />
                My Submitted Tickets
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading your tickets...</div>
            ) : myTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <LifeBuoy className="w-12 h-12 mx-auto text-slate-600" />
                <p className="text-base font-medium">No support tickets found.</p>
                <p className="text-xs text-slate-500">Submit a ticket using the button above to request support or report an issue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Ticket #</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">SLA Target</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {myTickets.map(t => (
                      <tr key={t._id} className="hover:bg-white/5 transition-all">
                        <td className="p-3.5 font-mono text-xs font-bold text-blue-300">
                          {t.ticketNumber}
                          {t.isSensitive && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                              Sensitive
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded border border-white/5">
                            {t.categoryCode}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-white max-w-xs truncate">
                          {t.title}
                        </td>
                        <td className="p-3.5">{getPriorityBadge(t.priority)}</td>
                        <td className="p-3.5">{getStatusBadge(t.status)}</td>
                        <td className="p-3.5 text-xs text-slate-400">
                          {new Date(t.slaDeadline).toLocaleString()}
                          {t.escalated && (
                            <span className="ml-2 text-[10px] font-bold text-rose-400">
                              (ESCALATED)
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSearchParams({ tab: 'ticket-detail', id: t._id })}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
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

      {/* TAB 2: TICKET DETAIL */}
      {activeTab === 'ticket-detail' && (
        <div className="space-y-6">
          {!ticketDetail ? (
            <div className="p-8 text-center text-slate-400">
              {loading ? 'Loading ticket details...' : 'Select a ticket from My Tickets or Staff Inbox to view details.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Main Thread & Messages */}
              <div className="lg:col-span-2 space-y-6">
                {/* Ticket Header Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-blue-400">
                          {ticketDetail.ticket.ticketNumber}
                        </span>
                        {getStatusBadge(ticketDetail.ticket.status)}
                        {getPriorityBadge(ticketDetail.ticket.priority)}
                        {ticketDetail.ticket.isSensitive && (
                          <span className="px-2 py-0.5 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Restricted / Sensitive
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-white mt-1">
                        {ticketDetail.ticket.title}
                      </h2>
                    </div>

                    {/* Reopen Action for Students */}
                    {(ticketDetail.ticket.status === HelpdeskTicketStatus.RESOLVED ||
                      ticketDetail.ticket.status === HelpdeskTicketStatus.CLOSED) && (
                      <button
                        onClick={() => setShowReopenModal(true)}
                        className="px-3.5 py-1.5 rounded-xl font-medium text-xs bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 border border-purple-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reopen Ticket
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 bg-slate-800/40 p-4 rounded-xl border border-white/5 whitespace-pre-wrap">
                    {ticketDetail.ticket.description}
                  </p>

                  {/* Metadata Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 pt-2 border-t border-white/10">
                    <div>
                      <span className="block text-slate-500">Category</span>
                      <span className="text-slate-200 font-medium">{ticketDetail.ticket.categoryCode}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Student Roll</span>
                      <span className="text-slate-200 font-medium">{ticketDetail.ticket.studentRollNumber}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">SLA Deadline</span>
                      <span className="text-slate-200 font-medium">{new Date(ticketDetail.ticket.slaDeadline).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500">Reopen Count</span>
                      <span className="text-slate-200 font-medium">{ticketDetail.ticket.reopenCount}</span>
                    </div>
                  </div>
                </div>

                {/* Conversation Thread */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Conversation Thread & Audit Messages ({ticketDetail.messages.length})
                  </h3>

                  <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
                    {ticketDetail.messages.map(m => (
                      <div
                        key={m._id}
                        className={`p-4 rounded-xl border text-sm space-y-1.5 ${
                          m.isInternalNote
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-100'
                            : m.senderRole === 'STUDENT'
                            ? 'bg-blue-950/30 border-blue-500/30 text-slate-200'
                            : 'bg-slate-800/70 border-white/10 text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-1">
                          <span className="font-semibold text-white flex items-center gap-1.5">
                            {m.senderName} ({m.senderRole})
                            {m.isInternalNote && (
                              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/30 text-amber-300 rounded border border-amber-500/40">
                                INTERNAL STAFF NOTE
                              </span>
                            )}
                          </span>
                          <span>{new Date(m.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-xs sm:text-sm">{m.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleSendMessage} className="pt-3 border-t border-white/10 space-y-3">
                    <textarea
                      rows={3}
                      value={replyMessage}
                      onChange={e => setReplyMessage(e.target.value)}
                      placeholder="Write your response message..."
                      className="w-full p-3 rounded-xl bg-slate-800/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                    />

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={e => setIsInternalNote(e.target.checked)}
                          className="rounded bg-slate-800 border-white/20 text-amber-500 focus:ring-amber-500"
                        />
                        Post as Staff Internal Note (Hidden from Student)
                      </label>

                      <button
                        type="submit"
                        disabled={!replyMessage.trim()}
                        className="px-4 py-2 rounded-xl font-medium text-xs bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Send Reply
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Right Col: Staff Controls & Actions */}
              <div className="space-y-6">
                {/* Staff Control Panel */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                    Staff Management Actions
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="block text-slate-400 mb-1">Assigned Staff</span>
                      <p className="p-2.5 rounded-lg bg-slate-800/60 border border-white/5 font-medium text-white">
                        {ticketDetail.ticket.assignedStaffId
                          ? `${ticketDetail.ticket.assignedStaffId.name} (${ticketDetail.ticket.assignedStaffId.role})`
                          : 'Unassigned'}
                      </p>
                    </div>

                    <button
                      onClick={() => setShowAssignModal(true)}
                      className="w-full py-2 rounded-xl font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer text-xs"
                    >
                      Assign / Reassign Staff Member
                    </button>

                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <span className="block text-slate-400 mb-1">Update Status</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleUpdateStatus(HelpdeskTicketStatus.IN_PROGRESS)}
                          className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-medium cursor-pointer"
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(HelpdeskTicketStatus.RESOLVED)}
                          className="py-1.5 px-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-medium cursor-pointer"
                        >
                          Resolve Ticket
                        </button>
                      </div>
                      <button
                        onClick={() => handleUpdateStatus(HelpdeskTicketStatus.CLOSED)}
                        className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs font-medium cursor-pointer"
                      >
                        Close Ticket
                      </button>
                    </div>
                  </div>
                </div>

                {/* Audit & Escalation Log */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-3 text-xs">
                  <h4 className="font-semibold text-slate-200 border-b border-white/10 pb-2">
                    Assignments & Escalations Log
                  </h4>

                  {ticketDetail.assignments.length === 0 && ticketDetail.escalations.length === 0 ? (
                    <p className="text-slate-500">No staff assignments or escalations recorded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {ticketDetail.assignments.map((a, idx) => (
                        <div key={idx} className="p-2 rounded bg-slate-800/40 border border-white/5">
                          <span className="text-slate-400">Assigned To: </span>
                          <span className="text-slate-200 font-medium">{a.assignedTo?.name || 'Staff'}</span>
                        </div>
                      ))}
                      {ticketDetail.escalations.map((e, idx) => (
                        <div key={idx} className="p-2 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
                          <span className="font-bold">[SLA BREACH] </span>
                          <span>{e.reason}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STAFF INBOX */}
      {activeTab === 'staff-inbox' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-blue-400" />
              <span className="font-semibold text-slate-300">Filters:</span>

              <select
                value={inboxStatusFilter}
                onChange={e => setInboxStatusFilter(e.target.value)}
                className="p-2 rounded-lg bg-slate-800 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="OPEN">OPEN</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="REOPENED">REOPENED</option>
              </select>

              <select
                value={inboxCategoryFilter}
                onChange={e => setInboxCategoryFilter(e.target.value)}
                className="p-2 rounded-lg bg-slate-800 border border-white/10 text-slate-200 focus:outline-none"
              >
                <option value="">All Categories</option>
                {categories.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchStaffInbox}
              className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 cursor-pointer"
            >
              Refresh Inbox
            </button>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                Staff Service Desk Queue ({staffInbox.length})
              </h3>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading inbox tickets...</div>
            ) : staffInbox.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-10 h-10 mx-auto text-slate-600" />
                <p>No pending tickets in staff inbox.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Ticket #</th>
                      <th className="p-3.5">Student</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Assigned To</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {staffInbox.map(t => (
                      <tr key={t._id} className="hover:bg-white/5 transition-all">
                        <td className="p-3.5 font-mono text-xs font-bold text-blue-300">
                          {t.ticketNumber}
                          {t.isSensitive && (
                            <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                              Sensitive
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-medium text-slate-200">{t.studentRollNumber}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded border border-white/5">
                            {t.categoryCode}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-white max-w-xs truncate">{t.title}</td>
                        <td className="p-3.5">{getPriorityBadge(t.priority)}</td>
                        <td className="p-3.5 text-xs text-slate-400">
                          {t.assignedStaffId ? (t.assignedStaffId as any).name || 'Staff' : 'Unassigned'}
                        </td>
                        <td className="p-3.5">{getStatusBadge(t.status)}</td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => setSearchParams({ tab: 'ticket-detail', id: t._id })}
                            className="px-3 py-1 text-xs rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Manage
                          </button>
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

      {/* TAB 4: KNOWLEDGE BASE & SLA CONFIG */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Categories Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Tag className="w-5 h-5 text-blue-400" />
                Service Categories & Catalog
              </h3>

              <div className="space-y-3">
                {categories.map(c => (
                  <div key={c._id} className="p-3.5 rounded-xl bg-slate-800/50 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-white">{c.name} ({c.code})</span>
                      <span className="text-xs text-amber-300">SLA: {c.defaultSlaHours}h</span>
                    </div>
                    <p className="text-xs text-slate-400">{c.description}</p>
                    {c.isSensitive && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded">
                        Restricted / Sensitive Grievance Category
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* SLA Policies Card */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
              <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                <Clock className="w-5 h-5 text-indigo-400" />
                Configured SLA Resolution Rules
              </h3>

              <div className="space-y-3">
                {slaPolicies.map(p => (
                  <div key={p._id} className="p-3.5 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm text-white">{p.name}</span>
                      <span className="ml-2">{getPriorityBadge(p.priority)}</span>
                      <p className="text-xs text-slate-400 mt-1">
                        Response: {p.responseTimeHours}h | Resolution: {p.resolutionTimeHours}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMIT NEW TICKET */}
      {showNewTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-400" />
              Submit Helpdesk Ticket
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Service Category</label>
                  <select
                    value={newTicket.categoryCode}
                    onChange={e => setNewTicket({ ...newTicket, categoryCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Priority</label>
                  <select
                    value={newTicket.priority}
                    onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                    className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={e => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="e.g. Water leakage in Room 304 bathroom"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.description}
                  onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Describe the issue in detail..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/40 border border-white/5 space-y-2">
                <label className="flex items-center gap-2 text-xs text-rose-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTicket.isSensitive}
                    onChange={e => setNewTicket({ ...newTicket, isSensitive: e.target.checked })}
                    className="rounded bg-slate-800 border-white/20 text-rose-500 focus:ring-rose-500"
                  />
                  Mark as Restricted / Sensitive Grievance (Strict confidential access)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTicketModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-medium bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REOPEN TICKET */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-purple-400" />
              Reopen Support Ticket
            </h3>

            <p className="text-xs text-slate-300">
              Please provide the reason why the resolution was unsatisfactory or why the issue has recurred.
            </p>

            <textarea
              rows={4}
              required
              value={reopenReason}
              onChange={e => setReopenReason(e.target.value)}
              placeholder="State your reason for reopening..."
              className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none text-sm"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowReopenModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReopenTicket}
                disabled={!reopenReason.trim()}
                className="px-5 py-2 rounded-xl font-medium bg-purple-600 hover:bg-purple-500 text-white text-xs disabled:opacity-50"
              >
                Confirm Reopen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN STAFF */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              Assign Ticket to Staff Member
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Staff Member User ID</label>
                <input
                  type="text"
                  required
                  value={assignStaffId}
                  onChange={e => setAssignStaffId(e.target.value)}
                  placeholder="Enter User ObjectId or Staff ID"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Assignment Instructions / Notes</label>
                <textarea
                  rows={3}
                  value={assignNotes}
                  onChange={e => setAssignNotes(e.target.value)}
                  placeholder="Notes for assigned staff..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignTicket}
                disabled={!assignStaffId.trim()}
                className="px-5 py-2 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white text-xs disabled:opacity-50"
              >
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
