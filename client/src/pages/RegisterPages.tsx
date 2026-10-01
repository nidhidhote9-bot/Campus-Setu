import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Send,
  CheckCircle,
  Folder,
  Settings,
  Search,
  Filter,
  Download,
  AlertTriangle,
  Plus,
  Ban,
  Printer,
  Eye,
  Lock,
  Clock,
  ArrowRight,
  Shield,
  BookOpen
} from 'lucide-react';
import { RegisterType, RegisterEntryStatus, DocumentMovementStatus } from '@shared/index';

export const RegisterPages: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'entries' | 'numbering' | 'movement' | 'reports'>('entries');

  // State
  const [entries, setEntries] = useState<any[]>([]);
  const [sequences, setSequences] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters & Search
  const [filterType, setFilterType] = useState<string>('');
  const [filterDept, setFilterDept] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals / Selected Items
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showVoidModal, setShowVoidModal] = useState(false);
  const [showAckPrintModal, setShowAckPrintModal] = useState(false);
  const [ackPrintContent, setAckPrintContent] = useState<string>('');

  // Form states
  const [newEntry, setNewEntry] = useState({
    departmentCode: 'CSE',
    registerType: RegisterType.INWARD,
    subject: '',
    senderDetails: '',
    recipientDetails: '',
    documentDate: '2026-10-01',
    isPrivate: false,
    attachmentsText: 'Curriculum_Draft_2026.pdf|/files/doc.pdf',
    metadata: 'Priority: Normal'
  });

  const [dispatchData, setDispatchData] = useState({
    toDepartmentCode: 'ADMIN',
    remarks: 'Forwarded for administrative review and record'
  });

  const [voidReason, setVoidReason] = useState('');

  const [ackRemarks, setAckRemarks] = useState('Received and verified physical copy');

  const [newSeqConfig, setNewSeqConfig] = useState({
    departmentCode: 'CSE',
    registerType: RegisterType.INWARD,
    year: 2026,
    prefix: 'REG/IN/CSE/2026/',
    paddingDigits: 5
  });

  const token = localStorage.getItem('token');

  // Load entries
  const fetchEntries = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/registers/entries?institutionId=${user?.institutionId || 'inst-101'}`;
      if (filterType) url += `&registerType=${filterType}`;
      if (filterDept) url += `&departmentCode=${filterDept}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) {
        setEntries(data);
      }
    } catch (err: any) {
      console.error('Error fetching register entries', err);
    } finally {
      setLoading(false);
    }
  };

  // Load sequences
  const fetchSequences = async () => {
    try {
      const res = await fetch(`/api/v1/registers/numbering?institutionId=${user?.institutionId || 'inst-101'}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setSequences(data);
    } catch (err) {
      console.error('Error fetching sequences', err);
    }
  };

  // Load reports
  const fetchReports = async () => {
    try {
      let url = `/api/v1/registers/reports?institutionId=${user?.institutionId || 'inst-101'}`;
      if (filterDept) url += `&departmentCode=${filterDept}`;
      if (filterType) url += `&registerType=${filterType}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setReportsData(data);
    } catch (err) {
      console.error('Error fetching reports', err);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchSequences();
    if (activeTab === 'reports') fetchReports();
  }, [activeTab, filterType, filterDept, searchQuery, startDate, endDate]);

  // Create entry submit
  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const attachments = newEntry.attachmentsText.split('\n').filter(Boolean).map(line => {
        const parts = line.split('|');
        return {
          title: parts[0]?.trim() || 'Document',
          url: parts[1]?.trim() || '/files/doc.pdf',
          isPrivate: newEntry.isPrivate
        };
      });

      const res = await fetch('/api/v1/registers/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          institutionId: user?.institutionId || 'inst-101',
          departmentCode: newEntry.departmentCode,
          registerType: newEntry.registerType,
          subject: newEntry.subject,
          senderDetails: newEntry.senderDetails,
          recipientDetails: newEntry.recipientDetails,
          documentDate: newEntry.documentDate,
          isPrivate: newEntry.isPrivate,
          attachments,
          metadata: newEntry.metadata
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create entry');

      setMessage({ type: 'success', text: `Document Registered successfully! Entry No: ${data.entryNumber}` });
      setShowCreateModal(false);
      fetchEntries();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Configure sequence submit
  const handleConfigureSequence = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/registers/numbering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          institutionId: user?.institutionId || 'inst-101',
          ...newSeqConfig
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to configure sequence');
      setMessage({ type: 'success', text: 'Register number sequence format updated successfully' });
      fetchSequences();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Void Entry submit
  const handleVoidEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    try {
      const res = await fetch(`/api/v1/registers/entries/${selectedEntry._id}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason: voidReason })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to void entry');

      setMessage({ type: 'success', text: `Entry ${selectedEntry.entryNumber} voided. Number preserved in audit history.` });
      setShowVoidModal(false);
      setVoidReason('');
      fetchEntries();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Dispatch Document
  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntry) return;
    try {
      const res = await fetch(`/api/v1/registers/entries/${selectedEntry._id}/dispatch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(dispatchData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch document');

      setMessage({ type: 'success', text: `Document dispatched to department ${dispatchData.toDepartmentCode}` });
      setShowDispatchModal(false);
      fetchEntries();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // Acknowledge Document Movement
  const handleAcknowledge = async (movementId: string) => {
    try {
      const res = await fetch(`/api/v1/registers/movement/${movementId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ remarks: ackRemarks })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to acknowledge document');

      setMessage({ type: 'success', text: 'Document receipt acknowledged successfully!' });
      if (data.acknowledgement?.printableContent) {
        setAckPrintContent(data.acknowledgement.printableContent);
        setShowAckPrintModal(true);
      }
      fetchEntries();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  // View detail
  const handleViewDetail = async (entryId: string) => {
    try {
      const res = await fetch(`/api/v1/registers/entries/${entryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSelectedEntry(data);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Test attachment access
  const handleTestAttachment = async (entryId: string, index: number) => {
    try {
      const res = await fetch(`/api/v1/registers/entries/${entryId}/attachment-access?attachmentIndex=${index}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        alert(`Access Granted! File ${data.attachment.title} is ready for download.`);
      } else {
        alert(`Access Denied: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error checking access: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <BookOpen style={{ color: '#3b82f6' }} size={32} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>
              M24: E-Register & Document Movement
            </h1>
          </div>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.95rem' }}>
            Atomic sequence assignment, inward/outward registers, department routing, acknowledgement receipts, and privacy enforcement.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}
        >
          <Plus size={18} /> Register Document
        </button>
      </div>

      {/* Alert Messages */}
      {message && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          color: message.type === 'success' ? '#4ade80' : '#f87171'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: '24px'
      }}>
        {[
          { id: 'entries', label: '1. Register Entries (/entries)', icon: FileText },
          { id: 'numbering', label: '2. Numbering Config (/numbering)', icon: Settings },
          { id: 'movement', label: '3. Movement & Dispatch (/movement)', icon: Send },
          { id: 'reports', label: '4. Search & Reports (/reports)', icon: Filter }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                color: isActive ? '#60a5fa' : '#94a3b8',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: REGISTER ENTRIES */}
      {activeTab === 'entries' && (
        <div>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            alignItems: 'center',
            background: 'rgba(30, 41, 59, 0.5)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search entry number, subject, sender..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#fff'
                }}
              />
            </div>

            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff'
              }}
            >
              <option value="">All Register Types</option>
              <option value={RegisterType.INWARD}>INWARD</option>
              <option value={RegisterType.OUTWARD}>OUTWARD</option>
            </select>

            <select
              value={filterDept}
              onChange={e => setFilterDept(e.target.value)}
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                padding: '8px 12px',
                color: '#fff'
              }}
            >
              <option value="">All Departments</option>
              <option value="CSE">CSE (Computer Science)</option>
              <option value="ADMIN">ADMIN (Administration)</option>
              <option value="FIN">FIN (Finance)</option>
              <option value="REG">REG (Registrar)</option>
            </select>
          </div>

          {/* Entries Table */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#e2e8f0', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'rgba(30, 41, 59, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Entry Number</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Type & Dept</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Sender & Recipient</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Doc Date</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'left' }}>Privacy</th>
                  <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                      No register entries found. Click "Register Document" to add one.
                    </td>
                  </tr>
                ) : (
                  entries.map(entry => (
                    <tr key={entry._id} style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      opacity: entry.isVoided ? 0.6 : 1,
                      backgroundColor: entry.isVoided ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                    }}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, fontFamily: 'monospace', color: '#60a5fa' }}>
                        {entry.entryNumber}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: entry.registerType === RegisterType.INWARD ? 'rgba(34, 197, 94, 0.2)' : 'rgba(168, 85, 247, 0.2)',
                          color: entry.registerType === RegisterType.INWARD ? '#4ade80' : '#c084fc',
                          marginRight: '6px'
                        }}>
                          {entry.registerType}
                        </span>
                        <span style={{ fontWeight: 500, color: '#94a3b8' }}>{entry.departmentCode}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500 }}>
                        {entry.subject}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '0.85rem' }}>
                        <div style={{ color: '#cbd5e1' }}>From: {entry.senderDetails}</div>
                        <div style={{ color: '#94a3b8' }}>To: {entry.recipientDetails}</div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#94a3b8' }}>
                        {entry.documentDate}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor:
                            entry.status === 'VOIDED' ? 'rgba(239, 68, 68, 0.2)' :
                            entry.status === 'ACKNOWLEDGED' ? 'rgba(34, 197, 94, 0.2)' :
                            entry.status === 'DISPATCHED' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color:
                            entry.status === 'VOIDED' ? '#f87171' :
                            entry.status === 'ACKNOWLEDGED' ? '#4ade80' :
                            entry.status === 'DISPATCHED' ? '#facc15' : '#60a5fa'
                        }}>
                          {entry.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {entry.isPrivate ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#f87171', fontSize: '0.8rem' }}>
                            <Lock size={14} /> Private
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Public</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleViewDetail(entry._id)}
                            title="View Detail & History"
                            style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer' }}
                          >
                            <Eye size={18} />
                          </button>

                          {!entry.isVoided && entry.status === 'ACTIVE' && (
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowDispatchModal(true);
                              }}
                              title="Dispatch Document"
                              style={{ background: 'none', border: 'none', color: '#facc15', cursor: 'pointer' }}
                            >
                              <Send size={18} />
                            </button>
                          )}

                          {!entry.isVoided && (
                            <button
                              onClick={() => {
                                setSelectedEntry(entry);
                                setShowVoidModal(true);
                              }}
                              title="Void Entry"
                              style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                            >
                              <Ban size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: NUMBERING CONFIG */}
      {activeTab === 'numbering' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Configure Sequence Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings style={{ color: '#3b82f6' }} size={20} /> Department Number Sequence Config
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
              Configure atomic scoped number format per department, register type, and year.
            </p>

            <form onSubmit={handleConfigureSequence} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Department Code</label>
                <select
                  value={newSeqConfig.departmentCode}
                  onChange={e => setNewSeqConfig({ ...newSeqConfig, departmentCode: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                >
                  <option value="CSE">CSE - Computer Science</option>
                  <option value="ADMIN">ADMIN - Administration</option>
                  <option value="FIN">FIN - Finance</option>
                  <option value="REG">REG - Registrar Office</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Register Type</label>
                  <select
                    value={newSeqConfig.registerType}
                    onChange={e => setNewSeqConfig({ ...newSeqConfig, registerType: e.target.value as any })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  >
                    <option value={RegisterType.INWARD}>INWARD</option>
                    <option value={RegisterType.OUTWARD}>OUTWARD</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Operating Year</label>
                  <input
                    type="number"
                    value={newSeqConfig.year}
                    onChange={e => setNewSeqConfig({ ...newSeqConfig, year: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Number Format Prefix</label>
                <input
                  type="text"
                  value={newSeqConfig.prefix}
                  onChange={e => setNewSeqConfig({ ...newSeqConfig, prefix: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Sequence Padding Digits</label>
                <input
                  type="number"
                  value={newSeqConfig.paddingDigits}
                  onChange={e => setNewSeqConfig({ ...newSeqConfig, paddingDigits: parseInt(e.target.value, 10) })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Save Sequence Config
              </button>
            </form>
          </div>

          {/* Active Sequences List */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen style={{ color: '#4ade80' }} size={20} /> Active Department Registers & Counters
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
              {sequences.map(seq => (
                <div key={seq._id} style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                      {seq.departmentCode} — {seq.registerType} ({seq.year})
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#60a5fa', fontFamily: 'monospace' }}>
                      Prefix: {seq.prefix}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4ade80' }}>
                      #{seq.currentSequence}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Next: {seq.prefix}{String(seq.currentSequence + 1).padStart(seq.paddingDigits || 5, '0')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MOVEMENT & DISPATCH */}
      {activeTab === 'movement' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#f8fafc', fontSize: '1.1rem' }}>
              Pending Inward / Movement Acknowledgements
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Documents dispatched to your department requiring formal receipt acknowledgement.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {entries.filter(e => e.status === 'DISPATCHED').length === 0 ? (
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '32px', borderRadius: '12px', textAlign: 'center', color: '#94a3b8' }}>
                No active document dispatches awaiting acknowledgement.
              </div>
            ) : (
              entries.filter(e => e.status === 'DISPATCHED').map(entry => (
                <div key={entry._id} style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#facc15' }}>{entry.entryNumber}</span>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', padding: '2px 8px', borderRadius: '4px' }}>
                        IN TRANSIT / DISPATCHED
                      </span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                      {entry.subject}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Sender: {entry.senderDetails} | Dept: {entry.departmentCode}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Acknowledgement remarks..."
                      value={ackRemarks}
                      onChange={e => setAckRemarks(e.target.value)}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#fff',
                        width: '240px'
                      }}
                    />
                    <button
                      onClick={async () => {
                        // Get movement id from detail
                        const res = await fetch(`/api/v1/registers/entries/${entry._id}`, { headers: { Authorization: `Bearer ${token}` } });
                        const d = await res.json();
                        const lastMov = d.movements && d.movements[d.movements.length - 1];
                        if (lastMov) {
                          handleAcknowledge(lastMov._id);
                        } else {
                          alert('Movement record not found for entry');
                        }
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 16px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle size={16} /> Acknowledge Receipt
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REPORTS */}
      {activeTab === 'reports' && reportsData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Summary Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Total Registered</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f8fafc' }}>{reportsData.summary.totalCount}</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Inward / Outward Split</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#60a5fa' }}>
                In: {reportsData.summary.inwardCount} | Out: {reportsData.summary.outwardCount}
              </div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Acknowledged Received</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4ade80' }}>{reportsData.summary.acknowledgedCount}</div>
            </div>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '4px' }}>Voided Entries</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f87171' }}>{reportsData.summary.voidedCount}</div>
            </div>
          </div>

          {/* Export Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30, 41, 59, 0.5)', padding: '16px 24px', borderRadius: '12px' }}>
            <span style={{ color: '#cbd5e1' }}>Export authorized official register report data in JSON/CSV format</span>
            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportsData, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `Register_Report_${new Date().toISOString().split('T')[0]}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 18px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} /> Export Authorized Register
            </button>
          </div>
        </div>
      )}

      {/* CREATE REGISTER ENTRY MODAL */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px', padding: '32px', width: '600px', maxWidth: '90%', color: '#fff'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.4rem' }}>Register New Document Entry</h2>

            <form onSubmit={handleCreateEntry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Department Code</label>
                  <select
                    value={newEntry.departmentCode}
                    onChange={e => setNewEntry({ ...newEntry, departmentCode: e.target.value })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="FIN">FIN</option>
                    <option value="REG">REG</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Register Type</label>
                  <select
                    value={newEntry.registerType}
                    onChange={e => setNewEntry({ ...newEntry, registerType: e.target.value as any })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  >
                    <option value={RegisterType.INWARD}>INWARD</option>
                    <option value={RegisterType.OUTWARD}>OUTWARD</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Document Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Budget Sanction 2026-27"
                  value={newEntry.subject}
                  onChange={e => setNewEntry({ ...newEntry, subject: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Sender Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UGC Finance Wing"
                    value={newEntry.senderDetails}
                    onChange={e => setNewEntry({ ...newEntry, senderDetails: e.target.value })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Recipient Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finance Officer"
                    value={newEntry.recipientDetails}
                    onChange={e => setNewEntry({ ...newEntry, recipientDetails: e.target.value })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Document Date (YYYY-MM-DD)</label>
                  <input
                    type="text"
                    required
                    value={newEntry.documentDate}
                    onChange={e => setNewEntry({ ...newEntry, documentDate: e.target.value })}
                    style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '24px' }}>
                  <input
                    type="checkbox"
                    id="isPrivateCheck"
                    checked={newEntry.isPrivate}
                    onChange={e => setNewEntry({ ...newEntry, isPrivate: e.target.checked })}
                  />
                  <label htmlFor="isPrivateCheck" style={{ color: '#cbd5e1', fontSize: '0.9rem', cursor: 'pointer' }}>
                    Mark Attachment as Private
                  </label>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Attachments (Title|URL per line)</label>
                <textarea
                  rows={2}
                  value={newEntry.attachmentsText}
                  onChange={e => setNewEntry({ ...newEntry, attachmentsText: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#94a3b8', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Register & Assign Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH MODAL */}
      {showDispatchModal && selectedEntry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px', padding: '32px', width: '500px', maxWidth: '90%', color: '#fff'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem' }}>Dispatch Document {selectedEntry.entryNumber}</h2>

            <form onSubmit={handleDispatch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Recipient Department</label>
                <select
                  value={dispatchData.toDepartmentCode}
                  onChange={e => setDispatchData({ ...dispatchData, toDepartmentCode: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                >
                  <option value="ADMIN">ADMIN - Administration</option>
                  <option value="FIN">FIN - Finance</option>
                  <option value="CSE">CSE - Computer Science</option>
                  <option value="REG">REG - Registrar Office</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Dispatch Remarks</label>
                <textarea
                  rows={3}
                  required
                  value={dispatchData.remarks}
                  onChange={e => setDispatchData({ ...dispatchData, remarks: e.target.value })}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#94a3b8', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Dispatch Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VOID MODAL */}
      {showVoidModal && selectedEntry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '16px', padding: '32px', width: '500px', maxWidth: '90%', color: '#fff'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '1.3rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ban size={22} /> Void Register Entry
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginBottom: '20px' }}>
              Entry numbers are immutable and cannot be deleted or reused. Voiding will preserve entry history with mandatory justification.
            </p>

            <form onSubmit={handleVoidEntry} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: '#cbd5e1', marginBottom: '6px', fontSize: '0.85rem' }}>Mandatory Void Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Duplicate entry created erroneously by section officer"
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  style={{ width: '100%', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '6px', padding: '10px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowVoidModal(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#94a3b8', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm Void Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENTRY DETAIL MODAL */}
      {showDetailModal && selectedEntry && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(4px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px', padding: '32px', width: '700px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem', fontFamily: 'monospace', color: '#60a5fa' }}>
                {selectedEntry.entryNumber}
              </h2>
              <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '8px' }}>
              <div><strong>Subject:</strong> {selectedEntry.subject}</div>
              <div><strong>Type:</strong> {selectedEntry.registerType} ({selectedEntry.departmentCode})</div>
              <div><strong>Sender:</strong> {selectedEntry.senderDetails}</div>
              <div><strong>Recipient:</strong> {selectedEntry.recipientDetails}</div>
              <div><strong>Doc Date:</strong> {selectedEntry.documentDate}</div>
              <div><strong>Status:</strong> {selectedEntry.status}</div>
            </div>

            {selectedEntry.isVoided && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: '#f87171' }}>
                <strong>ENTRY VOIDED:</strong> {selectedEntry.voidReason}
              </div>
            )}

            {/* Attachments Section */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Attachments ({selectedEntry.attachments?.length || 0})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {selectedEntry.attachments?.map((att: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)', padding: '12px', borderRadius: '6px' }}>
                  <span>{att.title} {att.isPrivate && <Lock size={14} style={{ color: '#f87171', marginLeft: '6px' }} />}</span>
                  <button
                    onClick={() => handleTestAttachment(selectedEntry._id, idx)}
                    style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Test Download Access
                  </button>
                </div>
              ))}
            </div>

            {/* Movement Timeline */}
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px' }}>Document Movement History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedEntry.movements?.length === 0 ? (
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>No movement recorded yet.</div>
              ) : (
                selectedEntry.movements?.map((m: any, i: number) => (
                  <div key={i} style={{ background: 'rgba(15, 23, 42, 0.6)', borderLeft: '4px solid #3b82f6', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                      {m.fromDepartmentCode} → {m.toDepartmentCode} ({m.status})
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                      Dispatched: {new Date(m.dispatchedAt).toLocaleString()} — Remarks: {m.remarks}
                    </div>
                    {m.acknowledgement && (
                      <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '4px', fontSize: '0.85rem' }}>
                        Ack No: {m.acknowledgement.ackNumber} by {m.acknowledgement.receivedByUserName}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE ACKNOWLEDGEMENT RECEIPT MODAL */}
      {showAckPrintModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
        }}>
          <div style={{
            background: '#fff', color: '#000', fontFamily: 'monospace',
            borderRadius: '12px', padding: '32px', width: '600px', maxWidth: '90%', whiteSpace: 'pre-wrap'
          }}>
            <h2 style={{ fontFamily: 'sans-serif', margin: '0 0 16px 0', borderBottom: '2px solid #000', paddingBottom: '8px' }}>
              Official Printable Acknowledgement
            </h2>
            <div style={{ background: '#f8fafc', padding: '16px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              {ackPrintContent}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button
                onClick={() => window.print()}
                style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
              >
                <Printer size={16} style={{ display: 'inline', marginRight: '6px' }} /> Print Receipt
              </button>
              <button
                onClick={() => setShowAckPrintModal(false)}
                style={{ background: '#64748b', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
