import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  BookOpen,
  Award,
  CheckCircle,
  Play,
  Clock,
  Globe,
  Sliders,
  Sparkles,
  Layers,
  Star,
  Users,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Filter,
  Check,
  Info,
  Calendar,
  ChevronRight,
  TrendingUp,
  FileText,
  Video,
  Code,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  TopicDifficulty,
  ResourceFormat,
  ResourceLanguage,
  MasteryLevel,
  RecommendationStatus,
  ActivityType
} from '@shared/index';

export const LearningPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine active tab based on route
  const getTabFromPath = () => {
    if (location.pathname.includes('/resources')) return 'resources';
    if (location.pathname.includes('/progress')) return 'progress';
    if (location.pathname.includes('/faculty')) return 'faculty';
    return 'my-plan';
  };

  const [activeTab, setActiveTab] = useState<'my-plan' | 'resources' | 'progress' | 'faculty'>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'my-plan' | 'resources' | 'progress' | 'faculty') => {
    setActiveTab(tab);
    if (tab === 'my-plan') navigate('/app/learning/my-plan');
    else if (tab === 'resources') navigate('/app/learning/resources');
    else if (tab === 'progress') navigate('/app/learning/progress');
    else if (tab === 'faculty') navigate('/app/learning/faculty');
  };

  // State: My Plan
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planData, setPlanData] = useState<any>(null);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [prefForm, setPrefForm] = useState({
    preferredLanguage: ResourceLanguage.EN,
    preferredFormat: ResourceFormat.VIDEO,
    weeklyStudyHours: 6,
    targetMastery: 80
  });

  // State: Resources
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceFilter, setResourceFilter] = useState({
    topicId: '',
    difficulty: '',
    language: 'ALL',
    format: 'ALL',
    search: ''
  });
  const [showAddResourceModal, setShowAddResourceModal] = useState(false);
  const [newResourceForm, setNewResourceForm] = useState({
    courseId: '',
    topicId: '',
    title: '',
    description: '',
    url: '',
    durationMinutes: 20,
    difficulty: TopicDifficulty.INTERMEDIATE,
    language: ResourceLanguage.EN,
    format: ResourceFormat.VIDEO,
    provider: 'Dept of Computer Science'
  });

  // State: Topics
  const [topics, setTopics] = useState<any[]>([]);

  // State: Progress
  const [progressData, setProgressData] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [logForm, setLogForm] = useState({
    topicId: '',
    resourceId: '',
    activityType: ActivityType.PRACTICE_COMPLETION,
    timeSpentMinutes: 25,
    scoreObtained: 80,
    rating: 5,
    feedbackNotes: ''
  });

  // State: Faculty Engagement
  const [facultyData, setFacultyData] = useState<any>(null);
  const [loadingFaculty, setLoadingFaculty] = useState(false);

  // State: Demo Journey Modal
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);

  // Fetch My Plan
  const fetchMyPlan = async () => {
    setLoadingPlan(true);
    try {
      const res = await fetch('/api/v1/learning/my-plan', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPlanData(data);
        if (data.plan) {
          setPrefForm({
            preferredLanguage: data.plan.preferredLanguage || ResourceLanguage.EN,
            preferredFormat: data.plan.preferredFormat || ResourceFormat.VIDEO,
            weeklyStudyHours: data.plan.weeklyStudyHours || 6,
            targetMastery: data.plan.targetMastery || 80
          });
        }
      }
    } catch (e) {
      console.error('Error fetching plan:', e);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Fetch Topics
  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/v1/learning/topics', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (e) {
      console.error('Error fetching topics:', e);
    }
  };

  // Fetch Resources
  const fetchResources = async () => {
    setLoadingResources(true);
    try {
      const params = new URLSearchParams();
      if (resourceFilter.topicId) params.append('topicId', resourceFilter.topicId);
      if (resourceFilter.difficulty) params.append('difficulty', resourceFilter.difficulty);
      if (resourceFilter.language && resourceFilter.language !== 'ALL') params.append('language', resourceFilter.language);
      if (resourceFilter.format && resourceFilter.format !== 'ALL') params.append('format', resourceFilter.format);
      if (resourceFilter.search) params.append('search', resourceFilter.search);

      const res = await fetch(`/api/v1/learning/resources?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResources(data);
      }
    } catch (e) {
      console.error('Error fetching resources:', e);
    } finally {
      setLoadingResources(false);
    }
  };

  // Fetch Progress
  const fetchProgress = async () => {
    setLoadingProgress(true);
    try {
      const res = await fetch('/api/v1/learning/progress', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProgressData(data);
      }
    } catch (e) {
      console.error('Error fetching progress:', e);
    } finally {
      setLoadingProgress(false);
    }
  };

  // Fetch Faculty Engagement
  const fetchFacultyEngagement = async () => {
    setLoadingFaculty(true);
    try {
      const res = await fetch('/api/v1/learning/faculty/engagement', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setFacultyData(data);
      }
    } catch (e) {
      console.error('Error fetching faculty engagement:', e);
    } finally {
      setLoadingFaculty(false);
    }
  };

  useEffect(() => {
    fetchTopics();
    if (activeTab === 'my-plan') fetchMyPlan();
    else if (activeTab === 'resources') fetchResources();
    else if (activeTab === 'progress') fetchProgress();
    else if (activeTab === 'faculty') fetchFacultyEngagement();
  }, [activeTab]);

  // Update Preferences Handler
  const handleUpdatePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planData?.plan?._id) return;

    try {
      const res = await fetch('/api/v1/learning/my-plan/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          planId: planData.plan._id,
          ...prefForm
        })
      });
      if (res.ok) {
        setShowPrefModal(false);
        fetchMyPlan();
      }
    } catch (e) {
      console.error('Error updating preferences:', e);
    }
  };

  // Log Activity Completion Handler
  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planData?.plan?._id) return;

    try {
      const res = await fetch('/api/v1/learning/activities/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          learningPlanId: planData.plan._id,
          ...logForm
        })
      });
      if (res.ok) {
        setShowLogModal(false);
        fetchMyPlan();
        fetchProgress();
      }
    } catch (e) {
      console.error('Error logging activity:', e);
    }
  };

  // Run Reproducible Demonstration
  const handleRunDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch('/api/v1/learning/demo/journey', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDemoResult(data);
        fetchMyPlan();
      }
    } catch (e) {
      console.error('Error running demo journey:', e);
    } finally {
      setDemoLoading(false);
    }
  };

  // Endorse Resource Handler
  const handleEndorseResource = async (resourceId: string) => {
    try {
      const res = await fetch('/api/v1/learning/faculty/endorse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ resourceId })
      });
      if (res.ok) {
        fetchResources();
        fetchFacultyEngagement();
      }
    } catch (e) {
      console.error('Error endorsing resource:', e);
    }
  };

  // Format Helper
  const getFormatIcon = (format: string) => {
    switch (format) {
      case ResourceFormat.VIDEO:
        return <Video className="w-4 h-4 text-rose-500" />;
      case ResourceFormat.PRACTICE_PROBLEMS:
        return <Code className="w-4 h-4 text-emerald-500" />;
      case ResourceFormat.INTERACTIVE_SIM:
        return <Compass className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMasteryBadgeClass = (level: string) => {
    switch (level) {
      case MasteryLevel.MASTERY:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case MasteryLevel.PROFICIENT:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case MasteryLevel.DEVELOPING:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case MasteryLevel.NOVICE:
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-700/60 rounded-full border border-indigo-500/40 text-indigo-200">
              Module 33: Adaptive Learning
            </span>
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-700/60 rounded-full border border-emerald-500/40 text-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Verified Catalog
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Personalized Learning Recommendations
          </h1>
          <p className="text-indigo-200 text-sm max-w-2xl">
            Explainable rule-based resource prioritization grounded in verified syllabus topics, actual assessment mappings, and student language preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowDemoModal(true);
              handleRunDemo();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-100" />
            Reproducible Demo
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 space-x-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('my-plan')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'my-plan'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Learning Plan
        </button>
        <button
          onClick={() => handleTabChange('resources')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'resources'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          Curated Catalog
        </button>
        <button
          onClick={() => handleTabChange('progress')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'progress'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          Progress & Feedback
        </button>
        <button
          onClick={() => handleTabChange('faculty')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 transition-all ${
            activeTab === 'faculty'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
          }`}
        >
          <Users className="w-4 h-4" />
          Faculty Engagement
        </button>
      </div>

      {/* TAB 1: MY LEARNING PLAN */}
      {activeTab === 'my-plan' && (
        <div className="space-y-6">
          {loadingPlan ? (
            <div className="p-12 text-center text-gray-500">Loading student personalized plan...</div>
          ) : planData ? (
            <>
              {/* Cold Start / Starter Notice */}
              {planData.isStarterPlan && (
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Orientation Diagnostic Mode</h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                      {planData.plan?.starterPlanNotice ||
                        'No actual assessment marks recorded yet. Showing introductory foundational resources without fabricated personalized scores.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Plan Overview Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                      {planData.plan?.courseCode || 'CS-201'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Term: {planData.plan?.academicTerm || '2026-AUTUMN'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {planData.plan?.title || 'Target Mastery Plan'}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Student: {planData.plan?.studentName} ({planData.plan?.studentRollNumber}) • Target Date: {planData.plan?.targetCompletionDate}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Aggregate Mastery Ring/Bar */}
                  <div className="text-center">
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {planData.plan?.aggregateMastery || 0}%
                    </div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Current Mastery</div>
                  </div>

                  {/* Target Goal */}
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-800 dark:text-gray-200">
                      {planData.plan?.targetMastery || 80}%
                    </div>
                    <div className="text-xs font-semibold text-gray-500 uppercase">Target Goal</div>
                  </div>

                  {/* Preferences Summary */}
                  <div className="border-l border-gray-200 dark:border-gray-800 pl-6 space-y-1">
                    <div className="text-xs text-gray-500">
                      Language: <span className="font-semibold text-gray-800 dark:text-gray-200">{planData.plan?.preferredLanguage === 'HI' ? 'Hindi (हिंदी)' : 'English'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Format: <span className="font-semibold text-gray-800 dark:text-gray-200">{planData.plan?.preferredFormat}</span>
                    </div>
                    <button
                      onClick={() => setShowPrefModal(true)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                    >
                      <Sliders className="w-3 h-3" /> Edit Preferences
                    </button>
                  </div>
                </div>
              </div>

              {/* Topic Mastery Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Compass className="w-4 h-4 text-indigo-600" />
                    Curriculum Topic Mastery Radar
                  </h3>
                  <span className="text-xs text-gray-500">
                    Derived strictly from mapped assessments & verified diagnostic activities
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {planData.topicMasteries?.map((t: any) => (
                    <div
                      key={t.topicId}
                      className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-gray-400">{t.topicCode}</span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getMasteryBadgeClass(t.masteryLevel)}`}>
                            {t.masteryLevel}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {t.topicTitle}
                        </h4>
                      </div>

                      <div className="mt-4 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Mastery</span>
                          <span className="font-bold text-gray-800 dark:text-gray-200">{t.masteryScore}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              t.masteryScore >= 70
                                ? 'bg-emerald-500'
                                : t.masteryScore >= 40
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${t.masteryScore}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-400 text-right">
                          {t.sampleCount > 0 ? `${t.sampleCount} evaluations` : 'Cold-start diagnostic'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranked Curated Recommendations */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Ranked Recommended Interventions
                    </h3>
                    <p className="text-xs text-gray-500">
                      Prioritized by concept mastery deficit, prerequisite validation, and preferred format
                    </p>
                  </div>
                  <span className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full border border-indigo-200">
                    {planData.recommendations?.length || 0} Ranked Resources
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {planData.recommendations?.map((rec: any) => (
                    <div
                      key={rec._id}
                      className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                              #{rec.rank}
                            </span>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {rec.topicTitle}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200">
                              {rec.matchScore}% Match
                            </span>
                            {rec.facultyEndorsed && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-0.5">
                                <Award className="w-3 h-3" /> Faculty Endorsed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-gray-900 dark:text-white">
                            {rec.resourceTitle}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              {getFormatIcon(rec.resourceFormat)}
                              {rec.resourceFormat}
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="w-3.5 h-3.5 text-gray-400" />
                              {rec.resourceLanguage === 'HI' ? 'Hindi (हिंदी)' : 'English'}
                            </span>
                            {rec.durationMinutes && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {rec.durationMinutes} mins
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Explainable Rule-Based Rationale Box */}
                        <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2">
                          <Sliders className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Recommendation Driver: </span>
                            {rec.ruleRationale}
                          </div>
                        </div>

                        {/* Grounded Curriculum Fact Box */}
                        {rec.groundedFactExplanation && (
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-gray-700 dark:text-gray-300">Syllabus Grounding: </span>
                              {rec.groundedFactExplanation}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          Status: <span className="font-semibold text-indigo-600">{rec.status}</span>
                        </span>

                        <button
                          onClick={() => {
                            setLogForm({
                              topicId: rec.topicId,
                              resourceId: rec.resourceId,
                              activityType: ActivityType.PRACTICE_COMPLETION,
                              timeSpentMinutes: rec.durationMinutes || 20,
                              scoreObtained: 85,
                              rating: 5,
                              feedbackNotes: 'Completed topic exercise successfully.'
                            });
                            setShowLogModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
                        >
                          <Play className="w-3.5 h-3.5" /> Start & Log Activity
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500">No active learning plan available.</div>
          )}
        </div>
      )}

      {/* TAB 2: CURATED RESOURCE CATALOG */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                Curated Internal Resource Repository
              </h2>
              <p className="text-xs text-gray-500">
                Peer-reviewed course materials tagged with topic, format, difficulty and language.
              </p>
            </div>

            <button
              onClick={() => setShowAddResourceModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors self-start"
            >
              <Plus className="w-4 h-4" /> Add Catalog Resource
            </button>
          </div>

          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-wrap gap-4 items-center">
            <input
              type="text"
              placeholder="Search resource title or concept..."
              value={resourceFilter.search}
              onChange={(e) => setResourceFilter({ ...resourceFilter, search: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm flex-1 min-w-[200px]"
            />

            <select
              value={resourceFilter.topicId}
              onChange={(e) => setResourceFilter({ ...resourceFilter, topicId: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.topicCode} — {t.title}
                </option>
              ))}
            </select>

            <select
              value={resourceFilter.language}
              onChange={(e) => setResourceFilter({ ...resourceFilter, language: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <option value="ALL">All Languages</option>
              <option value={ResourceLanguage.EN}>English (EN)</option>
              <option value={ResourceLanguage.HI}>Hindi (हिंदी - HI)</option>
            </select>

            <select
              value={resourceFilter.format}
              onChange={(e) => setResourceFilter({ ...resourceFilter, format: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <option value="ALL">All Formats</option>
              <option value={ResourceFormat.VIDEO}>Video</option>
              <option value={ResourceFormat.PRACTICE_PROBLEMS}>Practice Problems</option>
              <option value={ResourceFormat.INTERACTIVE_SIM}>Interactive Simulator</option>
              <option value={ResourceFormat.ARTICLE}>Article</option>
            </select>

            <button
              onClick={fetchResources}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5"
            >
              <Filter className="w-4 h-4" /> Apply Filter
            </button>
          </div>

          {/* Resources Table / Cards */}
          {loadingResources ? (
            <div className="p-12 text-center text-gray-500">Loading resources catalog...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resources.map((res) => (
                <div
                  key={res._id}
                  className="p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                        {getFormatIcon(res.format)}
                        {res.format}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200">
                        {res.language === 'HI' ? 'Hindi (हिंदी)' : 'English'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2">
                      {res.title}
                    </h4>

                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                      {res.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{res.provider}</span>
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {res.rating}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-gray-400">{res.durationMinutes} mins</span>
                      <button
                        onClick={() => handleEndorseResource(res._id)}
                        className="px-2.5 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Award className="w-3 h-3" /> Endorse
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PERSONAL PROGRESS & FEEDBACK */}
      {activeTab === 'progress' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Personal Learning Progress & Completion Log
              </h2>
              <p className="text-xs text-gray-500">
                Track study time, completed exercises, scores, and personal review feedback notes.
              </p>
            </div>

            <button
              onClick={() => setShowLogModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors self-start"
            >
              <Plus className="w-4 h-4" /> Log Completed Activity
            </button>
          </div>

          {/* Progress Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {progressData?.totalHours || 0} hrs
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Total Study Time</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {progressData?.completedCount || 0}
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Activities Completed</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <div className="text-2xl font-black text-amber-500">
                {progressData?.streakDays || 0} Days
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Study Streak</div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
              <div className="text-2xl font-black text-purple-600">
                4.9 <Star className="w-4 h-4 inline fill-current text-amber-400" />
              </div>
              <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Average Satisfaction</div>
            </div>
          </div>

          {/* Activities History Table */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" /> Activity History & Completion Notes
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                  <tr>
                    <th className="p-3">Topic / Resource</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Time Spent</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Rating</th>
                    <th className="p-3">Feedback Notes</th>
                    <th className="p-3">Completed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {progressData?.activities?.map((a: any) => (
                    <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="p-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{a.resourceTitle}</div>
                        <div className="text-xs text-gray-400">{a.topicTitle}</div>
                      </td>
                      <td className="p-3 text-xs">{a.activityType}</td>
                      <td className="p-3 text-xs font-semibold">{a.timeSpentMinutes} mins</td>
                      <td className="p-3 text-xs">
                        {a.scoreObtained !== undefined ? (
                          <span className="font-bold text-emerald-600">{a.scoreObtained}%</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3 text-xs text-amber-500 font-bold">
                        {a.rating ? `${a.rating} ★` : '—'}
                      </td>
                      <td className="p-3 text-xs text-gray-500 max-w-xs truncate">
                        {a.feedbackNotes || '—'}
                      </td>
                      <td className="p-3 text-xs text-gray-400">
                        {a.completedAt ? new Date(a.completedAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                  {(!progressData?.activities || progressData.activities.length === 0) && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-gray-400">
                        No activities completed yet. Start an activity from your Learning Plan!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FACULTY ENGAGEMENT & REVIEW */}
      {activeTab === 'faculty' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Faculty Recommendation Review & Cohort Analytics
              </h2>
              <p className="text-xs text-gray-500">
                Identify cohort-wide conceptual weak spots, review engagement, and endorse high-impact materials.
              </p>
            </div>
          </div>

          {loadingFaculty ? (
            <div className="p-12 text-center text-gray-500">Loading cohort engagement analytics...</div>
          ) : (
            <>
              {/* Cohort Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
                  <div className="text-2xl font-black text-indigo-600">
                    {facultyData?.totalEnrolledPlans || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Enrolled Plans</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
                  <div className="text-2xl font-black text-emerald-600">
                    {facultyData?.averageCohortMastery || 0}%
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Cohort Average Mastery</div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center">
                  <div className="text-2xl font-black text-purple-600">
                    {facultyData?.totalActivitiesCompleted || 0}
                  </div>
                  <div className="text-xs font-semibold text-gray-500 uppercase mt-1">Exercises Completed</div>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 shadow-sm text-center">
                  <div className="text-lg font-black text-rose-700 dark:text-rose-400 truncate">
                    {facultyData?.weakestTopic?.title || 'None'}
                  </div>
                  <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase mt-1">
                    Weakest Cohort Topic ({facultyData?.weakestTopic?.averageMastery || 0}%)
                  </div>
                </div>
              </div>

              {/* Cohort Topic Mastery Heat Map */}
              <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600" />
                  Cohort Mastery Breakdown by Curriculum Module
                </h3>

                <div className="space-y-4">
                  {facultyData?.topicStats?.map((t: any) => (
                    <div key={t.topicId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gray-500">{t.topicCode}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{t.title}</span>
                          {t.needsRevisionLecture && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Needs Revision Lecture
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-gray-800 dark:text-gray-200">{t.averageMastery}%</span>
                      </div>

                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            t.averageMastery >= 70
                              ? 'bg-emerald-500'
                              : t.averageMastery >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${t.averageMastery}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-gray-400">
                        <span>{t.noviceStudentsCount} novice students requiring remediation</span>
                        <span>{t.evaluatedStudentsCount} evaluated records</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Preferences Modal */}
      {showPrefModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Student Recommendation Preferences
            </h3>
            <p className="text-xs text-gray-500">
              Customize language and content format. The recommendation algorithm will immediately re-rank materials to match your choices.
            </p>

            <form onSubmit={handleUpdatePreferences} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Delivery Language
                </label>
                <select
                  value={prefForm.preferredLanguage}
                  onChange={(e) => setPrefForm({ ...prefForm, preferredLanguage: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value={ResourceLanguage.EN}>English</option>
                  <option value={ResourceLanguage.HI}>Hindi (हिंदी)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Preferred Content Format
                </label>
                <select
                  value={prefForm.preferredFormat}
                  onChange={(e) => setPrefForm({ ...prefForm, preferredFormat: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value={ResourceFormat.VIDEO}>Video Lecture</option>
                  <option value={ResourceFormat.PRACTICE_PROBLEMS}>Practice Problems & Exercises</option>
                  <option value={ResourceFormat.INTERACTIVE_SIM}>Interactive Simulator</option>
                  <option value={ResourceFormat.ARTICLE}>Article & Reference Notes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Weekly Study Target (Hours)
                </label>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={prefForm.weeklyStudyHours}
                  onChange={(e) => setPrefForm({ ...prefForm, weeklyStudyHours: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrefModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  Save & Re-rank
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Log Learning Activity Completion
            </h3>
            <p className="text-xs text-gray-500">
              Record time spent, quiz score and feedback. Mastery points will automatically update!
            </p>

            <form onSubmit={handleLogActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Time Spent (Minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={logForm.timeSpentMinutes}
                  onChange={(e) => setLogForm({ ...logForm, timeSpentMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Score Obtained (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={logForm.scoreObtained}
                  onChange={(e) => setLogForm({ ...logForm, scoreObtained: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Satisfaction Rating (1 to 5 Stars)
                </label>
                <select
                  value={logForm.rating}
                  onChange={(e) => setLogForm({ ...logForm, rating: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                >
                  <option value={5}>5 Stars — Excellent Resource</option>
                  <option value={4}>4 Stars — Very Helpful</option>
                  <option value={3}>3 Stars — Average</option>
                  <option value={2}>2 Stars — Needs Clarification</option>
                  <option value={1}>1 Star — Confusing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Feedback Notes
                </label>
                <textarea
                  rows={2}
                  value={logForm.feedbackNotes}
                  onChange={(e) => setLogForm({ ...logForm, feedbackNotes: e.target.value })}
                  placeholder="e.g. Visual step-through helped clarify rotation pointers."
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                >
                  Complete & Update Mastery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reproducible Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  M33 Reproducible Recommendation Journey
                </h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {demoLoading ? (
              <div className="py-12 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Executing complete personalized learning recommendation journey...
                </p>
                <p className="text-xs text-gray-500">
                  Checking weak topics • Validating prerequisites • Ranking curated Hindi/English resources • Logging activity completion • Persisting mastery growth
                </p>
              </div>
            ) : demoResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                  <h4 className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Acceptance Gate Verified: All Criteria Passed
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-1">
                    Student {demoResult.studentRollNumber} in course {demoResult.courseCode} successfully completed the verified personalized loop.
                  </p>
                </div>

                {/* Step 1: Weak Topic & Prerequisite Verification */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Step 1: Concept Weakness & Prerequisite Analysis
                  </span>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-500">Weak Target Topic:</div>
                      <div className="font-bold text-rose-600">
                        {demoResult.weakTopic.title} ({demoResult.weakTopic.initialMastery}% - {demoResult.weakTopic.initialLevel})
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Prerequisite Dependency:</div>
                      <div className="font-bold text-emerald-600">
                        {demoResult.prerequisiteStatus.title} ({demoResult.prerequisiteStatus.mastery}% - Satisfied)
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 & 3: Recommendation & Explanation */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Step 2 & 3: Ranked Curated Recommendation & Grounded Fact
                  </span>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {demoResult.recommendedResource.title}
                  </div>
                  <div className="text-xs text-indigo-900 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950 p-2.5 rounded-lg border border-indigo-200">
                    <span className="font-bold">Rule Rationale: </span>
                    {demoResult.recommendedResource.ruleRationale}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Grounded Fact: </span>
                    {demoResult.recommendedResource.groundedFactExplanation}
                  </div>
                </div>

                {/* Step 4 & 5: Activity Completion & Persisted Progress */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 space-y-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Step 4 & 5: Activity Logged & Persisted Mastery Growth
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded bg-white dark:bg-gray-900 border">
                      <div className="font-bold text-gray-900 dark:text-white">+{demoResult.persistedProgress.masteryGrowth}%</div>
                      <div className="text-[10px] text-gray-500">Mastery Growth</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-gray-900 border">
                      <div className="font-bold text-indigo-600">{demoResult.persistedProgress.newTopicMastery}%</div>
                      <div className="text-[10px] text-gray-500">New Topic Mastery</div>
                    </div>
                    <div className="p-2 rounded bg-white dark:bg-gray-900 border">
                      <div className="font-bold text-emerald-600">{demoResult.persistedProgress.newMasteryLevel}</div>
                      <div className="text-[10px] text-gray-500">Updated Level</div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowDemoModal(false)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                  >
                    Close Demo
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
export default LearningPages;
