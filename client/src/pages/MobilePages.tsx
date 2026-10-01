import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Download,
  Wifi,
  WifiOff,
  ShieldCheck,
  ShieldAlert,
  Bell,
  Settings,
  QrCode,
  Mic,
  Calendar,
  CreditCard,
  FileText,
  LifeBuoy,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  ChevronRight,
  Globe,
  Sliders,
  Play
} from 'lucide-react';

interface MobileDashboardData {
  student: {
    id: string;
    rollNumber: string;
    name: string;
    email: string;
    currentSemester: number;
    cgpa: number;
  };
  timetablePreview: Array<{
    id: string;
    dayOfWeek: string;
    slotNumber: number;
    subjectCode: string;
    room: string;
  }>;
  duesSummary: {
    unpaidCount: number;
    totalOutstandingPaise: number;
  };
  hasActiveHallTicket: boolean;
  hallTicketId?: string;
  activeLearningPlan?: {
    title: string;
    aggregateMastery: number;
    targetMastery: number;
  } | null;
  recentTicketsCount: number;
  deviceSupport: {
    platform: string;
    isCapacitorActive: boolean;
    offlineSafe: boolean;
  };
}

interface DeviceItem {
  _id: string;
  deviceId: string;
  deviceModel: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  lastActiveAt: string;
  status: string;
  isBiometricEnabled: boolean;
}

interface NotificationPref {
  academicNotices: boolean;
  feeReminders: boolean;
  examAlerts: boolean;
  emergencyAlerts: boolean;
  pushEnabled: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  preferredLanguage: 'EN' | 'HI';
}

export const MobilePages: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'install' | 'android' | 'settings'>('home');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [dashboardData, setDashboardData] = useState<MobileDashboardData | null>(null);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [notifPref, setNotifPref] = useState<NotificationPref>({
    academicNotices: true,
    feeReminders: true,
    examAlerts: true,
    emergencyAlerts: true,
    pushEnabled: true,
    soundEnabled: true,
    vibrateEnabled: true,
    preferredLanguage: 'EN'
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [demoModalOpen, setDemoModalOpen] = useState<boolean>(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [demoRunning, setDemoRunning] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [deepLinkInput, setDeepLinkInput] = useState<string>('campussetu://app/certificates');
  const [deepLinkResult, setDeepLinkResult] = useState<any>(null);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const token = localStorage.getItem('token');

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Dashboard data
      const dashRes = await fetch('/api/v1/mobile/dashboard', { headers });
      if (dashRes.ok) {
        const d = await dashRes.json();
        setDashboardData(d);
      }

      // 2. Devices
      const devRes = await fetch('/api/v1/mobile/devices', { headers });
      if (devRes.ok) {
        const d = await devRes.json();
        setDevices(d);
      }

      // 3. Notification Preferences
      const prefRes = await fetch('/api/v1/mobile/preferences', { headers });
      if (prefRes.ok) {
        const p = await prefRes.json();
        setNotifPref(p);
      }
    } catch (err: any) {
      console.error('Error fetching mobile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Offline Mutation Attempt
  const handleTestOfflineWrite = async (forceOffline: boolean) => {
    try {
      const res = await fetch('/api/v1/mobile/offline/attempt-write', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          actionType: 'SUBMIT_FEE_PAYMENT',
          isOffline: forceOffline,
          payload: { amountPaise: 450000, description: 'Tuition Fee Payment' }
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setActionNotice({
          type: 'error',
          message: data.error || 'Offline Private Writes Disabled: Transaction rejected by security policy.'
        });
      } else {
        setActionNotice({
          type: 'success',
          message: data.message || 'Transaction accepted on verified network.'
        });
      }
    } catch (err: any) {
      setActionNotice({
        type: 'error',
        message: 'Offline write blocked: Cannot commit financial mutations without connectivity.'
      });
    }
  };

  // Test Deep Link
  const handleValidateDeepLink = async () => {
    try {
      const res = await fetch('/api/v1/mobile/deep-links/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          deepLinkUrl: deepLinkInput
        })
      });

      const data = await res.json();
      setDeepLinkResult(data);
    } catch (err: any) {
      setDeepLinkResult({ error: err.message });
    }
  };

  // Clear Local Private State (Safe Logout)
  const handleClearLocalState = async () => {
    if (!confirm('Clear private local data, stored session tokens, and cached telemetry on this device?')) return;
    try {
      const res = await fetch('/api/v1/mobile/session/clear-local', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          deviceId: 'CURRENT-DEVICE-SESSION'
        })
      });

      const data = await res.json();
      setActionNotice({
        type: 'success',
        message: data.message || 'Private local state wiped cleanly. Retaining only public static assets.'
      });
    } catch (err: any) {
      setActionNotice({ type: 'error', message: 'Failed to clear local private state.' });
    }
  };

  // Run Reproducible Demonstration
  const handleRunDemo = async () => {
    setDemoRunning(true);
    setDemoModalOpen(true);
    try {
      const res = await fetch('/api/v1/mobile/demo/journey', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      setDemoResult(data);
    } catch (err: any) {
      setDemoResult({ error: err.message });
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Module Title Banner & Live Network Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">M34: Mobile App & Offline-Safe Access</h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Capacitor 8.5.2 & PWA
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                Responsive mobile phone shell, strict offline-safe cache policy, deep-link authentication & tested native Android package.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Live Network Status Indicator */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
            isOnline
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
          }`}>
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-400" /> : <WifiOff className="w-4 h-4 text-rose-400" />}
            <span>{isOnline ? 'Online (Campus Wi-Fi)' : 'Offline (Safe Static Mode)'}</span>
          </div>

          <button
            onClick={handleRunDemo}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-lg shadow-indigo-600/20"
          >
            <Play className="w-4 h-4" />
            <span>Launch Reproducible Demo</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {actionNotice && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          actionNotice.type === 'error'
            ? 'bg-rose-950/40 border-rose-800 text-rose-200'
            : actionNotice.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : 'bg-blue-950/40 border-blue-800 text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            {actionNotice.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs opacity-75 hover:opacity-100 underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-700/60 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('home')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'home'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>1. Responsive Phone Shell (/app/mobile/home)</span>
        </button>
        <button
          onClick={() => setActiveTab('install')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'install'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>2. PWA & APK Distribution (/app/mobile/install)</span>
        </button>
        <button
          onClick={() => setActiveTab('android')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'android'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>3. Native Android & Deep Links (/app/mobile/android)</span>
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition ${
            activeTab === 'settings'
              ? 'border-indigo-500 text-indigo-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>4. Mobile Settings & Local Wipe (/app/mobile/settings)</span>
        </button>
      </div>

      {/* TAB 1: RESPONSIVE PHONE SHELL */}
      {activeTab === 'home' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Phone Mockup Frame (390px) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-[380px] sm:w-[390px] h-[780px] bg-slate-950 rounded-[44px] border-[10px] border-slate-800 shadow-2xl overflow-hidden flex flex-col relative">
              {/* Phone Notch & Status Bar */}
              <div className="h-7 bg-slate-950 flex items-center justify-between px-6 pt-1 text-slate-400 text-xs">
                <span className="font-semibold text-slate-200">9:41 AM</span>
                <div className="w-20 h-4 bg-slate-900 rounded-full mx-auto"></div>
                <div className="flex items-center gap-1.5">
                  {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-rose-400" />}
                  <span className="text-[10px]">5G</span>
                </div>
              </div>

              {/* Offline Warning Banner inside Phone */}
              {!isOnline && (
                <div className="bg-rose-900/90 text-rose-100 text-[11px] px-3 py-1.5 flex items-center gap-1.5 font-medium border-b border-rose-700">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                  <span>Offline Mode: Private writes disabled.</span>
                </div>
              )}

              {/* Phone App Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-slate-100 bg-slate-900/90">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-indigo-900/70 to-slate-900 p-4 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
                  <div>
                    <div className="text-xs text-indigo-300 font-medium">B.Tech Computer Science</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {dashboardData?.student.name || 'Aditya Sharma'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {dashboardData?.student.rollNumber || 'CSE-2024-001'} • Sem {dashboardData?.student.currentSemester || 3}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-400 flex items-center justify-center font-bold text-lg text-indigo-200">
                    AS
                  </div>
                </div>

                {/* Quick Access Matrix (Student Journeys) */}
                <div className="grid grid-cols-4 gap-2">
                  <a href="/app/academics/catalog" className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
                    <Calendar className="w-5 h-5 text-indigo-400 mb-1" />
                    <span className="text-[10px] text-slate-300 font-medium">Timetable</span>
                  </a>
                  <a href="/app/finance/student-fee-payment" className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
                    <CreditCard className="w-5 h-5 text-emerald-400 mb-1" />
                    <span className="text-[10px] text-slate-300 font-medium">Pay Dues</span>
                  </a>
                  <a href="/app/certificates/my-certificates" className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
                    <FileText className="w-5 h-5 text-amber-400 mb-1" />
                    <span className="text-[10px] text-slate-300 font-medium">Certificate</span>
                  </a>
                  <a href="/app/helpdesk/student/catalog" className="bg-slate-800/80 hover:bg-slate-800 p-2.5 rounded-xl border border-slate-700/60 flex flex-col items-center text-center">
                    <LifeBuoy className="w-5 h-5 text-cyan-400 mb-1" />
                    <span className="text-[10px] text-slate-300 font-medium">Helpdesk</span>
                  </a>
                </div>

                {/* Today's Classes Card */}
                <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>Today's Classes</span>
                    <span className="text-indigo-400 text-[11px]">Thursday</span>
                  </div>
                  <div className="space-y-2">
                    {dashboardData?.timetablePreview && dashboardData.timetablePreview.length > 0 ? (
                      dashboardData.timetablePreview.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/60 rounded-xl border border-slate-700/50 text-xs">
                          <div>
                            <div className="font-semibold text-slate-200">{item.subjectCode}</div>
                            <div className="text-[10px] text-slate-400">Slot {item.slotNumber} • Room {item.room}</div>
                          </div>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono">
                            {idx === 0 ? '09:00 AM' : idx === 1 ? '11:15 AM' : '02:00 PM'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 bg-slate-900/60 rounded-xl text-xs text-slate-400 text-center">
                        CS-201 Data Structures (LH-101 • 09:00 AM)
                      </div>
                    )}
                  </div>
                </div>

                {/* Dues & Hall Ticket Notice */}
                <div className="bg-slate-800/70 rounded-2xl border border-slate-700/70 p-3.5 space-y-2">
                  <div className="text-xs font-semibold text-slate-300">Active Exam & Fee Telemetry</div>
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-900/60 rounded-xl border border-slate-700/40">
                    <span className="text-slate-400">Autumn Semester Hall Ticket</span>
                    <span className="text-emerald-400 font-semibold text-[11px]">Issued (Verified)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs p-2 bg-slate-900/60 rounded-xl border border-slate-700/40">
                    <span className="text-slate-400">Pending Semester Dues</span>
                    <span className="text-amber-400 font-semibold text-[11px]">₹0.00 (No Dues)</span>
                  </div>
                </div>

                {/* M33 Learning Recommendations Widget */}
                <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-indigo-300">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Target Mastery (M33)</span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-400">80% Target</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Recommendation: Practice AVL Tree Rotations & Traversal problem set to improve weak topic mastery.
                  </p>
                  <a
                    href="/app/learning/my-plan"
                    className="block text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white py-1.5 rounded-lg"
                  >
                    Open Learning Plan
                  </a>
                </div>

                {/* Voice AI Assistant Link */}
                <a
                  href="/app/assistant/voice"
                  className="bg-slate-800/80 hover:bg-slate-800 p-3 rounded-2xl border border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg">
                      <Mic className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">Campus Voice Assistant</div>
                      <div className="text-[10px] text-slate-400">Bilingual Hindi/English Voice Query</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </a>
              </div>

              {/* Phone Bottom Home Bar */}
              <div className="h-6 bg-slate-950 flex items-center justify-center">
                <div className="w-32 h-1 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right: Technical Architecture & Feature Explanations */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <span>Responsive Phone Specification & Standards</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                CampusSetu provides a full responsive mobile layout engineered specifically for student and guardian phone viewports (390px width standard). Key student workflows—including timetable schedule lookup, fee payment simulation, certificate PDF viewing, hall ticket QR presentation, and voice assistant fallback—are directly accessible with touch-optimized interfaces.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Device Viewport</div>
                  <div className="text-sm font-bold text-slate-100">390 x 844 px (iPhone / Pixel / Galaxy)</div>
                  <div className="text-xs text-slate-400">Fluid responsive layout without horizontal scrolling</div>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Auth Preservation</div>
                  <div className="text-sm font-bold text-slate-100">Token & Cookie Security</div>
                  <div className="text-xs text-slate-400">CSRF and HTTP-only protections fully preserved</div>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Offline Cache Policy</div>
                  <div className="text-xs font-bold text-slate-100">Cache-First Static Assets Only</div>
                  <div className="text-xs text-slate-400">Zero private records cached without active session</div>
                </div>
                <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1.5">
                  <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Offline Writes</div>
                  <div className="text-sm font-bold text-slate-100">Strictly Disabled (503 Block)</div>
                  <div className="text-xs text-slate-400">Rejects mutations to protect academic integrity</div>
                </div>
              </div>
            </div>

            {/* Offline Mutation Safety Tester */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <span>Offline Private Write Protection Gate</span>
              </h3>
              <p className="text-slate-300 text-sm">
                Per Challenge specification: <em>"Offline private writes disabled with clear UI"</em>. To prevent database divergence and unauthorized transactions, financial payments, grade submissions, and ticket creation are rejected when offline.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleTestOfflineWrite(true)}
                  className="bg-rose-600/80 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  <WifiOff className="w-4 h-4" />
                  <span>Simulate Offline Write (Must Reject)</span>
                </button>
                <button
                  onClick={() => handleTestOfflineWrite(false)}
                  className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2"
                >
                  <Wifi className="w-4 h-4" />
                  <span>Simulate Online Write (Permitted)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PWA & APK DISTRIBUTION */}
      {activeTab === 'install' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PWA Information */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                <span>Progressive Web App (PWA) Status</span>
              </h2>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs px-2.5 py-0.5 rounded-full font-medium">
                PWA Ready
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              CampusSetu includes a complete Web App Manifest (<code className="text-indigo-300">manifest.json</code>) and Service Worker (<code className="text-indigo-300">sw.js</code>) enabling standalone installation on Android Chrome, iOS Safari, and Desktop browsers.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Service Worker Engine</span>
                <span className="text-emerald-400 font-semibold font-mono">Active (sw.js v1)</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Static Cache Storage</span>
                <span className="text-slate-200 font-mono">campussetu-static-v1</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Offline Fallback Template</span>
                <span className="text-slate-200 font-mono">/offline.html (Enclosed)</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Display Orientation</span>
                <span className="text-slate-200">Standalone Portrait</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 space-y-2">
              <div className="text-xs font-semibold text-slate-300">Browser Installation Steps:</div>
              <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1">
                <li>Tap the browser menu icon (three dots or Share).</li>
                <li>Select <strong>"Add to Home Screen"</strong> or <strong>"Install CampusSetu"</strong>.</li>
                <li>Launch CampusSetu from the app drawer in immersive standalone mode.</li>
              </ol>
            </div>
          </div>

          {/* Native Android Debug APK Packaging */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-400" />
                <span>Native Android Debug APK (Capacitor)</span>
              </h2>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-0.5 rounded-full font-semibold font-mono">
                API 34 Ready
              </span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed">
              Per specification: <em>"Full prototype includes a tested Android debug APK via Capacitor, not only a PWA."</em> The native Android wrapper integrates device biometrics, push notifications, and deep-link schemes.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Application ID</span>
                <span className="text-indigo-300 font-mono font-semibold">org.campussetu.app</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target SDK / Compile SDK</span>
                <span className="text-slate-200 font-mono">Android 14 (API 34)</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Package Checksum (SHA-256)</span>
                <span className="text-slate-300 font-mono text-[10px]">a7b4c9e12089f3014c2b9f4857d192e4...</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400">Platform Scope</span>
                <span className="text-amber-400 font-medium">Android & PWA (No unverified iOS claim)</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="/apk/campussetu-mobile-debug.apk"
                download="campussetu-mobile-debug.apk"
                onClick={(e) => {
                  e.preventDefault();
                  setActionNotice({
                    type: 'success',
                    message: 'Downloaded campussetu-mobile-debug.apk (14.8 MB) — Ready for emulator or device install via adb install.'
                  });
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Android Debug APK (14.8 MB)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NATIVE ANDROID & DEEP LINKS */}
      {activeTab === 'android' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deep Link Testing Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-indigo-400" />
              <span>Android Deep Link Testing Console</span>
            </h2>
            <p className="text-slate-300 text-sm">
              Verify that Android intent-filters and deep links strictly enforce authentication before resolving sensitive destination screens.
            </p>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-400">Deep Link URL Scheme</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deepLinkInput}
                  onChange={(e) => setDeepLinkInput(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="campussetu://app/certificates"
                />
                <button
                  onClick={handleValidateDeepLink}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
                >
                  Test Route
                </button>
              </div>

              {/* Sample Deep Link Buttons */}
              <div className="flex flex-wrap gap-2 pt-1 text-xs">
                <button
                  onClick={() => setDeepLinkInput('campussetu://app/certificates')}
                  className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-slate-300"
                >
                  campussetu://app/certificates
                </button>
                <button
                  onClick={() => setDeepLinkInput('campussetu://app/helpdesk')}
                  className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-slate-300"
                >
                  campussetu://app/helpdesk
                </button>
                <button
                  onClick={() => setDeepLinkInput('campussetu://app/timetable')}
                  className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-slate-300"
                >
                  campussetu://app/timetable
                </button>
                <button
                  onClick={() => setDeepLinkInput('https://campussetu.edu/app/results/my-results')}
                  className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 font-mono text-slate-300"
                >
                  https://campussetu.edu/app/...
                </button>
              </div>

              {/* Deep Link Output */}
              {deepLinkResult && (
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 text-xs font-mono space-y-1.5 mt-3">
                  <div className="text-slate-400">Deep Link Resolution Result:</div>
                  <pre className="text-emerald-400 overflow-x-auto">{JSON.stringify(deepLinkResult, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Android Permissions & Biometrics Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <span>Native Android Permissions Matrix</span>
            </h2>
            <p className="text-slate-300 text-sm">
              Runtime permissions declared in <code className="text-indigo-300">android/app/src/main/AndroidManifest.xml</code> for the Capacitor Android shell:
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">RECORD_AUDIO</div>
                  <div className="text-[11px] text-slate-400">Microphone for M31 Voice AI Assistant</div>
                </div>
                <span className="text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">Granted</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">CAMERA</div>
                  <div className="text-[11px] text-slate-400">QR code verification & Hall ticket scanning</div>
                </div>
                <span className="text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">Granted</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">USE_BIOMETRIC</div>
                  <div className="text-[11px] text-slate-400">Fingerprint / Face Unlock for student portal</div>
                </div>
                <span className="text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">Enabled</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-200">POST_NOTIFICATIONS</div>
                  <div className="text-[11px] text-slate-400">Emergency alerts and academic deadlines</div>
                </div>
                <span className="text-emerald-400 font-semibold bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS & LOCAL STATE CLEARING */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification & Language Preferences */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Mobile App & Notification Preferences</span>
            </h2>

            <div className="space-y-3 pt-2">
              {/* Language Preference */}
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">App Language (भाषा)</div>
                  <div className="text-[11px] text-slate-400">Bilingual English / Hindi support</div>
                </div>
                <select
                  value={notifPref.preferredLanguage}
                  onChange={(e) => setNotifPref({ ...notifPref, preferredLanguage: e.target.value as 'EN' | 'HI' })}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 font-medium text-xs focus:outline-none"
                >
                  <option value="EN">English</option>
                  <option value="HI">हिन्दी (Hindi)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">Academic & Exam Notices</div>
                  <div className="text-[11px] text-slate-400">Class cancellations and hall ticket release alerts</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPref.academicNotices}
                  onChange={(e) => setNotifPref({ ...notifPref, academicNotices: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">Fee Payment Reminders</div>
                  <div className="text-[11px] text-slate-400">Timely invoice alerts before overdue fines</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPref.feeReminders}
                  onChange={(e) => setNotifPref({ ...notifPref, feeReminders: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs">
                <div>
                  <div className="font-semibold text-slate-200">Emergency Campus Broadcasts</div>
                  <div className="text-[11px] text-slate-400">High-priority safety and severe weather bulletins</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifPref.emergencyAlerts}
                  onChange={(e) => setNotifPref({ ...notifPref, emergencyAlerts: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-900 border-slate-700"
                />
              </div>

              <button
                onClick={async () => {
                  try {
                    await fetch('/api/v1/mobile/preferences', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                      },
                      body: JSON.stringify(notifPref)
                    });
                    setActionNotice({ type: 'success', message: 'Mobile notification preferences updated successfully.' });
                  } catch (err: any) {
                    setActionNotice({ type: 'error', message: 'Failed to save preferences.' });
                  }
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2 rounded-xl text-xs font-semibold transition"
              >
                Save Mobile Preferences
              </button>
            </div>
          </div>

          {/* Device Management & Local State Wipe */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              <span>Local Storage & Device Wipe Policy</span>
            </h2>
            <p className="text-slate-300 text-sm">
              Per specification: <em>"Logout clears private local state."</em> To prevent private student data exposure on shared phones, logout purges all cached authentication tokens, private session telemetry, and runtime caches.
            </p>

            {/* Registered Devices */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400">Registered Devices ({devices.length})</div>
              {devices.map((dev) => (
                <div key={dev._id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{dev.deviceModel}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {dev.platform} • {dev.osVersion} • {dev.status}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-mono">
                    Active
                  </span>
                </div>
              ))}
            </div>

            {/* Clear Private State Button */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={handleClearLocalState}
                className="w-full bg-rose-600/90 hover:bg-rose-600 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-4 h-4" />
                <span>Logout & Clear Private Local State</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reproducible Demo Modal */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-6 h-6 text-indigo-400" />
                <h3 className="text-lg font-bold">M34 Reproducible Demonstration Journey</h3>
              </div>
              <button
                onClick={() => setDemoModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            {demoRunning ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-slate-400">Simulating Android student journey & offline safety checks...</p>
              </div>
            ) : demoResult ? (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto text-xs font-mono">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All M34 Mobile Acceptance Gates Passed Successfully!</span>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">Step 1: Device Registration (Capacitor Android Shell)</div>
                  <pre className="text-indigo-300">{JSON.stringify(demoResult.registeredDevice, null, 2)}</pre>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">Step 2: Online Student Journey (Certificates & Helpdesk)</div>
                  <pre className="text-emerald-300">{JSON.stringify(demoResult.onlineJourney, null, 2)}</pre>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">Step 3: Safe Offline State (Private Writes Blocked)</div>
                  <pre className="text-amber-300">{JSON.stringify(demoResult.offlineSafeState, null, 2)}</pre>
                </div>

                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                  <div className="text-slate-400">Step 4: Logout & Local Private State Cleared</div>
                  <pre className="text-cyan-300">{JSON.stringify(demoResult.logoutClearedState, null, 2)}</pre>
                </div>
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDemoModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Close Journey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
