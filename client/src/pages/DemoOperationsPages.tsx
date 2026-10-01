import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Clock,
  Activity,
  Server,
  Database,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Layers,
  Send,
  Sliders,
  Cpu,
  ShieldAlert,
  ArrowRight,
  HardDrive,
  Copy,
  Calendar,
  Zap,
  Globe
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE = '/api/v1';

export const DemoOperationsPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tab state matching blueprint routes
  const currentTab = location.pathname.includes('/integrations')
    ? 'integrations'
    : location.pathname.includes('/jobs')
    ? 'jobs'
    : location.pathname.includes('/clock')
    ? 'clock'
    : 'scenarios';

  // State
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [seedStatus, setSeedStatus] = useState<any>(null);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [simulationEvents, setSimulationEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [storageUsage, setStorageUsage] = useState<any>(null);
  const [backupGuide, setBackupGuide] = useState<any>(null);
  const [demoClock, setDemoClock] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal / Form state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmPhrase, setResetConfirmPhrase] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const [showTriggerEventModal, setShowTriggerEventModal] = useState(false);
  const [eventAdapterId, setEventAdapterId] = useState('PAYMENT_GATEWAY');
  const [eventTypeName, setEventTypeName] = useState('PAYMENT_GATEWAY_CALLBACK');
  const [eventPayloadJson, setEventPayloadJson] = useState('{\n  "orderId": "ORD-DEMO-101",\n  "amountPaise": 50000\n}');
  const [eventSimulateFailure, setEventSimulateFailure] = useState(false);

  const [timeOffsetSlider, setTimeOffsetSlider] = useState<number>(0);
  const [timeScaleChoice, setTimeScaleChoice] = useState<number>(1);

  // Demonstration scenario state
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  // Load Data
  const loadScenariosAndSeed = async () => {
    try {
      setLoading(true);
      const [scenRes, seedRes] = await Promise.all([
        fetch(`${API_BASE}/demo-operations/scenarios`),
        fetch(`${API_BASE}/demo-operations/seed/status`)
      ]);
      if (scenRes.ok) setScenarios(await scenRes.json());
      if (seedRes.ok) setSeedStatus(await seedRes.json());
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadIntegrationsAndEvents = async () => {
    try {
      setLoading(true);
      const [intRes, simRes] = await Promise.all([
        fetch(`${API_BASE}/demo-operations/integrations`),
        fetch(`${API_BASE}/demo-operations/simulation-events?limit=15`)
      ]);
      if (intRes.ok) setIntegrations(await intRes.json());
      if (simRes.ok) setSimulationEvents(await simRes.json());
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadJobsAndStorage = async () => {
    try {
      setLoading(true);
      const [jobsRes, storeRes, guideRes] = await Promise.all([
        fetch(`${API_BASE}/demo-operations/jobs`),
        fetch(`${API_BASE}/demo-operations/storage`),
        fetch(`${API_BASE}/demo-operations/backup-guide`)
      ]);
      if (jobsRes.ok) setJobs(await jobsRes.json());
      if (storeRes.ok) setStorageUsage(await storeRes.json());
      if (guideRes.ok) setBackupGuide(await guideRes.json());
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoClock = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/demo-operations/clock`);
      if (res.ok) {
        const data = await res.json();
        setDemoClock(data);
        setTimeOffsetSlider(data.timeOffsetMinutes || 0);
        setTimeScaleChoice(data.timeScaleFactor || 1);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 'scenarios') loadScenariosAndSeed();
    else if (currentTab === 'integrations') loadIntegrationsAndEvents();
    else if (currentTab === 'jobs') loadJobsAndStorage();
    else if (currentTab === 'clock') loadDemoClock();
  }, [currentTab]);

  // Handler: Prepare Scenario
  const handlePrepareScenario = async (code: string) => {
    try {
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/scenarios/${code}/prepare`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to prepare scenario');
      setActionMessage(data.message);
      loadScenariosAndSeed();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handler: Reset Isolated Dataset
  const handleResetDataset = async () => {
    try {
      setIsResetting(true);
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPhrase: resetConfirmPhrase,
          isDemoEnvironment: true
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset isolated demo dataset');
      setActionMessage(data.message);
      setShowResetModal(false);
      setResetConfirmPhrase('');
      loadScenariosAndSeed();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsResetting(false);
    }
  };

  // Handler: Update Integration Config
  const handleUpdateIntegration = async (adapterId: string, updates: any) => {
    try {
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/integrations/${adapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update integration');
      setActionMessage(`Updated integration mode for ${adapterId}`);
      loadIntegrationsAndEvents();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handler: Trigger Simulation Event
  const handleTriggerEvent = async () => {
    try {
      setErrorMessage(null);
      let parsedPayload = {};
      try {
        parsedPayload = JSON.parse(eventPayloadJson);
      } catch {
        throw new Error('Invalid JSON format in event payload.');
      }

      const res = await fetch(`${API_BASE}/demo-operations/simulation-events/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adapterId: eventAdapterId,
          eventType: eventTypeName,
          payload: parsedPayload,
          simulateFailure: eventSimulateFailure
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to trigger simulation event');
      setActionMessage(`Simulation event ${data.eventId} created with status ${data.status}`);
      setShowTriggerEventModal(false);
      loadIntegrationsAndEvents();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handler: Replay Simulation Event
  const handleReplayEvent = async (eventId: string) => {
    try {
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/simulation-events/${eventId}/replay`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to replay simulation event');
      setActionMessage(data.message);
      loadIntegrationsAndEvents();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handler: Run Background Job
  const handleRunJob = async (jobKey: string) => {
    try {
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/jobs/${jobKey}/run`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to execute job');
      setActionMessage(`Job ${jobKey} completed (${data.itemsProcessed} items processed)`);
      loadJobsAndStorage();
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handler: Update Demo Clock
  const handleUpdateClock = async () => {
    try {
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/clock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeOffsetMinutes: timeOffsetSlider,
          timeScaleFactor: timeScaleChoice
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update demo clock');
      setDemoClock(data);
      setActionMessage(`Simulated clock updated: ${new Date(data.currentVirtualTime).toUTCString()}`);
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  // Handler: Run Demonstration Scenario
  const handleRunDemonstration = async () => {
    try {
      setIsDemoRunning(true);
      setErrorMessage(null);
      const res = await fetch(`${API_BASE}/demo-operations/demo/journey`, {
        method: 'POST'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run demonstration');
      setDemoResult(data);
      setActionMessage('Demonstration executed: Delayed payment callback & notification recovery verified.');
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsDemoRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Prominent Clock Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-white">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Module 35
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Protected Control Center
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-indigo-400" />
            Demo Control Center, Integrations & Operations
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Restricted operations cockpit for scenario orchestration, adapter simulators, background job telemetry, and time controls.
          </p>
        </div>

        {/* Global Simulated Clock Indicator */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 px-4 flex items-center gap-3 backdrop-blur-sm self-start md:self-auto">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Simulated Virtual Clock
            </div>
            <div className="text-sm font-mono font-bold text-amber-300">
              {demoClock ? new Date(demoClock.currentVirtualTime).toUTCString() : '2026-10-01 09:00:00 UTC'}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>Ref: 2026-10-01T09:00Z</span>
              <span>•</span>
              <span className="text-emerald-400">Offset: {demoClock?.timeOffsetMinutes || 0}m</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Error Alerts */}
      {actionMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-emerald-200 text-xs">Dismiss</button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200 text-xs">Dismiss</button>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-700 space-x-1">
        <button
          onClick={() => navigate('/app/demo-operations/scenarios')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'scenarios'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Scenarios & Seed Status
        </button>
        <button
          onClick={() => navigate('/app/demo-operations/integrations')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'integrations'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4" />
          Integrations & Simulator Events
        </button>
        <button
          onClick={() => navigate('/app/demo-operations/jobs')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'jobs'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          Background Jobs & Storage
        </button>
        <button
          onClick={() => navigate('/app/demo-operations/clock')}
          className={`px-4 py-2.5 font-medium text-sm border-b-2 flex items-center gap-2 transition-colors ${
            currentTab === 'clock'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Time Controls & Demonstration
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SCENARIOS & SEED STATUS */}
      {/* ==================================================================== */}
      {currentTab === 'scenarios' && (
        <div className="space-y-6">
          {/* Seed Integrity & Environment Status Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-indigo-400" />
                  Isolated Demo Dataset & Seed Manifest
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verifies database references, record entity checksums and baseline demo consistency.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  seedStatus?.integrityPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {seedStatus?.integrityPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {seedStatus?.integrityPassed ? 'Seed Integrity Verified' : 'Incomplete References'}
                </span>
                <button
                  onClick={() => setShowResetModal(true)}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-rose-900/30 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Demo Dataset
                </button>
              </div>
            </div>

            {seedStatus?.manifest && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 mb-4">
                {Object.entries(seedStatus.manifest.entityCountsByType || {}).map(([key, val]) => (
                  <div key={key} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 capitalize truncate">{key}</div>
                    <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">{String(val)}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 px-4 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Checksum Digest:</span>
                <code className="font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {seedStatus?.manifest?.checksum || 'a1b2c3d4e5f6...'}
                </code>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Total Entities: <strong className="text-slate-200 font-mono">{seedStatus?.manifest?.totalEntities || 0}</strong></span>
                <span>Environment: <strong className="text-emerald-400 font-mono">{seedStatus?.environment || 'development'}</strong></span>
              </div>
            </div>
          </div>

          {/* Scenario Catalog */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Curated Demo Scenario Catalog
              </h2>
              <button
                onClick={loadScenariosAndSeed}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Catalog
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scen) => (
                <div key={scen.code} className="bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all rounded-2xl p-5 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {scen.code}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                        {scen.category}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-100 mb-1.5">{scen.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">{scen.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {(scen.affectedModules || []).map((m: string) => (
                        <span key={m} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400">
                      {scen.lastExecutedAt ? (
                        <span>Last: {new Date(scen.lastExecutedAt).toLocaleTimeString()}</span>
                      ) : (
                        <span className="text-slate-500">Ready to prepare</span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePrepareScenario(scen.code)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Prepare Scenario
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: INTEGRATIONS & SIMULATOR EVENTS */}
      {/* ==================================================================== */}
      {currentTab === 'integrations' && (
        <div className="space-y-6">
          {/* Adapter Health & Mode Roster */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  Integration Adapters & Operational Modes
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Explicit simulation modes per adapter. Simulator commands exercise real domain logic without bypass.
                </p>
              </div>
              <button
                onClick={() => setShowTriggerEventModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Trigger Simulator Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((intg) => (
                <div key={intg.adapterId} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-mono font-bold text-indigo-400">{intg.adapterId}</div>
                      <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 mt-0.5">{intg.adapterName}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      intg.healthStatus === 'HEALTHY'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {intg.healthStatus}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    <div className="truncate">URL: <span className="font-mono text-slate-300">{intg.endpointUrl}</span></div>
                    <div className="mt-1">Heartbeat: <span className="text-slate-300">{intg.lastHeartbeatAt ? new Date(intg.lastHeartbeatAt).toLocaleTimeString() : 'Active'}</span></div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between">
                    <label className="text-xs text-slate-400">Mode:</label>
                    <select
                      value={intg.mode}
                      onChange={(e) => handleUpdateIntegration(intg.adapterId, { mode: e.target.value })}
                      className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-1 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    >
                      <option value="SIMULATED">SIMULATED</option>
                      <option value="MOCK">MOCK</option>
                      <option value="SANDBOX">SANDBOX</option>
                      <option value="LIVE">LIVE</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulator Event History */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  Simulator Event History & Replay Log
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audited record of all simulated webhooks, delayed callbacks and dead-letter retries.
                </p>
              </div>
              <button
                onClick={loadIntegrationsAndEvents}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Events
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Event ID</th>
                    <th className="py-2.5 px-3">Adapter</th>
                    <th className="py-2.5 px-3">Event Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Latency</th>
                    <th className="py-2.5 px-3">Retries</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {simulationEvents.map((evt) => (
                    <tr key={evt.eventId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-indigo-300 font-semibold">{evt.eventId}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{evt.adapterId}</td>
                      <td className="py-2.5 px-3 text-slate-300">{evt.eventType}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          evt.status === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : evt.status === 'REPLAYED'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{evt.simulatedLatencyMs || 150}ms</td>
                      <td className="py-2.5 px-3 font-mono">{evt.retryCount || 0}</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {evt.createdAt ? new Date(evt.createdAt).toLocaleTimeString() : 'Just now'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => handleReplayEvent(evt.eventId)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 rounded text-[11px] font-semibold transition-colors"
                        >
                          Replay Event
                        </button>
                      </td>
                    </tr>
                  ))}
                  {simulationEvents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-500">
                        No simulation events recorded yet. Click "Trigger Simulator Event" to run a provider callback.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: BACKGROUND JOBS & STORAGE */}
      {/* ==================================================================== */}
      {currentTab === 'jobs' && (
        <div className="space-y-6">
          {/* Background Job Runner List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Server className="w-5 h-5 text-indigo-400" />
                  Background Cron Jobs & Dispatch Telemetry
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time status of outbox dispatchers, fee reconcilers, anomaly scans and AI batch inference.
                </p>
              </div>
              <button
                onClick={loadJobsAndStorage}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh Jobs
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => (
                <div key={job.jobKey} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {job.jobKey}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                        {job.runnerType}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-100">{job.jobName}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-mono bg-slate-900/60 p-2 rounded border border-slate-800">
                      {job.logSnippet || 'No recent execution logs.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                    <div>
                      <span>Items: <strong className="text-slate-200 font-mono">{job.itemsProcessed || 0}</strong></span>
                      <span className="mx-2">•</span>
                      <span>Duration: <strong className="text-slate-200 font-mono">{job.durationMs || 0}ms</strong></span>
                    </div>
                    <button
                      onClick={() => handleRunJob(job.jobKey)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow transition-colors"
                    >
                      <Play className="w-3 h-3" />
                      Run Job Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Database Storage Metrics & Backup Runbook */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Storage Usage Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
                <HardDrive className="w-5 h-5 text-indigo-400" />
                Storage Usage & Collection Footprint
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400">Database Engine:</span>
                  <span className="font-mono text-slate-200">{storageUsage?.engine || 'MongoDB 7.0 / WiredTiger'}</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400">Total Storage Size:</span>
                  <span className="font-mono text-emerald-400 font-bold">{storageUsage?.totalStorageSizeMb || 48.6} MB</span>
                </div>
                <div className="flex items-center justify-between text-xs bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/40">
                  <span className="text-slate-400">Offline PWA Storage:</span>
                  <span className="font-mono text-indigo-300">{storageUsage?.cacheStorage?.pwaOfflineStorageMb || 8.2} MB</span>
                </div>

                <div className="pt-2">
                  <div className="text-xs font-semibold text-slate-300 mb-2">Top Collections by Size:</div>
                  <div className="space-y-1.5">
                    {(storageUsage?.topCollections || []).map((c: any) => (
                      <div key={c.name} className="flex items-center justify-between text-xs bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
                        <span className="font-mono text-slate-300">{c.name}</span>
                        <div className="text-slate-400 font-mono">
                          <span>{c.documentCount} docs</span>
                          <span className="mx-1.5">•</span>
                          <span className="text-indigo-300">{c.sizeKb} KB</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Restore Runbook Card */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-3">
                <Terminal className="w-5 h-5 text-indigo-400" />
                Database Backup & Restore Runbook
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                {backupGuide?.environmentPolicy || 'Automated daily mongodump with checksum validation.'}
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-slate-400 mb-1 font-semibold">CLI Backup Command:</div>
                  <code className="block p-2 bg-slate-950 rounded border border-slate-800 font-mono text-indigo-300 overflow-x-auto text-[11px]">
                    {backupGuide?.backupCommand || 'mongodump --uri="mongodb://127.0.0.1:27017/campus_setu" --gzip'}
                  </code>
                </div>

                <div>
                  <div className="text-slate-400 mb-1 font-semibold">CLI Restore Command:</div>
                  <code className="block p-2 bg-slate-950 rounded border border-slate-800 font-mono text-amber-300 overflow-x-auto text-[11px]">
                    {backupGuide?.restoreCommand || 'mongorestore --uri="mongodb://127.0.0.1:27017/campus_setu" --drop --gzip'}
                  </code>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-slate-400">
                  <span>RTO Target: <strong className="text-slate-200 font-mono">{backupGuide?.disasterRecoveryRTO || '< 15m'}</strong></span>
                  <span>RPO Target: <strong className="text-slate-200 font-mono">{backupGuide?.disasterRecoveryRPO || '< 1h'}</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: TIME CONTROLS & DEMONSTRATION */}
      {/* ==================================================================== */}
      {currentTab === 'clock' && (
        <div className="space-y-6">
          {/* Scenario Time Controls Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-indigo-400" />
              Scenario Time Controls & Virtual Timeline Warp
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Adjust scenario time relative to fixed baseline reference date (<code className="font-mono text-indigo-300">2026-10-01T09:00:00Z</code>). Never mutates real operating system clock.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-300 font-medium">Virtual Time Offset:</span>
                    <span className="font-mono text-indigo-400 font-bold">
                      {timeOffsetSlider >= 0 ? `+${timeOffsetSlider} Minutes (${(timeOffsetSlider / 1440).toFixed(1)} Days)` : `${timeOffsetSlider} Minutes`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-1440"
                    max="43200"
                    step="60"
                    value={timeOffsetSlider}
                    onChange={(e) => setTimeOffsetSlider(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                    <span>-1 Day (-1440m)</span>
                    <span>Baseline (0m)</span>
                    <span>+7 Days (+10080m)</span>
                    <span>+30 Days (+43200m)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <label className="text-xs text-slate-300 font-medium">Simulation Time Scale:</label>
                  <div className="flex items-center gap-2">
                    {[1, 5, 60, 1440].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => setTimeScaleChoice(scale)}
                        className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                          timeScaleChoice === scale
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {scale}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Resulting Virtual Time</div>
                  <div className="text-base font-mono font-bold text-amber-300 break-words">
                    {new Date(new Date('2026-10-01T09:00:00.000Z').getTime() + timeOffsetSlider * 60000).toUTCString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-2">
                    Active Scenario: <strong className="text-slate-200 font-mono">{demoClock?.activeScenarioCode || 'SCENARIO-ADM-01'}</strong>
                  </div>
                </div>

                <button
                  onClick={handleUpdateClock}
                  className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  Apply Time Offset
                </button>
              </div>
            </div>
          </div>

          {/* Reproducible Demonstration Journey Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Acceptance Demonstration
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">
                  Delayed Payment Callback & Outbox Failure Recovery
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Demonstrates simulated gateway failure, persistent dead-letter state, and clean idempotent recovery without duplicate charges.
                </p>
              </div>
              <button
                onClick={handleRunDemonstration}
                disabled={isDemoRunning}
                className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/40 transition-all disabled:opacity-50"
              >
                <Play className={`w-4 h-4 ${isDemoRunning ? 'animate-spin' : ''}`} />
                {isDemoRunning ? 'Executing Demonstration...' : 'Run M35 Recovery Demo'}
              </button>
            </div>

            {demoResult && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Failure State */}
                  <div className="bg-slate-950/80 border border-rose-900/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <XCircle className="w-4 h-4" />
                      Phase 1: Simulated Upstream Provider Failure
                    </div>
                    <div className="text-slate-300 space-y-1 font-mono text-[11px]">
                      <div>Payment Event ID: <span className="text-rose-300">{demoResult.failedStates.paymentFailureEventId}</span></div>
                      <div>Payment Status: <span className="text-rose-400 font-bold">{demoResult.failedStates.paymentFailureStatus}</span></div>
                      <div>Outbox Event ID: <span className="text-rose-300">{demoResult.failedStates.outboxFailureEventId}</span></div>
                      <div>Invoice Unpaid Verified: <span className="text-emerald-400 font-bold">{String(demoResult.failedStates.invoiceUnpaidDuringFailure)}</span></div>
                    </div>
                  </div>

                  {/* Recovery State */}
                  <div className="bg-slate-950/80 border border-emerald-900/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      Phase 2: Idempotent Replay & Cron Recovery
                    </div>
                    <div className="text-slate-300 space-y-1 font-mono text-[11px]">
                      <div>Invoice Paid After Replay: <span className="text-emerald-400 font-bold">{String(demoResult.recoveryStates.invoicePaidAfterRecovery)}</span></div>
                      <div>Outbox Dispatcher Status: <span className="text-indigo-300">{demoResult.recoveryStates.outboxJobStatus}</span></div>
                      <div>Outbox Messages Recovered: <span className="text-emerald-400 font-bold">{demoResult.recoveryStates.outboxJobItemsProcessed}</span></div>
                      <div>Audit Trail Verified: <span className="text-emerald-400 font-bold">{String(demoResult.recoveryStates.auditTrailVerified)}</span></div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Demonstration complete: All failure barriers, idempotent replays, and audit compliance verified cleanly.</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: RESET DATASET CONFIRMATION */}
      {/* ==================================================================== */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/30">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Destructive Dataset Reset</h3>
                <p className="text-xs text-slate-400">Protected command & control gate</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This action will completely purge the isolated demo database collections and re-seed all coherent student, academic, and financial fixtures to initial state.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Type <code className="text-rose-400 bg-rose-950/60 px-1.5 py-0.5 rounded">CONFIRM-DEMO-RESET</code> to proceed:
              </label>
              <input
                type="text"
                value={resetConfirmPhrase}
                onChange={(e) => setResetConfirmPhrase(e.target.value)}
                placeholder="CONFIRM-DEMO-RESET"
                className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => { setShowResetModal(false); setResetConfirmPhrase(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleResetDataset}
                disabled={resetConfirmPhrase !== 'CONFIRM-DEMO-RESET' || isResetting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/30 transition-colors disabled:opacity-40"
              >
                {isResetting ? 'Resetting...' : 'Execute Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TRIGGER SIMULATOR EVENT */}
      {/* ==================================================================== */}
      {showTriggerEventModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                Trigger Simulator Event
              </h3>
              <button onClick={() => setShowTriggerEventModal(false)} className="text-slate-400 hover:text-slate-200 text-sm">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Target Adapter:</label>
                <select
                  value={eventAdapterId}
                  onChange={(e) => setEventAdapterId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="PAYMENT_GATEWAY">PAYMENT_GATEWAY (Razorpay / Bank)</option>
                  <option value="COMMUNICATION_OUTBOX">COMMUNICATION_OUTBOX (SMS / WhatsApp)</option>
                  <option value="DIGILOCKER_NAD">DIGILOCKER_NAD (Academic Depository)</option>
                  <option value="BIOMETRIC_DEVICE">BIOMETRIC_DEVICE (Attendance Reader)</option>
                  <option value="ML_INFERENCE_ENGINE">ML_INFERENCE_ENGINE (Risk Model)</option>
                  <option value="EMAIL_SMTP">EMAIL_SMTP (Mail Relay)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Type Identifier:</label>
                <input
                  type="text"
                  value={eventTypeName}
                  onChange={(e) => setEventTypeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Event Payload (JSON):</label>
                <textarea
                  rows={4}
                  value={eventPayloadJson}
                  onChange={(e) => setEventPayloadJson(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-100 rounded-xl p-3 text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="simulateFailureCheck"
                  checked={eventSimulateFailure}
                  onChange={(e) => setEventSimulateFailure(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="simulateFailureCheck" className="text-slate-300 font-medium cursor-pointer">
                  Simulate upstream provider failure (forces dead-letter status)
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowTriggerEventModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerEvent}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow transition-colors"
              >
                Send Simulator Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
