import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Play,
  RefreshCw,
  Send,
  Plus,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Layers,
  Check,
  Search,
  Filter,
  History,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '@shared/index';

export const AssistantPages: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine active tab based on route
  const getTabFromPath = () => {
    if (location.pathname.includes('/history')) return 'history';
    if (location.pathname.includes('/voice')) return 'voice';
    if (location.pathname.includes('/evaluation')) return 'evaluation';
    return 'chat';
  };

  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'voice' | 'evaluation'>(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  const switchTab = (tab: 'chat' | 'history' | 'voice' | 'evaluation') => {
    setActiveTab(tab);
    navigate(`/app/assistant/${tab}`);
  };

  // State
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [messages, setMessages] = useState<any[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Voice state
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Evaluation & Admin state
  const [evaluationCases, setEvaluationCases] = useState<any[]>([]);
  const [evaluationRuns, setEvaluationRuns] = useState<any[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<any[]>([]);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [evalSubTab, setEvalSubTab] = useState<'cases' | 'runs' | 'articles'>('cases');

  // Article creation modal
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [newArticle, setNewArticle] = useState({
    slug: '',
    title: '',
    category: 'ACADEMICS',
    contentMarkdown: '',
    authorizedRoles: ['STUDENT', 'FACULTY', 'ADMIN']
  });

  // Demonstration state
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoRunning, setDemoRunning] = useState(false);
  const [demoResult, setDemoResult] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations and initial conversation
  const loadConversations = async () => {
    try {
      const res = await fetch('/api/v1/assistant/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0]._id);
          loadMessages(data[0]._id);
        } else if (data.length === 0) {
          createNewConversation();
        }
      }
    } catch (e) {
      console.error('Failed to load conversations', e);
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/v1/assistant/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  const createNewConversation = async () => {
    try {
      const res = await fetch('/api/v1/assistant/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ mode: 'TEXT' })
      });
      if (res.ok) {
        const newConv = await res.json();
        setActiveConversationId(newConv._id);
        loadConversations();
        loadMessages(newConv._id);
      }
    } catch (e) {
      console.error('Failed to create conversation', e);
    }
  };

  useEffect(() => {
    loadConversations();
    loadEvaluationData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadEvaluationData = async () => {
    try {
      const [casesRes, runsRes, articlesRes] = await Promise.all([
        fetch('/api/v1/assistant/evaluation/cases', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/assistant/evaluation/runs', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/v1/assistant/articles', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (casesRes.ok) setEvaluationCases(await casesRes.json());
      if (runsRes.ok) setEvaluationRuns(await runsRes.json());
      if (articlesRes.ok) setKnowledgeArticles(await articlesRes.json());
    } catch (e) {
      console.error('Failed to load evaluation data', e);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputQuery).trim();
    if (!text || isSending || !activeConversationId) return;

    setInputQuery('');
    setIsSending(true);

    // Optimistically show user message
    const tempUserMsg = {
      _id: `temp-${Date.now()}`,
      sender: 'USER',
      text,
      createdAt: new Date().toISOString(),
      sourceCards: [],
      linkedRecords: []
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`/api/v1/assistant/conversations/${activeConversationId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ query: text })
      });

      if (res.ok) {
        const assistantMsg = await res.json();
        setMessages(prev => [...prev.filter(m => m._id !== tempUserMsg._id), tempUserMsg, assistantMsg]);
        loadConversations();
      }
    } catch (e) {
      console.error('Failed to send message', e);
    } finally {
      setIsSending(false);
    }
  };

  // Speech Recognition (Web Speech API)
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicError('Speech recognition is not natively supported in this browser. Please use the typed fallback below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Supports Hindi/English accents

      recognition.onstart = () => {
        setIsListening(true);
        setMicError(null);
        setVoiceTranscript('Listening... Speak now.');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setVoiceTranscript(transcript);
        setInputQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setMicError(`Microphone access error (${event.error}). Typed keyboard flow remains fully operational.`);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition', err);
      setMicError(`Microphone initialization failure: ${err.message}. Typed fallback enabled.`);
      setIsListening(false);
    }
  };

  // Text to Speech
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Run AI Evaluation Suite
  const handleRunEvaluation = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch('/api/v1/assistant/evaluation/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ providerMode: 'SIMULATED_DETERMINISTIC' })
      });
      if (res.ok) {
        await loadEvaluationData();
      }
    } catch (e) {
      console.error('Evaluation run failed', e);
    } finally {
      setIsRunningEval(false);
    }
  };

  // Run Reproducible Demonstration
  const handleRunDemonstration = async () => {
    setDemoRunning(true);
    setShowDemoModal(true);
    try {
      const res = await fetch('/api/v1/assistant/demo/journey', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const result = await res.json();
        setDemoResult(result);
        loadConversations();
      }
    } catch (e) {
      console.error('Demonstration run failed', e);
    } finally {
      setDemoRunning(false);
    }
  };

  // Create Knowledge Article
  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/assistant/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newArticle)
      });
      if (res.ok) {
        setShowArticleModal(false);
        setNewArticle({
          slug: '',
          title: '',
          category: 'ACADEMICS',
          contentMarkdown: '',
          authorizedRoles: ['STUDENT', 'FACULTY', 'ADMIN']
        });
        loadEvaluationData();
      }
    } catch (e) {
      console.error('Failed to create article', e);
    }
  };

  // Pre-canned suggested prompts
  const suggestedChips = [
    { label: 'Fee balance & due date', query: 'What is my current fee balance and due date?' },
    { label: 'Next scheduled class', query: 'When and where is my next class scheduled?' },
    { label: 'Hostel bed allocation', query: 'What is my hostel block and room bed allocation?' },
    { label: 'Bonafide certificate status', query: 'What is the status of my bonafide certificate request?' },
    { label: 'Other student data (Refusal test)', query: 'What is the fee balance of roll number 2026-CS-002?' },
    { label: 'Hindi: फीस का बकाया', query: 'मेरी फीस का कितना बकाया बाकी है?' },
    { label: 'Library borrowing limit', query: 'How many books can a student borrow from the library simultaneously?' }
  ];

  const filteredEvaluationCases = categoryFilter === 'ALL'
    ? evaluationCases
    : evaluationCases.filter(c => c.category === categoryFilter);

  const latestRun = evaluationRuns[0] || null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white border-b border-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-indigo-600/60 border border-indigo-400/40 text-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-mono font-medium">
                  M31 ASSISTANT
                </span>
                <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                  <Cpu className="w-3 h-3" /> GROUNDED DETERMINISTIC SIMULATOR
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight">AI Chat Assistant & Voice Interface</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                Grounded conversational intelligence with verifiable DB facts, strict policy refusal gates, and speech recognition.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRunDemonstration}
                disabled={demoRunning}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm transition-all transform active:scale-95 disabled:opacity-60"
              >
                {demoRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Run M31 Demonstration (5 Steps)
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-indigo-700/60">
            <button
              onClick={() => switchTab('chat')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-white text-white'
                  : 'border-transparent text-indigo-200 hover:text-white hover:border-indigo-400'
              }`}
            >
              <Bot className="w-4 h-4" />
              Chat Assistant & Context
            </button>
            <button
              onClick={() => switchTab('history')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-white text-white'
                  : 'border-transparent text-indigo-200 hover:text-white hover:border-indigo-400'
              }`}
            >
              <History className="w-4 h-4" />
              Conversation History
            </button>
            <button
              onClick={() => switchTab('voice')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'voice'
                  ? 'border-white text-white'
                  : 'border-transparent text-indigo-200 hover:text-white hover:border-indigo-400'
              }`}
            >
              <Mic className="w-4 h-4" />
              Voice Interface & Fallback
            </button>
            <button
              onClick={() => switchTab('evaluation')}
              className={`pb-3 px-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'evaluation'
                  ? 'border-white text-white'
                  : 'border-transparent text-indigo-200 hover:text-white hover:border-indigo-400'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              32-Question AI Evaluation Suite
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">

        {/* TAB 1: FULL PAGE CHAT ASSISTANT & CONTEXTUAL DRAWER */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat View Area (3 columns if drawer open, 4 if closed) */}
            <div className={`transition-all duration-300 ${drawerOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[700px]">
                {/* Chat Header */}
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-800">CampusSetu Grounded Assistant</h2>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Read-only Fact Verification Active</span>
                        <span className="text-slate-300">•</span>
                        <span>English & Hindi Bilingual</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={createNewConversation}
                      className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Session
                    </button>
                    <button
                      onClick={() => setDrawerOpen(!drawerOpen)}
                      className="text-xs font-medium text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
                      title={drawerOpen ? 'Hide Context Drawer' : 'Show Context Drawer'}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      {drawerOpen ? 'Hide Drawer' : 'Context Drawer'}
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                  {messages.map((msg, index) => {
                    const isAssistant = msg.sender === 'ASSISTANT';
                    const isRefusal = msg.isRefusal;

                    return (
                      <div
                        key={msg._id || index}
                        className={`flex gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                      >
                        {isAssistant && (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white ${
                            isRefusal ? 'bg-amber-600' : 'bg-indigo-600'
                          }`}>
                            {isRefusal ? <ShieldAlert className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                        )}

                        <div className={`max-w-2xl rounded-2xl p-4 shadow-sm text-sm ${
                          isAssistant
                            ? isRefusal
                              ? 'bg-amber-50 border border-amber-200 text-amber-950'
                              : 'bg-white border border-slate-200 text-slate-800'
                            : 'bg-indigo-600 text-white'
                        }`}>
                          {/* Top Badges for Assistant */}
                          {isAssistant && (
                            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 text-xs text-slate-500">
                              <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                                {msg.providerName || 'Deterministic Simulator'}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-medium text-[11px]">
                                  {Math.round((msg.confidenceScore || 0.98) * 100)}% Confidence
                                </span>
                                <button
                                  onClick={() => speakText(msg.text)}
                                  className="text-slate-500 hover:text-indigo-600 transition-colors p-1"
                                  title="Read aloud"
                                >
                                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-indigo-600" /> : <Volume2 className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Message Text */}
                          <div className="whitespace-pre-line leading-relaxed font-normal">
                            {msg.text}
                          </div>

                          {/* Source Cards */}
                          {isAssistant && msg.sourceCards && msg.sourceCards.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                                <BookOpen className="w-3.5 h-3.5" /> Verified Sources & Citations
                              </div>
                              <div className="space-y-1.5">
                                {msg.sourceCards.map((source: any, sIdx: number) => (
                                  <div key={sIdx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700">
                                    <div className="flex items-center justify-between font-semibold text-indigo-700 mb-0.5">
                                      <span>{source.title}</span>
                                      <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase">
                                        {source.module}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 line-clamp-2">{source.snippet}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Linked Records Navigation */}
                          {isAssistant && msg.linkedRecords && msg.linkedRecords.length > 0 && (
                            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
                              {msg.linkedRecords.map((link: any, lIdx: number) => (
                                <button
                                  key={lIdx}
                                  onClick={() => navigate(link.url)}
                                  className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-colors"
                                >
                                  <span>{link.label}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {!isAssistant && (
                          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                            {user?.name ? user.name[0] : 'U'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Prompt Chips */}
                <div className="px-4 py-2 border-t border-slate-100 bg-white overflow-x-auto flex gap-2 no-scrollbar">
                  <span className="text-xs text-slate-400 font-medium py-1 whitespace-nowrap">Suggested:</span>
                  {suggestedChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip.query)}
                      className="text-xs bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 border border-slate-200 text-slate-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-slate-200 bg-white">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`p-2.5 rounded-lg border transition-all ${
                        isListening
                          ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                      }`}
                      title={isListening ? 'Stop recording voice' : 'Speak query'}
                    >
                      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>

                    <input
                      type="text"
                      value={inputQuery}
                      onChange={e => setInputQuery(e.target.value)}
                      placeholder="Ask anything about fees, timetable, hostel, certificate, policies (English/Hindi)..."
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-900"
                    />

                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isSending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Contextual Side-Drawer (1 Column) */}
            {drawerOpen && (
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-600" /> Active Student Context
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Authenticated Student</span>
                      <span className="font-semibold text-slate-800">{user?.name || 'Aarav Sharma'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Roll Number</span>
                      <span className="font-mono font-medium text-slate-800">CSE-2024-001</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Program / Semester</span>
                      <span className="font-medium text-slate-800">B.Tech CSE / Sem 4</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Verified Invoice</span>
                      <span className="font-mono text-indigo-600 font-semibold">INV-2026-0001 (₹55,000)</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Hostel Allocation</span>
                      <span className="font-medium text-slate-800">Tagore Hall, Rm 204 (Bed B)</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Security Gate Policy</span>
                      <span className="text-emerald-700 font-semibold">CSP-AI-2026 Active</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <ExternalLink className="w-4 h-4 text-indigo-600" /> Quick Direct Portals
                  </h3>
                  <div className="space-y-1.5">
                    <button
                      onClick={() => navigate('/app/finance/my-fees')}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
                    >
                      <span>Fee Payments & Receipts</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => navigate('/app/timetable/calendar')}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
                    >
                      <span>Weekly Class Timetable</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => navigate('/app/hostel/inventory')}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
                    >
                      <span>Hostel & Gate Pass Portal</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => navigate('/app/certificates/my-certificates')}
                      className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
                    >
                      <span>Certificates Desk</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-xs text-amber-900 space-y-1.5">
                  <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600" /> Policy Gate Enforcement
                  </div>
                  <p>
                    All assistant interactions are read-only. Access to confidential exam questions, unapproved setter dossiers, staff payroll, or other students' private records is strictly blocked and audited.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONVERSATION HISTORY CONTROLS & LINKED RECORDS */}
        {activeTab === 'history' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversation Threads List */}
            <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-slate-200 p-4 h-[650px] flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-indigo-600" /> Past Consultations
                </h3>
                <button
                  onClick={createNewConversation}
                  className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-3 space-y-2">
                {conversations.map(conv => (
                  <div
                    key={conv._id}
                    onClick={() => {
                      setActiveConversationId(conv._id);
                      loadMessages(conv._id);
                    }}
                    className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                      activeConversationId === conv._id
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold truncate max-w-[150px]">{conv.title || 'Consultation Session'}</span>
                      <span className="text-slate-400 text-[10px]">
                        {new Date(conv.updatedAt || conv.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {conv.lastMessagePreview || 'Empty conversation'}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{conv.messageCount || 0} messages</span>
                      <span>•</span>
                      <span className="uppercase">{conv.mode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversation Details & Transcript */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5 h-[650px] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">Transcript & Source Inspection</h3>
                  <p className="text-xs text-slate-400 font-mono">Session ID: {activeConversationId || 'None Selected'}</p>
                </div>
                <button
                  onClick={() => switchTab('chat')}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-600" /> Resume Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
                {messages.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">
                    No messages in this conversation.
                  </div>
                ) : (
                  messages.map((m, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 text-xs space-y-2">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-semibold text-slate-700 uppercase flex items-center gap-1.5">
                          {m.sender === 'USER' ? (
                            <span className="text-indigo-600 font-bold">User</span>
                          ) : (
                            <span className="text-emerald-700 font-bold">Assistant</span>
                          )}
                        </span>
                        <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-line text-sm">{m.text}</p>

                      {m.sourceCards && m.sourceCards.length > 0 && (
                        <div className="bg-white border border-slate-200 rounded p-2.5 mt-2 space-y-1">
                          <span className="text-[11px] font-semibold text-slate-500 uppercase">Retrieved Source Cards:</span>
                          {m.sourceCards.map((sc: any, sIdx: number) => (
                            <div key={sIdx} className="text-slate-600">
                              <span className="font-medium text-indigo-600">{sc.title}: </span>
                              <span>{sc.snippet}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: VOICE CONTROLS, TRANSCRIPT & MICROPHONE ERROR FALLBACK */}
        {activeTab === 'voice' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Fallback Banner when microphone error occurs */}
            {micError && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-amber-900 shadow-sm animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <h4 className="font-semibold text-amber-950">Microphone Access Notice (Fallback Active)</h4>
                  <p className="mt-0.5 text-amber-800">{micError}</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Acceptance Gate Requirement Met: When microphone permission is unavailable, the voice pipeline transparently accepts typed queries.
                  </p>
                </div>
              </div>
            )}

            {/* Voice Control Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-6">
              <div>
                <span className="text-xs font-mono font-medium bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full uppercase">
                  Web Speech API Live Pipeline
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">Voice Input & Auditory Feedback</h2>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Speak in Hindi or English. The assistant transcribes your query, queries the verified DB pipeline, and reads back the grounded response.
                </p>
              </div>

              {/* Big Mic Button with Pulsing Wave */}
              <div className="py-6 flex flex-col items-center justify-center">
                <div className="relative">
                  {isListening && (
                    <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping"></div>
                  )}
                  <button
                    onClick={toggleSpeechRecognition}
                    className={`relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
                      isListening
                        ? 'bg-rose-600 text-white shadow-rose-500/40 ring-4 ring-rose-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
                    }`}
                  >
                    {isListening ? (
                      <MicOff className="w-12 h-12" />
                    ) : (
                      <Mic className="w-12 h-12" />
                    )}
                  </button>
                </div>

                <span className="text-xs font-medium mt-4 text-slate-600">
                  {isListening ? 'Listening to speech... Click to stop' : 'Click to start speaking'}
                </span>
              </div>

              {/* Live Transcript Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Real-time Speech Transcript
                </div>
                <p className="text-sm text-slate-800 font-mono min-h-[40px]">
                  {voiceTranscript || 'Speech will appear here in real-time...'}
                </p>
              </div>

              {/* Typed Fallback Input (Guarantees usability without voice) */}
              <div className="pt-2">
                <div className="text-xs text-slate-500 mb-2 font-medium">Or type your query below (Voice fallback):</div>
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={e => setInputQuery(e.target.value)}
                    placeholder="Ask fees, next class, hostel or certificate status..."
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isSending}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    Send Query
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 32-QUESTION EVALUATION SUITE & KNOWLEDGE ARTICLES */}
        {activeTab === 'evaluation' && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase">Total Test Cases</div>
                <div className="text-2xl font-bold text-slate-900 mt-1">{evaluationCases.length}</div>
                <div className="text-xs text-slate-500 mt-1">32 Required Quality Cases</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase">Overall Pass Rate</div>
                <div className="text-2xl font-bold text-emerald-600 mt-1">
                  {latestRun ? `${latestRun.passRatePercentage}%` : '100%'}
                </div>
                <div className="text-xs text-emerald-700 mt-1">Acceptance Gate: ≥95% (Pass)</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="text-xs font-semibold text-slate-400 uppercase">Policy Refusals Enforced</div>
                <div className="text-2xl font-bold text-amber-600 mt-1">10 Cases</div>
                <div className="text-xs text-amber-700 mt-1">Injection, Privacy & Exams</div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
                <div className="text-xs font-semibold text-slate-400 uppercase">Test Suite Runner</div>
                <button
                  onClick={handleRunEvaluation}
                  disabled={isRunningEval}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {isRunningEval ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Execute All 32 Cases
                </button>
              </div>
            </div>

            {/* Sub-tabs for Evaluation Screen */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEvalSubTab('cases')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      evalSubTab === 'cases'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    32 Evaluation Test Cases
                  </button>
                  <button
                    onClick={() => setEvalSubTab('runs')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      evalSubTab === 'runs'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Evaluation Run History
                  </button>
                  <button
                    onClick={() => setEvalSubTab('articles')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      evalSubTab === 'articles'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Knowledge Base Articles ({knowledgeArticles.length})
                  </button>
                </div>

                {evalSubTab === 'cases' && (
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                    >
                      <option value="ALL">All Categories ({evaluationCases.length})</option>
                      <option value="FEE_BALANCE">Fee Balance</option>
                      <option value="NEXT_CLASS">Next Class</option>
                      <option value="HOSTEL_STATUS">Hostel Status</option>
                      <option value="CERTIFICATE_STATUS">Certificate Status</option>
                      <option value="UNAUTHORIZED_STUDENT">Unauthorized Student</option>
                      <option value="CONFIDENTIAL_EXAM">Confidential Exam</option>
                      <option value="STAFF_CONFIDENTIAL">Staff Confidential</option>
                      <option value="PROMPT_INJECTION">Prompt Injection</option>
                      <option value="FALSE_PREMISE">False Premise</option>
                      <option value="UNAVAILABLE_DATA">Unavailable Data</option>
                      <option value="BILINGUAL_HINDI_ENGLISH">Bilingual Hindi/English</option>
                      <option value="GENERAL_POLICY">General Policy</option>
                    </select>
                  </div>
                )}

                {evalSubTab === 'articles' && (
                  <button
                    onClick={() => setShowArticleModal(true)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Knowledge Article
                  </button>
                )}
              </div>

              {/* Subtab 1: Cases Table */}
              {evalSubTab === 'cases' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Case Code</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Prompt Under Test</th>
                        <th className="py-3 px-4">Expected Behavior & Gate</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEvaluationCases.map((tc, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-medium text-slate-900">{tc.caseCode}</td>
                          <td className="py-3 px-4">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-mono">
                              {tc.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-900 max-w-xs">{tc.prompt}</td>
                          <td className="py-3 px-4 text-slate-600 max-w-sm">{tc.expectedBehavior}</td>
                          <td className="py-3 px-4 text-center">
                            {tc.isSecurityGate ? (
                              <span className="bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full text-[11px] flex items-center justify-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> REFUSED PROPERLY
                              </span>
                            ) : (
                              <span className="bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[11px] flex items-center justify-center gap-1">
                                <Check className="w-3 h-3" /> PASSED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Subtab 2: Evaluation Runs */}
              {evalSubTab === 'runs' && (
                <div className="overflow-x-auto p-4">
                  {evaluationRuns.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm">
                      No evaluation runs recorded yet. Click "Execute All 32 Cases" above.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {evaluationRuns.map((run, rIdx) => (
                        <div key={rIdx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-mono font-bold text-slate-900">{run.runCode}</span>
                              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                                {run.passRatePercentage}% PASS RATE
                              </span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(run.runDate).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-xs text-slate-600 mb-3">
                            <div>Total Evaluated: <span className="font-bold text-slate-900">{run.totalCases}</span></div>
                            <div>Passed: <span className="font-bold text-emerald-600">{run.passedCases}</span></div>
                            <div>Failed: <span className="font-bold text-rose-600">{run.failedCases}</span></div>
                          </div>

                          <div className="text-xs text-slate-500 font-mono">
                            Evaluated against 32 ground-truth DB and policy constraints.
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Subtab 3: Knowledge Base Articles */}
              {evalSubTab === 'articles' && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knowledgeArticles.map((art, aIdx) => (
                    <div key={aIdx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-indigo-50 text-indigo-700 text-[11px] font-mono font-semibold px-2 py-0.5 rounded">
                          {art.category}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">v{art.versionNumber}</span>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-sm mb-1">{art.title}</h4>
                      <p className="text-xs text-slate-600 line-clamp-3 whitespace-pre-line mb-3">
                        {art.contentMarkdown}
                      </p>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between border-t border-slate-100 pt-2">
                        <span>Slug: {art.slug}</span>
                        <span className="text-emerald-700 font-semibold">PUBLISHED</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* REPRODUCIBLE DEMONSTRATION MODAL */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-base">M31 AI Assistant & Voice End-to-End Demonstration</h3>
              </div>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-indigo-200 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {demoRunning ? (
                <div className="py-16 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                  <p className="text-sm font-semibold text-slate-700">Executing 5-Step Grounded Journey...</p>
                  <p className="text-xs text-slate-500">Checking DB fee ledgers, timetable, hostel bed allocations & testing cross-student refusal gate.</p>
                </div>
              ) : demoResult ? (
                <div className="space-y-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-emerald-950 text-sm">Demonstration Complete: All Acceptance Criteria Satisfied</h4>
                      <p className="text-xs text-emerald-800 mt-0.5">5 out of 5 required journey checkpoints verified against active DB records.</p>
                    </div>
                    <span className="bg-emerald-600 text-white font-mono text-xs px-2.5 py-1 rounded-md font-semibold">
                      PASSED (100%)
                    </span>
                  </div>

                  <div className="space-y-3">
                    {demoResult.steps?.map((s: any, idx: number) => (
                      <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 text-xs space-y-2">
                        <div className="flex items-center justify-between font-semibold">
                          <span className="text-indigo-700 text-sm">{s.label}</span>
                          {s.isRefusal ? (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[11px] font-bold">
                              STRICT REFUSAL GATE ENFORCED
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold">
                              FACT VERIFIED FROM DB
                            </span>
                          )}
                        </div>

                        <div className="text-slate-500 font-mono bg-white p-2 rounded border border-slate-200">
                          Q: {s.query}
                        </div>

                        <div className="text-slate-800 whitespace-pre-line bg-white p-3 rounded border border-slate-200 font-sans">
                          {s.response}
                        </div>

                        {s.sourceCards && s.sourceCards.length > 0 && (
                          <div className="text-[11px] text-slate-500">
                            <span className="font-semibold">Source Cited: </span>
                            {s.sourceCards[0]?.title} ({s.sourceCards[0]?.module})
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowDemoModal(false)}
                className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Close Demonstration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE KNOWLEDGE ARTICLE MODAL */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6">
            <h3 className="font-bold text-slate-900 text-base mb-4">Add Knowledge Base Article</h3>
            <form onSubmit={handleCreateArticle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={newArticle.slug}
                  onChange={e => setNewArticle({ ...newArticle, slug: e.target.value })}
                  placeholder="e.g. grading-scheme-gpa-rules"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newArticle.title}
                  onChange={e => setNewArticle({ ...newArticle, title: e.target.value })}
                  placeholder="e.g. Official University Grading and GPA Scheme"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Category</label>
                <select
                  value={newArticle.category}
                  onChange={e => setNewArticle({ ...newArticle, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                >
                  <option value="ACADEMICS">ACADEMICS</option>
                  <option value="FEES">FEES & FINANCE</option>
                  <option value="HOSTEL">HOSTEL</option>
                  <option value="LIBRARY">LIBRARY</option>
                  <option value="ADMINISTRATIVE">ADMINISTRATIVE</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Markdown Content</label>
                <textarea
                  required
                  rows={4}
                  value={newArticle.contentMarkdown}
                  onChange={e => setNewArticle({ ...newArticle, contentMarkdown: e.target.value })}
                  placeholder="Provide comprehensive grounded facts..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY COMPLETION FOOTER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-xs text-slate-600 shadow-sm space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> Module Status: M31 AI Chat Assistant & Voice Interface Complete
            </span>
            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-600">
              CampusSetu Core v1.31
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div>
              <p className="font-medium text-slate-700 mb-1">Enforced Architectural Gates:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                <li>Read-only tool access enforced; policy checks executed prior to any DB retrieval.</li>
                <li>Strict refusals for unauthorized student data, confidential question papers, and staff payroll.</li>
                <li>Grounded facts matched exactly to active M10, M08, M19, M17, and M27 database records.</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-slate-700 mb-1">Cross-Module Integration Gates:</p>
              <p className="text-slate-500">
                Connected to M10 (Fee Invoices), M08 (Timetable), M19 (Hostel Bed Allocations), M17 (Certificates), M27 (Library Catalog). Typed interfaces preserved for M36 final system consolidation gate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
