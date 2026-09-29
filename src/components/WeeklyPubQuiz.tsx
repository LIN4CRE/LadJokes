import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  PlusCircle,
  Share2,
  Award,
  Zap,
  Flame,
  Shield,
  X,
  Trash2,
  Check,
} from 'lucide-react';
import { PubQuizRound, PubQuizQuestion, UserAccount, LadTier } from '../types';
import { playBanterSound } from '../services/syncService';
import { LadTierBadge } from './LadTierBadge';

interface WeeklyPubQuizProps {
  quizzes: PubQuizRound[];
  currentUser: UserAccount | null;
  onSaveQuiz: (newRound: PubQuizRound) => void;
  onAwardKarma?: (points: number) => void;
  onShareQuizResult?: (title: string, score: number, total: number) => void;
}

export const WeeklyPubQuiz: React.FC<WeeklyPubQuizProps> = ({
  quizzes,
  currentUser,
  onSaveQuiz,
  onAwardKarma,
  onShareQuizResult,
}) => {
  // Selected quiz to play
  const [activeQuiz, setActiveQuiz] = useState<PubQuizRound | null>(null);

  // Gameplay state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<
    { questionId: string; selectedIndex: number | null; isCorrect: boolean }[]
  >([]);

  // Admin Quiz Creator Modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Admin form state
  const [quizTitle, setQuizTitle] = useState('');
  const [quizCategory, setQuizCategory] = useState<PubQuizRound['category']>('Crude History');
  const [quizWeekLabel, setQuizWeekLabel] = useState('Week 40 Special');
  const [quizDescription, setQuizDescription] = useState('');
  const [quizTimeSeconds, setQuizTimeSeconds] = useState(20);
  const [adminQuestions, setAdminQuestions] = useState<PubQuizQuestion[]>([
    {
      id: 'q-custom-1',
      question: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      explanation: '',
      points: 100,
    },
  ]);

  const isAdmin = currentUser?.role === 'admin';

  // Active quiz timer effect
  useEffect(() => {
    if (!activeQuiz || isAnswerSubmitted || isQuizCompleted) return;

    if (timeLeft <= 0) {
      handleTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeQuiz, isAnswerSubmitted, isQuizCompleted, timeLeft]);

  // Start a Quiz
  const handleStartQuiz = (quiz: PubQuizRound) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setCorrectAnswersCount(0);
    setTimeLeft(quiz.timePerQuestionSeconds || 25);
    setIsQuizCompleted(false);
    setUserAnswers([]);
    playBanterSound('pint');
  };

  // User submits an answer
  const handleSelectOption = (index: number) => {
    if (isAnswerSubmitted || !activeQuiz) return;
    setSelectedOption(index);
    setIsAnswerSubmitted(true);

    const question = activeQuiz.questions[currentQuestionIndex];
    const isCorrect = index === question.correctOptionIndex;

    if (isCorrect) {
      setScore((prev) => prev + question.points);
      setCorrectAnswersCount((prev) => prev + 1);
      playBanterSound('pint');
    } else {
      playBanterSound('outrage');
    }

    setUserAnswers((prev) => [
      ...prev,
      { questionId: question.id, selectedIndex: index, isCorrect },
    ]);
  };

  // Timer run out
  const handleTimeExpired = () => {
    if (isAnswerSubmitted || !activeQuiz) return;
    setIsAnswerSubmitted(true);
    setSelectedOption(null);
    playBanterSound('outrage');

    const question = activeQuiz.questions[currentQuestionIndex];
    setUserAnswers((prev) => [
      ...prev,
      { questionId: question.id, selectedIndex: null, isCorrect: false },
    ]);
  };

  // Proceed to next question or complete quiz
  const handleNextQuestion = () => {
    if (!activeQuiz) return;

    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(activeQuiz.timePerQuestionSeconds || 25);
      playBanterSound('pop');
    } else {
      setIsQuizCompleted(true);
      playBanterSound('pint');
      if (onAwardKarma) {
        onAwardKarma(Math.round(score / 5));
      }
    }
  };

  // AI Quiz Generator using Banter Coach API
  const handleAiGenerateTrivia = async () => {
    setIsGeneratingAi(true);
    playBanterSound('pop');

    try {
      const res = await fetch('/api/banter-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'chat',
          prompt: `Generate 3 hilarious, authentic pub quiz questions about '${quizCategory}'. 
Format strictly as JSON array of objects with keys: "question", "options" (array of 4 distinct answers), "correctOptionIndex" (0, 1, 2, or 3), "explanation" (1-2 sentences with witty comedic commentary), "points" (100). Do not include markdown codeblocks.`,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        // Try parsing JSON from reply
        const clean = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted: PubQuizQuestion[] = parsed.map((item: any, i: number) => ({
            id: `q-ai-${Date.now()}-${i}`,
            question: item.question,
            options: item.options,
            correctOptionIndex: item.correctOptionIndex ?? 0,
            explanation: item.explanation || 'Certified pub trivia legend fact.',
            points: 100,
          }));
          setAdminQuestions(formatted);
          setQuizDescription(`AI-Powered round packed with wild trivia on ${quizCategory}.`);
          playBanterSound('pint');
        }
      }
    } catch {
      // Fallback preset if network or AI formatting is unavailable
      setAdminQuestions([
        {
          id: `q-fallback-1`,
          question: `In 1974, which bizarre item did an Australian cricket fan sneak onto the Melbourne pitch?`,
          options: ['A live pig painted with the captain’s jersey number', 'A keg of beer on a skateboard', 'A stuffed kangaroo with sunglasses', 'A lawnmower with a flag'],
          correctOptionIndex: 0,
          explanation: 'A fan named Dennis slipped an oiled piglet sporting numbers into the Ashes test match!',
          points: 100,
        },
        {
          id: `q-fallback-2`,
          question: `What was declared the "official national hangover cure" of Ancient Rome by Pliny the Elder?`,
          options: ['Deep-fried canary birds eaten whole', 'Pickled sheep eyeballs in vinegar', 'Boiled seawater with crushed garlic', 'Raw goat testicles with honey'],
          correctOptionIndex: 0,
          explanation: 'Pliny wrote that deep-fried canaries crushed and eaten with salt were guaranteed to revive the spirit!',
          points: 100,
        },
      ]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Admin saves custom quiz
  const handleSaveAdminQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim() || adminQuestions.length === 0) return;

    const newQuizRound: PubQuizRound = {
      id: `quiz-custom-${Date.now()}`,
      title: quizTitle.trim(),
      weekLabel: quizWeekLabel.trim() || 'Community Round',
      category: quizCategory,
      description: quizDescription.trim() || 'Community created pub quiz round.',
      timePerQuestionSeconds: quizTimeSeconds,
      questions: adminQuestions,
      participantsCount: 1,
      topScorerName: currentUser?.nickname || 'Quizmaster',
      topScore: adminQuestions.reduce((acc, q) => acc + q.points, 0),
      createdAt: 'Just now',
      status: 'active',
    };

    onSaveQuiz(newQuizRound);
    playBanterSound('pint');
    setShowAdminModal(false);
    setQuizTitle('');
    setQuizDescription('');
  };

  // Add blank question in admin modal
  const handleAddQuestionRow = () => {
    setAdminQuestions((prev) => [
      ...prev,
      {
        id: `q-user-${Date.now()}-${prev.length + 1}`,
        question: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        explanation: '',
        points: 100,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Admin Trigger */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#171424] via-[#1a172c] to-[#12111d] border border-amber-500/30 p-6 sm:p-7 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-mono tracking-wider uppercase font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Weekly Pub Quiz · Timed Trivia Rounds</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-display font-extrabold tracking-wide text-white uppercase">
              THE WEEKLY PUB QUIZ
            </h3>
            <p className="text-sm text-slate-300">
              Gather your mates, beat the clock, and settle trivia debates on pop culture, crude history, and banter knowledge. Level up your Lad Tier with every round.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isAdmin && (
              <button
                onClick={() => setShowAdminModal(true)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Admin: Setup Quiz Round</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Rounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {quizzes.map((quiz) => {
          const totalPoints = quiz.questions.reduce((acc, q) => acc + q.points, 0);
          const isActive = quiz.status === 'active';

          return (
            <div
              key={quiz.id}
              className={`rounded-2xl border p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-[#151724] to-[#10121d] border-amber-500/40 hover:border-amber-500'
                  : 'bg-[#11131b] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`py-0.5 px-2.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-white/5 text-slate-400 border border-white/10'
                    }`}
                  >
                    {quiz.weekLabel}
                  </span>

                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{quiz.timePerQuestionSeconds}s / Q</span>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-amber-400 font-medium">{quiz.category}</span>
                  <h4 className="text-lg font-bold text-white font-heading leading-snug">
                    {quiz.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {quiz.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>{quiz.questions.length} Questions ({totalPoints} Pts)</span>
                  <span className="text-amber-300 font-semibold">{quiz.participantsCount} Lads</span>
                </div>

                <button
                  onClick={() => handleStartQuiz(quiz)}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                    isActive
                      ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{isActive ? 'Enter Live Pub Quiz' : 'Replay Trivia Round'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Gameplay Modal */}
      {activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-xl w-full bg-[#11131c] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-[#161826] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-lg">
                  🍻
                </span>
                <div>
                  <h4 className="text-base font-bold text-white font-heading">
                    {activeQuiz.title}
                  </h4>
                  <span className="text-[11px] font-mono text-amber-400">
                    {activeQuiz.weekLabel} · {activeQuiz.category}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveQuiz(null)}
                aria-label="Exit Quiz"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* In-Game State */}
            {!isQuizCompleted ? (
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                {/* Progress & Countdown Timer */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">
                      Question <strong className="text-white">{currentQuestionIndex + 1}</strong> of{' '}
                      {activeQuiz.questions.length}
                    </span>
                    <span
                      className={`font-bold flex items-center gap-1 ${
                        timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{timeLeft}s Left</span>
                    </span>
                  </div>

                  {/* Timer Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        timeLeft <= 5 ? 'bg-red-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}
                      style={{
                        width: `${(timeLeft / (activeQuiz.timePerQuestionSeconds || 25)) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">
                    Worth {activeQuiz.questions[currentQuestionIndex].points} Points
                  </span>
                  <h5 className="text-base sm:text-lg font-bold text-white font-sans leading-snug">
                    {activeQuiz.questions[currentQuestionIndex].question}
                  </h5>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5">
                  {activeQuiz.questions[currentQuestionIndex].options.map((opt, idx) => {
                    const isSelected = selectedOption === idx;
                    const isCorrect =
                      idx === activeQuiz.questions[currentQuestionIndex].correctOptionIndex;

                    let buttonStyle = 'bg-white/5 border-white/10 text-slate-200 hover:bg-white/10';

                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        buttonStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        buttonStyle = 'bg-red-500/20 border-red-500 text-red-300 font-bold';
                      } else {
                        buttonStyle = 'opacity-40 bg-white/5 border-white/5 text-slate-400';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        disabled={isAnswerSubmitted}
                        className={`w-full p-3.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${buttonStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Answer Explanation Box */}
                {isAnswerSubmitted && (
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#181a26] to-[#12141c] border border-amber-500/30 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>THE PUB LANDLORD'S VERDICT:</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">
                      {activeQuiz.questions[currentQuestionIndex].explanation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Results Summary */
              <div className="p-6 space-y-6 text-center overflow-y-auto flex-1">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-amber-500/10">
                  🏆
                </div>

                <div className="space-y-1">
                  <h4 className="text-2xl font-bold font-heading text-white">QUIZ ROUND COMPLETE!</h4>
                  <p className="text-xs text-slate-400">
                    You answered {correctAnswersCount} of {activeQuiz.questions.length} questions correctly.
                  </p>
                </div>

                {/* Score Pill */}
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 max-w-sm mx-auto space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                    Total Score Earned
                  </span>
                  <div className="text-4xl font-extrabold text-amber-400 font-mono">{score} PTS</div>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="text-xs text-slate-300">Awarded Tier:</span>
                    <LadTierBadge
                      tier={
                        score >= 400
                          ? 'Pub Legend'
                          : score >= 200
                          ? 'Banter Veteran'
                          : 'Rookie Lad'
                      }
                      size="sm"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    onClick={() => handleStartQuiz(activeQuiz)}
                    className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Try Again</span>
                  </button>

                  {onShareQuizResult && (
                    <button
                      onClick={() =>
                        onShareQuizResult(
                          activeQuiz.title,
                          score,
                          activeQuiz.questions.reduce((a, b) => a + b.points, 0)
                        )
                      }
                      className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Scorecard</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Footer Navigation */}
            {!isQuizCompleted && isAnswerSubmitted && (
              <div className="p-4 bg-[#141624] border-t border-white/10 flex justify-end shrink-0">
                <button
                  onClick={handleNextQuestion}
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20"
                >
                  {currentQuestionIndex + 1 < activeQuiz.questions.length
                    ? 'Next Question →'
                    : 'View Final Score 🏆'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Quiz Creator Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-2xl w-full bg-[#11131c] border border-amber-500/40 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-[#171424] via-[#1a172c] to-[#12111d] border-b border-white/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Shield className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white font-heading">
                    Admin Quizmaster Setup
                  </h4>
                  <p className="text-xs text-slate-400">
                    Create a timed, multiple-choice trivia battle for the community
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAdminModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveAdminQuiz} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Round Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. The Sunday League & Kebab Specials"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Week Label:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Week 40 (Live)"
                    value={quizWeekLabel}
                    onChange={(e) => setQuizWeekLabel(e.target.value)}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Topic Category:
                  </label>
                  <select
                    value={quizCategory}
                    onChange={(e) => setQuizCategory(e.target.value as any)}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Crude History">📜 Crude History</option>
                    <option value="Pop Culture">🎬 Pop Culture</option>
                    <option value="Banter Knowledge">🍺 Banter Knowledge</option>
                    <option value="Mixed Tavern">🏆 Mixed Tavern</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Time Per Question:
                  </label>
                  <select
                    value={quizTimeSeconds}
                    onChange={(e) => setQuizTimeSeconds(Number(e.target.value))}
                    className="w-full bg-[#161824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={15}>15 Seconds (Blitz Mode)</option>
                    <option value={20}>20 Seconds (Fast)</option>
                    <option value={25}>25 Seconds (Standard Pub)</option>
                    <option value={30}>30 Seconds (Relaxed)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold text-slate-300 uppercase">
                  Round Description:
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell the lads what horrors and wild questions await in this round..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full bg-[#161824] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* AI Auto-Generate Trigger */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span className="text-xs text-amber-300 font-semibold">
                    Need questions fast? Let Baz The Banter Coach generate questions!
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAiGenerateTrivia}
                  disabled={isGeneratingAi}
                  className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase transition-all cursor-pointer whitespace-nowrap"
                >
                  {isGeneratingAi ? 'Generating...' : '✨ Auto-Generate'}
                </button>
              </div>

              {/* Questions List Editor */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                    Questions ({adminQuestions.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuestionRow}
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                {adminQuestions.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className="p-4 rounded-2xl bg-[#151724] border border-white/10 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        Question #{qIndex + 1}
                      </span>
                      {adminQuestions.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setAdminQuestions((prev) => prev.filter((_, idx) => idx !== qIndex))
                          }
                          className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      placeholder="Enter question text..."
                      value={q.question}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdminQuestions((prev) =>
                          prev.map((item, idx) => (idx === qIndex ? { ...item, question: val } : item))
                        );
                      }}
                      className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />

                    {/* 4 Choices */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        Options (select the radio button for the correct answer):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((optText, optIdx) => (
                          <div
                            key={optIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border ${
                              q.correctOptionIndex === optIdx
                                ? 'bg-emerald-500/10 border-emerald-500/40'
                                : 'bg-[#12141f] border-white/5'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-opt-${qIndex}`}
                              checked={q.correctOptionIndex === optIdx}
                              onChange={() => {
                                setAdminQuestions((prev) =>
                                  prev.map((item, idx) =>
                                    idx === qIndex ? { ...item, correctOptionIndex: optIdx } : item
                                  )
                                );
                              }}
                              className="accent-emerald-500 cursor-pointer"
                            />
                            <input
                              type="text"
                              required
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              value={optText}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAdminQuestions((prev) =>
                                  prev.map((item, idx) => {
                                    if (idx !== qIndex) return item;
                                    const nextOpts = [...item.options];
                                    nextOpts[optIdx] = val;
                                    return { ...item, options: nextOpts };
                                  })
                                );
                              }}
                              className="w-full bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explanation */}
                    <input
                      type="text"
                      placeholder="Humorous explanation for the correct answer..."
                      value={q.explanation}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAdminQuestions((prev) =>
                          prev.map((item, idx) =>
                            idx === qIndex ? { ...item, explanation: val } : item
                          )
                        );
                      }}
                      className="w-full bg-[#12141f] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                >
                  Publish Quiz Round 🍻
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
