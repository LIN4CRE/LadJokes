import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Share2,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Beer,
  Flame,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Filter,
  Zap,
  Sparkles,
} from 'lucide-react';
import { Chapter, Joke, JokeCategoryType, ContentIntensity } from '../types';
import { playBanterSound } from '../services/syncService';
import { BanterCoachModal } from './BanterCoachModal';

interface BookReaderProps {
  chapters: Chapter[];
  jokes: Joke[];
  onRateJoke: (jokeId: string) => void;
  onSpillPint: (jokeId: string) => void;
  onBookmarkJoke: (jokeId: string) => void;
  onShareJoke: (joke: Joke) => void;
  onAddNewJoke: (newJoke: Partial<Joke>) => void;
}

export const BookReader: React.FC<BookReaderProps> = ({
  chapters,
  jokes,
  onRateJoke,
  onSpillPint,
  onBookmarkJoke,
  onShareJoke,
  onAddNewJoke,
}) => {
  const [selectedChapterId, setSelectedChapterId] = useState<string>('all');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'classic' | 'raunchy' | 'disturbing'>('all');
  const [hideExtremeContent, setHideExtremeContent] = useState<boolean>(() => {
    return localStorage.getItem('lad_jokes_hide_extreme_content') === 'true';
  });
  const [unmaskedJokes, setUnmaskedJokes] = useState<Record<string, boolean>>({});
  const [currentJokeIndex, setCurrentJokeIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [showPunchline, setShowPunchline] = useState(true);

  // New Joke form state
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState('ch-1');
  const [newCategoryType, setNewCategoryType] = useState<JokeCategoryType>('classic');
  const [newIntensity, setNewIntensity] = useState<ContentIntensity>('standard');
  const [newContent, setNewContent] = useState('');
  const [newPunchline, setNewPunchline] = useState('');
  const [newTags, setNewTags] = useState('Pub Banter, Outrageous');

  const toggleHideExtreme = () => {
    const nextVal = !hideExtremeContent;
    setHideExtremeContent(nextVal);
    localStorage.setItem('lad_jokes_hide_extreme_content', String(nextVal));
  };

  // Category counts
  const categoryCounts = {
    all: jokes.length,
    classic: jokes.filter((j) => j.categoryType === 'classic' || (!j.categoryType && j.chapterId !== 'ch-6')).length,
    raunchy: jokes.filter((j) => j.categoryType === 'raunchy' || j.tags.some((t) => t.toLowerCase().includes('raunchy'))).length,
    disturbing: jokes.filter((j) => j.categoryType === 'disturbing' || j.chapterId === 'ch-6').length,
  };

  // Filter jokes
  const filteredJokes = jokes.filter((j) => {
    const matchChapter = selectedChapterId === 'all' || j.chapterId === selectedChapterId;
    
    let matchCategory = true;
    if (selectedCategoryTab === 'classic') {
      matchCategory = j.categoryType === 'classic' || (!j.categoryType && j.chapterId !== 'ch-6');
    } else if (selectedCategoryTab === 'raunchy') {
      matchCategory = j.categoryType === 'raunchy' || j.tags.some((t) => t.toLowerCase().includes('raunchy'));
    } else if (selectedCategoryTab === 'disturbing') {
      matchCategory = j.categoryType === 'disturbing' || j.chapterId === 'ch-6';
    }

    const matchSearch =
      searchQuery.trim() === '' ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.punchline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchChapter && matchCategory && matchSearch;
  });

  const activeJoke = filteredJokes[currentJokeIndex] || filteredJokes[0] || jokes[0];

  const handleNext = () => {
    if (currentJokeIndex < filteredJokes.length - 1) {
      setCurrentJokeIndex((prev) => prev + 1);
      stopAudio();
    }
  };

  const handlePrev = () => {
    if (currentJokeIndex > 0) {
      setCurrentJokeIndex((prev) => prev - 1);
      stopAudio();
    }
  };

  // TTS Narrator
  const toggleAudioNarrator = () => {
    if (!('speechSynthesis' in window)) return;

    if (isReadingAudio) {
      stopAudio();
    } else if (activeJoke) {
      window.speechSynthesis.cancel();
      const textToRead = `${activeJoke.title}. ${activeJoke.content}. The punchline: ${activeJoke.punchline}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 0.95;
      utterance.pitch = 0.9;

      const voices = window.speechSynthesis.getVoices();
      const britishVoice = voices.find(
        (v) => v.lang.includes('en-GB') || v.lang.includes('en-AU') || v.name.includes('UK')
      );
      if (britishVoice) {
        utterance.voice = britishVoice;
      }

      utterance.onend = () => setIsReadingAudio(false);
      utterance.onerror = () => setIsReadingAudio(false);

      setIsReadingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReadingAudio(false);
    }
  };

  const handleSubmitJoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !newPunchline.trim()) return;

    const parsedTags = newTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    onAddNewJoke({
      title: newTitle,
      chapterId: newChapter,
      content: newContent,
      punchline: newPunchline,
      tags: parsedTags.length > 0 ? parsedTags : ['Pub Banter'],
      categoryType: newCategoryType,
      intensity: newIntensity,
      outrageScore: newIntensity === 'extreme' ? 98 : newIntensity === 'high' ? 92 : 80,
      pintsSpilled: 1,
    });

    playBanterSound('pint');
    setNewTitle('');
    setNewContent('');
    setNewPunchline('');
    setShowSubmitModal(false);
  };

  const isExtremeMasked =
    hideExtremeContent &&
    activeJoke?.intensity === 'extreme' &&
    !unmaskedJokes[activeJoke.id];

  return (
    <div className="space-y-6">
      {/* Book Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#12141c] via-[#161924] to-[#0e1017] border border-white/10 p-6 sm:p-10 shadow-xl overflow-hidden">
        {/* Glow & subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 text-xs text-amber-500 font-mono tracking-wider uppercase font-bold flex-wrap">
              <span>Uncensored Adult Edition</span>
              <span aria-hidden="true">·</span>
              <span>Volume 1</span>
              <span aria-hidden="true">·</span>
              <span>18+ Banter Vault</span>
              <span aria-hidden="true">·</span>
              <span className="text-red-400">Extreme Content Filters Available</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white uppercase leading-none">
              LAD JOKES: The Bible of Banter
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Curated adult humor, raunchy pub anecdotes, and catastrophe-tier stag do tales. Rate the outrage, spill pints in approval, or submit your own boundary-pushing material.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit a Lad Joke</span>
            </button>
          </div>
        </div>
      </div>

      {/* CATEGORY TABBED FILTER & CONTENT INTENSITY PREFERENCE BAR */}
      <div className="bg-[#10121a] border border-white/10 rounded-2xl p-4 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabbed Filter UI: All / Classic Pub / Raunchy / Disturbing */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setSelectedCategoryTab('all');
                setCurrentJokeIndex(0);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategoryTab === 'all'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
            >
              <span>All Jokes</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">
                {categoryCounts.all}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategoryTab('classic');
                setCurrentJokeIndex(0);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategoryTab === 'classic'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
              }`}
            >
              <span>🍺 Classic Pub</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">
                {categoryCounts.classic}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategoryTab('raunchy');
                setCurrentJokeIndex(0);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategoryTab === 'raunchy'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-md shadow-orange-500/20'
                  : 'text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20'
              }`}
            >
              <span>🔥 Raunchy</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">
                {categoryCounts.raunchy}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedCategoryTab('disturbing');
                setCurrentJokeIndex(0);
              }}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategoryTab === 'disturbing'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/30'
                  : 'text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 border border-red-500/30'
              }`}
            >
              <span>⚡ Disturbing</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20">
                {categoryCounts.disturbing}
              </span>
            </button>
          </div>

          {/* User Preference: Content Sensitivity Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleHideExtreme}
              className={`flex items-center gap-2 py-2 px-3.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                hideExtremeContent
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}
              title="Toggle censorship filter for extreme/boundary-pushing jokes"
            >
              {hideExtremeContent ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Sensitivity Filter: ON (Extreme Hidden)</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Sensitivity Filter: OFF (Uncensored)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Chapter Carousel & Search Bar */}
        <div className="pt-3 border-t border-white/5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            <button
              onClick={() => {
                setSelectedChapterId('all');
                setCurrentJokeIndex(0);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedChapterId === 'all'
                  ? 'bg-white/20 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-white/5'
              }`}
            >
              All Chapters
            </button>
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  setCurrentJokeIndex(0);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedChapterId === ch.id
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                Ch {ch.number}: {ch.title.split('&')[0]}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search jokes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentJokeIndex(0);
              }}
              className="w-full bg-[#181a24] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Main Joke Presentation Card */}
      {filteredJokes.length === 0 ? (
        <div className="text-center py-20 bg-[#10121a] rounded-2xl border border-white/10 p-8 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No jokes found for this filter</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your category tabs, chapter selector, or search keyword.
          </p>
          <button
            onClick={() => {
              setSelectedCategoryTab('all');
              setSelectedChapterId('all');
              setSearchQuery('');
            }}
            className="py-2 px-4 rounded-xl bg-amber-500 text-black font-bold text-xs cursor-pointer hover:bg-amber-400 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <article className="relative bg-[#11131b] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Card Top Metadata & Intensity Warning */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/5 gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="py-1 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold">
                JOKE {currentJokeIndex + 1} OF {filteredJokes.length}
              </span>

              {/* Category indicator tag */}
              <span className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded border uppercase ${
                activeJoke.categoryType === 'disturbing'
                  ? 'bg-red-500/15 border-red-500/40 text-red-400'
                  : activeJoke.categoryType === 'raunchy'
                  ? 'bg-orange-500/15 border-orange-500/40 text-orange-400'
                  : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
              }`}>
                {activeJoke.categoryType || 'Classic Pub'}
              </span>

              {/* CONTENT INTENSITY WARNING TAG */}
              {activeJoke.intensity === 'extreme' && (
                <div
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-[11px] font-mono font-bold tracking-wide animate-pulse"
                  title="Content Intensity: Extreme boundary-pushing adult material"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>EXTREME INTENSITY WARNING</span>
                </div>
              )}

              {activeJoke.intensity === 'high' && (
                <div
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-[11px] font-mono font-bold tracking-wide"
                  title="Content Intensity: High crude & adult themes"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
                  <span>HIGH INTENSITY</span>
                </div>
              )}
            </div>

            {/* Reader Tools */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudioNarrator}
                title={isReadingAudio ? 'Stop audio' : 'Listen with Lad TTS Voice'}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  isReadingAudio
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {isReadingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
                <span className="hidden sm:inline">
                  {isReadingAudio ? 'Mute Voice' : 'Read in Lad Voice'}
                </span>
              </button>

              <button
                onClick={() => onBookmarkJoke(activeJoke.id)}
                aria-label="Bookmark joke"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {activeJoke.bookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => onShareJoke(activeJoke)}
                aria-label="Share joke"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Book Content Body (or Gated Content Sensitivity Overlay) */}
          {isExtremeMasked ? (
            <div className="py-12 sm:py-16 max-w-xl mx-auto text-center space-y-4 p-6 rounded-2xl bg-red-950/20 border border-red-500/30">
              <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto text-xl">
                ⚠️
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                Content Hidden by Personal Sensitivity Filter
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                This joke is rated <strong>EXTREME INTENSITY</strong> (boundary-pushing, disturbing, or raunchy material). You currently have the Sensitivity Filter enabled.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() =>
                    setUnmaskedJokes((prev) => ({ ...prev, [activeJoke.id]: true }))
                  }
                  className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Reveal This Joke Only</span>
                </button>
                <button
                  onClick={toggleHideExtreme}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Turn Off Filter
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 sm:py-12 max-w-3xl mx-auto space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white leading-tight">
                {activeJoke.title}
              </h2>

              <div className="text-base sm:text-lg text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {activeJoke.content}
              </div>

              {/* Punchline Card with Reveal Option */}
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-amber-500/10 via-[#181a24] to-[#12141c] border border-amber-500/30 relative">
                <div className="flex items-center justify-between text-xs font-mono text-amber-400 font-bold uppercase mb-2">
                  <span>The Punchline</span>
                  <button
                    onClick={() => setShowPunchline(!showPunchline)}
                    className="text-slate-400 hover:text-white text-[11px] underline cursor-pointer"
                  >
                    {showPunchline ? 'Hide Punchline' : 'Reveal Punchline'}
                  </button>
                </div>

                {showPunchline ? (
                  <p className="text-lg sm:text-xl font-bold text-white tracking-wide leading-snug">
                    {activeJoke.punchline}
                  </p>
                ) : (
                  <div
                    onClick={() => setShowPunchline(true)}
                    className="py-4 text-center text-xs text-amber-400/80 cursor-pointer font-medium tracking-wide bg-amber-500/5 rounded-lg border border-dashed border-amber-500/30"
                  >
                    🍺 Click to reveal the punchline...
                  </div>
                )}
              </div>

              {/* Tags & Metadata */}
              <div className="flex flex-wrap items-center gap-3 pt-4 text-xs text-slate-400">
                <span className="font-semibold text-slate-500">TAGS:</span>
                {activeJoke.tags.map((tag, i) => (
                  <span key={i} className="text-slate-300">
                    #{tag}
                    {i < activeJoke.tags.length - 1 && <span className="ml-2 text-slate-600">·</span>}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reader Rating & Navigation Footer */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Outrage rating buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  onSpillPint(activeJoke.id);
                  playBanterSound('pint');
                }}
                className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Beer className="w-4 h-4 text-amber-400" />
                <span>Spill A Pint ({activeJoke.pintsSpilled})</span>
              </button>

              <button
                onClick={() => {
                  onRateJoke(activeJoke.id);
                  playBanterSound('outrage');
                }}
                className="flex items-center gap-2 py-2 px-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-red-500" />
                <span>Rate Outrage ({activeJoke.outrageScore}%)</span>
              </button>
            </div>

            {/* Paging controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentJokeIndex === 0}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 text-xs text-white font-medium transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentJokeIndex === filteredJokes.length - 1}
                className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-xs text-black font-bold transition-colors cursor-pointer"
              >
                <span>Next Joke</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </article>
      )}

      {/* Submit New Joke Modal with Category & Intensity Options */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-heading text-white mb-1">Submit a Joke to the Vault</h3>
            <p className="text-xs text-slate-400 mb-5">
              Submit your sharpest banter, raunchy adult gag, or disturbing gallows punchline.
            </p>

            <form onSubmit={handleSubmitJoke} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Joke Title</label>
                <input
                  type="text"
                  placeholder="e.g. The 4:00 AM Kebab Negotiation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value as JokeCategoryType)}
                    className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="classic">Classic Pub</option>
                    <option value="raunchy">Raunchy</option>
                    <option value="disturbing">Disturbing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Content Intensity</label>
                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value as ContentIntensity)}
                    className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="standard">Standard (Mild Banter)</option>
                    <option value="high">High (Crude Adult Humor)</option>
                    <option value="extreme">Extreme (Boundary-Pushing)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Chapter Target</label>
                <select
                  value={newChapter}
                  onChange={(e) => setNewChapter(e.target.value)}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {chapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      Ch {ch.number}: {ch.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">The Setup & Story</label>
                <textarea
                  rows={3}
                  placeholder="The setup or context of the joke..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">The Killer Punchline</label>
                  <button
                    type="button"
                    onClick={() => setIsCoachOpen(true)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 py-1 px-2.5 rounded-lg border border-amber-500/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ AI Punchline Coach</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="The final punchline..."
                  value={newPunchline}
                  onChange={(e) => setNewPunchline(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Pub Banter, Extreme, Classic"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Publish to Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Banter Coach for Punchlines */}
      <BanterCoachModal
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        initialMode="punchline"
        initialContext={newContent ? `Setup: ${newContent}` : newTitle || 'A hilarious pub setup'}
        onApplyText={(suggestedPunchline) => setNewPunchline(suggestedPunchline)}
      />
    </div>
  );
};
