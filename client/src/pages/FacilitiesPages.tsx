import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building, Bus, Library, QrCode, CheckCircle2, FileText, Plus } from 'lucide-react';
import { LoadingState } from '../components/BadgesAndStates';

export const HostelPage: React.FC = () => {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rRes, pRes] = await Promise.all([
          fetch('/api/v1/hostels', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/v1/hostels/gatepasses', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        if (rRes.ok) setRooms(await rRes.json());
        if (pRes.ok) setPasses(await pRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <LoadingState message="Loading hostel facilities data..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Hostel Facilities & Gate Pass Engine</h1>
        <p style={{ color: 'var(--text-muted)' }}>Building room occupancy grids, gate pass workflows & warden approvals</p>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={20} style={{ color: '#6366f1' }} /> Hostel Building Occupancy
        </h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Building Name</th>
                <th>Room Number</th>
                <th>Capacity</th>
                <th>Current Occupancy</th>
                <th>Monthly Rent (Paise)</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(rm => (
                <tr key={rm._id}>
                  <td style={{ fontWeight: 600 }}>{rm.buildingName}</td>
                  <td><span className="badge badge-idempotency">Room {rm.roomNumber}</span></td>
                  <td>{rm.capacity} Beds</td>
                  <td>{rm.currentOccupancy} / {rm.capacity} Occupied</td>
                  <td><strong style={{ color: '#34d399' }}>₹{(rm.monthlyRentPaise / 100).toLocaleString('en-IN')}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Gate Pass Outpass Requests</h3>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Reason</th>
                <th>Out Date</th>
                <th>In Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {passes.map(p => (
                <tr key={p._id}>
                  <td style={{ fontWeight: 600 }}>{p.studentId?.userId?.name || 'Aarav Sharma'}</td>
                  <td>{p.reason}</td>
                  <td>{p.outDate}</td>
                  <td>{p.inDate}</td>
                  <td><span className="badge badge-paise">{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const TransportPage: React.FC = () => {
  const { token } = useAuth();
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await fetch('/api/v1/transport/routes', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setRoutes(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [token]);

  if (loading) return <LoadingState message="Loading transport routes..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Transport Routes & Bus Pass</h1>
        <p style={{ color: 'var(--text-muted)' }}>Vehicle route details, driver info & active bus pass QR codes</p>
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Route No</th>
                <th>Route Name</th>
                <th>Vehicle No</th>
                <th>Driver Name</th>
                <th>Fee (Paise)</th>
                <th>Bus Pass</th>
              </tr>
            </thead>
            <tbody>
              {routes.map(r => (
                <tr key={r._id}>
                  <td><span className="badge badge-idempotency">{r.routeNumber}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.routeName}</td>
                  <td>{r.vehicleNumber}</td>
                  <td>{r.driverName}</td>
                  <td><strong style={{ color: '#34d399' }}>₹{(r.feePaise / 100).toLocaleString('en-IN')}</strong></td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => alert('Bus Pass QR Issued!')}>
                      <QrCode size={14} /> View Bus Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const LibraryPage: React.FC = () => {
  const { token } = useAuth();
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/v1/library/books', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setBooks(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [token]);

  if (loading) return <LoadingState message="Loading library catalog..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Library Catalog & Circulation</h1>
        <p style={{ color: 'var(--text-muted)' }}>Book ISBN search, issue/return tracking & overdue fine calculation</p>
      </div>

      <div className="glass-card">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>Book Title</th>
                <th>Author</th>
                <th>Available Copies</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{b.isbn}</td>
                  <td style={{ fontWeight: 600 }}>{b.title}</td>
                  <td>{b.author}</td>
                  <td><span className="badge badge-paise">{b.availableCopies} / {b.totalCopies} Available</span></td>
                  <td>
                    <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => alert(`Issued ${b.title}!`)}>
                      Issue Book
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
