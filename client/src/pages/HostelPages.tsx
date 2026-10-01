import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Building,
  BedDouble,
  UserCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRightLeft,
  LogOut,
  LogIn,
  FileText,
  DollarSign,
  ShieldCheck,
  Search,
  Filter,
  Eye,
  PieChart,
  Users,
  Home,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import {
  HostelGenderPolicy,
  RoomType,
  BedStatus,
  HostelAppStatus,
  BedAllocationStatus,
  formatPaiseToRupees
} from '@shared/index';

interface Hostel {
  _id: string;
  code: string;
  name: string;
  genderPolicy: HostelGenderPolicy;
  totalRooms: number;
  totalCapacity: number;
  isActive: boolean;
}

interface HostelRoom {
  _id: string;
  hostelId: {
    _id: string;
    name: string;
    code: string;
  } | string;
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  currentOccupancy: number;
  monthlyFeePaise: number;
  isActive: boolean;
}

interface Bed {
  _id: string;
  hostelId: string;
  roomId: {
    _id: string;
    roomNumber: string;
    roomType: RoomType;
    monthlyFeePaise: number;
  } | string;
  bedNumber: string;
  status: BedStatus;
  currentStudentId?: {
    _id: string;
    rollNumber: string;
  };
}

interface HostelApplication {
  _id: string;
  applicationNumber: string;
  studentId: string;
  studentRollNumber: string;
  gender: string;
  hostelId: string;
  preferredRoomType: RoomType;
  specialPreferences?: string;
  status: HostelAppStatus;
  academicTerm: string;
  submittedAt: string;
}

interface BedAllocation {
  _id: string;
  allocationNumber: string;
  applicationId: string;
  studentId: string;
  hostelId: {
    _id: string;
    name: string;
    code: string;
  } | string;
  roomId: {
    _id: string;
    roomNumber: string;
    roomType: RoomType;
    monthlyFeePaise: number;
  } | string;
  bedId: {
    _id: string;
    bedNumber: string;
    status: BedStatus;
  } | string;
  status: BedAllocationStatus;
  monthlyFeePaise: number;
  depositAmountPaise: number;
  depositPaid: boolean;
  allocatedAt: string;
  checkedInAt?: string;
  checkedOutAt?: string;
}

interface OccupancyReportItem {
  hostelId: string;
  hostelName: string;
  hostelCode: string;
  genderPolicy: string;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  waitlistCount: number;
  occupancyPercentage: number;
}

export const HostelPages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'inventory';

  // Data states
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [myApplications, setMyApplications] = useState<HostelApplication[]>([]);
  const [myAllocation, setMyAllocation] = useState<BedAllocation | null>(null);
  const [pendingApps, setPendingApps] = useState<HostelApplication[]>([]);
  const [occupancyReport, setOccupancyReport] = useState<OccupancyReportItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [selectedHostelId, setSelectedHostelId] = useState<string>('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [appForm, setAppForm] = useState({
    hostelId: '',
    preferredRoomType: RoomType.DOUBLE,
    gender: 'MALE',
    specialPreferences: '',
    academicTerm: '2026-AUTUMN-SEM3'
  });

  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<HostelApplication | null>(null);
  const [targetBedId, setTargetBedId] = useState<string>('');

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferBedId, setTransferBedId] = useState<string>('');
  const [transferReason, setTransferReason] = useState<string>('');

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [damageCharges, setDamageCharges] = useState<number>(0);
  const [keysReturned, setKeysReturned] = useState<boolean>(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'inventory') {
      fetchInventoryData();
    } else if (activeTab === 'apply') {
      fetchStudentAppData();
    } else if (activeTab === 'allocations') {
      fetchAllocationsData();
    } else if (activeTab === 'reports') {
      fetchReportData();
    }
  }, [activeTab, selectedHostelId]);

  const fetchInitialData = async () => {
    try {
      const res = await fetch('/api/v1/hostel/hostels');
      if (res.ok) {
        const data = await res.json();
        setHostels(data);
        if (data.length > 0 && !selectedHostelId) {
          setSelectedHostelId(data[0]._id);
          setAppForm(prev => ({ ...prev, hostelId: data[0]._id }));
        }
      }
    } catch (err: any) {
      console.error('Failed to load hostels', err);
    }
  };

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, bedsRes] = await Promise.all([
        fetch(`/api/v1/hostel/rooms?hostelId=${selectedHostelId}`),
        fetch(`/api/v1/hostel/beds?hostelId=${selectedHostelId}`)
      ]);
      if (roomsRes.ok) setRooms(await roomsRes.json());
      if (bedsRes.ok) setBeds(await bedsRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAppData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [appRes, allocRes] = await Promise.all([
        fetch('/api/v1/hostel/applications/my-applications'),
        fetch('/api/v1/hostel/allocations/my-allocation')
      ]);
      if (appRes.ok) setMyApplications(await appRes.json());
      if (allocRes.ok) setMyAllocation(await allocRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocationsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pendingRes, bedsRes] = await Promise.all([
        fetch(`/api/v1/hostel/applications/pending?hostelId=${selectedHostelId}`),
        fetch(`/api/v1/hostel/beds?hostelId=${selectedHostelId}`)
      ]);
      if (pendingRes.ok) setPendingApps(await pendingRes.json());
      if (bedsRes.ok) setBeds(await bedsRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/v1/hostel/reports/occupancy');
      if (res.ok) setOccupancyReport(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/hostel/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit application');

      setSuccess(`Hostel application ${data.applicationNumber} submitted successfully!`);
      setShowApplyModal(false);
      fetchStudentAppData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAllocateBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !targetBedId) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/hostel/allocations/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: selectedApp._id,
          bedId: targetBedId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to allocate bed');

      if (data.waitlisted) {
        setSuccess(data.message || 'Bed capacity full. Application placed on Waitlist!');
      } else {
        setSuccess(`Bed ${data.bed?.bedNumber || ''} allocated successfully! Allocation #${data.allocation?.allocationNumber || ''}`);
      }

      setShowAllocateModal(false);
      fetchAllocationsData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePayDeposit = async (allocationId: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/v1/hostel/allocations/${allocationId}/pay-deposit`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deposit payment failed');

      setSuccess('Hostel security deposit of ₹10,000 processed successfully!');
      fetchStudentAppData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckIn = async (allocationId: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/hostel/allocations/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocationId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Check-in failed');

      setSuccess('Student checked in to room. Bed status updated to OCCUPIED.');
      if (activeTab === 'allocations') fetchAllocationsData();
      if (activeTab === 'apply') fetchStudentAppData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTransferRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAllocation || !transferBedId) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/hostel/allocations/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationId: myAllocation._id,
          newBedId: transferBedId,
          reason: transferReason
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Room transfer failed');

      setSuccess('Room transfer completed. Previous bed released and new bed occupied!');
      setShowTransferModal(false);
      fetchStudentAppData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myAllocation) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/v1/hostel/allocations/check-out', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocationId: myAllocation._id,
          damageChargesPaise: damageCharges * 100,
          keysReturned
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      setSuccess('Checkout and clearance completed! Bed released to AVAILABLE status.');
      setShowCheckoutModal(false);
      fetchStudentAppData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getBedStatusBadge = (status: BedStatus) => {
    switch (status) {
      case BedStatus.AVAILABLE:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">AVAILABLE</span>;
      case BedStatus.OCCUPIED:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">OCCUPIED</span>;
      case BedStatus.RESERVED:
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">RESERVED</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded bg-slate-500/20 text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto text-slate-100 space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-900/40 to-slate-900/40 p-6 border border-white/10 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
              <Building className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Hostel Facilities & Room Allocation
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  [DEMO / SIMULATION MODE]
                </span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                Bed inventory map, student room allocation, deposit payment, transfer & checkout clearance engine.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Apply For Hostel
          </button>
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
      <div className="flex items-center justify-between border-b border-white/10 pb-1 overflow-x-auto">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchParams({ tab: 'inventory' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BedDouble className="w-4 h-4" />
            Inventory & Bed Map
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'apply' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Application & Room
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'allocations' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'allocations'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Warden Allocation Desk
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'reports' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all cursor-pointer ${
              activeTab === 'reports'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Occupancy Reports
          </button>
        </div>

        {/* Hostel Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Hostel Building:</span>
          <select
            value={selectedHostelId}
            onChange={e => setSelectedHostelId(e.target.value)}
            className="p-2 rounded-xl bg-slate-800 border border-white/10 text-white text-xs focus:outline-none"
          >
            {hostels.map(h => (
              <option key={h._id} value={h._id}>
                {h.name} ({h.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: INVENTORY & BED MAP */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Rooms</p>
                <p className="text-2xl font-bold text-white">{rooms.length}</p>
              </div>
              <Home className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Beds</p>
                <p className="text-2xl font-bold text-cyan-300">{beds.length}</p>
              </div>
              <BedDouble className="w-8 h-8 text-cyan-400 opacity-60" />
            </div>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Available Beds</p>
                <p className="text-2xl font-bold text-emerald-300">
                  {beds.filter(b => b.status === BedStatus.AVAILABLE).length}
                </p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-60" />
            </div>
          </div>

          {/* Rooms Grid */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <BedDouble className="w-5 h-5 text-emerald-400" />
              Room & Bed Occupancy Matrix
            </h3>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading room inventory...</div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No rooms found for this hostel building.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map(r => {
                  const roomBeds = beds.filter(b => (b.roomId as any)?._id === r._id || b.roomId === r._id);
                  return (
                    <div key={r._id} className="p-4 rounded-xl bg-slate-800/60 border border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-white text-base">Room {r.roomNumber}</span>
                          <span className="ml-2 text-xs text-slate-400">Floor {r.floor}</span>
                        </div>
                        <span className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded font-mono">
                          ₹{formatPaiseToRupees(r.monthlyFeePaise)}/mo
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Type: {r.roomType}</span>
                        <span>Occupancy: {r.currentOccupancy} / {r.capacity}</span>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-white/5">
                        {roomBeds.map(b => (
                          <div key={b._id} className="flex items-center justify-between p-2 rounded bg-slate-900/40 text-xs">
                            <span className="font-mono text-slate-300 font-semibold">{b.bedNumber}</span>
                            <div className="flex items-center gap-2">
                              {b.currentStudentId && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({b.currentStudentId.rollNumber})
                                </span>
                              )}
                              {getBedStatusBadge(b.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY APPLICATION & ROOM */}
      {activeTab === 'apply' && (
        <div className="space-y-6">
          {/* Active Allocation Card */}
          {myAllocation ? (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-emerald-500/30 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Active Bed Allocation #{myAllocation.allocationNumber}
                </h3>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {myAllocation.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-white/5 text-xs text-slate-300">
                <div>
                  <span className="block text-slate-500">Hostel Building</span>
                  <span className="text-sm font-semibold text-white">{(myAllocation.hostelId as any)?.name}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Allocated Room</span>
                  <span className="text-sm font-semibold text-white">Room {(myAllocation.roomId as any)?.roomNumber}</span>
                </div>
                <div>
                  <span className="block text-slate-500">Bed Number</span>
                  <span className="text-sm font-semibold text-emerald-300 font-mono">{(myAllocation.bedId as any)?.bedNumber}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400">
                  Monthly Rent: <span className="text-white font-bold font-mono">₹{formatPaiseToRupees(myAllocation.monthlyFeePaise)}</span> | Deposit: <span className="text-emerald-400 font-bold font-mono">₹{formatPaiseToRupees(myAllocation.depositAmountPaise)}</span> ({myAllocation.depositPaid ? 'PAID' : 'PENDING'})
                </div>

                <div className="flex items-center gap-2">
                  {!myAllocation.depositPaid && (
                    <button
                      onClick={() => handlePayDeposit(myAllocation._id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      Pay Deposit (₹10,000)
                    </button>
                  )}
                  {myAllocation.status === BedAllocationStatus.DEPOSIT_PAID && (
                    <button
                      onClick={() => handleCheckIn(myAllocation._id)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                    >
                      Check In
                    </button>
                  )}
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 cursor-pointer"
                  >
                    Request Room Transfer
                  </button>
                  <button
                    onClick={() => setShowCheckoutModal(true)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-medium bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/30 cursor-pointer"
                  >
                    Check Out & Clear Dues
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md text-center space-y-3">
              <Home className="w-10 h-10 mx-auto text-slate-500" />
              <p className="text-sm text-slate-300">You currently do not have an active hostel room allocation.</p>
              <button
                onClick={() => setShowApplyModal(true)}
                className="px-4 py-2 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                Apply For Hostel Room
              </button>
            </div>
          )}

          {/* Submitted Applications History */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="w-5 h-5 text-emerald-400" />
              My Submitted Hostel Applications
            </h3>

            {myApplications.length === 0 ? (
              <p className="text-xs text-slate-400">No application history found.</p>
            ) : (
              <div className="space-y-3">
                {myApplications.map(app => (
                  <div key={app._id} className="p-4 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-emerald-400 font-bold">{app.applicationNumber}</span>
                      <p className="text-slate-300 mt-0.5">Term: {app.academicTerm} | Room Preference: {app.preferredRoomType}</p>
                    </div>
                    <span className="px-2.5 py-1 font-semibold rounded-full bg-slate-700 text-slate-200">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WARDEN ALLOCATION DESK */}
      {activeTab === 'allocations' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Pending Applications for Warden Review ({pendingApps.length})
              </h3>
            </div>

            {pendingApps.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No pending hostel applications awaiting review.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-800/80 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">App #</th>
                      <th className="p-3.5">Student Roll</th>
                      <th className="p-3.5">Gender</th>
                      <th className="p-3.5">Preference</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingApps.map(app => (
                      <tr key={app._id} className="hover:bg-white/5 transition-all">
                        <td className="p-3.5 font-mono text-xs font-bold text-emerald-300">{app.applicationNumber}</td>
                        <td className="p-3.5 font-medium text-white">{(app.studentId as any)?.rollNumber || app.studentRollNumber}</td>
                        <td className="p-3.5 text-xs text-slate-300">{app.gender}</td>
                        <td className="p-3.5 text-xs text-slate-300">{app.preferredRoomType}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowAllocateModal(true);
                            }}
                            className="px-3 py-1 text-xs rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 cursor-pointer"
                          >
                            Allocate Bed
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

      {/* TAB 4: OCCUPANCY REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <PieChart className="w-5 h-5 text-emerald-400" />
              Hostel Occupancy & Capacity Utilization Report
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {occupancyReport.map(r => (
                <div key={r.hostelId} className="p-5 rounded-xl bg-slate-800/60 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-lg">{r.hostelName}</h4>
                      <span className="text-xs text-slate-400">Gender Policy: {r.genderPolicy}</span>
                    </div>
                    <span className="text-xl font-extrabold text-emerald-400 font-mono">
                      {r.occupancyPercentage}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${r.occupancyPercentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-300 text-center pt-2">
                    <div className="p-2 rounded bg-slate-900/40">
                      <span className="block text-slate-500">Total Beds</span>
                      <span className="font-bold text-white">{r.totalBeds}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/40">
                      <span className="block text-slate-500">Occupied</span>
                      <span className="font-bold text-rose-300">{r.occupiedBeds}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/40">
                      <span className="block text-slate-500">Waitlist</span>
                      <span className="font-bold text-amber-300">{r.waitlistCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY FOR HOSTEL */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-400" />
              Submit Hostel Application
            </h3>

            <form onSubmit={handleApplyHostel} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Hostel Building</label>
                <select
                  value={appForm.hostelId}
                  onChange={e => setAppForm({ ...appForm, hostelId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                >
                  {hostels.map(h => (
                    <option key={h._id} value={h._id}>
                      {h.name} ({h.genderPolicy})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Room Preference</label>
                <select
                  value={appForm.preferredRoomType}
                  onChange={e => setAppForm({ ...appForm, preferredRoomType: e.target.value as RoomType })}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                >
                  <option value="SINGLE">SINGLE ROOM</option>
                  <option value="DOUBLE">DOUBLE SHARING</option>
                  <option value="TRIPLE">TRIPLE SHARING</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Special Preferences / Accessibility</label>
                <textarea
                  rows={2}
                  value={appForm.specialPreferences}
                  onChange={e => setAppForm({ ...appForm, specialPreferences: e.target.value })}
                  placeholder="e.g. Ground floor preference for mobility support"
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WARDEN ALLOCATE BED */}
      {showAllocateModal && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Allocate Bed for App #{selectedApp.applicationNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Applicant Roll: <span className="text-white font-bold font-mono">{selectedApp.studentRollNumber}</span>
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Target Bed</label>
                <select
                  value={targetBedId}
                  onChange={e => setTargetBedId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                >
                  <option value="">Select Bed...</option>
                  {beds.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.bedNumber} ({b.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAllocateModal(false)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAllocateBed}
                disabled={!targetBedId}
                className="px-5 py-2 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white text-xs disabled:opacity-50"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TRANSFER ROOM */}
      {showTransferModal && myAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ArrowRightLeft className="w-5 h-5 text-amber-400" />
              Request Room Transfer
            </h3>

            <form onSubmit={handleTransferRoom} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Target Transfer Bed</label>
                <select
                  value={transferBedId}
                  onChange={e => setTransferBedId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                >
                  <option value="">Select Target Available Bed...</option>
                  {beds.filter(b => b.status === BedStatus.AVAILABLE).map(b => (
                    <option key={b._id} value={b._id}>
                      {b.bedNumber} (Room {(b.roomId as any)?.roomNumber || ''})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Transfer Reason</label>
                <textarea
                  rows={3}
                  required
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  placeholder="Reason for room transfer request..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferBedId || !transferReason.trim()}
                  className="px-5 py-2 rounded-xl font-medium bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50"
                >
                  Confirm Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CHECKOUT & CLEARANCE */}
      {showCheckoutModal && myAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <LogOut className="w-5 h-5 text-rose-400" />
              Check Out & Room Clearance
            </h3>

            <form onSubmit={handleCheckOut} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Checking out will release Bed <span className="font-mono font-bold text-rose-300">{(myAllocation.bedId as any)?.bedNumber}</span> back to AVAILABLE status.
              </p>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Damage Charges (Rupees, if any)</label>
                <input
                  type="number"
                  min={0}
                  value={damageCharges}
                  onChange={e => setDamageCharges(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-white/10 text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={keysReturned}
                  onChange={e => setKeysReturned(e.target.checked)}
                  className="rounded bg-slate-800 border-white/20 text-emerald-500"
                />
                Room Keys Returned to Warden Office
              </label>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-medium bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Complete Checkout & Release Bed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
