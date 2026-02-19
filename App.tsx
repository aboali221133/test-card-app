
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, LogOut, BookOpen, Camera as CameraIcon, 
  Wand2, Trash2, BrainCircuit, Loader2, Settings, Key, X, 
  AlertCircle, CheckCircle2, Play, ChevronRight, Trophy, 
  RotateCcw, HelpCircle, FileText, ChevronLeft, LayoutGrid,
  Library, MoreVertical, GraduationCap, CheckSquare, Square,
  Zap, ListChecks, ArrowLeftCircle, Star, History, Copy, ClipboardCheck,
  Calendar, Trash, Edit3, Languages, Globe, Info, ExternalLink,
  Cpu, ZapOff, CloudLightning, ShieldCheck, ShieldAlert,
  Check, XCircle
} from 'lucide-react';
import { supabase } from './services/supabase';
import { 
  extractTextFromImages, 
  getAIAnswer, 
  generateQuizOptions, 
  gradeWrittenAnswer,
  assignDifficultyPoints,
  hasValidKey,
  testApiKey
} from './services/geminiService';
import { 
  localExtractText, 
  generateLocalDistractors, 
  localGradeAnswer 
} from './services/localService';
import CameraScanner from './components/CameraScanner';
import { User, Flashcard, Subject } from './types';

type Language = 'ar' | 'en' | 'de';

const translations = {
  ar: {
    appName: "FlashMind",
    tagline: "مساعد المذاكرة الذكي",
    login: "تسجيل الدخول",
    register: "اشترك الآن",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    subjects: "حقيبة المواد",
    newSubject: "مادة جديدة",
    subjectName: "اسم المادة",
    create: "إنشاء",
    search: "البحث في",
    selectionMode: "تحديد أسئلة",
    cancelSelection: "إلغاء التحديد",
    startQuiz: "اختبار عشوائي",
    startSelected: "اختبار المحدد",
    history: "سجل الاختبارات",
    addCard: "إضافة بطاقة ذكية",
    editCard: "تعديل البطاقة",
    question: "السؤال أو المفهوم..",
    answer: "الإجابة التفصيلية..",
    save: "حفظ",
    aiAnswer: "توليد بالذكاء الاصطناعي",
    points: "نقطة",
    finish: "تم الإنجاز!",
    back: "العودة",
    deleteConfirm: "هل أنت متأكد من الحذف؟",
    noHistory: "لا توجد سجلات بعد..",
    apiKey: "مفتاح API",
    manualKey: "لصق يدوي للمفتاح",
    testKey: "فحص الاتصال",
    manageKey: "اختيار مفتاح النظام",
    keyValid: "مفتاح صالح! تم الربط بنجاح",
    keyInvalid: "مفتاح غير صالح. يرجى التأكد.",
    preparingQuiz: "جاري تجهيز الاختبار..",
    extractingText: "جاري استخراج النصوص..",
    generatingAnswer: "جاري توليد الإجابة بذكاء..",
    success: "تمت العملية بنجاح",
    error: "حدث خطأ ما، يرجى المحاولة لاحقاً",
    ocrSuccess: "تم استخراج النص بنجاح!",
    ocrFailed: "فشل استخراج النص، جرب إضاءة أفضل.",
    settings: "الإعدادات",
    aiModeActive: "نمط الذكاء الاصطناعي",
    offlineMode: "النمط المحلي (Local)",
    noAiNotice: "تنبيه: تعمل حالياً في النمط المحلي بدون ذكاء اصطناعي.",
    switchToLocal: "التحويل للنمط المحلي",
    aiStatus: "حالة الذكاء الاصطناعي",
    deleteSuccess: "تم الحذف بنجاح",
    copied: "تم النسخ إلى الحافظة",
    editCardSuccess: "تم تعديل البطاقة بنجاح",
    addCardSuccess: "تم إضافة البطاقة بنجاح",
    questionCountHint: "عدد الأسئلة (بحد أقصى {max})",
    reviewAnswers: "مراجعة الإجابات",
    yourAnswer: "إجابتك",
    correctAnswer: "الإجابة الصحيحة",
    score: "النتيجة النهائية"
  },
  en: {
    appName: "FlashMind",
    tagline: "Smart Study Assistant",
    login: "Login",
    register: "Sign Up",
    username: "Username",
    password: "Password",
    subjects: "Subjects",
    newSubject: "New Subject",
    subjectName: "Subject Name",
    create: "Create",
    search: "Search in",
    selectionMode: "Select",
    cancelSelection: "Cancel",
    startQuiz: "Random Quiz",
    startSelected: "Quiz Selected",
    history: "History",
    addCard: "Add Card",
    editCard: "Edit Card",
    question: "Question...",
    answer: "Answer...",
    save: "Save",
    aiAnswer: "Generate Answer",
    points: "pts",
    finish: "Well Done!",
    back: "Back",
    deleteConfirm: "Confirm delete?",
    noHistory: "No history found.",
    apiKey: "API Key",
    manualKey: "Manual Key",
    testKey: "Test Connection",
    manageKey: "System Key",
    keyValid: "Key Valid! Connected.",
    keyInvalid: "Invalid Key. Check and retry.",
    preparingQuiz: "Preparing quiz...",
    extractingText: "Extracting text...",
    generatingAnswer: "Generating answer...",
    success: "Success",
    error: "Error occurred",
    ocrSuccess: "Text extracted!",
    ocrFailed: "Extraction failed.",
    settings: "Settings",
    aiModeActive: "AI Mode",
    offlineMode: "Local Mode",
    noAiNotice: "Notice: Operating in Local mode.",
    switchToLocal: "Switch to Local",
    aiStatus: "AI Status",
    deleteSuccess: "Deleted successfully",
    copied: "Copied to clipboard",
    editCardSuccess: "Card updated successfully",
    addCardSuccess: "Card added successfully",
    questionCountHint: "Number of questions (Max {max})",
    reviewAnswers: "Review Answers",
    yourAnswer: "Your Answer",
    correctAnswer: "Correct Answer",
    score: "Final Score"
  },
  de: {
    appName: "FlashMind",
    tagline: "Lernhelfer",
    login: "Login",
    register: "Sign Up",
    username: "Nutzer",
    password: "Passwort",
    subjects: "Fächer",
    newSubject: "Neues Fach",
    subjectName: "Fachname",
    create: "Erstellen",
    search: "Suchen",
    selectionMode: "Wählen",
    cancelSelection: "Abbrechen",
    startQuiz: "Zufallsquiz",
    startSelected: "Wahlquiz",
    history: "Verlauf",
    addCard: "Hinzufügen",
    editCard: "Bearbeiten",
    question: "Frage...",
    answer: "Antwort...",
    save: "Speichern",
    aiAnswer: "KI-Antwort",
    points: "Pkt",
    finish: "Fertig!",
    back: "Zurück",
    deleteConfirm: "Löschen?",
    noHistory: "Kein Verlauf.",
    apiKey: "API-Key",
    manualKey: "Manueller Key",
    testKey: "Testen",
    manageKey: "System-Key",
    keyValid: "Key gültig!",
    keyInvalid: "Ungültig.",
    preparingQuiz: "Quiz bereit..",
    extractingText: "Text extrahieren..",
    generatingAnswer: "Antwort generieren..",
    success: "Erfolg",
    error: "Fehler",
    ocrSuccess: "Text extrahiert!",
    ocrFailed: "Fehlgeschlagen.",
    settings: "Einstellungen",
    aiModeActive: "KI-Modus",
    offlineMode: "Lokal-Modus",
    noAiNotice: "Hinweis: Lokal-Modus.",
    switchToLocal: "Auf Lokal wechseln",
    aiStatus: "KI-Status",
    deleteSuccess: "Erfolgreich gelöscht",
    copied: "In Zwischenablage kopiert",
    editCardSuccess: "Karte erfolgreich aktualisiert",
    addCardSuccess: "Karte erfolgreich hinzugefügt",
    questionCountHint: "Anzahl der Fragen (Max {max})",
    reviewAnswers: "Antworten überprüfen",
    yourAnswer: "Ihre Antwort",
    correctAnswer: "Richtige Antwort",
    score: "Endergebnis"
  }
};

interface QuizQuestion extends Flashcard {
  options?: string[];
  userSelection?: string;
  isCorrect?: boolean;
  aiFeedback?: string;
  isGrading?: boolean;
  points?: number;
}

interface QuizRecord {
  id: string;
  score: number;
  total_possible: number;
  quiz_type: string;
  created_at: string;
}

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>((localStorage.getItem('app_lang') as Language) || 'ar');
  const t = translations[lang];
  const isRtl = lang === 'ar';

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [isQuizPreparing, setIsQuizPreparing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);

  // Modes and Keys
  const [manualKey, setManualKey] = useState(localStorage.getItem('manual_api_key') || '');
  const [isLocalMode, setIsLocalMode] = useState(localStorage.getItem('force_local') === 'true');
  const [keyTesting, setKeyTesting] = useState(false);
  
  const aiAvailable = hasValidKey(manualKey) && !isLocalMode;

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  const [showQuizSetup, setShowQuizSetup] = useState(false);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizConfig, setQuizConfig] = useState({ count: 5, type: 'mcq' as 'mcq' | 'written' });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizStep, setCurrentQuizStep] = useState(0);
  const [quizResults, setQuizResults] = useState<{ score: number, totalPossible: number, count: number } | null>(null);
  const [writtenAnswerInput, setWrittenAnswerInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('app_user_session');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    localStorage.setItem('app_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('force_local', isLocalMode.toString());
  }, [isLocalMode]);

  useEffect(() => {
    if (currentUser) fetchSubjects();
  }, [currentUser]);

  useEffect(() => {
    if (selectedSubject) {
      fetchFlashcards();
      fetchQuizHistory();
      setSelectionMode(false);
      setSelectedCardIds(new Set());
    }
  }, [selectedSubject]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const handleTestKey = async () => {
    if (!manualKey) return;
    setKeyTesting(true);
    const valid = await testApiKey(manualKey);
    setKeyTesting(false);
    if (valid) {
      localStorage.setItem('manual_api_key', manualKey);
      addToast(t.keyValid, 'success');
    } else {
      addToast(t.keyInvalid, 'error');
    }
  };

  const fetchSubjects = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('subjects').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false });
      if (error) throw error;
      setSubjects(data || []);
    } catch { addToast(t.error, 'error'); }
    finally { setLoading(false); }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !newSubjectName.trim() || loading) return;
    setLoading(true);
    try {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const { data, error } = await supabase.from('subjects').insert([{ user_id: currentUser.id, name: newSubjectName.trim(), color }]).select().single();
      if (error) throw error;
      if (data) {
        setSubjects(prev => [data, ...prev]);
        setNewSubjectName('');
        setShowSubjectModal(false);
        setSelectedSubject(data);
        addToast(t.success);
      }
    } catch { addToast(t.error, 'error'); }
    finally { setLoading(false); }
  };

  const deleteSubject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm(t.deleteConfirm)) {
      setLoading(true);
      try {
        await supabase.from('subjects').delete().eq('id', id);
        addToast(t.deleteSuccess);
        fetchSubjects();
      } catch { addToast(t.error, 'error'); }
      finally { setLoading(false); }
    }
  };

  const fetchFlashcards = async () => {
    if (!currentUser || !selectedSubject) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('flashcards').select('*').eq('subject_id', selectedSubject.id).order('created_at', { ascending: false });
      if (error) throw error;
      setFlashcards(data || []);
    } catch { addToast(t.error, 'error'); }
    finally { setLoading(false); }
  };

  const fetchQuizHistory = async () => {
    if (!currentUser || !selectedSubject) return;
    const { data, error } = await supabase.from('quiz_results').select('*').eq('subject_id', selectedSubject.id).order('created_at', { ascending: false });
    if (!error) setQuizHistory(data || []);
  };

  const handleCopy = (card: Flashcard) => {
    const text = `${t.question}: ${card.question}\n${t.answer}: ${card.answer}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(card.id);
      addToast(t.copied);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const toggleCardSelection = (id: string) => {
    setSelectedCardIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startQuiz = async (fromSelection: boolean = false) => {
    if (isQuizPreparing) return;
    
    // 1. Select Cards
    let cardsToUse = fromSelection 
      ? flashcards.filter(c => selectedCardIds.has(c.id))
      : [...flashcards].sort(() => 0.5 - Math.random()).slice(0, Math.min(quizConfig.count, flashcards.length));

    if (!cardsToUse || cardsToUse.length === 0) return addToast(t.subjects, 'info');
    
    setIsQuizPreparing(true);
    
    try {
      // 2. Prepare Questions Data
      const preparedQuestions: QuizQuestion[] = [];
      const questionsText = cardsToUse.map(c => c.question);
      
      // Determine if we should ATTEMPT AI
      const shouldUseAI = aiAvailable && !isLocalMode;

      // Try to get points from AI if enabled, fallback to 5
      let points: number[] = [];
      if (shouldUseAI) {
        try {
           points = await assignDifficultyPoints(questionsText, manualKey);
        } catch (e) {
           console.warn("AI Points failed, defaulting to 5", e);
           points = questionsText.map(() => 5);
        }
      } else {
        points = questionsText.map(() => 5);
      }

      // 3. Process each card
      for (let i = 0; i < cardsToUse.length; i++) {
        const card = cardsToUse[i];
        const q: QuizQuestion = { ...card, points: points[i] || 5 };
        
        if (quizConfig.type === 'mcq') {
          let distractors: string[] = [];
          
          if (shouldUseAI) {
            try {
              distractors = await generateQuizOptions(card.question, card.answer, manualKey);
              if (!distractors || distractors.length < 1) throw new Error("Empty AI options");
            } catch (err) {
              console.warn("AI MCQ generation failed, falling back to local immediately", err);
              // Fallback to local immediately
              distractors = generateLocalDistractors(card.answer, flashcards);
            }
          } else {
            // Local mode forced
            distractors = generateLocalDistractors(card.answer, flashcards);
          }
          
          q.options = [...distractors, card.answer].sort(() => 0.5 - Math.random());
        }
        
        preparedQuestions.push(q);
      }

      setQuizQuestions(preparedQuestions);
      setQuizResults(null);
      setCurrentQuizStep(0);
      setWrittenAnswerInput('');
      setIsQuizActive(true);
      setShowQuizSetup(false);
      addToast(t.success);

    } catch (error) {
       console.error("Quiz preparation fatal error", error);
       addToast(t.error, 'error');
    } finally {
      setIsQuizPreparing(false);
    }
  };

  const submitQuizAnswer = async (answer: string) => {
    if (!answer.trim()) return;
    const updated = [...quizQuestions];
    const current = updated[currentQuizStep];
    current.userSelection = answer;
    
    const shouldUseAI = aiAvailable && !isLocalMode;

    if (quizConfig.type === 'mcq') {
      current.isCorrect = answer === current.answer;
      current.aiFeedback = current.isCorrect ? (isRtl ? "أحسنت!" : "Correct!") : (isRtl ? "الإجابة الصحيحة هي: " : "Correct answer is: ") + current.answer;
      finishStep(updated);
    } else {
      current.isGrading = true;
      setQuizQuestions(updated);
      try {
        if (shouldUseAI) {
          try {
            const result = await gradeWrittenAnswer(current.question, current.answer, answer, manualKey);
            current.isCorrect = result.isCorrect;
            current.aiFeedback = result.feedback;
          } catch {
             // AI Grade Failed, Fallback
             const result = localGradeAnswer(current.answer, answer);
             current.isCorrect = result.isCorrect;
             current.aiFeedback = result.feedback + " (Local Fallback)";
          }
        } else {
          const result = localGradeAnswer(current.answer, answer);
          current.isCorrect = result.isCorrect;
          current.aiFeedback = result.feedback;
        }
      } catch {
        current.isCorrect = false;
        current.aiFeedback = "Grade error";
      }
      current.isGrading = false;
      finishStep(updated);
    }
  };

  const finishStep = (updated: QuizQuestion[]) => {
    setQuizQuestions(updated);
    if (currentQuizStep < quizQuestions.length - 1) {
      setTimeout(() => {
        setCurrentQuizStep(prev => prev + 1);
        setWrittenAnswerInput('');
      }, 500);
    } else {
      const score = updated.reduce((acc, q) => q.isCorrect ? acc + (q.points || 5) : acc, 0);
      const totalPossible = updated.reduce((acc, q) => acc + (q.points || 5), 0);
      setQuizResults({ score, totalPossible, count: updated.length });
      supabase.from('quiz_results').insert([{
        user_id: currentUser!.id,
        subject_id: selectedSubject!.id,
        score,
        total_possible: totalPossible,
        quiz_type: quizConfig.type
      }]).then(() => fetchQuizHistory());
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (isRegistering) {
        const { data, error } = await supabase.from('app_users').insert([{ username, password }]).select().single();
        if (error) throw error;
        localStorage.setItem('app_user_session', JSON.stringify(data));
        setCurrentUser(data);
      } else {
        const { data, error } = await supabase.from('app_users').select('*').eq('username', username).eq('password', password).single();
        if (error || !data) throw new Error();
        localStorage.setItem('app_user_session', JSON.stringify(data));
        setCurrentUser(data);
      }
      addToast(t.success);
    } catch { addToast(t.error, 'error'); }
    finally { setLoading(false); }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedSubject || !newQuestion || !newAnswer || loading) return;
    setLoading(true);
    try {
      if (editingCard) {
        await supabase.from('flashcards').update({ question: newQuestion, answer: newAnswer }).eq('id', editingCard.id);
        addToast(t.editCardSuccess);
      } else {
        await supabase.from('flashcards').insert([{ user_id: currentUser.id, subject_id: selectedSubject.id, question: newQuestion, answer: newAnswer }]);
        addToast(t.addCardSuccess);
      }
      setNewQuestion(''); setNewAnswer(''); setShowAddModal(false); setEditingCard(null); fetchFlashcards();
    } catch { addToast(t.error, 'error'); }
    finally { setLoading(false); }
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery) return flashcards;
    return flashcards.filter(card => 
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      card.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [flashcards, searchQuery]);

  return (
    <div className={`min-h-screen bg-[#fcfdfe] text-gray-900 pb-28 md:pb-12 font-['Cairo']`} dir={isRtl ? "rtl" : "ltr"}>
      {/* Toasts Container */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 w-full max-w-sm px-4">
        {toasts.map(toast => (
          <div key={toast.id} className={`p-4 rounded-3xl shadow-2xl flex items-center gap-4 animate-in border ${
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
            toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
          }`}>
            {toast.type === 'success' ? <CheckCircle2 size={24} /> : toast.type === 'error' ? <AlertCircle size={24} /> : <Info size={24} />}
            <span className="font-bold text-sm leading-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {!currentUser ? (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md border border-indigo-50 animate-in">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl">
                <BrainCircuit size={40} />
              </div>
              <h1 className="text-4xl font-black text-gray-900">{t.appName}</h1>
              <p className="text-gray-500 mt-2 font-medium">{t.tagline}</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="text" placeholder={t.username} required className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input type="password" placeholder={t.password} required className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center justify-center">
                {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? t.register : t.login)}
              </button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="w-full mt-6 text-indigo-600 font-bold text-sm text-center">
              {isRegistering ? t.login : t.register}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* AI Status Banner with Toggle */}
          <div className={`py-3 px-6 flex items-center justify-between gap-4 text-xs font-black uppercase tracking-widest transition-all ${aiAvailable ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
            <div className="flex items-center gap-2">
              {aiAvailable ? <CloudLightning size={16} /> : <ZapOff size={16} />}
              <span>{aiAvailable ? t.aiModeActive : t.offlineMode}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden md:inline opacity-60">{t.aiStatus}</span>
              <button 
                onClick={() => setIsLocalMode(!isLocalMode)}
                className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${aiAvailable ? 'bg-indigo-500' : 'bg-amber-200'}`}
              >
                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isLocalMode ? 'left-1' : 'right-1'}`} />
              </button>
            </div>
          </div>

          <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 px-4 md:px-8 py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                {selectedSubject ? (
                  <button onClick={() => setSelectedSubject(null)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-indigo-600">
                    <ChevronLeft className={isRtl ? "" : "rotate-180"} size={28} />
                  </button>
                ) : (
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <BrainCircuit size={24} />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="font-black text-xl text-indigo-950">{t.appName}</span>
                  {selectedSubject && <span className="text-xs font-bold text-indigo-500">{selectedSubject.name}</span>}
                </div>
              </div>
              
              <div className="flex items-center gap-2 md:gap-4">
                {selectedSubject && (
                  <button onClick={() => setShowHistory(true)} className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all" title={t.history}>
                    <History size={22} />
                  </button>
                )}
                <button onClick={() => setShowSettings(true)} className={`p-3 rounded-2xl transition-all ${!aiAvailable ? 'text-amber-500 bg-amber-50' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <Settings size={22} />
                </button>
                <button onClick={() => { localStorage.removeItem('app_user_session'); setCurrentUser(null); }} className="p-3 text-red-500 hover:bg-red-50 rounded-2xl"><LogOut size={22} /></button>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 md:px-8 pt-8">
            {!selectedSubject ? (
              <div className="animate-in">
                {!aiAvailable && (
                  <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-[2rem] flex items-center gap-4 text-amber-900 shadow-sm">
                    <AlertCircle size={32} className="shrink-0" />
                    <p className="font-bold">{t.noAiNotice}</p>
                  </div>
                )}
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-gray-900 leading-none">{t.subjects}</h2>
                  <button onClick={() => setShowSubjectModal(true)} className="flex items-center gap-2 px-8 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-bold shadow-2xl hover:bg-indigo-700 transition-all">
                    <Plus size={24} /> {t.newSubject}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {subjects.map(sub => (
                    <button key={sub.id} onClick={() => setSelectedSubject(sub)} className="bg-white p-10 rounded-[3.5rem] border-2 border-transparent hover:border-indigo-600 shadow-sm hover:shadow-2xl transition-all flex flex-col h-64 relative group overflow-hidden text-right">
                      <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mb-auto z-10 shadow-xl" style={{ backgroundColor: sub.color }}>
                        <GraduationCap size={32} />
                      </div>
                      <div className={`z-10 ${isRtl ? 'text-right' : 'text-left'} w-full`}>
                        <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">{sub.name}</h3>
                        <p className="text-sm font-bold text-gray-400">{t.tagline}</p>
                      </div>
                      <button onClick={(e) => deleteSubject(e, sub.id)} className={`absolute top-8 ${isRtl ? 'left-8' : 'right-8'} p-3 bg-red-50 text-red-400 hover:text-red-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110`}>
                        <Trash2 size={20} />
                      </button>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="animate-in">
                <div className="flex flex-col md:flex-row gap-5 mb-12">
                  <div className="relative flex-1 group">
                    <Search className={`absolute ${isRtl ? 'right-6' : 'left-6'} top-1/2 -translate-y-1/2 text-gray-400`} size={24} />
                    <input type="text" placeholder={`${t.search} ${selectedSubject.name}..`} className={`w-full ${isRtl ? 'pr-16 pl-8' : 'pl-16 pr-8'} py-6 bg-white border-2 border-indigo-50 rounded-[2.2rem] shadow-sm focus:border-indigo-500 outline-none font-bold`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setSelectionMode(!selectionMode); setSelectedCardIds(new Set()); }} className={`px-8 py-5 rounded-[1.8rem] font-bold flex items-center gap-2 transition-all ${selectionMode ? 'bg-indigo-600 text-white shadow-xl' : 'bg-white border-2 border-indigo-100 text-indigo-600'}`}>
                      <ListChecks size={22} /> {selectionMode ? t.cancelSelection : t.selectionMode}
                    </button>
                    {selectionMode && selectedCardIds.size > 0 && (
                      <button onClick={() => startQuiz(true)} className="px-10 py-5 bg-emerald-600 text-white rounded-[1.8rem] font-black shadow-2xl flex items-center gap-2 hover:bg-emerald-700 active:scale-95">
                        {isQuizPreparing ? <Loader2 className="animate-spin" /> : <Zap size={22} />} {t.startSelected} ({selectedCardIds.size})
                      </button>
                    )}
                    {!selectionMode && (
                      <button onClick={() => setShowQuizSetup(true)} className="px-10 py-5 bg-indigo-600 text-white rounded-[1.8rem] font-black shadow-2xl flex items-center gap-2 hover:bg-indigo-700 active:scale-95">
                        {isQuizPreparing ? <Loader2 className="animate-spin" /> : <Play size={22} />} {t.startQuiz}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right">
                  {filteredCards.map(card => (
                    <div key={card.id} onClick={() => selectionMode && toggleCardSelection(card.id)} className={`bg-white p-10 rounded-[3.5rem] border-2 shadow-sm transition-all group relative cursor-pointer ${selectionMode && selectedCardIds.has(card.id) ? 'border-indigo-600 bg-indigo-50/40 scale-[0.98]' : 'border-gray-50 hover:shadow-2xl hover:border-indigo-100'}`}>
                      {selectionMode && <div className={`absolute top-8 ${isRtl ? 'right-8' : 'left-8'} text-indigo-600`}>{selectedCardIds.has(card.id) ? <CheckSquare size={32} /> : <Square size={32} className="text-gray-200" />}</div>}
                      <div className="mb-6">
                        <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest block mb-3 text-right">{t.question}</span>
                        <p className="text-2xl font-black text-gray-900 leading-tight text-right">{card.question}</p>
                      </div>
                      <div className="pt-6 border-t border-gray-50">
                        <span className="text-[11px] font-black text-emerald-500 uppercase tracking-widest block mb-3 text-right">{t.answer}</span>
                        <p className="text-gray-600 font-bold leading-relaxed line-clamp-4 text-right">{card.answer}</p>
                      </div>
                      <div className={`absolute top-8 ${isRtl ? 'left-8' : 'right-8'} flex gap-3 opacity-0 group-hover:opacity-100 transition-all`}>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(card); }} className="p-3 bg-gray-100 text-gray-400 hover:text-indigo-600 rounded-2xl"><Copy size={20} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingCard(card); setNewQuestion(card.question); setNewAnswer(card.answer); setShowAddModal(true); }} className="p-3 bg-indigo-50 text-indigo-400 hover:text-indigo-600 rounded-2xl"><Edit3 size={20} /></button>
                        {!selectionMode && <button onClick={(e) => { e.stopPropagation(); if(confirm(t.deleteConfirm)) supabase.from('flashcards').delete().eq('id', card.id).then(fetchFlashcards); }} className="p-3 bg-red-50 text-red-400 rounded-2xl"><Trash2 size={20} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Quiz Overlay */}
          {isQuizActive && (
            <div className="fixed inset-0 bg-white z-[600] flex flex-col animate-in" dir={isRtl ? "rtl" : "ltr"}>
              <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${aiAvailable ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                    {aiAvailable ? <Zap size={24} /> : <Cpu size={24} />}
                  </div>
                  <div className="flex flex-col">
                    <h2 className="font-black text-2xl text-indigo-950 leading-none">{selectedSubject?.name}</h2>
                    {!aiAvailable && <span className="text-[10px] font-black text-amber-600 uppercase mt-1 tracking-widest">{t.offlineMode}</span>}
                  </div>
                </div>
                <button onClick={() => { if(confirm('Exit quiz?')) setIsQuizActive(false); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><X size={40} /></button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 md:p-12">
                <div className="max-w-4xl mx-auto h-full flex flex-col">
                  {quizResults ? (
                    <div className="py-12 animate-in flex flex-col items-center w-full">
                      <div className="w-40 h-40 bg-indigo-100 rounded-[3rem] flex items-center justify-center text-indigo-600 mb-10 shadow-xl"><Trophy size={80} /></div>
                      <h3 className="text-5xl font-black text-gray-900 mb-4">{t.finish}</h3>
                      <div className="bg-indigo-600 text-white px-14 py-8 rounded-[3.5rem] font-black text-4xl mb-10 shadow-2xl flex items-center gap-4">
                        <Star fill="white" size={40} /> {quizResults.score} / {quizResults.totalPossible} {t.points}
                      </div>

                      {/* Review Section */}
                      <div className="w-full bg-gray-50 rounded-[3rem] p-8 space-y-6">
                        <h4 className="text-2xl font-black text-center mb-6 text-gray-700">{t.reviewAnswers}</h4>
                        {quizQuestions.map((q, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                            <p className="font-bold text-lg mb-4 text-gray-800">{q.question}</p>
                            <div className="space-y-2">
                              <div className={`flex items-center gap-2 font-bold ${q.isCorrect ? 'text-emerald-600' : 'text-red-500'}`}>
                                {q.isCorrect ? <Check size={20} /> : <XCircle size={20} />}
                                <span>{t.yourAnswer}: {q.userSelection || "-"}</span>
                              </div>
                              {!q.isCorrect && (
                                <div className="flex items-center gap-2 font-bold text-emerald-600 bg-emerald-50 p-3 rounded-xl">
                                  <CheckCircle2 size={20} />
                                  <span>{t.correctAnswer}: {q.answer}</span>
                                </div>
                              )}
                              {q.aiFeedback && (
                                <p className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl">{q.aiFeedback}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <button onClick={() => setIsQuizActive(false)} className="mt-10 px-16 py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-3xl shadow-2xl flex items-center gap-5 hover:bg-indigo-700 transition-all"><ArrowLeftCircle size={36} /> {t.back}</button>
                    </div>
                  ) : (
                    <div key={currentQuizStep} className="flex-1 flex flex-col animate-in">
                      <div className="w-full flex justify-between items-center mb-12 bg-gray-100 p-6 rounded-[2.5rem] border border-gray-200">
                        <span className="text-gray-500 font-black text-xl">Card {currentQuizStep + 1} / {quizQuestions.length}</span>
                        <div className="flex items-center gap-3 text-indigo-600 font-black bg-white px-8 py-3 rounded-2xl shadow-sm"><Star size={24} fill="#4f46e5" /> {quizQuestions[currentQuizStep].points} {t.points}</div>
                      </div>
                      <div className="bg-indigo-50 p-16 rounded-[4.5rem] mb-16 text-center shadow-inner border-2 border-indigo-100"><h3 className="text-4xl md:text-5xl font-black text-indigo-950 leading-tight">{quizQuestions[currentQuizStep].question}</h3></div>
                      {quizConfig.type === 'mcq' ? (
                        <div className="grid grid-cols-1 gap-5">
                          {quizQuestions[currentQuizStep].options?.map((opt, i) => (
                            <button key={i} onClick={() => submitQuizAnswer(opt)} className="w-full p-10 text-right bg-white border-3 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 rounded-[3rem] font-black text-3xl transition-all">
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <textarea autoFocus className="w-full p-12 bg-gray-50 border-3 border-indigo-50 focus:border-indigo-600 rounded-[4rem] outline-none text-3xl font-bold shadow-inner text-right" placeholder="Type answer..." rows={6} value={writtenAnswerInput} onChange={(e) => setWrittenAnswerInput(e.target.value)} />
                          <button onClick={() => submitQuizAnswer(writtenAnswerInput)} disabled={quizQuestions[currentQuizStep].isGrading || !writtenAnswerInput.trim()} className="w-full py-10 bg-indigo-600 text-white rounded-[3.5rem] font-black text-4xl shadow-2xl flex items-center justify-center gap-5 disabled:opacity-50">
                            {quizQuestions[currentQuizStep].isGrading ? <Loader2 className="animate-spin" size={48} /> : t.save}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* New Subject Modal */}
          {showSubjectModal && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl p-12 animate-in relative">
                <button onClick={() => setShowSubjectModal(false)} className="absolute top-10 left-10 text-gray-400 hover:text-gray-600"><X size={32} /></button>
                <div className="flex flex-col items-center mb-10">
                  <div className="w-20 h-20 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center text-indigo-600 mb-6"><Library size={40} /></div>
                  <h3 className="font-black text-3xl">{t.newSubject}</h3>
                </div>
                <form onSubmit={handleAddSubject} className="space-y-8">
                  <input type="text" required autoFocus placeholder={t.subjectName} className="w-full p-6 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-black text-xl text-right" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                  <button type="submit" disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-2xl transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : t.create}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Settings with Key Test */}
          {showSettings && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-[3.5rem] shadow-2xl p-12 animate-in relative overflow-hidden">
                <button onClick={() => setShowSettings(false)} className="absolute top-10 left-10 text-gray-400 hover:text-gray-600"><X size={32} /></button>
                <div className="flex flex-col items-center mb-10 text-center">
                  <div className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl ${aiAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {aiAvailable ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
                  </div>
                  <h3 className="font-black text-3xl">{t.settings}</h3>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-xs font-black text-gray-400 uppercase px-2">{t.manualKey}</label>
                    <div className="flex flex-col gap-3">
                      <input type="password" placeholder="AI API Key..." className="w-full p-5 bg-gray-50 border-2 border-transparent focus:border-indigo-600 rounded-2xl outline-none font-bold text-sm" value={manualKey} onChange={(e) => setManualKey(e.target.value)} />
                      <button 
                        onClick={handleTestKey} 
                        disabled={keyTesting || !manualKey}
                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        {keyTesting ? <Loader2 className="animate-spin" /> : <CloudLightning size={18} />}
                        {t.testKey}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-8 border-gray-50">
                    <label className="text-xs font-black text-gray-400 uppercase px-2">{t.manageKey}</label>
                    <button onClick={async () => { try { await window.aistudio.openSelectKey(); setShowSettings(false); } catch { addToast(t.error, 'error'); } }} className="w-full flex items-center justify-between p-6 bg-gray-100 text-indigo-600 rounded-3xl font-black text-xl hover:bg-gray-200 transition-all">
                      <span>{t.manageKey}</span>
                      <Key size={24} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Screens */}
          {(isQuizPreparing || aiLoading) && (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-[2000] flex flex-col items-center justify-center text-center p-8 animate-in">
              <div className={`w-32 h-32 rounded-[3rem] flex items-center justify-center text-white mb-10 animate-bounce shadow-2xl ${aiAvailable ? 'bg-indigo-600' : 'bg-amber-600'}`}>
                {aiAvailable ? <BrainCircuit size={64} /> : <Cpu size={64} />}
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">
                {isQuizPreparing ? t.preparingQuiz : (aiAvailable ? t.generatingAnswer : t.extractingText)}
              </h2>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}

          {/* Add/Edit Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-4xl rounded-[4rem] shadow-2xl overflow-hidden animate-in flex flex-col max-h-[90vh]">
                <div className="p-10 border-b flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-black text-3xl">{editingCard ? t.editCard : t.addCard}</h3>
                  <button onClick={() => { setShowAddModal(false); setEditingCard(null); }} className="text-gray-400 hover:text-red-500 transition-all"><X size={36} /></button>
                </div>
                <form onSubmit={handleAddCard} className="p-12 space-y-10 overflow-y-auto">
                  <div className="flex gap-5">
                    <input type="text" required placeholder={t.question} className="flex-1 p-6 bg-gray-50 border-3 border-transparent focus:border-indigo-500 rounded-3xl outline-none font-black text-2xl text-right" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                    {aiAvailable && (
                      <button type="button" onClick={async () => { if(!newQuestion || aiLoading) return; setAiLoading(true); try { const ans = await getAIAnswer(newQuestion, manualKey); setNewAnswer(ans); addToast(t.success); } catch { addToast(t.error, 'error'); } finally { setAiLoading(false); } }} disabled={!newQuestion || aiLoading} className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                        {aiLoading ? <Loader2 size={36} className="animate-spin" /> : <Wand2 size={36} />}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <textarea required rows={8} placeholder={t.answer} className="w-full p-10 bg-gray-50 border-3 border-transparent focus:border-indigo-500 rounded-[3.5rem] outline-none resize-none font-bold leading-relaxed text-xl text-right" value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
                    <button type="button" onClick={() => setShowScanner(true)} className={`absolute bottom-8 ${isRtl ? 'left-8' : 'right-8'} w-20 h-20 bg-white text-indigo-600 rounded-3xl shadow-2xl flex items-center justify-center hover:scale-105 transition-all border-2 border-indigo-50`}><CameraIcon size={36} /></button>
                  </div>
                  <button type="submit" disabled={loading || !newAnswer} className="w-full py-8 bg-indigo-600 text-white rounded-[3rem] font-black text-3xl shadow-2xl hover:bg-indigo-700 transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : t.save}
                  </button>
                </form>
              </div>
            </div>
          )}

          {selectedSubject && !selectionMode && (
            <button onClick={() => { setEditingCard(null); setNewQuestion(''); setNewAnswer(''); setShowAddModal(true); }} className={`fixed bottom-10 ${isRtl ? 'left-10' : 'right-10'} w-20 h-20 bg-indigo-600 text-white rounded-[2.2rem] shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-40 border-4 border-white`}>
              <Plus size={36} />
            </button>
          )}

          {showScanner && (
            <CameraScanner onScan={async (imgs) => { 
              setAiLoading(true); 
              try { 
                let text = "";
                if (aiAvailable) {
                  text = await extractTextFromImages(imgs, manualKey); 
                } else {
                  text = await localExtractText(imgs);
                }
                
                if (text.trim()) {
                  setNewAnswer(prev => prev ? prev + "\n\n" + text : text); 
                  addToast(t.ocrSuccess, 'success');
                } else {
                  addToast(t.ocrFailed, 'error');
                }
              } catch (e) { 
                console.error(e);
                addToast(t.error, 'error'); 
                setIsLocalMode(true);
              } 
              finally { setAiLoading(false); } 
            }} onClose={() => setShowScanner(false)} />
          )}

          {showHistory && (
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-2xl rounded-[4rem] shadow-2xl p-12 animate-in relative max-h-[85vh] flex flex-col">
                <button onClick={() => setShowHistory(false)} className="absolute top-10 left-10 text-gray-400 hover:text-gray-600"><X size={32} /></button>
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-16 h-16 bg-indigo-50 rounded-[1.8rem] flex items-center justify-center text-indigo-600 shadow-sm"><History size={32} /></div>
                  <h3 className="font-black text-3xl">{t.history}</h3>
                </div>
                <div className="flex-1 overflow-y-auto space-y-6">
                  {quizHistory.length === 0 ? (
                    <div className="text-center py-24 opacity-20">
                      <Calendar size={100} className="mx-auto mb-6" />
                      <p className="font-black text-2xl">{t.noHistory}</p>
                    </div>
                  ) : (
                    quizHistory.map(record => (
                      <div key={record.id} className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-indigo-50">
                        <div className="text-right">
                          <span className="text-xs font-black text-gray-400 mb-2 block tracking-widest">{new Date(record.created_at).toLocaleDateString(lang)}</span>
                          <p className="font-black text-3xl text-indigo-950">{record.score} / {record.total_possible} <span className="text-lg text-indigo-400 font-bold">{t.points}</span></p>
                          <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg mt-2 inline-block uppercase">{record.quiz_type}</span>
                        </div>
                        <button onClick={async () => { if(confirm(t.deleteConfirm)) { await supabase.from('quiz_results').delete().eq('id', record.id); fetchQuizHistory(); addToast(t.deleteSuccess); } }} className="p-4 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all"><Trash size={24} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default App;
