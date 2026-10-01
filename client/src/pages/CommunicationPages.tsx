import React, { useState, useEffect } from 'react';

interface NoticeItem {
  _id: string;
  noticeNumber: string;
  title: string;
  body: string;
  category: string;
  targetAudience: {
    audienceType: string;
    departmentId?: string;
    batchYear?: number;
    targetRole?: string;
  };
  calculatedRecipientCount: number;
  isSensitive: boolean;
  status: string;
  scheduledPublishAt?: string;
  publishedAt?: string;
  createdByName: string;
  attachments?: Array<{ title: string; url: string; fileType: string }>;
  createdAt: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  body: string;
  category: string;
  channel: string;
  isRead: boolean;
  isSensitive: boolean;
  deliveredAt: string;
  noticeId?: any;
}

interface OutboxItem {
  _id: string;
  eventId: string;
  recipientAddress: string;
  channel: string;
  subject: string;
  payloadText: string;
  isSensitive: boolean;
  status: string;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  dispatchedAt?: string;
  createdAt: string;
  recipientUserId?: { name: string; email: string; role: string };
  attempts?: Array<{
    attemptNumber: number;
    status: string;
    providerResponse: string;
    errorMessage?: string;
    attemptedAt: string;
  }>;
}

interface CalendarEventItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  isSensitive: boolean;
  location: string;
  isSubscribed: boolean;
  attachments?: Array<{ title: string; url: string; fileType: string }>;
}

export const CommunicationPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'notices' | 'inbox' | 'outbox' | 'calendar'>('notices');
  const [token, setToken] = useState<string>('');

  // State
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [outboxMessages, setOutboxMessages] = useState<OutboxItem[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [preferences, setPreferences] = useState<any>({ inAppEnabled: true, emailEnabled: true, smsEnabled: true, mutedCategories: [] });

  // Notice Form State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('ACADEMIC');
  const [audienceType, setAudienceType] = useState('ALL_INSTITUTION');
  const [targetRole, setTargetRole] = useState('STUDENT');
  const [batchYear, setBatchYear] = useState<number>(2024);
  const [isSensitive, setIsSensitive] = useState(false);
  const [scheduledPublishAt, setScheduledPublishAt] = useState('');
  const [publishImmediately, setPublishImmediately] = useState(true);

  // Audience Preview State
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token') || '';
    setToken(savedToken);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'notices') fetchNotices();
    if (activeTab === 'inbox') {
      fetchInbox();
      fetchPreferences();
    }
    if (activeTab === 'outbox') fetchOutbox();
    if (activeTab === 'calendar') fetchCalendar();
  }, [activeTab, token]);

  const fetchNotices = async () => {
    try {
      const res = await fetch('/api/v1/communications/notices', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setNotices(data);
    } catch (err) {}
  };

  const fetchInbox = async () => {
    try {
      const res = await fetch('/api/v1/communications/inbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {}
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/v1/communications/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setPreferences(data);
    } catch (err) {}
  };

  const fetchOutbox = async () => {
    try {
      const res = await fetch('/api/v1/communications/outbox', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setOutboxMessages(data);
    } catch (err) {}
  };

  const fetchCalendar = async () => {
    try {
      const res = await fetch('/api/v1/communications/calendar', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCalendarEvents(data);
    } catch (err) {}
  };

  const handlePreviewAudience = async () => {
    try {
      const targetAudience = {
        audienceType,
        targetRole: audienceType === 'ROLE' ? targetRole : undefined,
        batchYear: audienceType === 'BATCH' ? Number(batchYear) : undefined
      };
      const res = await fetch('/api/v1/communications/notices/preview-audience', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ targetAudience })
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewCount(data.matchedCount);
      }
    } catch (err) {}
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      const targetAudience = {
        audienceType,
        targetRole: audienceType === 'ROLE' ? targetRole : undefined,
        batchYear: audienceType === 'BATCH' ? Number(batchYear) : undefined
      };

      const res = await fetch('/api/v1/communications/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          body,
          category,
          targetAudience,
          isSensitive,
          scheduledPublishAt: scheduledPublishAt || undefined,
          publishImmediately
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: `Notice '${data.title}' created successfully! Audience size: ${data.calculatedRecipientCount}` });
        setTitle('');
        setBody('');
        setScheduledPublishAt('');
        fetchNotices();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to create notice' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handlePublishNow = async (noticeId: string) => {
    setMsg(null);
    try {
      const res = await fetch('/api/v1/communications/notices/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ noticeId })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: `Notice '${data.title}' published and outbox events dispatched!` });
        fetchNotices();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to publish notice' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleMarkRead = async (notificationId: string) => {
    try {
      await fetch('/api/v1/communications/inbox/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notificationId })
      });
      fetchInbox();
    } catch (err) {}
  };

  const handleUpdatePreferences = async (newPref: any) => {
    try {
      const res = await fetch('/api/v1/communications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPref)
      });
      const data = await res.json();
      if (res.ok) setPreferences(data);
    } catch (err) {}
  };

  const handleRetryOutbox = async (outboxMessageId: string) => {
    setMsg(null);
    try {
      const res = await fetch('/api/v1/communications/outbox/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ outboxMessageId, forceSuccess: true })
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: 'success', text: `Outbox message retried successfully. Status: ${data.outboxMessage.status}` });
        fetchOutbox();
      } else {
        setMsg({ type: 'error', text: data.error || 'Failed to retry outbox message' });
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  const handleCalendarSubscribe = async (calendarEventId: string, currentSub: boolean) => {
    try {
      await fetch('/api/v1/communications/calendar/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ calendarEventId, action: currentSub ? 'UNSUBSCRIBE' : 'SUBSCRIBE' })
      });
      fetchCalendar();
    } catch (err) {}
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Communications & Outbox Simulator
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px', marginTop: '4px' }}>
            Notice Composition, In-App Inbox, Asynchronous Outbox Delivery Worker & Academic Calendar
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ background: '#E0E7FF', color: '#3730A3', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            [SIMULATED PROVIDER MODE]
          </span>
          <span style={{ background: '#F3F4F6', color: '#374151', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            Campus Timezone: Asia/Kolkata (IST)
          </span>
        </div>
      </div>

      {/* Alert Messages */}
      {msg && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          background: msg.type === 'success' ? '#DEF7EC' : '#FDE8E8',
          color: msg.type === 'success' ? '#03543F' : '#9B1C1C',
          fontWeight: '500',
          fontSize: '14px'
        }}>
          {msg.text}
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #E5E7EB', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('notices')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            color: activeTab === 'notices' ? '#4F46E5' : '#6B7280',
            borderBottom: activeTab === 'notices' ? '3px solid #4F46E5' : '3px solid transparent',
            marginBottom: '-2px'
          }}
        >
          Notices & Compose
        </button>
        <button
          onClick={() => setActiveTab('inbox')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            color: activeTab === 'inbox' ? '#4F46E5' : '#6B7280',
            borderBottom: activeTab === 'inbox' ? '3px solid #4F46E5' : '3px solid transparent',
            marginBottom: '-2px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Notification Inbox
          {unreadCount > 0 && (
            <span style={{ background: '#EF4444', color: '#FFF', borderRadius: '12px', padding: '2px 8px', fontSize: '11px' }}>
              {unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outbox')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            color: activeTab === 'outbox' ? '#4F46E5' : '#6B7280',
            borderBottom: activeTab === 'outbox' ? '3px solid #4F46E5' : '3px solid transparent',
            marginBottom: '-2px'
          }}
        >
          Delivery Outbox & Simulator Logs
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          style={{
            padding: '12px 20px',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            color: activeTab === 'calendar' ? '#4F46E5' : '#6B7280',
            borderBottom: activeTab === 'calendar' ? '3px solid #4F46E5' : '3px solid transparent',
            marginBottom: '-2px'
          }}
        >
          Academic Calendar & Attachments
        </button>
      </div>

      {/* TAB 1: NOTICES & COMPOSE */}
      {activeTab === 'notices' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Notice Compose Card */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              Compose & Preview Notice
            </h2>
            <form onSubmit={handleCreateNotice}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Notice Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class Schedule Modification & Mid-Term Exam Update"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Notice Content / Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Enter detailed notice message..."
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="EXAMINATION">Examination</option>
                    <option value="ADMINISTRATIVE">Administrative</option>
                    <option value="HOSTEL">Hostel</option>
                    <option value="TRANSPORT">Transport</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Target Audience</label>
                  <select
                    value={audienceType}
                    onChange={e => setAudienceType(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  >
                    <option value="ALL_INSTITUTION">Entire Institution</option>
                    <option value="ROLE">By User Role</option>
                    <option value="BATCH">By Student Batch</option>
                  </select>
                </div>
              </div>

              {audienceType === 'ROLE' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Select Target Role</label>
                  <select
                    value={targetRole}
                    onChange={e => setTargetRole(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  >
                    <option value="STUDENT">Students Only</option>
                    <option value="FACULTY">Faculty Members</option>
                    <option value="WARDEN">Wardens</option>
                    <option value="FINANCE">Finance Staff</option>
                  </select>
                </div>
              )}

              {audienceType === 'BATCH' && (
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Batch Year</label>
                  <input
                    type="number"
                    value={batchYear}
                    onChange={e => setBatchYear(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                  />
                </div>
              )}

              {/* Sensitive Toggle */}
              <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="sensitiveToggle"
                  checked={isSensitive}
                  onChange={e => setIsSensitive(e.target.checked)}
                />
                <label htmlFor="sensitiveToggle" style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  Confidential / Sensitive Notice (Redacts in-app body for broad notifications)
                </label>
              </div>

              {/* Schedule Publish Date */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  Scheduled Publication Time (Campus Timezone)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledPublishAt}
                  onChange={e => {
                    setScheduledPublishAt(e.target.value);
                    setPublishImmediately(false);
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '14px' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                  <input
                    type="checkbox"
                    id="pubNow"
                    checked={publishImmediately}
                    onChange={e => {
                      setPublishImmediately(e.target.checked);
                      if (e.target.checked) setScheduledPublishAt('');
                    }}
                  />
                  <label htmlFor="pubNow" style={{ fontSize: '12px', color: '#6B7280' }}>Publish Immediately upon submission</label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handlePreviewAudience}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: '1px solid #4F46E5',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Preview Recipient Size
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#4F46E5',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {publishImmediately ? 'Publish Notice' : 'Schedule Notice'}
                </button>
              </div>

              {previewCount !== null && (
                <div style={{ marginTop: '12px', padding: '10px', background: '#F3F4F6', borderRadius: '6px', fontSize: '13px', color: '#374151', textAlign: 'center' }}>
                  🎯 <strong>Audience Match Result:</strong> {previewCount} recipient users matched in this institution.
                </div>
              )}
            </form>
          </div>

          {/* Published / Scheduled Notices List */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              Institutional Notice Board ({notices.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notices.length === 0 ? (
                <div style={{ padding: '20px', background: '#F9FAFB', borderRadius: '8px', color: '#6B7280', textAlign: 'center' }}>
                  No notices published yet.
                </div>
              ) : (
                notices.map(n => (
                  <div key={n._id} style={{ background: '#FFFFFF', padding: '16px', borderRadius: '10px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '4px' }}>
                        {n.noticeNumber} • {n.category}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: n.status === 'PUBLISHED' ? '#DEF7EC' : n.status === 'SCHEDULED' ? '#FEF08A' : '#F3F4F6',
                        color: n.status === 'PUBLISHED' ? '#03543F' : n.status === 'SCHEDULED' ? '#713F12' : '#374151'
                      }}>
                        {n.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: '600', margin: '0 0 6px 0', color: '#111827' }}>
                      {n.title}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#4B5563', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                      {n.body}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#9CA3AF' }}>
                      <span>By: {n.createdByName} • Target: {n.targetAudience.audienceType} ({n.calculatedRecipientCount} recipients)</span>
                      {n.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handlePublishNow(n._id)}
                          style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Publish Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATION INBOX */}
      {activeTab === 'inbox' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
              Personal In-App Inbox ({notifications.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px', background: '#F9FAFB', borderRadius: '8px', color: '#6B7280', textAlign: 'center' }}>
                  Your notification inbox is clean! No unread notices.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n._id} style={{
                    background: n.isRead ? '#FAFAFA' : '#FFFFFF',
                    padding: '16px',
                    borderRadius: '10px',
                    borderLeft: n.isRead ? '4px solid #D1D5DB' : '4px solid #4F46E5',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>{n.title}</span>
                      <span style={{ fontSize: '12px', color: '#9CA3AF' }}>{new Date(n.deliveredAt).toLocaleString()}</span>
                    </div>

                    <p style={{
                      fontSize: '13px',
                      color: n.isSensitive ? '#B45309' : '#374151',
                      background: n.isSensitive ? '#FEF3C7' : 'transparent',
                      padding: n.isSensitive ? '8px 12px' : '0',
                      borderRadius: n.isSensitive ? '6px' : '0',
                      margin: '0 0 10px 0'
                    }}>
                      {n.body}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '4px' }}>
                        Channel: {n.channel}
                      </span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n._id)}
                          style={{ background: '#EEF2FF', color: '#4F46E5', border: '1px solid #C7D2FE', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preferences Control Panel */}
          <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '20px', height: 'fit-content' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '14px', color: '#111827' }}>
              Notification Preferences
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.inAppEnabled}
                  onChange={e => handleUpdatePreferences({ ...preferences, inAppEnabled: e.target.checked })}
                />
                In-App Notification Center
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.emailEnabled}
                  onChange={e => handleUpdatePreferences({ ...preferences, emailEnabled: e.target.checked })}
                />
                Email Delivery (Simulated)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={preferences.smsEnabled}
                  onChange={e => handleUpdatePreferences({ ...preferences, smsEnabled: e.target.checked })}
                />
                SMS Mobile Alerts (Simulated)
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: OUTBOX & SIMULATOR LOGS */}
      {activeTab === 'outbox' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Asynchronous Outbox Queue & Provider Simulator Logs ({outboxMessages.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {outboxMessages.length === 0 ? (
              <div style={{ padding: '24px', background: '#F9FAFB', borderRadius: '8px', color: '#6B7280', textAlign: 'center' }}>
                Outbox delivery queue is empty.
              </div>
            ) : (
              outboxMessages.map(m => (
                <div key={m._id} style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', fontWeight: '700', background: '#E0E7FF', color: '#3730A3', padding: '2px 8px', borderRadius: '4px', marginRight: '8px' }}>
                        CHANNEL: {m.channel}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>
                        To: {m.recipientUserId?.name || m.recipientAddress} ({m.recipientAddress})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: m.status === 'DISPATCHED' ? '#DEF7EC' : m.status === 'FAILED' ? '#FDE8E8' : '#FEF08A',
                        color: m.status === 'DISPATCHED' ? '#03543F' : m.status === 'FAILED' ? '#9B1C1C' : '#713F12'
                      }}>
                        STATUS: {m.status} (Attempt {m.retryCount}/{m.maxRetries})
                      </span>

                      {m.status !== 'DISPATCHED' && (
                        <button
                          onClick={() => handleRetryOutbox(m._id)}
                          style={{ background: '#EF4444', color: '#FFF', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}
                        >
                          Retry Delivery
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: '#374151', margin: '4px 0 10px 0', fontWeight: '500' }}>
                    Subject: {m.subject}
                  </p>

                  {/* Provider Logs Terminal */}
                  <div style={{ background: '#1E293B', color: '#F8FAFC', padding: '10px 14px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '12px' }}>
                    <div style={{ color: '#94A3B8', marginBottom: '4px' }}>// Simulated Provider Audit Terminal</div>
                    {m.attempts && m.attempts.length > 0 ? (
                      m.attempts.map((att, i) => (
                        <div key={i} style={{ color: att.status === 'SUCCESS' ? '#4ADE80' : '#F87171' }}>
                          [{new Date(att.attemptedAt).toLocaleTimeString()}] Attempt #{att.attemptNumber}: {att.providerResponse}
                        </div>
                      ))
                    ) : (
                      <div style={{ color: '#FACC15' }}>[QUEUED] Waiting for delivery worker dispatch tick...</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACADEMIC CALENDAR */}
      {activeTab === 'calendar' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
            Academic & Event Calendar Subscription ({calendarEvents.length})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
            {calendarEvents.map(ev => (
              <div key={ev._id} style={{ background: '#FFFFFF', borderRadius: '10px', border: '1px solid #E5E7EB', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', background: '#F3F4F6', color: '#374151', padding: '2px 8px', borderRadius: '4px' }}>
                    {ev.category}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: '600' }}>
                    📅 {ev.startDate} to {ev.endDate}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 6px 0', color: '#111827' }}>
                  {ev.title}
                </h3>
                <p style={{ fontSize: '13px', color: ev.isSensitive ? '#D97706' : '#4B5563', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                  {ev.description}
                </p>

                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                  📍 Location: {ev.location}
                </div>

                {ev.attachments && ev.attachments.length > 0 && (
                  <div style={{ marginBottom: '12px', background: '#F9FAFB', padding: '8px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#4B5563', marginBottom: '4px' }}>Document Attachments:</div>
                    {ev.attachments.map((att, idx) => (
                      <a key={idx} href={att.url} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: '#4F46E5', textDecoration: 'none', display: 'block' }}>
                        📄 {att.title}
                      </a>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => handleCalendarSubscribe(ev._id, ev.isSubscribed)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #4F46E5',
                    background: ev.isSubscribed ? '#EEF2FF' : '#4F46E5',
                    color: ev.isSubscribed ? '#4F46E5' : '#FFFFFF',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  {ev.isSubscribed ? '✓ Subscribed to Calendar' : '+ Subscribe to Event'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
