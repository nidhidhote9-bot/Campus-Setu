import React, { useState, useEffect } from 'react';

interface Stop {
  _id: string;
  stopName: string;
  sequenceOrder: number;
  pickupTime: string;
  dropTime: string;
  farePaise: number;
  distanceKm: number;
}

interface Vehicle {
  _id: string;
  registrationNumber: string;
  vehicleType: string;
  seatingCapacity: number;
  status: string;
  manufactureYear: number;
  assignedRouteId?: any;
}

interface RouteItem {
  _id: string;
  code: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  distanceKm: number;
  operatingStatus: string;
  serviceTimeSlots: string[];
  stops?: Stop[];
  vehicles?: Vehicle[];
}

interface StudentPassData {
  subscription: {
    _id: string;
    subscriptionNumber: string;
    status: string;
    serviceTimeSlot: string;
    farePaise: number;
    validFrom: string;
    validTo: string;
    waitlistPosition?: number;
  };
  pass?: {
    _id: string;
    passNumber: string;
    routeCode: string;
    stopName: string;
    seatNumber: string;
    qrCode: string;
    status: string;
    validFrom: string;
    validTo: string;
  };
  allocation?: {
    _id: string;
    seatNumber: string;
    vehicleId?: {
      registrationNumber: string;
      vehicleType: string;
    };
  };
}

interface OccupancyReportItem {
  routeId: string;
  routeCode: string;
  routeName: string;
  vehiclesCount: number;
  totalSeatingCapacity: number;
  activeAllocations: number;
  waitlistedCount: number;
  utilizationPercentage: number;
}

export const TransportPages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'routes' | 'my-pass' | 'operations' | 'tracking'>('routes');
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [myPassData, setMyPassData] = useState<StudentPassData | null>(null);
  const [occupancyReport, setOccupancyReport] = useState<OccupancyReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Form States
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedStopId, setSelectedStopId] = useState<string>('');
  const [serviceTimeSlot, setServiceTimeSlot] = useState<string>('MORNING_PICKUP');

  // Substitution Form
  const [subRouteId, setSubRouteId] = useState<string>('');
  const [origVehicleId, setOrigVehicleId] = useState<string>('');
  const [replVehicleId, setReplVehicleId] = useState<string>('');
  const [subReason, setSubReason] = useState<string>('');
  const [subResult, setSubResult] = useState<any>(null);

  // Trip Log Form & Simulation State
  const [tripRouteId, setTripRouteId] = useState<string>('');
  const [tripVehicleId, setTripVehicleId] = useState<string>('');
  const [driverName, setDriverName] = useState<string>('Rajesh Kumar');
  const [simLocations, setSimLocations] = useState<any[]>([]);
  const [activeTrip, setActiveTrip] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rRes, vRes, pRes, oRes] = await Promise.all([
        fetch('/api/v1/transport/routes'),
        fetch('/api/v1/transport/vehicles'),
        fetch('/api/v1/transport/passes/my-pass'),
        fetch('/api/v1/transport/reports/occupancy')
      ]);

      if (rRes.ok) setRoutes(await rRes.json());
      if (vRes.ok) setVehicles(await vRes.json());
      if (pRes.ok) setMyPassData(await pRes.json());
      if (oRes.ok) setOccupancyReport(await oRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRouteId || !selectedStopId) {
      setMessage({ text: 'Please select both a route and a stop.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch('/api/v1/transport/subscriptions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: selectedRouteId,
          stopId: selectedStopId,
          serviceTimeSlot
        })
      });

      const data = await res.json();
      if (res.ok) {
        if (data.status === 'WAITLISTED') {
          setMessage({
            text: `Selected route capacity is full. Subscription submitted and added to WAITLIST (Position #${data.waitlistPosition}).`,
            type: 'warning'
          });
        } else {
          setMessage({
            text: 'Transport subscription submitted successfully! Pending seat allocation.',
            type: 'success'
          });
        }
        fetchData();
      } else {
        setMessage({ text: data.error || 'Failed to submit subscription', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleCancelPass = async () => {
    if (!myPassData?.subscription?._id) return;
    if (!window.confirm('Are you sure you want to cancel your transport pass? This will release your seat allocation.')) return;

    try {
      const res = await fetch('/api/v1/transport/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: myPassData.subscription._id,
          reason: 'Student initiated cancellation'
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Transport pass cancelled. Capacity released.', type: 'success' });
        fetchData();
      } else {
        setMessage({ text: data.error || 'Cancellation failed', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleRenewPass = async () => {
    if (!myPassData?.pass?._id) return;
    try {
      const res = await fetch('/api/v1/transport/passes/renew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passId: myPassData.pass._id,
          extensionMonths: 6
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Pass renewed successfully for 6 additional months!', type: 'success' });
        fetchData();
      } else {
        setMessage({ text: data.error || 'Pass renewal failed', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleSubstituteVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subRouteId || !origVehicleId || !replVehicleId) {
      setMessage({ text: 'Please fill in all vehicle substitution fields.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch('/api/v1/transport/vehicles/substitute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: subRouteId,
          originalVehicleId: origVehicleId,
          replacementVehicleId: replVehicleId,
          reason: subReason || 'Vehicle maintenance replacement'
        })
      });

      const data = await res.json();
      setSubResult(data);
      if (data.capacityConflict) {
        setMessage({
          text: data.message,
          type: 'error'
        });
      } else {
        setMessage({
          text: data.message,
          type: 'success'
        });
      }
      fetchData();
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const handleRecordTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripRouteId || !tripVehicleId) {
      setMessage({ text: 'Please select route and vehicle for trip simulation.', type: 'warning' });
      return;
    }

    try {
      const res = await fetch('/api/v1/transport/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeId: tripRouteId,
          vehicleId: tripVehicleId,
          driverName,
          tripDate: '2026-10-01',
          departureTime: '07:30 AM',
          arrivalTime: '08:45 AM',
          totalPassengers: 32
        })
      });

      const data = await res.json();
      if (res.ok) {
        setActiveTrip(data.trip);
        setSimLocations(data.locations);
        setMessage({
          text: 'Trip initiated! Location telemetry generated in [DEMO / SIMULATION MODE].',
          type: 'success'
        });
        setActiveTab('tracking');
      } else {
        setMessage({ text: data.error || 'Failed to record trip', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  const selectedRouteObj = routes.find(r => r._id === selectedRouteId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Simulation Header Notice */}
      <div className="bg-blue-900/30 border border-blue-500/40 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="bg-blue-500 text-white font-mono text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">
            [DEMO / SIMULATION MODE]
          </span>
          <span className="text-blue-200 text-sm">
            M20 Transport Operations - Deterministic Location Telemetry & Vehicle Capacity Management
          </span>
        </div>
      </div>

      {/* Page Title & Tab Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-700/60 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">Transport Services & Pass Management</h1>
          <p className="text-gray-400 text-sm">Manage campus transit routes, pass subscriptions, vehicle substitutions & telemetry tracking</p>
        </div>

        <div className="flex space-x-1 bg-gray-800/80 p-1 rounded-xl border border-gray-700">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'routes' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Routes & Inventory
          </button>
          <button
            onClick={() => setActiveTab('my-pass')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'my-pass' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            My Bus Pass
          </button>
          <button
            onClick={() => setActiveTab('operations')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'operations' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Operations & Substitutions
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'tracking' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Live Tracking & Reports
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-sm flex justify-between items-center ${
          message.type === 'success' ? 'bg-emerald-900/40 border border-emerald-500/50 text-emerald-200' :
          message.type === 'warning' ? 'bg-amber-900/40 border border-amber-500/50 text-amber-200' :
          'bg-rose-900/40 border border-rose-500/50 text-rose-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse">Loading Transport Records...</div>
      ) : (
        <>
          {/* TAB 1: ROUTES & INVENTORY */}
          {activeTab === 'routes' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-white">Campus Transport Routes & Schedules</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map((r) => (
                  <div key={r._id} className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                          {r.code}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-1">{r.routeName}</h3>
                        <p className="text-xs text-gray-400">{r.startPoint} ➔ {r.endPoint} ({r.distanceKm} km)</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {r.operatingStatus}
                      </span>
                    </div>

                    {/* Stops List */}
                    <div className="space-y-2 pt-2 border-t border-gray-700/50">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Boarding Stops</div>
                      {r.stops?.map((st) => (
                        <div key={st._id} className="flex justify-between items-center bg-gray-900/40 p-2.5 rounded-lg text-xs">
                          <div>
                            <span className="font-semibold text-gray-200">Stop #{st.sequenceOrder}: {st.stopName}</span>
                            <span className="text-gray-400 ml-2">({st.pickupTime} / {st.dropTime})</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-semibold">
                            ₹{(st.farePaise / 100).toLocaleString('en-IN')}/term
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Assigned Vehicles */}
                    <div className="pt-2 border-t border-gray-700/50 flex justify-between items-center text-xs text-gray-400">
                      <span>Assigned Fleet: {r.vehicles?.length || 0} Vehicles</span>
                      <span className="text-indigo-400 font-medium">Service Slots: {r.serviceTimeSlots.join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vehicle Inventory Table */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-5 space-y-4">
                <h3 className="text-md font-bold text-white">Active Fleet Vehicles</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-gray-900/60 text-gray-400 uppercase font-mono border-b border-gray-700">
                      <tr>
                        <th className="p-3">Registration #</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Seating Capacity</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Assigned Route</th>
                        <th className="p-3">Manufacture Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {vehicles.map((v) => (
                        <tr key={v._id} className="hover:bg-gray-700/30">
                          <td className="p-3 font-mono font-bold text-indigo-300">{v.registrationNumber}</td>
                          <td className="p-3">{v.vehicleType}</td>
                          <td className="p-3 font-semibold text-emerald-400">{v.seatingCapacity} Seats</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.status === 'OPERATIONAL' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                          <td className="p-3">{v.assignedRouteId?.routeName || (typeof v.assignedRouteId === 'string' ? v.assignedRouteId : 'Unassigned')}</td>
                          <td className="p-3 text-gray-400">{v.manufactureYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY BUS PASS */}
          {activeTab === 'my-pass' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Active Pass Display */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-lg font-semibold text-white">Digital Transport Pass</h2>

                {myPassData?.pass ? (
                  <div className="bg-gradient-to-br from-indigo-900/80 via-purple-900/50 to-gray-900 border border-indigo-500/40 rounded-3xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-indigo-500 text-white font-mono text-[10px] px-2.5 py-1 rounded font-bold uppercase tracking-wider">
                          OFFICIAL BUS PASS
                        </span>
                        <h3 className="text-2xl font-black text-white mt-2 tracking-wide">
                          {myPassData.pass.routeCode} - {myPassData.pass.stopName}
                        </h3>
                        <p className="text-indigo-200 text-xs mt-1">Pass Number: {myPassData.pass.passNumber}</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl text-center shadow-lg">
                        <div className="w-20 h-20 bg-gray-900 rounded flex items-center justify-center font-mono text-[10px] text-indigo-400 font-bold p-1 text-center border">
                          {myPassData.pass.qrCode}
                        </div>
                        <span className="text-[9px] font-mono text-gray-600 font-bold block mt-1">VERIFIED QR</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-gray-900/60 backdrop-blur p-4 rounded-2xl border border-indigo-500/20 text-xs">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Allocated Seat</span>
                        <span className="text-emerald-400 font-bold text-sm">{myPassData.pass.seatNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Vehicle</span>
                        <span className="text-gray-200 font-semibold">{myPassData.allocation?.vehicleId?.registrationNumber || 'Assigned Fleet'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Pass Status</span>
                        <span className="text-emerald-400 font-bold uppercase">{myPassData.pass.status}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-indigo-200 border-t border-indigo-500/30 pt-4">
                      <span>Valid: {new Date(myPassData.pass.validFrom).toLocaleDateString()} to {new Date(myPassData.pass.validTo).toLocaleDateString()}</span>
                      <div className="space-x-2">
                        <button
                          onClick={handleRenewPass}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Renew (6 Months)
                        </button>
                        <button
                          onClick={handleCancelPass}
                          className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition"
                        >
                          Cancel Pass
                        </button>
                      </div>
                    </div>
                  </div>
                ) : myPassData?.subscription?.status === 'WAITLISTED' ? (
                  <div className="bg-amber-900/30 border border-amber-500/40 rounded-2xl p-6 text-center space-y-3">
                    <span className="text-3xl">⏳</span>
                    <h3 className="text-lg font-bold text-amber-200">Subscription Waitlisted</h3>
                    <p className="text-xs text-amber-300/80 max-w-md mx-auto">
                      All available seating capacity on this route is currently filled. Your subscription is queued at Position #{myPassData.subscription.waitlistPosition || 1}.
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-800/40 border border-gray-700/60 rounded-2xl p-8 text-center space-y-3">
                    <span className="text-4xl text-gray-500">🚌</span>
                    <h3 className="text-md font-semibold text-gray-300">No Active Transport Pass</h3>
                    <p className="text-xs text-gray-400">Select a route and boarding stop on the right to apply for a campus bus pass.</p>
                  </div>
                )}
              </div>

              {/* Right Column: New Subscription Form */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 space-y-4 h-fit">
                <h3 className="text-md font-bold text-white">Apply for Route Subscription</h3>
                
                <form onSubmit={handleApplySubscription} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-gray-400 mb-1">Select Transit Route</label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => {
                        setSelectedRouteId(e.target.value);
                        setSelectedStopId('');
                      }}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-indigo-500"
                    >
                      <option value="">-- Choose Route --</option>
                      {routes.map(r => (
                        <option key={r._id} value={r._id}>{r.code} - {r.routeName}</option>
                      ))}
                    </select>
                  </div>

                  {selectedRouteObj && (
                    <div>
                      <label className="block text-gray-400 mb-1">Select Boarding Stop</label>
                      <select
                        value={selectedStopId}
                        onChange={(e) => setSelectedStopId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-indigo-500"
                      >
                        <option value="">-- Choose Stop --</option>
                        {selectedRouteObj.stops?.map(st => (
                          <option key={st._id} value={st._id}>
                            {st.stopName} (₹{st.farePaise / 100})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-400 mb-1">Preferred Time Slot</label>
                    <select
                      value={serviceTimeSlot}
                      onChange={(e) => setServiceTimeSlot(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white focus:border-indigo-500"
                    >
                      <option value="MORNING_PICKUP">Morning Pickup (07:30 AM)</option>
                      <option value="EVENING_DROP">Evening Drop (05:30 PM)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition"
                  >
                    Submit Subscription Request
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATIONS & SUBSTITUTIONS */}
          {activeTab === 'operations' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vehicle Substitution Card */}
                <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white flex items-center space-x-2">
                    <span>🔁</span>
                    <span>Fleet Vehicle Substitution</span>
                  </h3>
                  <p className="text-xs text-gray-400">Substitute an operational vehicle on a route. Automatic capacity safety check evaluates current seat allocations against replacement capacity.</p>

                  <form onSubmit={handleSubstituteVehicle} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">Select Route</label>
                      <select
                        value={subRouteId}
                        onChange={(e) => setSubRouteId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      >
                        <option value="">-- Choose Route --</option>
                        {routes.map(r => (
                          <option key={r._id} value={r._id}>{r.code} - {r.routeName}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-400 mb-1">Original Vehicle</label>
                        <select
                          value={origVehicleId}
                          onChange={(e) => setOrigVehicleId(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                        >
                          <option value="">-- Original --</option>
                          {vehicles.map(v => (
                            <option key={v._id} value={v._id}>{v.registrationNumber} ({v.seatingCapacity} seats)</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-400 mb-1">Replacement Vehicle</label>
                        <select
                          value={replVehicleId}
                          onChange={(e) => setReplVehicleId(e.target.value)}
                          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                        >
                          <option value="">-- Replacement --</option>
                          {vehicles.map(v => (
                            <option key={v._id} value={v._id}>{v.registrationNumber} ({v.seatingCapacity} seats)</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Substitution Reason</label>
                      <input
                        type="text"
                        value={subReason}
                        onChange={(e) => setSubReason(e.target.value)}
                        placeholder="e.g. Engine maintenance overhaul"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-xs transition"
                    >
                      Execute Substitution Check
                    </button>
                  </form>

                  {/* Conflict Result Alert */}
                  {subResult && subResult.capacityConflict && (
                    <div className="bg-rose-900/50 border border-rose-500/60 rounded-xl p-4 space-y-2 text-xs text-rose-200">
                      <div className="font-bold flex items-center space-x-2">
                        <span>⚠️</span>
                        <span>CAPACITY CONFLICT DETECTED</span>
                      </div>
                      <p>{subResult.message}</p>
                      <div className="font-mono text-[11px] bg-rose-950/60 p-2 rounded border border-rose-800">
                        Original Capacity: {subResult.originalCapacity} | Replacement: {subResult.replacementCapacity} | Allocated: {subResult.allocatedPassengers} | Unassigned Passengers: {subResult.excessPassengers}
                      </div>
                    </div>
                  )}
                </div>

                {/* Trip Telemetry Recorder */}
                <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-md font-bold text-white flex items-center space-x-2">
                    <span>📡</span>
                    <span>Initiate Trip & Telemetry Stream</span>
                  </h3>
                  <p className="text-xs text-gray-400">Record a scheduled transit trip to generate location telemetry waypoints in deterministic simulation mode.</p>

                  <form onSubmit={handleRecordTrip} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-gray-400 mb-1">Route</label>
                      <select
                        value={tripRouteId}
                        onChange={(e) => setTripRouteId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      >
                        <option value="">-- Select Route --</option>
                        {routes.map(r => (
                          <option key={r._id} value={r._id}>{r.code} - {r.routeName}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Assigned Vehicle</label>
                      <select
                        value={tripVehicleId}
                        onChange={(e) => setTripVehicleId(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      >
                        <option value="">-- Select Vehicle --</option>
                        {vehicles.map(v => (
                          <option key={v._id} value={v._id}>{v.registrationNumber} ({v.vehicleType})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-400 mb-1">Driver Name</label>
                      <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition"
                    >
                      Start Simulated Trip & View Map
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE TRACKING & REPORTS */}
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              {/* Telemetry Schematic Box */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <div>
                    <h3 className="text-md font-bold text-white">Route Telemetry & Vehicle Position Schematic</h3>
                    <p className="text-xs text-blue-400 font-mono">[DEMO / SIMULATION MODE] Deterministic Waypoint Tracking</p>
                  </div>
                  {activeTrip && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-bold">
                      Trip {activeTrip.tripCode} - IN_TRANSIT
                    </span>
                  )}
                </div>

                {simLocations.length > 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="relative border-l-2 border-indigo-500/50 ml-4 pl-6 space-y-6">
                      {simLocations.map((loc, idx) => (
                        <div key={loc._id || idx} className="relative">
                          <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-2 border-gray-900 flex items-center justify-center text-[8px] text-white font-bold">
                            {idx + 1}
                          </div>
                          <div className="bg-gray-900/60 border border-gray-700 p-3 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between items-center font-bold text-gray-200">
                              <span>Waypoint Stop: {loc.currentStopName}</span>
                              <span className="text-indigo-400 font-mono">{loc.progressPercentage}% Progress</span>
                            </div>
                            <div className="text-gray-400 font-mono text-[11px]">
                              Coords: {loc.currentLatitude.toFixed(4)}°N, {loc.currentLongitude.toFixed(4)}°E | Speed: {loc.currentSpeedKmh} km/h
                            </div>
                            <div className="text-[10px] text-blue-300 font-mono bg-blue-950/40 px-2 py-0.5 rounded w-fit border border-blue-800/40">
                              {loc.statusLabel}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No active trip stream selected. Go to <button onClick={() => setActiveTab('operations')} className="text-indigo-400 underline">Operations Tab</button> to initiate a simulated transit trip.
                  </div>
                )}
              </div>

              {/* Occupancy & Capacity Utilization Report */}
              <div className="bg-gray-800/60 border border-gray-700/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-md font-bold text-white">Route Utilization & Capacity Report</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {occupancyReport.map((rep) => (
                    <div key={rep.routeId} className="bg-gray-900/60 border border-gray-700 p-4 rounded-xl space-y-3 text-xs">
                      <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                        <span className="font-mono font-bold text-indigo-300 text-sm">{rep.routeCode}</span>
                        <span className="text-gray-200 font-semibold">{rep.routeName}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-gray-800/60 p-2 rounded">
                          <span className="text-gray-400 block text-[10px]">Total Seats</span>
                          <span className="text-white font-bold text-sm">{rep.totalSeatingCapacity}</span>
                        </div>
                        <div className="bg-gray-800/60 p-2 rounded">
                          <span className="text-gray-400 block text-[10px]">Allocated</span>
                          <span className="text-emerald-400 font-bold text-sm">{rep.activeAllocations}</span>
                        </div>
                        <div className="bg-gray-800/60 p-2 rounded">
                          <span className="text-gray-400 block text-[10px]">Waitlisted</span>
                          <span className="text-amber-400 font-bold text-sm">{rep.waitlistedCount}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                          <span>Utilization</span>
                          <span>{rep.utilizationPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              rep.utilizationPercentage > 90 ? 'bg-rose-500' :
                              rep.utilizationPercentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(rep.utilizationPercentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
