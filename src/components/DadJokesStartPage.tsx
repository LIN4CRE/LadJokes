import React, { useState, useMemo } from 'react';
import {
  Smile,
  Volume2,
  VolumeX,
  Share2,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Search,
  Sparkles,
  ArrowRight,
  ThumbsDown,
  Laugh,
  Flame,
  BookOpen,
} from 'lucide-react';
import { DadJoke, INITIAL_DAD_JOKES } from '../data/dadJokesData';
import { playBanterSound } from '../services/syncService';

interface DadJokesStartPageProps {
  onNavigateToBook: () => void;
  onNavigateToCommunity: () => void;
}

export const DadJokesStartPage: React.FC<DadJokesStartPageProps> = ({
  onNavigateToBook,
  onNavigateToCommunity,
}) => {
  const [dadJokes, setDadJokes] = useState<DadJoke[]>(() => {
    const saved = localStorage.getItem('lad_jokes_dad_jokes_v1');
    return saved ? JSON.parse(saved) : INITIAL_DAD_JOKES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [randomJokeIndex, setRandomJokeIndex] = useState(0);
  const [revealedPunchlines, setRevealedPunchlines] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // New dad joke form
  const [newSetup, setNewSetup] = useState('');
  const [newPunchline, setNewPunchline] = useState('');
  const [newCategory, setNewCategory] = useState<DadJoke['category']>('Classic');

  // Categories list
  const categories = ['All', 'Classic', 'Puns', 'Animals', 'Food', 'Work & Life'];

  // Save dad jokes on change
  const saveJokes = (updated: DadJoke[]) => {
    setDadJokes(updated);
    localStorage.setItem('lad_jokes_dad_jokes_v1', JSON.stringify(updated));
  };

  // Filtered jokes
  const filteredJokes = useMemo(() => {
    return dadJokes.filter((j) => {
      const matchCat = selectedCategory === 'All' || j.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        j.setup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.punchline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [dadJokes, selectedCategory, searchQuery]);

  const spotlightJoke = dadJokes[randomJokeIndex % dadJokes.length] || dadJokes[0];

  const handleNextRandom = () => {
    playBanterSound('pint');
    setRandomJokeIndex((prev) => (prev + 1 + Math.floor(Math.random() * (dadJokes.length - 1))) % dadJokes.length);
    stopAudio();
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleReveal = (id: string) => {
    setRevealedPunchlines((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVote = (id: string, type: 'groan' | 'chuckle') => {
    const updated = dadJokes.map((j) => {
      if (j.id === id) {
        return {
          ...j,
          groanCount: type === 'groan' ? j.groanCount + 1 : j.groanCount,
          chuckleCount: type === 'chuckle' ? j.chuckleCount + 1 : j.chuckleCount,
        };
      }
      return j;
    });
    saveJokes(updated);
    if (type === 'groan') {
      playBanterSound('outrage');
    } else {
      playBanterSound('pint');
    }
  };

  const speakJoke = (setup: string, punchline: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      stopAudio();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(`${setup}... ${punchline}!`);
    utterance.rate = 0.9;
    utterance.pitch = 0.85;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find((v) => v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('David') || v.name.includes('George')));
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleAddDadJoke = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetup.trim() || !newPunchline.trim()) return;

    const newJokeItem: DadJoke = {
      id: `dad-${Date.now()}`,
      setup: newSetup.trim(),
      punchline: newPunchline.trim(),
      category: newCategory,
      groanCount: 1,
      chuckleCount: 2,
    };

    saveJokes([newJokeItem, ...dadJokes]);
    playBanterSound('pint');
    setNewSetup('');
    setNewPunchline('');
    setShowSubmitModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#131620] via-[#171b28] to-[#0d0f17] border border-amber-500/20 p-6 sm:p-12 shadow-2xl overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
              <Smile className="w-4 h-4 text-amber-400" />
              <span>The Official Start Page</span>
              <span>·</span>
              <span className="text-emerald-400">Simple & Clean Humor</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-none uppercase">
              Classic Dad Jokes
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Simple, punchy, groan-worthy dad humor to warm you up. Guaranteed 100% eye-rolls, instant laughs, and corny punchlines that never get old!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNavigateToBook}
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Jump to 18+ Lad Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Submit a Dad Joke</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex lg:flex-col gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-white/10 text-center min-w-[130px]">
              <div className="text-2xl font-bold font-mono text-amber-400">{dadJokes.length}</div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Dad Jokes</div>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-white/10 text-center min-w-[130px]">
              <div className="text-2xl font-bold font-mono text-emerald-400">100%</div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Groan Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* SPOTLIGHT: Interactive "Dad Joke of the Moment" Generator */}
      <section className="bg-gradient-to-r from-[#11131c] via-[#151926] to-[#11131c] border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
          <div className="flex items-center gap-2">
            <span className="py-1 px-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-bold uppercase">
              ⚡ Dad Joke of the Moment
            </span>
            <span className="py-1 px-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
              {spotlightJoke.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => speakJoke(spotlightJoke.setup, spotlightJoke.punchline)}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSpeaking
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
              }`}
              title="Hear joke in Dad voice"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              <span className="text-xs">{isSpeaking ? 'Stop' : 'Listen'}</span>
            </button>

            <button
              onClick={() => handleCopy(`${spotlightJoke.setup} — ${spotlightJoke.punchline}`, spotlightJoke.id)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy joke"
            >
              {copiedId === spotlightJoke.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleNextRandom}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Another One</span>
            </button>
          </div>
        </div>

        {/* Big Joke Setup & Interactive Punchline */}
        <div className="py-8 sm:py-12 max-w-2xl mx-auto text-center space-y-6">
          <p className="text-2xl sm:text-4xl font-display font-bold text-white leading-tight">
            "{spotlightJoke.setup}"
          </p>

          {/* Interactive Reveal Punchline */}
          <div className="pt-2">
            {revealedPunchlines[spotlightJoke.id] ? (
              <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-xl sm:text-2xl font-extrabold text-amber-300 tracking-wide font-sans">
                  👉 {spotlightJoke.punchline}
                </p>
              </div>
            ) : (
              <button
                onClick={() => toggleReveal(spotlightJoke.id)}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/40 text-amber-300 text-sm sm:text-base font-bold tracking-wide transition-all shadow-lg cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
              >
                😂 Click to reveal the punchline...
              </button>
            )}
          </div>

          {/* Groan vs Chuckle Reactions */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleVote(spotlightJoke.id, 'groan')}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-300 hover:text-red-400 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <ThumbsDown className="w-4 h-4 text-red-400" />
              <span>Dad Groan 🤦‍♂️ ({spotlightJoke.groanCount})</span>
            </button>

            <button
              onClick={() => handleVote(spotlightJoke.id, 'chuckle')}
              className="flex items-center gap-2 py-2 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            >
              <Laugh className="w-4 h-4 text-amber-400" />
              <span>Chuckle 😂 ({spotlightJoke.chuckleCount})</span>
            </button>
          </div>
        </div>
      </section>

      {/* FILTER & SEARCH BAR */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#10121a] border border-white/10 rounded-2xl p-4">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {cat === 'All' ? 'All Dad Jokes' : cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search dad jokes & puns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181a24] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Dad Jokes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJokes.map((joke) => {
            const isRevealed = revealedPunchlines[joke.id];
            return (
              <article
                key={joke.id}
                className="bg-[#11131c] border border-white/10 hover:border-amber-500/30 rounded-2xl p-5 space-y-4 transition-all shadow-md flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {joke.category}
                    </span>
                    <button
                      onClick={() => handleCopy(`${joke.setup} — ${joke.punchline}`, joke.id)}
                      className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy joke"
                    >
                      {copiedId === joke.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {joke.setup}
                  </h3>

                  {/* Punchline toggle */}
                  <div className="pt-1">
                    {isRevealed ? (
                      <p className="text-sm font-semibold text-amber-400 font-sans leading-normal animate-in fade-in duration-150">
                        👉 {joke.punchline}
                      </p>
                    ) : (
                      <button
                        onClick={() => toggleReveal(joke.id)}
                        className="text-xs text-slate-400 hover:text-amber-400 underline cursor-pointer font-medium"
                      >
                        Click for punchline...
                      </button>
                    )}
                  </div>
                </div>

                {/* Card reactions footer */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(joke.id, 'groan')}
                      className="flex items-center gap-1 hover:text-red-400 transition-colors cursor-pointer"
                      title="Dad Groan"
                    >
                      <span>🤦‍♂️</span>
                      <span>{joke.groanCount}</span>
                    </button>
                    <button
                      onClick={() => handleVote(joke.id, 'chuckle')}
                      className="flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer"
                      title="Chuckle"
                    >
                      <span>😂</span>
                      <span>{joke.chuckleCount}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => speakJoke(joke.setup, joke.punchline)}
                    className="hover:text-white transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Speak</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* BOTTOM TRANSITION BANNER: Enter the Heavy 18+ Vault */}
      <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-red-500/10 to-transparent border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xl font-bold font-heading text-white">
            Had your fill of wholesome Dad Jokes?
          </h4>
          <p className="text-xs sm:text-sm text-slate-300">
            Step into the 18+ Uncensored Lad Vault for crude pub tales, stag do benders, and boundary-pushing jokes.
          </p>
        </div>

        <button
          onClick={onNavigateToBook}
          className="shrink-0 flex items-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95"
        >
          <span>Open 18+ Lad Vault</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </section>

      {/* Submit Dad Joke Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold font-heading text-white">Submit a Dad Joke</h3>
            <p className="text-xs text-slate-400">
              Share your favorite corny setup and groan-worthy punchline.
            </p>

            <form onSubmit={handleAddDadJoke} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as DadJoke['category'])}
                  className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Classic">Classic</option>
                  <option value="Puns">Puns</option>
                  <option value="Animals">Animals</option>
                  <option value="Food">Food</option>
                  <option value="Work & Life">Work & Life</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Setup / Question</label>
                <input
                  type="text"
                  placeholder="e.g. Why don't eggs tell jokes?"
                  value={newSetup}
                  onChange={(e) => setNewSetup(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Punchline / Answer</label>
                <input
                  type="text"
                  placeholder="e.g. They'd crack each other up."
                  value={newPunchline}
                  onChange={(e) => setNewPunchline(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Post Dad Joke
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
