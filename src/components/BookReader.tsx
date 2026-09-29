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
  Sparkles,
  PlusCircle,
  Search,
  Beer,
  Flame,
  Check,
} from 'lucide-react';
import { Chapter, Joke } from '../types';
import { playBanterSound } from '../services/syncService';

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
  const [currentJokeIndex, setCurrentJokeIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReadingAudio, setIsReadingAudio] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showPunchline, setShowPunchline] = useState(true);

  // New Joke form state
  const [newTitle, setNewTitle] = useState('');
  const [newChapter, setNewChapter] = useState('ch-1');
  const [newContent, setNewContent] = useState('');
  const [newPunchline, setNewPunchline] = useState('');
  const [newTags, setNewTags] = useState('Pub Banter, Outrageous');

  // Filter jokes
  const filteredJokes = jokes.filter((j) => {
    const matchChapter = selectedChapterId === 'all' || j.chapterId === selectedChapterId;
    const matchSearch =
      searchQuery.trim() === '' ||
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.punchline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchChapter && matchSearch;
  });

  const activeJoke = filteredJokes[currentJokeIndex] || jokes[0];

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
      utterance.pitch = 0.9; // cheeky low pitch

      // Try British or English voice
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

    onAddNewJoke({
      title: newTitle,
      chapterId: newChapter,
      content: newContent,
      punchline: newPunchline,
      tags: newTags.split(',').map((t) => t.trim()),
    });

    playBanterSound('pint');
    setNewTitle('');
    setNewContent('');
    setNewPunchline('');
    setShowSubmitModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Book Hero Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#12141c] via-[#161924] to-[#0e1017] border border-white/10 p-6 sm:p-10 shadow-xl overflow-hidden">
        {/* Glow & subtle ambient lighting */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3 text-xs text-amber-500 font-mono tracking-wider uppercase font-bold">
              <span>Uncensored Adult Edition</span>
              <span aria-hidden="true">·</span>
              <span>Volume 1</span>
              <span aria-hidden="true">·</span>
              <span>18+ Banter Vault</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white uppercase leading-none">
              LAD JOKES: The Bible of Banter
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Curated adult humor, raunchy pub anecdotes, and catastrophe-tier stag do tales. Rate the outrage, spill pints in approval, or submit your own crude material.
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

      {/* Chapters & Search Controls */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Chapter Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#10121a] rounded-xl border border-white/5 scrollbar-none">
          <button
            onClick={() => {
              setSelectedChapterId('all');
              setCurrentJokeIndex(0);
            }}
            className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedChapterId === 'all'
                ? 'bg-amber-500 text-black font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Chapters ({jokes.length})
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
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Ch {ch.number}: {ch.title.split('&')[0]}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search jokes, tags, puns..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentJokeIndex(0);
            }}
            className="w-full bg-[#10121a] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
      </div>

      {/* Interactive Book Reader Canvas */}
      {filteredJokes.length === 0 ? (
        <div className="text-center py-20 bg-[#10121a] rounded-2xl border border-white/5 text-slate-400 text-sm">
          No jokes match your search. Try adjusting keywords or selecting another chapter!
        </div>
      ) : (
        <div className="relative bg-[#10121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-10">
          {/* Book Spine Texture Edge */}
          <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-r from-black via-amber-900/30 to-transparent" />

          {/* Reader Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/5">
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="font-mono text-amber-400 font-bold">
                JOKE {currentJokeIndex + 1} OF {filteredJokes.length}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {chapters.find((c) => c.id === activeJoke.chapterId)?.title || 'Banter Archive'}
              </span>
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

          {/* Book Content Body */}
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
                <Flame className="w-4 h-4 text-red-400" />
                <span>Outrage Score ({activeJoke.outrageScore}%)</span>
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={currentJokeIndex === 0}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 border border-white/10 text-xs font-medium text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <button
                onClick={handleNext}
                disabled={currentJokeIndex === filteredJokes.length - 1}
                className="flex items-center gap-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-xs font-bold text-black transition-colors cursor-pointer"
              >
                <span>Next Joke</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Joke Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold font-heading text-white mb-2">
              Submit A Lad Joke to The Vault
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Got a classic pub one-liner, Sunday League catastrophe, or stag prank joke? Add it to the official book.
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
                <label className="block text-xs font-medium text-slate-400 mb-1">The Killer Punchline</label>
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
                  placeholder="Pub Banter, Lock-in, Classic"
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
    </div>
  );
};
