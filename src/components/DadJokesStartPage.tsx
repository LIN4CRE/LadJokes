import React, { useState, useMemo, useEffect } from 'react';
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
  Shuffle,
  Beer,
  MessageSquare,
} from 'lucide-react';
import { DadJoke, INITIAL_DAD_JOKES } from '../data/dadJokesData';
import { playBanterSound } from '../services/syncService';
import {
  bazSpeech,
  BAZ_VOICE_PROFILES,
  BazVoiceType,
  BazSpeechState,
} from '../services/bazSpeechEngine';
import { BazAnimatedAvatar } from './BazAnimatedAvatar';

interface DadJokesStartPageProps {
  onNavigateToBook: () => void;
  onNavigateToCommunity: () => void;
  onOpenBanterCoach?: (initialContext?: string) => void;
}

export const DadJokesStartPage: React.FC<DadJokesStartPageProps> = ({
  onNavigateToBook,
  onNavigateToCommunity,
  onOpenBanterCoach,
}) => {
  const [dadJokes, setDadJokes] = useState<DadJoke[]>(() => {
    const saved = localStorage.getItem('lad_jokes_dad_jokes_v4');
    if (saved) return JSON.parse(saved);
    const v3 =
      localStorage.getItem('lad_jokes_dad_jokes_v3') ||
      localStorage.getItem('lad_jokes_dad_jokes_v2') ||
      localStorage.getItem('lad_jokes_dad_jokes_v1');
    if (v3) {
      try {
        const parsed = JSON.parse(v3);
        const userAdded = parsed.filter(
          (j: DadJoke) => !INITIAL_DAD_JOKES.some((init) => init.id === j.id)
        );
        return [...INITIAL_DAD_JOKES, ...userAdded];
      } catch {
        return INITIAL_DAD_JOKES;
      }
    }
    return INITIAL_DAD_JOKES;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [randomJokeIndex, setRandomJokeIndex] = useState(0);
  const [revealedPunchlines, setRevealedPunchlines] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Baz speech & voice engine subscription
  const [selectedVoice, setSelectedVoice] = useState<BazVoiceType>('baz');
  const [speechState, setSpeechState] = useState<BazSpeechState>({
    phase: 'idle',
    isSpeaking: false,
    activeWord: '',
    currentText: '',
    mouthOpen: false,
    selectedVoice: 'baz',
  });

  useEffect(() => {
    return bazSpeech.subscribe(setSpeechState);
  }, []);

  // Shuffle seed to randomize feed all the time
  const [shuffleSeed, setShuffleSeed] = useState(() => Math.random());

  // New dad joke form
  const [newSetup, setNewSetup] = useState('');
  const [newPunchline, setNewPunchline] = useState('');
  const [newCategory, setNewCategory] = useState<DadJoke['category']>('Classic');

  // Categories list
  const categories = ['All', 'Classic', 'Puns', 'Animals', 'Food', 'Work & Life'];

  // Save dad jokes on change
  const saveJokes = (updated: DadJoke[]) => {
    setDadJokes(updated);
    localStorage.setItem('lad_jokes_dad_jokes_v4', JSON.stringify(updated));
  };

  // Shuffle helper function (Fisher-Yates)
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Filtered and randomly shuffled jokes
  const filteredJokes = useMemo(() => {
    const filtered = dadJokes.filter((j) => {
      const matchCat = selectedCategory === 'All' || j.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        j.setup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.punchline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    // Always randomize unless searching specifically
    if (searchQuery.trim() === '') {
      return shuffleArray(filtered);
    }
    return filtered;
  }, [dadJokes, selectedCategory, searchQuery, shuffleSeed]);

  const spotlightJoke = dadJokes[randomJokeIndex % dadJokes.length] || dadJokes[0];

  const handleNextRandom = () => {
    playBanterSound('pint');
    setRandomJokeIndex(
      (prev) => (prev + 1 + Math.floor(Math.random() * (dadJokes.length - 1))) % dadJokes.length
    );
    bazSpeech.stop();
  };

  const handleShuffleFeed = () => {
    setShuffleSeed(Math.random());
    playBanterSound('pint');
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
    playBanterSound(type === 'chuckle' ? 'pint' : 'pop');
  };

  // Deliver Joke with Baz Animated Speech
  const handleReadAloudWithBaz = (joke: DadJoke) => {
    playBanterSound('pint');
    setRevealedPunchlines((prev) => ({ ...prev, [joke.id]: true }));
    bazSpeech.deliverJoke(joke.setup, joke.punchline, selectedVoice);
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
              <span className="text-emerald-400">Randomized Feed Always</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-none uppercase">
              Classic Dad Jokes
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
              Simple, punchy, groan-worthy dad humor to warm you up. Guaranteed 100% eye-rolls, instant laughs, and corny punchlines narrated live by Baz The Banter Coach!
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
                onClick={handleShuffleFeed}
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
              >
                <Shuffle className="w-4 h-4 text-amber-400" />
                <span>🔀 Shuffle Joke Feed</span>
              </button>

              <button
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-2 py-3 px-5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 text-amber-400" />
                <span>Submit a Joke</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex lg:flex-col gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-white/10 text-center min-w-[130px]">
              <span className="block text-3xl font-display font-bold text-amber-400">
                {dadJokes.length}
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">Total Jokes</span>
            </div>
            <div className="p-4 rounded-2xl bg-[#0f1118]/80 border border-white/10 text-center min-w-[130px]">
              <span className="block text-3xl font-display font-bold text-emerald-400">
                100%
              </span>
              <span className="text-xs font-mono text-slate-400 uppercase">Eye Roll Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Baz's Pint-Side Spotlight Joke Card */}
      <section className="relative rounded-3xl bg-[#12141e] border-2 border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <BazAnimatedAvatar
                mouthOpen={speechState.mouthOpen}
                phase={speechState.phase}
                isSpeaking={speechState.isSpeaking}
                size="sm"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="py-0.5 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
                  ⚡ Baz's Pint-Side Spotlight
                </span>
                <span className="py-0.5 px-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                  {spotlightJoke.category}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Delivered live by <strong>{BAZ_VOICE_PROFILES[selectedVoice].name}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Voice Profile Selector */}
            <select
              value={selectedVoice}
              onChange={(e) => {
                const v = e.target.value as BazVoiceType;
                setSelectedVoice(v);
                bazSpeech.setVoice(v);
                playBanterSound('pop');
              }}
              className="bg-[#181a26] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
            >
              <option value="baz">🍺 Baz (The Gaffer)</option>
              <option value="gazza">⚡ Gazza (The Livewire)</option>
              <option value="trev">⚽ Big Trev (Sunday League)</option>
              <option value="archie">🎩 Archie (Oxford Wit)</option>
            </select>

            <button
              onClick={() => handleReadAloudWithBaz(spotlightJoke)}
              className="py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
              title="Hear Baz deliver this joke with comedic timing"
            >
              <Volume2 className="w-4 h-4 fill-current" />
              <span>Read with Baz</span>
            </button>

            {onOpenBanterCoach && (
              <button
                onClick={() =>
                  onOpenBanterCoach(
                    `Give me funny comebacks or punch up this joke: "${spotlightJoke.setup} — ${spotlightJoke.punchline}"`
                  )
                }
                className="py-1.5 px-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Ask Baz to roast or punch up this joke"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Roast Joke</span>
              </button>
            )}

            <button
              onClick={() =>
                handleCopy(
                  `${spotlightJoke.setup} — ${spotlightJoke.punchline}`,
                  spotlightJoke.id
                )
              }
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Copy joke"
            >
              {copiedId === spotlightJoke.id ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleNextRandom}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Spin Another</span>
            </button>
          </div>
        </div>

        {/* Big Joke Setup & Interactive Punchline */}
        <div className="py-6 sm:py-10 max-w-2xl mx-auto text-center space-y-6">
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
          <div className="flex items-center justify-center gap-4 pt-2">
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

      {/* Main Jokes Feed with Dynamic Categories & Shuffle Toolbar */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

          {/* Search Box & Shuffle Button */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleShuffleFeed}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap active:scale-95 shadow-sm"
              title="Shuffle jokes to get a completely fresh random selection"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>🔀 Shuffle Feed</span>
            </button>

            <div className="relative flex-1 md:w-64">
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

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleReadAloudWithBaz(joke)}
                        className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors cursor-pointer"
                        title="Read Aloud with Baz"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>Baz Voice</span>
                      </button>

                      <button
                        onClick={() =>
                          handleCopy(`${joke.setup} — ${joke.punchline}`, joke.id)
                        }
                        className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Copy joke"
                      >
                        {copiedId === joke.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
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
                        className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors cursor-pointer underline decoration-dotted"
                      >
                        Reveal punchline...
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleVote(joke.id, 'groan')}
                      className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                      title="Groan"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{joke.groanCount}</span>
                    </button>
                    <button
                      onClick={() => handleVote(joke.id, 'chuckle')}
                      className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                      title="Chuckle"
                    >
                      <Laugh className="w-3.5 h-3.5" />
                      <span>{joke.chuckleCount}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {onOpenBanterCoach && (
                      <button
                        onClick={() =>
                          onOpenBanterCoach(
                            `How would you roast or punch up this joke: "${joke.setup} — ${joke.punchline}"?`
                          )
                        }
                        className="text-[11px] text-purple-400 hover:text-purple-300 font-mono transition-colors cursor-pointer flex items-center gap-1"
                        title="Ask Baz to roast this joke"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Roast</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleCopy(`${joke.setup} — ${joke.punchline}`, joke.id)
                      }
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                    >
                      <Share2 className="w-3 h-3 text-amber-400" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Submit Joke Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold font-heading text-white mb-1">
              Submit a Dad Joke
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add your corniest, groan-inducing joke to the community start vault.
            </p>

            <form onSubmit={handleAddDadJoke} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#161824] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Classic">Classic</option>
                  <option value="Puns">Puns</option>
                  <option value="Animals">Animals</option>
                  <option value="Food">Food</option>
                  <option value="Work & Life">Work & Life</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Setup (The Question / Opening)
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Why did the bicycle fall over?"
                  value={newSetup}
                  onChange={(e) => setNewSetup(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Punchline
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Because it was two-tired."
                  value={newPunchline}
                  onChange={(e) => setNewPunchline(e.target.value)}
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
                  Publish Joke
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
