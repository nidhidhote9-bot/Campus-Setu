import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LoadingState, EmptyState } from '../components/BadgesAndStates';
import {
  Calendar as CalendarIcon,
  Clock,
  Building,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Plus,
  Download,
  Users,
  BookOpen,
  Bell,
  Filter,
  ArrowRight
} from 'lucide-react';

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bg = '#ECFDF5';
  let color = '#047857';

  if (status === 'HOLIDAY' || status === 'CANCELLED') {
    bg = '#FEE2E2';
    color = '#B91C1C';
  } else if (status === 'RESCHEDULED' || status === 'EXAM') {
    bg = '#FEF3C7';
    color = '#B45309';
  }

  return (
    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: bg, color }}>
      {status}
    </span>
  );
};

// ==========================================
// 1. TIMETABLE CALENDAR VIEW (/app/timetable/calendar)
// ==========================================
export const TimetableCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [scheduleData, setScheduleData] = useState<any>({ entries: [], exceptions: [], holidays: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<string>('Monday');

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const query = user?.role === 'STUDENT' ? `studentId=${user.studentId}` : '';
      const res = await fetch(`/api/v1/timetable/calendar?${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setScheduleData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState message="Loading weekly timetable schedule & enrolled courses..." />;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayEntries = scheduleData.entries.filter((e: any) => e.dayOfWeek === selectedDay);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={28} color="var(--primary-color)" /> Academic Timetable & Class Schedule
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {user?.role === 'STUDENT' ? 'Displaying enrolled courses for current semester.' : 'Master institution timetable and room allocations.'}
          </p>
        </div>
      </div>

      {/* Day Selector Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#FFFFFF', padding: '6px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
        {days.map(d => (
          <button
            key={d}
            className="btn"
            style={{
              flex: 1,
              padding: '10px',
              fontSize: '0.9rem',
              fontWeight: 700,
              background: selectedDay === d ? 'var(--primary-color)' : 'transparent',
              color: selectedDay === d ? '#FFFFFF' : 'var(--text-muted)',
              borderRadius: '8px'
            }}
            onClick={() => setSelectedDay(d)}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
          {selectedDay} Schedule ({dayEntries.length} Lectures)
        </h3>

        {dayEntries.length === 0 ? (
          <EmptyState title="No Lectures Scheduled" subtitle={`No classes scheduled for ${selectedDay}.`} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time Slot</th>
                  <th>Course Code & Title</th>
                  <th>Assigned Faculty</th>
                  <th>Allocated Room</th>
                  <th>Section</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dayEntries.map((entry: any) => (
                  <tr key={entry._id}>
                    <td style={{ fontWeight: 700 }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: '6px' }} />
                      {entry.startTime} - {entry.endTime}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{entry.courseId?.code || 'CS201'}</div>
                      <div style={{ fontSize: '0.85rem' }}>{entry.courseId?.name || 'Data Structures'}</div>
                    </td>
                    <td>{entry.facultyId?.name || 'Faculty Member'}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#059669' }}>
                        <Building size={14} style={{ display: 'inline', marginRight: '4px' }} />
                        {entry.roomId?.name || entry.roomNumber}
                      </span>
                    </td>
                    <td>Sec {entry.section}</td>
                    <td>
                      <StatusBadge status={entry.isPublished ? 'PUBLISHED' : 'DRAFT'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. TIMETABLE EDITOR & CONFLICT CHECKER (/app/timetable/editor)
// ==========================================
export const TimetableEditorPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [departmentId, setDepartmentId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('Monday');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [semester, setSemester] = useState<number>(4);
  const [section, setSection] = useState<string>('A');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, rRes, dRes] = await Promise.all([
        fetch('/api/v1/courses', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/timetable/rooms', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/departments', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);

      if (cRes.ok && rRes.ok && dRes.ok) {
        const cData = await cRes.json();
        const rData = await rRes.json();
        const dData = await dRes.json();

        setCourses(cData);
        setRooms(rData);
        setDepartments(dData);

        if (cData.length > 0) setCourseId(cData[0]._id);
        if (rData.length > 0) setRoomId(rData[0]._id);
        if (dData.length > 0) setDepartmentId(dData[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const selectedCourse = courses.find(c => c._id === courseId);
      const facultyId = selectedCourse?.facultyId?._id || selectedCourse?.facultyId || '600000000000000000000001';

      const payload = {
        institutionId: user?.institutionId || '100000000000000000000001',
        departmentId,
        courseId,
        facultyId,
        roomId,
        semester,
        section,
        dayOfWeek,
        startTime,
        endTime
      };

      const res = await fetch('/api/v1/timetable/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to schedule class entry');

      setSuccessMsg(`Class schedule entry successfully created for ${dayOfWeek} ${startTime}-${endTime}!`);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading room allocations & conflict checker..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Building size={28} color="var(--primary-color)" /> Timetable Editor & Room Conflict Checker
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Schedule recurring class entries with automated real-time conflict detection (Room, Faculty & Cohort).
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px', borderRadius: '8px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', marginBottom: '20px', fontWeight: 600 }}>
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '14px', borderRadius: '8px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', marginBottom: '20px', fontWeight: 600 }}>
          ⚠️ {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Editor Form */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 20px 0', color: 'var(--text-primary)' }}>
            Schedule New Course Entry
          </h3>
          <form onSubmit={handleCreateEntry}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Department</label>
                <select className="form-input" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                  {departments.map((d: any) => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Course Subject</label>
                <select className="form-input" value={courseId} onChange={e => setCourseId(e.target.value)}>
                  {courses.map((c: any) => (
                    <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Allocated Room</label>
                <select className="form-input" value={roomId} onChange={e => setRoomId(e.target.value)}>
                  {rooms.map((r: any) => (
                    <option key={r._id} value={r._id}>{r.name} ({r.building} - Cap: {r.capacity})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Day of Week</label>
                <select className="form-input" value={dayOfWeek} onChange={e => setDayOfWeek(e.target.value)}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Section</label>
                <input className="form-input" value={section} onChange={e => setSection(e.target.value)} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="form-label">Start Time (HH:MM)</label>
                <input className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} placeholder="09:00" required />
              </div>
              <div>
                <label className="form-label">End Time (HH:MM)</label>
                <input className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} placeholder="10:00" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 700 }} disabled={saving}>
              {saving ? 'Validating Conflicts & Saving...' : 'Run Conflict Check & Schedule Entry'}
            </button>
          </form>
        </div>

        {/* Room Directory & Capacity Info */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            Available Rooms Directory ({rooms.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {rooms.map((r: any) => (
              <div key={r._id} style={{ border: '1px solid var(--border-color)', padding: '12px', borderRadius: '8px', background: 'var(--surface-color)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary-color)' }}>
                  {r.name} — {r.building}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Capacity: <strong>{r.capacity} seats</strong> | Type: {r.roomType || 'Lecture Hall'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. RESCHEDULE & SUBSTITUTION WORKFLOW (/app/timetable/reschedule)
// ==========================================
export const TimetableReschedulePage: React.FC = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [exceptionDate, setExceptionDate] = useState<string>('2026-10-15');
  const [newRoomId, setNewRoomId] = useState<string>('');
  const [newStartTime, setNewStartTime] = useState<string>('11:00');
  const [newEndTime, setNewEndTime] = useState<string>('12:00');
  const [reason, setReason] = useState<string>('Faculty guest lecture clash adjustment.');
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, rRes] = await Promise.all([
        fetch('/api/v1/timetable/calendar', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        fetch('/api/v1/timetable/rooms', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);

      if (eRes.ok && rRes.ok) {
        const eData = await eRes.json();
        const rData = await rRes.json();
        setEntries(eData.entries || []);
        setRooms(rData || []);

        if (eData.entries?.length > 0) setSelectedEntryId(eData.entries[0]._id);
        if (rData?.length > 0) setNewRoomId(rData[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        entryId: selectedEntryId,
        exceptionDate,
        newRoomId,
        newStartTime,
        newEndTime,
        reason,
        sendNotificationNotice: true
      };

      const res = await fetch('/api/v1/timetable/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reschedule failed');

      setMessage(`Session successfully rescheduled for ${exceptionDate}! Affected students notified via outbox.`);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  if (loading) return <LoadingState message="Loading entries for substitution workflow..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <RefreshCw size={28} color="var(--primary-color)" /> Class Reschedule & Substitution Workflow
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
          Reschedule a specific dated lecture instance without overwriting historical weekly schedule entries.
        </p>
      </div>

      {message && (
        <div style={{ padding: '14px', borderRadius: '8px', background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', marginBottom: '20px', fontWeight: 600 }}>
          ✓ {message}
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '14px', borderRadius: '8px', background: '#FEE2E2', color: '#B91C1C', border: '1px solid #FCA5A5', marginBottom: '20px', fontWeight: 600 }}>
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="card" style={{ padding: '24px', maxWidth: '720px' }}>
        <form onSubmit={handleRescheduleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Target Weekly Class Entry</label>
            <select className="form-input" value={selectedEntryId} onChange={e => setSelectedEntryId(e.target.value)} required>
              {entries.map((entry: any) => (
                <option key={entry._id} value={entry._id}>
                  {entry.courseId?.code || 'CRS'} — {entry.dayOfWeek} {entry.startTime}-{entry.endTime} ({entry.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Specific Exception Date</label>
              <input type="date" className="form-input" value={exceptionDate} onChange={e => setExceptionDate(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">New Room Allocation</label>
              <select className="form-input" value={newRoomId} onChange={e => setNewRoomId(e.target.value)}>
                {rooms.map((r: any) => (
                  <option key={r._id} value={r._id}>{r.name} ({r.building})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">New Start Time (HH:MM)</label>
              <input className="form-input" value={newStartTime} onChange={e => setNewStartTime(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">New End Time (HH:MM)</label>
              <input className="form-input" value={newEndTime} onChange={e => setNewEndTime(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="form-label">Reason for Reschedule</label>
            <textarea className="form-input" rows={3} value={reason} onChange={e => setReason(e.target.value)} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 700 }}>
            Submit Reschedule & Dispatch Outbox Notice
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 4. ACADEMIC EVENTS & HOLIDAYS (/app/timetable/events)
// ==========================================
export const AcademicEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('Mid-Term Assessment Week');
  const [eventType, setEventType] = useState<string>('EXAM');
  const [startDate, setStartDate] = useState<string>('2026-10-20');
  const [endDate, setEndDate] = useState<string>('2026-10-25');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/timetable/events', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setHolidays(data.holidays || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        institutionId: user?.institutionId || '100000000000000000000001',
        title,
        eventType,
        startDate,
        endDate,
        isHoliday: eventType === 'HOLIDAY'
      };

      const res = await fetch('/api/v1/timetable/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        fetchEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading academic calendar & holidays..." />;

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={28} color="var(--primary-color)" /> Academic Calendar & Holidays
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Official university academic calendar events, exam periods, and mandatory holidays.
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => alert('Exporting academic calendar to iCal/CSV format...')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Download size={18} /> Export Calendar (.iCal)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Events Table */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            Scheduled Events & Mandatory Holidays
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event Title</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Class Effect</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h: any) => (
                  <tr key={h._id}>
                    <td style={{ fontWeight: 700 }}>{h.name}</td>
                    <td>
                      <StatusBadge status="HOLIDAY" />
                    </td>
                    <td>{h.date}</td>
                    <td style={{ color: '#EF4444', fontWeight: 600 }}>Classes Suspended</td>
                  </tr>
                ))}
                {events.map((ev: any) => (
                  <tr key={ev._id}>
                    <td style={{ fontWeight: 700 }}>{ev.title}</td>
                    <td>
                      <StatusBadge status={ev.eventType} />
                    </td>
                    <td>{ev.startDate} to {ev.endDate}</td>
                    <td>{ev.isHoliday ? 'Classes Suspended' : 'As Scheduled'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Event Form */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            Add Calendar Event
          </h3>
          <form onSubmit={handleCreateEvent}>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Event Title</label>
              <input className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Event Type</label>
              <select className="form-input" value={eventType} onChange={e => setEventType(e.target.value)}>
                <option value="EXAM">EXAM</option>
                <option value="HOLIDAY">HOLIDAY</option>
                <option value="ACADEMIC_DEADLINE">ACADEMIC DEADLINE</option>
                <option value="WORKSHOP">WORKSHOP</option>
              </select>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
              Add to Academic Calendar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
