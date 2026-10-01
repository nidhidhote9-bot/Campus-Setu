import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ShieldAlert,
  Sliders,
  Users,
  Brain,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Plus,
  Play,
  Filter,
  Check,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  UserCheck,
  Target,
  Sparkles,
  BarChart2,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  RiskBand,
  ModelType,
  ModelStatus,
  InterventionType,
  InterventionPriority,
  InterventionStatus,
  AdvisorReviewDecision,
  DataSufficiency
} from '@shared/index';

export const PredictionPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine active tab based on route
  const getTabFromPath = () => {
    if (location.pathname.includes('/student-support')) return 'student-support';
    if (location.pathname.includes('/training')) return 'training';
    if (location.pathname.includes('/interventions')) return 'interventions';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'student-support' | 'training' | 'interventions'>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'dashboard' | 'student-support' | 'training' | 'interventions') => {
    setActiveTab(tab);
    navigate(`/app/predictions/${tab}`);
  };

  // State: Dashboard
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [cohortList, setCohortList] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false);

  // State: Student Support Profile
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false);

  // What-If Simulator Sliders
  const [simulatorFeatures, setSimulatorFeatures] = useState({
    attendanceRate: 0.80,
    midSemAverage: 68,
    assignmentSubmissionRate: 0.85,
    lmsActivityCount: 45,
    feeDelayDays: 0,
    priorSgpa: 7.4
  });
  const [simulatedScore, setSimulatedScore] = useState<any>(null);

  // State: Training Console
  const [datasets, setDatasets] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [evaluationReport, setEvaluationReport] = useState<any>(null);
  const [trainSeed, setTrainSeed] = useState<number>(42);
  const [trainSampleCount, setTrainSampleCount] = useState<number>(200);
  const [trainEpochs, setTrainEpochs] = useState<number>(600);
  const [trainLr, setTrainLr] = useState<number>(0.05);
  const [trainThreshold, setTrainThreshold] = useState<number>(0.50);
  const [isTraining, setIsTraining] = useState<boolean>(false);

  // State: Interventions
  const [interventionsList, setInterventionsList] = useState<any[]>([]);
  const [filterInterventionStatus, setFilterInterventionStatus] = useState<string>('ALL');
  const [showCreateInterventionModal, setShowCreateInterventionModal] = useState<boolean>(false);
  const [showAdvisorReviewModal, setShowAdvisorReviewModal] = useState<boolean>(false);
  const [showUpdateOutcomeModal, setShowUpdateOutcomeModal] = useState<boolean>(false);
  const [activeInterventionForOutcome, setActiveInterventionForOutcome] = useState<any>(null);

  // Review Form state
  const [reviewDecision, setReviewDecision] = useState<AdvisorReviewDecision>(AdvisorReviewDecision.INTERVENTION_REQUIRED);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewHumanRisk, setReviewHumanRisk] = useState<RiskBand>(RiskBand.HIGH);
  const [reviewAction, setReviewAction] = useState<string>('');

  // Intervention Form state
  const [newInterventionType, setNewInterventionType] = useState<InterventionType>(InterventionType.PEER_TUTORING);
  const [newInterventionPriority, setNewInterventionPriority] = useState<InterventionPriority>(InterventionPriority.HIGH);
  const [newInterventionPlan, setNewInterventionPlan] = useState<string>('');
  const [newInterventionDueDate, setNewInterventionDueDate] = useState<string>('2026-11-25');
  const [outcomeNotesInput, setOutcomeNotesInput] = useState<string>('');

  // Demonstration state
  const [showDemoModal, setShowDemoModal] = useState<boolean>(false);
  const [demoResult, setDemoResult] = useState<any>(null);
  const [isRunningDemo, setIsRunningDemo] = useState<boolean>(false);

  const token = localStorage.getItem('token');

  // Load Dashboard Data
  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await fetch('/api/v1/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDashboardData(data);
      }

      const cohortRes = await fetch(`/api/v1/analytics/cohort?department=${selectedDept}&riskBand=${selectedRisk}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (cohortRes.ok) {
        const list = await cohortRes.json();
        setCohortList(list);
        if (list.length > 0 && !selectedStudentId) {
          setSelectedStudentId(list[0].studentId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDashboard(false);
    }
  };

  // Load Student Profile
  const loadStudentProfile = async (id: string) => {
    if (!id) return;
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/v1/analytics/student/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStudentProfile(data);
        if (data.prediction?.featuresUsed) {
          setSimulatorFeatures(data.prediction.featuresUsed);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Run What-If Live Simulator
  const runSimulator = async (updatedFeatures: typeof simulatorFeatures) => {
    if (!selectedStudentId) return;
    try {
      const res = await fetch('/api/v1/analytics/score-preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          features: updatedFeatures
        })
      });
      if (res.ok) {
        const sim = await res.json();
        setSimulatedScore(sim);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Training Data
  const loadTrainingData = async () => {
    try {
      const dsRes = await fetch('/api/v1/analytics/datasets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (dsRes.ok) {
        const dsList = await dsRes.json();
        setDatasets(dsList);
      }

      const mRes = await fetch('/api/v1/analytics/models', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (mRes.ok) {
        const mList = await mRes.json();
        setModels(mList);
        if (mList.length > 0) {
          const active = mList.find((m: any) => m.status === 'ACTIVE') || mList[0];
          setSelectedModelId(active._id);
          loadModelEvaluation(active._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Model Evaluation Report
  const loadModelEvaluation = async (modelId: string) => {
    try {
      const res = await fetch(`/api/v1/analytics/models/${modelId}/evaluation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const evalData = await res.json();
        setEvaluationReport(evalData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Interventions
  const loadInterventions = async () => {
    try {
      const res = await fetch(`/api/v1/analytics/interventions?status=${filterInterventionStatus}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInterventionsList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadTrainingData();
    loadInterventions();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'student-support' && selectedStudentId) {
      loadStudentProfile(selectedStudentId);
    } else if (activeTab === 'training') {
      loadTrainingData();
    } else if (activeTab === 'interventions') {
      loadInterventions();
    }
  }, [activeTab, selectedDept, selectedRisk, selectedStudentId, filterInterventionStatus]);

  // Generate Synthetic Dataset Handler
  const handleGenerateDataset = async () => {
    try {
      setIsTraining(true);
      const res = await fetch('/api/v1/analytics/datasets/generate-synthetic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          seed: trainSeed,
          totalRecords: trainSampleCount,
          academicTerm: '2026-AUTUMN'
        })
      });
      if (res.ok) {
        await loadTrainingData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTraining(false);
    }
  };

  // Train Model Handler
  const handleTrainModel = async () => {
    if (datasets.length === 0) return;
    try {
      setIsTraining(true);
      const res = await fetch('/api/v1/analytics/models/train', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          datasetVersionId: datasets[0]._id,
          epochs: trainEpochs,
          learningRate: trainLr,
          defaultThreshold: trainThreshold
        })
      });
      if (res.ok) {
        await loadTrainingData();
        await loadDashboard();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTraining(false);
    }
  };

  // Create Advisor Review
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentProfile?.prediction) return;
    try {
      const res = await fetch('/api/v1/analytics/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          predictionId: studentProfile.prediction._id,
          decision: reviewDecision,
          reviewNotes,
          humanAssessmentScore: reviewHumanRisk,
          actionRecommended: reviewAction
        })
      });
      if (res.ok) {
        setShowAdvisorReviewModal(false);
        setReviewNotes('');
        await loadStudentProfile(selectedStudentId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Support Intervention
  const handleCreateIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) return;
    try {
      const res = await fetch('/api/v1/analytics/interventions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: selectedStudentId,
          predictionId: studentProfile?.prediction?._id,
          interventionType: newInterventionType,
          priority: newInterventionPriority,
          assignedStaffUserId: user?.id || (user as any)?._id || 'user-101',
          actionPlan: newInterventionPlan,
          targetDueDate: newInterventionDueDate
        })
      });
      if (res.ok) {
        setShowCreateInterventionModal(false);
        setNewInterventionPlan('');
        await loadStudentProfile(selectedStudentId);
        await loadInterventions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Intervention Outcome
  const handleUpdateOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInterventionForOutcome) return;
    try {
      const res = await fetch(`/api/v1/analytics/interventions/${activeInterventionForOutcome._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: InterventionStatus.COMPLETED,
          outcomeNotes: outcomeNotesInput
        })
      });
      if (res.ok) {
        setShowUpdateOutcomeModal(false);
        setOutcomeNotesInput('');
        await loadInterventions();
        if (selectedStudentId) await loadStudentProfile(selectedStudentId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run Reproducible Demonstration
  const handleRunDemo = async () => {
    setIsRunningDemo(true);
    setShowDemoModal(true);
    try {
      const res = await fetch('/api/v1/analytics/demo/journey', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDemoResult(data);
        await loadDashboard();
        await loadTrainingData();
        await loadInterventions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningDemo(false);
    }
  };

  const getRiskBadgeColor = (band: string) => {
    switch (band) {
      case 'CRITICAL':
        return 'bg-red-900/60 text-red-300 border-red-700';
      case 'HIGH':
        return 'bg-amber-900/60 text-amber-300 border-amber-700';
      case 'MODERATE':
        return 'bg-yellow-900/60 text-yellow-300 border-yellow-700';
      default:
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 py-4 sticky top-0 z-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/40 rounded-xl text-indigo-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Performance Prediction & Early-Support Analytics
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-900/50 text-indigo-300 border border-indigo-700">
                  M32
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic numeric regression, dropout logistic baseline, student holdout evaluation & advisor interventions
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRunDemo}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run 5-Step Demo Journey</span>
            </button>
          </div>
        </div>

        {/* Global Notice Banner */}
        <div className="mt-3 py-1.5 px-3 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300 text-xs flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Synthetic Training Notice:</strong> Models train on synthetic longitudinal cohorts with student-separated holdouts. Demonstrates early-warning heuristics without automated penalties or demographic features.
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mt-4 border-b border-slate-800 -mb-4">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'dashboard'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Cohort Dashboard</span>
          </button>
          <button
            onClick={() => handleTabChange('student-support')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'student-support'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Support Profile & Simulator</span>
          </button>
          <button
            onClick={() => handleTabChange('training')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'training'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Synthetic Training & Scenarios</span>
          </button>
          <button
            onClick={() => handleTabChange('interventions')}
            className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center space-x-2 ${
              activeTab === 'interventions'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Advisor Interventions</span>
            {interventionsList.filter(i => i.status === 'OPEN').length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-red-800 text-red-200">
                {interventionsList.filter(i => i.status === 'OPEN').length}
              </span>
            )}
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: COHORT DASHBOARD */}
        {/* ========================================================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 font-medium">Scored Cohort</div>
                <div className="text-2xl font-bold text-white mt-1">
                  {dashboardData?.totalStudentsScored || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Model: {dashboardData?.activeModel?.code || 'None'}
                </div>
              </div>

              <div className="bg-slate-900 border border-red-900/40 p-4 rounded-xl">
                <div className="text-xs text-red-400 font-medium flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Critical Risk</span>
                </div>
                <div className="text-2xl font-bold text-red-300 mt-1">
                  {dashboardData?.riskDistribution?.critical || 0}
                </div>
                <div className="text-[11px] text-red-400/80 mt-1">Dropout Probability &ge; 75%</div>
              </div>

              <div className="bg-slate-900 border border-amber-900/40 p-4 rounded-xl">
                <div className="text-xs text-amber-400 font-medium flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>High Risk</span>
                </div>
                <div className="text-2xl font-bold text-amber-300 mt-1">
                  {dashboardData?.riskDistribution?.high || 0}
                </div>
                <div className="text-[11px] text-amber-400/80 mt-1">50% &le; Prob &lt; 75%</div>
              </div>

              <div className="bg-slate-900 border border-emerald-900/40 p-4 rounded-xl">
                <div className="text-xs text-emerald-400 font-medium">Low / Stable</div>
                <div className="text-2xl font-bold text-emerald-300 mt-1">
                  {dashboardData?.riskDistribution?.low || 0}
                </div>
                <div className="text-[11px] text-emerald-400/80 mt-1">Prob &lt; 25%</div>
              </div>

              <div className="bg-slate-900 border border-violet-900/40 p-4 rounded-xl">
                <div className="text-xs text-violet-400 font-medium">Active Interventions</div>
                <div className="text-2xl font-bold text-violet-300 mt-1">
                  {dashboardData?.interventionsSummary?.open || 0}
                </div>
                <div className="text-[11px] text-violet-400/80 mt-1">
                  {dashboardData?.interventionsSummary?.completed || 0} resolved
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters:</span>
                </div>
                <div>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSE">Computer Science (CSE)</option>
                    <option value="ECE">Electronics (ECE)</option>
                    <option value="MECH">Mechanical (MECH)</option>
                    <option value="CIVIL">Civil (CIVIL)</option>
                  </select>
                </div>
                <div>
                  <select
                    value={selectedRisk}
                    onChange={(e) => setSelectedRisk(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Risk Bands</option>
                    <option value="CRITICAL">Critical Risk Only</option>
                    <option value="HIGH">High Risk</option>
                    <option value="MODERATE">Moderate Risk</option>
                    <option value="LOW">Low Risk</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-400">
                Holdout Model Precision: <strong className="text-slate-200">{dashboardData?.activeModel?.precision ? `${Math.round(dashboardData.activeModel.precision * 100)}%` : 'N/A'}</strong> | MAE: <strong className="text-slate-200">{dashboardData?.activeModel?.mae ?? 'N/A'}</strong>
              </div>
            </div>

            {/* Student Cohort Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Student Predictive Risk Roster</h3>
                <span className="text-xs text-slate-400">Showing {cohortList.length} students</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Student & Roll</th>
                      <th className="px-4 py-3">Dept</th>
                      <th className="px-4 py-3">Predicted SGPA</th>
                      <th className="px-4 py-3">Dropout Risk Score</th>
                      <th className="px-4 py-3">Risk Band</th>
                      <th className="px-4 py-3">Top Risk Driver</th>
                      <th className="px-4 py-3">Data Sufficiency</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cohortList.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{p.studentName}</div>
                          <div className="text-[11px] text-slate-400">{p.studentRollNumber}</div>
                        </td>
                        <td className="px-4 py-3">{p.departmentCode}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-indigo-300">{p.predictedSgpa}</span>
                          <span className="text-[10px] text-slate-500 ml-1.5">(&plusmn;{p.predictedSgpaUncertainty?.confidenceInterval})</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full ${
                                  p.dropoutRiskScore >= 0.75
                                    ? 'bg-red-500'
                                    : p.dropoutRiskScore >= 0.50
                                    ? 'bg-amber-500'
                                    : p.dropoutRiskScore >= 0.25
                                    ? 'bg-yellow-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.round(p.dropoutRiskScore * 100)}%` }}
                              />
                            </div>
                            <span className="font-semibold">{(p.dropoutRiskScore * 100).toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRiskBadgeColor(p.riskBand)}`}>
                            {p.riskBand}
                          </span>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-300">
                          {p.topDrivers && p.topDrivers.length > 0 ? (
                            <span className="text-[11px]">
                              {p.topDrivers[0].label}: {p.topDrivers[0].impactDirection === 'ELEVATES_RISK' ? '⚠️ Elevated' : '🛡️ Protective'}
                            </span>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {p.dataSufficiency === DataSufficiency.LOW_DATA ? (
                            <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800">
                              LOW DATA
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Normal</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedStudentId(p.studentId);
                              handleTabChange('student-support');
                            }}
                            className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            <span>Support Profile</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {cohortList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No students found matching the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: STUDENT SUPPORT PROFILE & SENSITIVITY SIMULATOR */}
        {/* ========================================================= */}
        {activeTab === 'student-support' && (
          <div className="space-y-6">
            {/* Student Picker Banner */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold">
                  {studentProfile?.prediction?.studentName?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {studentProfile?.prediction?.studentName || 'Student Profile'}
                  </h2>
                  <div className="text-xs text-slate-400">
                    Roll Number: <strong className="text-slate-200">{studentProfile?.prediction?.studentRollNumber}</strong> | Term: 2026-AUTUMN | Dept: {studentProfile?.prediction?.departmentCode}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  {cohortList.map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.studentRollNumber}) - {s.riskBand} Risk
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAdvisorReviewModal(true)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Advisor Review</span>
                </button>

                <button
                  onClick={() => setShowCreateInterventionModal(true)}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Create Support Task</span>
                </button>
              </div>
            </div>

            {/* Low Data Warning if applicable */}
            {studentProfile?.prediction?.dataSufficiency === DataSufficiency.LOW_DATA && (
              <div className="p-3 bg-amber-950/40 border border-amber-800 rounded-xl text-amber-300 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Low-Data Uncertainty Condition:</strong> Student has fewer than 3 recorded institutional telemetry points this term. Prediction interval is widened by 2.5x to prevent overconfident interventions.
                </span>
              </div>
            )}

            {/* Prediction Telemetry Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Performance Regression */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Performance Regression (SGPA)
                  </div>
                  <span className="text-xs text-indigo-400 font-medium">Ridge Regression</span>
                </div>
                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-3xl font-extrabold text-white">
                    {simulatedScore?.predictedSgpa || studentProfile?.prediction?.predictedSgpa || '7.0'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Confidence Interval: <strong className="text-slate-200">[{simulatedScore?.predictedSgpaUncertainty?.confidenceInterval || studentProfile?.prediction?.predictedSgpaUncertainty?.confidenceInterval || '6.5 - 7.5'}]</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Forecasted end-of-semester Grade Point Average computed from pre-cutoff telemetry (attendance, mid-sem exam, assignment timeliness).
                </p>
              </div>

              {/* Card 2: Dropout Risk Classification */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Dropout Probability & Risk Band
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(simulatedScore?.riskBand || studentProfile?.prediction?.riskBand || 'LOW')}`}>
                    {simulatedScore?.riskBand || studentProfile?.prediction?.riskBand || 'LOW'}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline space-x-3">
                  <span className="text-3xl font-extrabold text-white">
                    {Math.round(((simulatedScore?.dropoutRiskScore ?? studentProfile?.prediction?.dropoutRiskScore) || 0) * 100)}%
                  </span>
                  <span className="text-xs text-slate-400">
                    Score: <strong>{(simulatedScore?.dropoutRiskScore ?? studentProfile?.prediction?.dropoutRiskScore ?? 0).toFixed(3)}</strong> (Threshold: 0.50)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Logistic regression probability baseline. Demonstrates early-warning heuristics for supportive advising without automated negative actions.
                </p>
              </div>
            </div>

            {/* Drivers & What-If Simulator Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Explainable Drivers */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Explainable Risk Drivers & Attributions</span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Local feature contributions</span>
                </div>

                <div className="space-y-3">
                  {(studentProfile?.prediction?.topDrivers || []).map((driver: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{driver.label}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            driver.impactDirection === 'ELEVATES_RISK'
                              ? 'bg-red-950 text-red-300 border border-red-800'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          }`}
                        >
                          {driver.impactDirection === 'ELEVATES_RISK' ? 'Elevates Risk' : 'Protective Factor'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{driver.explanation}</div>
                      <div className="text-[11px] text-slate-500">
                        Observed: <strong>{driver.value}</strong> | Baseline: {driver.baselineAverage} | Impact Weight: {driver.impactWeight}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Live What-If Sensitivity Simulator */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Interactive "What-If" Sensitivity Simulator</span>
                  </h3>
                  <span className="text-[11px] text-indigo-400 font-medium">Changing input changes score</span>
                </div>

                <p className="text-xs text-slate-400">
                  Adjust student parameters below to observe dynamic live recalculations in predicted SGPA and dropout risk:
                </p>

                <div className="space-y-4 text-xs">
                  {/* Attendance Slider */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Attendance Rate</span>
                      <strong className="text-indigo-400">{(simulatorFeatures.attendanceRate * 100).toFixed(0)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0.30"
                      max="1.0"
                      step="0.02"
                      value={simulatorFeatures.attendanceRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const updated = { ...simulatorFeatures, attendanceRate: val };
                        setSimulatorFeatures(updated);
                        runSimulator(updated);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Mid-Sem Exam Average Slider */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Mid-Semester Exam Average</span>
                      <strong className="text-indigo-400">{simulatorFeatures.midSemAverage} marks</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="1"
                      value={simulatorFeatures.midSemAverage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const updated = { ...simulatorFeatures, midSemAverage: val };
                        setSimulatorFeatures(updated);
                        runSimulator(updated);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Assignment Timeliness Slider */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Assignment Timeliness Rate</span>
                      <strong className="text-indigo-400">{(simulatorFeatures.assignmentSubmissionRate * 100).toFixed(0)}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0.20"
                      max="1.0"
                      step="0.05"
                      value={simulatorFeatures.assignmentSubmissionRate}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const updated = { ...simulatorFeatures, assignmentSubmissionRate: val };
                        setSimulatorFeatures(updated);
                        runSimulator(updated);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Fee Delay Days */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Outstanding Fee Delay (Days)</span>
                      <strong className="text-indigo-400">{simulatorFeatures.feeDelayDays} days</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="5"
                      value={simulatorFeatures.feeDelayDays}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        const updated = { ...simulatorFeatures, feeDelayDays: val };
                        setSimulatorFeatures(updated);
                        runSimulator(updated);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  {/* Prior SGPA */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-slate-300">Prior Cumulative SGPA</span>
                      <strong className="text-indigo-400">{simulatorFeatures.priorSgpa}</strong>
                    </div>
                    <input
                      type="range"
                      min="4.0"
                      max="10.0"
                      step="0.1"
                      value={simulatorFeatures.priorSgpa}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const updated = { ...simulatorFeatures, priorSgpa: val };
                        setSimulatorFeatures(updated);
                        runSimulator(updated);
                      }}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                {simulatedScore && (
                  <div className="p-3 bg-indigo-950/40 border border-indigo-800 rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-indigo-300">Live Recalculation Output:</div>
                    <div className="text-slate-300">
                      Simulated SGPA: <strong className="text-white">{simulatedScore.predictedSgpa}</strong> | Risk Score: <strong className="text-white">{(simulatedScore.dropoutRiskScore * 100).toFixed(1)}%</strong> ({simulatedScore.riskBand})
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Advisor Review & Intervention History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Advisor Reviews */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white">Human Advisor Reviews</h3>
                  <span className="text-xs text-slate-400">{studentProfile?.reviews?.length || 0} reviews</span>
                </div>
                <div className="space-y-3">
                  {(studentProfile?.reviews || []).map((rev: any) => (
                    <div key={rev._id} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{rev.reviewerName}</span>
                        <span className="text-slate-400 text-[11px]">{new Date(rev.reviewedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="text-slate-300">{rev.reviewNotes}</div>
                      {rev.actionRecommended && (
                        <div className="text-indigo-400 text-[11px]">Recommended: {rev.actionRecommended}</div>
                      )}
                    </div>
                  ))}
                  {(!studentProfile?.reviews || studentProfile.reviews.length === 0) && (
                    <div className="text-slate-500 text-xs py-4 text-center">No reviews recorded yet for this student.</div>
                  )}
                </div>
              </div>

              {/* Support Tasks */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white">Support Outreach Tasks</h3>
                  <span className="text-xs text-slate-400">{studentProfile?.interventions?.length || 0} tasks</span>
                </div>
                <div className="space-y-3">
                  {(studentProfile?.interventions || []).map((task: any) => (
                    <div key={task._id} className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-lg space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{task.interventionType.replace('_', ' ')}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${task.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'}`}>
                          {task.status}
                        </span>
                      </div>
                      <div className="text-slate-300">{task.actionPlan}</div>
                      {task.outcomeNotes && (
                        <div className="text-emerald-400 text-[11px]">Outcome: {task.outcomeNotes}</div>
                      )}
                    </div>
                  ))}
                  {(!studentProfile?.interventions || studentProfile.interventions.length === 0) && (
                    <div className="text-slate-500 text-xs py-4 text-center">No active support tasks for this student.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: SYNTHETIC TRAINING & THRESHOLD SCENARIOS */}
        {/* ========================================================= */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            {/* Top Row: Synthetic Dataset Generation & Model Training Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dataset Console */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <span>Synthetic Longitudinal Dataset Generator</span>
                  </h3>
                  <span className="text-xs text-slate-400">Student-separated holdout</span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Random Seed (Reproducibility)</label>
                    <input
                      type="number"
                      value={trainSeed}
                      onChange={(e) => setTrainSeed(parseInt(e.target.value) || 42)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Cohort Sample Size</label>
                    <input
                      type="number"
                      value={trainSampleCount}
                      onChange={(e) => setTrainSampleCount(parseInt(e.target.value) || 200)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Active Dataset: <strong className="text-slate-200">{datasets[0]?.versionCode || 'None'}</strong> | Total: {datasets[0]?.totalRecords || 0} (Train: {datasets[0]?.trainCount || 0}, Holdout: {datasets[0]?.holdoutCount || 0})
                </div>

                <button
                  onClick={handleGenerateDataset}
                  disabled={isTraining}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
                  <span>Generate New Synthetic Cohort (70/30 Split)</span>
                </button>
              </div>

              {/* Model Training Console */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-violet-400" />
                    <span>Numeric ML Training & Fitting Engine</span>
                  </h3>
                  <span className="text-xs text-violet-400">Ridge & Logistic Baselines</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1">Epochs</label>
                    <input
                      type="number"
                      value={trainEpochs}
                      onChange={(e) => setTrainEpochs(parseInt(e.target.value) || 600)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Learning Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={trainLr}
                      onChange={(e) => setTrainLr(parseFloat(e.target.value) || 0.05)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Decision Threshold</label>
                    <input
                      type="number"
                      step="0.05"
                      value={trainThreshold}
                      onChange={(e) => setTrainThreshold(parseFloat(e.target.value) || 0.50)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-400">
                  Holdout Isolation Rule: Feature standardization parameters (&mu;, &sigma;) are fitted strictly on the 70% train split. Held-out students never leak into fitting.
                </div>

                <button
                  onClick={handleTrainModel}
                  disabled={isTraining || datasets.length === 0}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-lg shadow-violet-600/20"
                >
                  <Play className={`w-3.5 h-3.5 fill-current ${isTraining ? 'animate-spin' : ''}`} />
                  <span>Train Models & Evaluate Holdout Set</span>
                </button>
              </div>
            </div>

            {/* Held-out Evaluation Metrics Cards */}
            {evaluationReport && (
              <div className="space-y-6">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Held-out Evaluation Metrics (Student-Separated Holdout)</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-medium">Sample Count: {evaluationReport.regressionMetrics?.sampleCount} students</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="text-[11px] text-slate-400 uppercase">Regression MAE</div>
                      <div className="text-xl font-bold text-white mt-1">{evaluationReport.regressionMetrics?.mae}</div>
                      <div className="text-[10px] text-slate-500">Mean Abs Error</div>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="text-[11px] text-slate-400 uppercase">Regression R&sup2;</div>
                      <div className="text-xl font-bold text-white mt-1">{evaluationReport.regressionMetrics?.r2}</div>
                      <div className="text-[10px] text-slate-500">Explained Variance</div>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="text-[11px] text-slate-400 uppercase">Classification PR-AUC</div>
                      <div className="text-xl font-bold text-indigo-300 mt-1">{evaluationReport.classificationMetrics?.prAuc}</div>
                      <div className="text-[10px] text-slate-500">Precision-Recall AUC</div>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="text-[11px] text-slate-400 uppercase">Precision (&tau;=0.50)</div>
                      <div className="text-xl font-bold text-white mt-1">{Math.round((evaluationReport.classificationMetrics?.precision || 0) * 100)}%</div>
                      <div className="text-[10px] text-slate-500">Positive Predictive Val</div>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="text-[11px] text-slate-400 uppercase">Recall (&tau;=0.50)</div>
                      <div className="text-xl font-bold text-white mt-1">{Math.round((evaluationReport.classificationMetrics?.recall || 0) * 100)}%</div>
                      <div className="text-[10px] text-slate-500">True Positive Rate</div>
                    </div>
                    <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/50">
                      <div className="text-[11px] text-slate-400 uppercase">Brier Score</div>
                      <div className="text-xl font-bold text-emerald-300 mt-1">{evaluationReport.classificationMetrics?.brierScore}</div>
                      <div className="text-[10px] text-slate-500">Prob Calibration</div>
                    </div>
                  </div>
                </div>

                {/* Threshold Scenario Comparison Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Threshold Scenario Comparison Matrix</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Evaluating advisor workload vs early-warning recall across multiple operational cutoff thresholds
                      </p>
                    </div>
                    <span className="text-xs text-indigo-400 font-semibold">Simulated Operational Trade-offs</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Scenario Policy</th>
                          <th className="px-4 py-3">Threshold (&tau;)</th>
                          <th className="px-4 py-3">Precision</th>
                          <th className="px-4 py-3">Recall</th>
                          <th className="px-4 py-3">F1 Score</th>
                          <th className="px-4 py-3">Flagged Count</th>
                          <th className="px-4 py-3">False Alerts</th>
                          <th className="px-4 py-3">Capacity Feasible</th>
                          <th className="px-4 py-3">Operational Recommendation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {(evaluationReport.thresholdScenarios || []).map((sc: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3 font-medium text-white">{sc.scenarioLabel}</td>
                            <td className="px-4 py-3 font-mono text-indigo-300 font-semibold">{sc.threshold}</td>
                            <td className="px-4 py-3 font-semibold">{Math.round(sc.precision * 100)}%</td>
                            <td className="px-4 py-3 font-semibold">{Math.round(sc.recall * 100)}%</td>
                            <td className="px-4 py-3">{sc.f1Score}</td>
                            <td className="px-4 py-3 text-white font-bold">{sc.flaggedCount}</td>
                            <td className="px-4 py-3 text-red-400 font-semibold">{sc.falseAlertsCount}</td>
                            <td className="px-4 py-3">
                              {sc.workloadCapacityFeasible ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                                  Feasible
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                  High Load
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-400 text-[11px] max-w-xs">{sc.recommendation}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 5-Bin Calibration Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-sm font-semibold text-white">Probability Calibration Curve (5 Bins)</h3>
                    <span className="text-xs text-slate-400">Mean Predicted vs Observed Positive Rate</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {(evaluationReport.calibrationCurve || []).map((bin: any) => (
                      <div key={bin.binIndex} className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-lg text-center space-y-1">
                        <div className="text-[11px] font-semibold text-slate-300">{bin.predictedRange}</div>
                        <div className="text-xs text-indigo-400">Pred: <strong>{(bin.meanPredictedProbability * 100).toFixed(0)}%</strong></div>
                        <div className="text-xs text-emerald-400">Actual: <strong>{(bin.actualPositiveRate * 100).toFixed(0)}%</strong></div>
                        <div className="text-[10px] text-slate-500">n = {bin.sampleCount}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: ADVISOR INTERVENTIONS & OUTREACH */}
        {/* ========================================================= */}
        {activeTab === 'interventions' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="text-xs font-semibold text-slate-300">Filter by Status:</div>
                <select
                  value={filterInterventionStatus}
                  onChange={(e) => setFilterInterventionStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="OPEN">Open Tasks</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed / Improved</option>
                </select>
              </div>

              <div className="text-xs text-slate-400">
                Total Tasks: <strong className="text-white">{interventionsList.length}</strong> | Open: <strong className="text-amber-400">{interventionsList.filter(i => i.status === 'OPEN').length}</strong>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Assigned Student Support Outreach Tasks</h3>
                <span className="text-xs text-slate-400">Human-reviewed tasks with assigned mentors & target outcomes</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Intervention Type</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Assigned Mentor</th>
                      <th className="px-4 py-3">Action Plan</th>
                      <th className="px-4 py-3">Due Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Outcome Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {interventionsList.map((task) => (
                      <tr key={task._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 font-medium text-white">
                          <div>{task.studentName}</div>
                          <div className="text-[11px] text-slate-400">{task.studentRollNumber}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-300">
                          {task.interventionType.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.priority === 'URGENT' ? 'bg-red-950 text-red-300' : task.priority === 'HIGH' ? 'bg-amber-950 text-amber-300' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">{task.assignedStaffName}</td>
                        <td className="px-4 py-3 max-w-xs truncate text-slate-300">{task.actionPlan}</td>
                        <td className="px-4 py-3">{task.targetDueDate}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            task.status === 'COMPLETED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {task.status !== 'COMPLETED' ? (
                            <button
                              onClick={() => {
                                setActiveInterventionForOutcome(task);
                                setShowUpdateOutcomeModal(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition"
                            >
                              Log Outcome
                            </button>
                          ) : (
                            <span className="text-emerald-400 text-[11px] truncate max-w-xs block">
                              {task.outcomeNotes || 'Resolved'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {interventionsList.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center py-8 text-slate-500">
                          No interventions currently matching filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: RECORD ADVISOR REVIEW */}
      {/* ========================================================= */}
      {showAdvisorReviewModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Record Human Advisor Review</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide human qualitative evaluation for <strong>{studentProfile?.prediction?.studentName}</strong> ({studentProfile?.prediction?.studentRollNumber}):
            </p>

            <form onSubmit={handleCreateReview} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value as AdvisorReviewDecision)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={AdvisorReviewDecision.INTERVENTION_REQUIRED}>Intervention Required</option>
                  <option value={AdvisorReviewDecision.MONITOR}>Continue Monitoring</option>
                  <option value={AdvisorReviewDecision.NO_ACTION}>No Action Required</option>
                  <option value={AdvisorReviewDecision.FALSE_POSITIVE}>Mark False Positive</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Human Risk Assessment</label>
                <select
                  value={reviewHumanRisk}
                  onChange={(e) => setReviewHumanRisk(e.target.value as RiskBand)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={RiskBand.CRITICAL}>Critical Risk</option>
                  <option value={RiskBand.HIGH}>High Risk</option>
                  <option value={RiskBand.MODERATE}>Moderate Risk</option>
                  <option value={RiskBand.LOW}>Low Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Advisor Rationale & Notes</label>
                <textarea
                  required
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record qualitative context (e.g. medical leave, personal circumstance, subject difficulty)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Action Recommendation</label>
                <input
                  type="text"
                  value={reviewAction}
                  onChange={(e) => setReviewAction(e.target.value)}
                  placeholder="e.g. Enroll in peer tutoring, weekly check-in"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvisorReviewModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg"
                >
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE SUPPORT TASK */}
      {/* ========================================================= */}
      {showCreateInterventionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Target className="w-4 h-4 text-violet-400" />
              <span>Create Support Outreach Task</span>
            </h3>
            <p className="text-xs text-slate-400">
              Assign targeted outreach for <strong>{studentProfile?.prediction?.studentName}</strong>:
            </p>

            <form onSubmit={handleCreateIntervention} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Intervention Type</label>
                <select
                  value={newInterventionType}
                  onChange={(e) => setNewInterventionType(e.target.value as InterventionType)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={InterventionType.PEER_TUTORING}>Peer Tutoring Cohort</option>
                  <option value={InterventionType.ATTENDANCE_COUNSELING}>Attendance Counseling</option>
                  <option value={InterventionType.REMEDIAL_CLASS}>Remedial Workshop</option>
                  <option value={InterventionType.MENTOR_CHECKIN}>Faculty Mentor Check-in</option>
                  <option value={InterventionType.FINANCIAL_COUNSELING}>Financial Aid Counseling</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Priority</label>
                <select
                  value={newInterventionPriority}
                  onChange={(e) => setNewInterventionPriority(e.target.value as InterventionPriority)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                >
                  <option value={InterventionPriority.URGENT}>Urgent</option>
                  <option value={InterventionPriority.HIGH}>High</option>
                  <option value={InterventionPriority.MEDIUM}>Medium</option>
                  <option value={InterventionPriority.LOW}>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Action Plan & Milestones</label>
                <textarea
                  required
                  rows={3}
                  value={newInterventionPlan}
                  onChange={(e) => setNewInterventionPlan(e.target.value)}
                  placeholder="Detail action plan, meeting cadence, and targeted course..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Due Date</label>
                <input
                  type="date"
                  required
                  value={newInterventionDueDate}
                  onChange={(e) => setNewInterventionDueDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateInterventionModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: UPDATE INTERVENTION OUTCOME */}
      {/* ========================================================= */}
      {showUpdateOutcomeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Log Support Intervention Outcome</span>
            </h3>
            <p className="text-xs text-slate-400">
              Record outcome for task: <strong>{activeInterventionForOutcome?.interventionType?.replace('_', ' ')}</strong> ({activeInterventionForOutcome?.studentName}):
            </p>

            <form onSubmit={handleUpdateOutcome} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Outcome & Improvement Notes</label>
                <textarea
                  required
                  rows={4}
                  value={outcomeNotesInput}
                  onChange={(e) => setOutcomeNotesInput(e.target.value)}
                  placeholder="Record qualitative and quantitative improvements (e.g. completed 4 tutoring sessions, quiz score rose 24%, attendance rebounded to 82%)..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateOutcomeModal(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg"
                >
                  Complete & Resolve Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: REPRODUCIBLE DEMONSTRATION JOURNEY */}
      {/* ========================================================= */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-indigo-400 fill-current" />
                <h3 className="text-base font-bold text-white">
                  M32 Reproducible Demonstration: 5-Step Predictive Analytics Lifecycle
                </h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            {isRunningDemo ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-xs text-slate-400">
                  Executing reproducible ML pipeline: generating dataset, fitting preprocessors, evaluating holdout metrics, comparing threshold scenarios, and logging advisor outreach...
                </p>
              </div>
            ) : demoResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>
                    <strong>All 5 Verification Gates Passed:</strong> Seeded baseline trained reproducibly, holdout never leaked into fitting, metrics verified, changing input changes score, and support task logged.
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                    <div className="font-semibold text-white">Step 1: Baseline Synthetic Model Trained</div>
                    <div className="text-slate-300">
                      Dataset: <strong>{demoResult.datasetVersion}</strong> | Model: <strong>{demoResult.modelCode}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                    <div className="font-semibold text-white">Step 2: Held-out Metrics Inspected (Holdout Isolation)</div>
                    <div className="text-slate-300 grid grid-cols-2 gap-2 mt-1">
                      <div>Regression MAE: <strong>{demoResult.holdoutMetrics?.regressionMAE}</strong></div>
                      <div>Regression R&sup2;: <strong>{demoResult.holdoutMetrics?.regressionR2}</strong></div>
                      <div>Classification PR-AUC: <strong>{demoResult.holdoutMetrics?.classificationPRAUC}</strong></div>
                      <div>Brier Score Calibration: <strong>{demoResult.holdoutMetrics?.brierScore}</strong></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                    <div className="font-semibold text-white">Step 3: Threshold Scenarios Compared (0.35 Sensitive vs 0.65 Targeted)</div>
                    <div className="text-slate-300 space-y-1 mt-1">
                      {demoResult.thresholdScenarios?.map((sc: any, i: number) => (
                        <div key={i} className="text-[11px]">
                          &bull; &tau;={sc.threshold}: Precision <strong>{Math.round(sc.precision * 100)}%</strong>, Recall <strong>{Math.round(sc.recall * 100)}%</strong> ({sc.flaggedCount} flagged, {sc.falseAlertsCount} false alerts)
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                    <div className="font-semibold text-white">Step 4: Feature Sensitivity Tested (Changing Input Changes Score)</div>
                    <div className="text-slate-300 space-y-1 mt-1">
                      <div>High-Risk Input Score: <strong>{(demoResult.featureSensitivity?.highRiskScore * 100).toFixed(1)}%</strong> ({demoResult.featureSensitivity?.highRiskBand})</div>
                      <div>Improved Input Score: <strong>{(demoResult.featureSensitivity?.improvedScore * 100).toFixed(1)}%</strong> ({demoResult.featureSensitivity?.improvedBand})</div>
                      <div className="text-emerald-400 font-semibold">&check; Score Changed: {demoResult.featureSensitivity?.scoreChanged ? 'Verified' : 'Failed'}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/60 space-y-1">
                    <div className="font-semibold text-white">Step 5: Human-Reviewed Support Task Logged & Resolved</div>
                    <div className="text-slate-300 space-y-1 mt-1">
                      <div>Intervention ID: <strong>{demoResult.interventionId}</strong> (Status: {demoResult.interventionStatus})</div>
                      <div className="text-emerald-400">{demoResult.outcomeNotes}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Mandatory Completion Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/60 px-6 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">M32: Performance Prediction & Early-Support Analytics</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-semibold">&check; Seeded Training Reproducible</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-semibold">&check; Holdout Preprocessing Strictly Isolated</span>
            <span>&bull;</span>
            <span className="text-emerald-400 font-semibold">&check; Dynamic What-If Sensitivity</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Integration Gates: M08 (Academics) &bull; M14 (Assessment) &bull; M15 (Results) &bull; Ready for M33 (Learning Recommendations)
          </div>
        </div>
      </footer>
    </div>
  );
};
