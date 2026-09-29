import React, { useState } from 'react';
import {
  MessageSquare,
  Flame,
  Beer,
  Share2,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Eye,
  Trophy,
  Sparkles,
  HelpCircle,
  Zap,
  Volume2,
  Headphones,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { CommunityStory, OutrageType, Comment, DailyBanterPrompt, LadTier } from '../types';
import { playBanterSound } from '../services/syncService';
import { LadTierBadge } from './LadTierBadge';
import { BanterCoachModal } from './BanterCoachModal';
import { StoryAudioPlayerModal } from './StoryAudioPlayerModal';

interface CommunityForumProps {
  stories: CommunityStory[];
  dailyPrompts?: DailyBanterPrompt[];
  currentUserTier?: LadTier;
  onRateOutrage: (storyId: string, ratingType: OutrageType) => void;
  onShareStory: (story: CommunityStory) => void;
  onPostStory: (newStory: Partial<CommunityStory>) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  stories,
  dailyPrompts = [
    {
      id: 'prompt-today',
      topic: 'The Worst Excuse Ever Used to Flee a Catastrophic Date',
      description: 'Whether it was faking a flat flood, pretending your ferret was being air-lifted to hospital, or jumping out the bathroom window at Nando’s.',
      date: "Today's Banter Prompt",
      expiresIn: '8h 24m remaining',
      entriesCount: 42,
      topEntryId: 'story-daily-1',
    },
  ],
  currentUserTier = 'Pub Legend',
  onRateOutrage,
  onShareStory,
  onPostStory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterDailyOnly, setFilterDailyOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'engagement' | 'outrage' | 'freshest' | 'pints'>('engagement');
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeStoryForComments, setActiveStoryForComments] = useState<CommunityStory | null>(null);

  // New story modal state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityStory['category']>('Pub Tales');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isDailyPromptEntry, setIsDailyPromptEntry] = useState(false);

  // Story comments state
  const [comments, setComments] = useState<Record<string, Comment[]>>(() => {
    const saved = localStorage.getItem('lad_jokes_story_comments_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });
  const [newCommentText, setNewCommentText] = useState('');
  const [coachModalConfig, setCoachModalConfig] = useState<{
    isOpen: boolean;
    mode: 'punchline' | 'witty_response' | 'story_polish' | 'chat';
    context: string;
    onApply?: (text: string) => void;
  }>({
    isOpen: false,
    mode: 'story_polish',
    context: '',
  });
  const [storyForAudio, setStoryForAudio] = useState<CommunityStory | null>(null);
  const [promptViewTab, setPromptViewTab] = useState<'today' | 'archive'>('today');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [expandedArchiveIds, setExpandedArchiveIds] = useState<Record<string, boolean>>({});

  // Categories list
  const categories = ['All', 'Stag Do', 'Pub Tales', 'Dating Fails', 'Sunday League', 'Workplace', 'Hangover Horror'];

  const activePrompt = dailyPrompts[0];
  const archivePrompts = dailyPrompts.filter((p) => p.id !== 'prompt-today');

  const filteredArchivePrompts = archivePrompts.filter((p) => {
    if (!archiveSearch.trim()) return true;
    const query = archiveSearch.toLowerCase();
    return (
      p.topic.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      (p.winnerTitle && p.winnerTitle.toLowerCase().includes(query)) ||
      (p.winnerAuthor && p.winnerAuthor.toLowerCase().includes(query)) ||
      (p.winnerContent && p.winnerContent.toLowerCase().includes(query))
    );
  });

  const handleListenToArchiveWinner = (p: DailyBanterPrompt) => {
    const syntheticStory: CommunityStory = {
      id: `archive-${p.id}`,
      author: p.winnerAuthor || 'Anonymous Winner',
      authorBadge: 'Archive Champion',
      authorTier: p.winnerAuthorTier || 'Pub Legend',
      avatar: p.winnerAvatar || '🏆',
      title: p.winnerTitle || p.topic,
      category: 'Pub Tales',
      content: p.winnerContent || p.description,
      outrageRatings: {
        properBanter: Math.round((p.winnerOutrageScore || 90) * 3),
        absoluteWeapon: Math.round((p.winnerOutrageScore || 90) * 1.5),
        spilledPint: p.winnerPints || 650,
        nuclearOutrage: Math.round((p.winnerOutrageScore || 90) * 0.8),
      },
      commentsCount: p.entriesCount,
      createdAt: p.date,
      verifiedLad: true,
      views: 4500,
      engagementScore: 100,
    };
    setStoryForAudio(syntheticStory);
    playBanterSound('pint');
  };

  // Determine the Top Entry of the Day
  const topDailyEntry = stories.find((s) => s.id === activePrompt?.topEntryId) ||
    stories.filter((s) => s.isDailyPromptEntry).sort((a, b) => b.outrageRatings.spilledPint - a.outrageRatings.spilledPint)[0] ||
    stories[0];

  // Filter & Sort stories
  const filteredStories = stories
    .filter((s) => {
      const matchCategory = selectedCategory === 'All' || s.category === selectedCategory;
      const matchDaily = !filterDailyOnly || s.isDailyPromptEntry;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchDaily && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'engagement') {
        return b.engagementScore - a.engagementScore;
      }
      if (sortBy === 'outrage') {
        const outrageA = a.outrageRatings.nuclearOutrage * 2 + a.outrageRatings.absoluteWeapon;
        const outrageB = b.outrageRatings.nuclearOutrage * 2 + b.outrageRatings.absoluteWeapon;
        return outrageB - outrageA;
      }
      if (sortBy === 'pints') {
        return b.outrageRatings.spilledPint - a.outrageRatings.spilledPint;
      }
      return 0; // default order
    });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    let authorName = newAuthor.trim();
    let authorAvatar = '🍺';
    let authorBadge = 'Rookie Contributor';
    let authorTier: LadTier = currentUserTier;

    if (isGhostMode) {
      const ghostNumber = Math.floor(100 + Math.random() * 900);
      authorName = `Anonymous Lad #${ghostNumber}`;
      authorAvatar = '👻';
      authorBadge = 'Ghost Contributor';
      authorTier = 'Rookie Lad';
    } else if (!authorName) {
      authorName = 'TopBanterLad_' + Math.floor(Math.random() * 900 + 100);
    }

    onPostStory({
      title: newTitle,
      category: newCategory,
      content: newContent,
      author: authorName,
      authorBadge,
      authorTier,
      avatar: authorAvatar,
      verifiedLad: !isGhostMode,
      isGhostMode,
      isDailyPromptEntry,
    });

    playBanterSound('pint');
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setIsGhostMode(false);
    setIsDailyPromptEntry(false);
    setShowPostModal(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoryForComments || !newCommentText.trim()) return;

    const commentId = 'c-' + Date.now();
    const commentItem: Comment = {
      id: commentId,
      storyId: activeStoryForComments.id,
      author: 'You',
      authorTier: currentUserTier,
      avatar: '🍺',
      text: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 1,
    };

    setComments((prev) => {
      const updated = {
        ...prev,
        [activeStoryForComments.id]: [...(prev[activeStoryForComments.id] || []), commentItem],
      };
      localStorage.setItem('lad_jokes_story_comments_v2', JSON.stringify(updated));
      return updated;
    });

    activeStoryForComments.commentsCount += 1;
    setNewCommentText('');
    playBanterSound('pop');
    playBanterSound('pop');
  };

  const calculateOutragePercent = (ratings: CommunityStory['outrageRatings']) => {
    const total = ratings.properBanter + ratings.absoluteWeapon + ratings.spilledPint + ratings.nuclearOutrage;
    if (total === 0) return 50;
    const weighted = ratings.properBanter * 25 + ratings.absoluteWeapon * 65 + ratings.spilledPint * 80 + ratings.nuclearOutrage * 100;
    return Math.round(weighted / total);
  };

  return (
    <div className="space-y-6">
      {/* Community Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141620] via-[#171a26] to-[#10121a] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-500 font-mono tracking-wider uppercase font-bold">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Outrageous Shared Experiences · Anonymous Feed</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-wide text-white uppercase">
              CRUDE CONFESSIONS & TALES
            </h2>
            <p className="text-sm text-slate-300">
              The unedited archives of stag disasters, hangover catastrophes, pub brawls, and Sunday league shame. Level up your Lad Tier with every spilled pint.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => {
                setIsDailyPromptEntry(true);
                setShowPostModal(true);
              }}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Daily Prompt Entry</span>
            </button>

            <button
              onClick={() => {
                setIsDailyPromptEntry(false);
                setShowPostModal(true);
              }}
              className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Confess Your Tale</span>
            </button>
          </div>
        </div>
      </div>

      {/* DAILY BANTER PROMPT & WEEKLY ARCHIVE */}
      {activePrompt && (
        <div className="relative rounded-2xl bg-gradient-to-br from-[#1c1710] via-[#151722] to-[#10121a] border border-amber-500/30 p-5 sm:p-6 shadow-2xl overflow-hidden">
          {/* Subtle amber aura in corner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Sub-Tabs: Today's Live Prompt vs Weekly Archive */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPromptViewTab('today')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  promptViewTab === 'today'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Today's Live Prompt</span>
              </button>

              <button
                onClick={() => setPromptViewTab('archive')}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  promptViewTab === 'archive'
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white bg-white/5'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Weekly Archive (Past 7 Days)</span>
                <span className="text-[10px] font-mono py-0.5 px-2 rounded-full bg-amber-500/20 text-amber-300">
                  {archivePrompts.length} Days
                </span>
              </button>
            </div>

            {promptViewTab === 'archive' && (
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search past winners & topics..."
                  value={archiveSearch}
                  onChange={(e) => setArchiveSearch(e.target.value)}
                  className="w-full bg-[#13151f] border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>

          {/* TAB 1: TODAY'S LIVE PROMPT */}
          {promptViewTab === 'today' && (
            <div className="relative z-10 space-y-5 animate-in fade-in duration-200">
              {/* Prompt Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Zap className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                      <span>{activePrompt.date}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-400 font-normal">{activePrompt.expiresIn}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                      {activePrompt.topic}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-400">
                    <strong className="text-amber-400">{activePrompt.entriesCount}</strong> Lads Participated
                  </span>
                  <button
                    onClick={() => {
                      setIsDailyPromptEntry(true);
                      setShowPostModal(true);
                    }}
                    className="py-1.5 px-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                  >
                    Submit Entry
                  </button>
                </div>
              </div>

              {/* Prompt Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {activePrompt.description}
              </p>

              {/* TOP ENTRY HIGHLIGHT SECTION */}
              {topDailyEntry && (
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#181a26] to-[#12141c] border border-amber-500/40 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>TOP ENTRY OF THE DAY · CROWN OF BANTER</span>
                    </div>
                    <span className="text-[11px] font-mono text-amber-400 font-semibold bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                      🍺 {topDailyEntry.outrageRatings.spilledPint} Pints Spilled
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{topDailyEntry.author}</span>
                      <LadTierBadge tier={topDailyEntry.authorTier || 'Pub Legend'} size="sm" />
                      <span className="text-[11px] text-slate-500 font-mono">· {topDailyEntry.createdAt}</span>
                    </div>

                    <h4 className="text-base font-bold text-amber-300 leading-snug">
                      "{topDailyEntry.title}"
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 leading-relaxed">
                      {topDailyEntry.content}
                    </p>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                        <span>Outrage: <strong className="text-red-400">{calculateOutragePercent(topDailyEntry.outrageRatings)}%</strong></span>
                        <span>·</span>
                        <span>Comments: <strong className="text-slate-200">{topDailyEntry.commentsCount}</strong></span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setStoryForAudio(topDailyEntry);
                            playBanterSound('pint');
                          }}
                          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>Listen (TTS)</span>
                        </button>

                        <button
                          onClick={() => setActiveStoryForComments(topDailyEntry)}
                          className="text-amber-400 hover:text-amber-300 font-semibold text-xs hover:underline cursor-pointer"
                        >
                          View Full Banter & Comments →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEEKLY ARCHIVE (PAST 7 DAYS) */}
          {promptViewTab === 'archive' && (
            <div className="relative z-10 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-white font-heading flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Hall of Banter Champions · Past 7 Days</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Crowned winning entries voted the most outrageous by the pub community.
                  </p>
                </div>
                <span className="hidden sm:inline text-xs font-mono text-amber-400/80 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  7 Winning Stories Archived
                </span>
              </div>

              {filteredArchivePrompts.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 bg-white/5 rounded-2xl border border-white/5">
                  No archived prompts match your search query.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredArchivePrompts.map((p) => {
                    const isExpanded = !!expandedArchiveIds[p.id];
                    return (
                      <div
                        key={p.id}
                        className="bg-[#13151f] border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-3 transition-all shadow-md"
                      >
                        {/* Day Tag & Topic */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/5 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="py-0.5 px-2.5 rounded-lg bg-amber-500/20 border border-amber-500/35 text-amber-300 font-mono text-xs font-bold">
                              {p.dayLabel || p.date}
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              · {p.entriesCount} Lads Competed
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              🏆 Crowned Winner
                            </span>
                          </div>
                        </div>

                        {/* Prompt Topic Recap */}
                        <div className="space-y-1">
                          <h5 className="text-sm font-bold text-slate-300 font-sans">
                            Prompt Challenge: <span className="text-white font-semibold font-heading">"{p.topic}"</span>
                          </h5>
                          <p className="text-xs text-slate-400 italic">
                            {p.description}
                          </p>
                        </div>

                        {/* Winner Showcase Card */}
                        {p.winnerTitle && (
                          <div className="rounded-xl bg-gradient-to-r from-amber-500/10 via-[#181a26] to-[#12141c] border border-amber-500/30 p-3.5 sm:p-4 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{p.winnerAvatar || '🏆'}</span>
                                <span className="text-xs font-bold text-white">{p.winnerAuthor}</span>
                                {p.winnerAuthorTier && (
                                  <LadTierBadge tier={p.winnerAuthorTier} size="sm" />
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[11px] font-mono">
                                <span className="text-amber-400 bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded font-semibold">
                                  🍺 {p.winnerPints || 650} Pints
                                </span>
                                <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded font-semibold">
                                  💥 {p.winnerOutrageScore || 90}% Outrage
                                </span>
                              </div>
                            </div>

                            <h6 className="text-sm font-bold text-amber-300">
                              "{p.winnerTitle}"
                            </h6>

                            <p className={`text-xs text-slate-200 leading-relaxed font-sans ${isExpanded ? '' : 'line-clamp-2'}`}>
                              {p.winnerContent}
                            </p>

                            {/* Card Footer Actions */}
                            <div className="pt-2 flex items-center justify-between text-xs border-t border-white/5">
                              <button
                                onClick={() =>
                                  setExpandedArchiveIds((prev) => ({
                                    ...prev,
                                    [p.id]: !prev[p.id],
                                  }))
                                }
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer font-medium text-[11px] flex items-center gap-1"
                              >
                                {isExpanded ? (
                                  <>
                                    <span>Show Less</span>
                                    <ChevronUp className="w-3 h-3" />
                                  </>
                                ) : (
                                  <>
                                    <span>Read Full Winning Story</span>
                                    <ChevronDown className="w-3 h-3" />
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleListenToArchiveWinner(p)}
                                className="flex items-center gap-1.5 py-1 px-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer active:scale-95"
                                title="Listen with Pub Tale TTS Narrator"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                                <span>Listen to Winner</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#10121a] border border-white/10 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories & Daily Prompt Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => {
                setFilterDailyOnly(!filterDailyOnly);
                setSelectedCategory('All');
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                filterDailyOnly
                  ? 'bg-amber-500 text-black font-bold shadow-sm'
                  : 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Daily Prompt Only</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setFilterDailyOnly(false);
                }}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  !filterDailyOnly && selectedCategory === cat
                    ? 'bg-amber-500 text-black font-bold'
                    : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search confessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181a24] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Engagement Sort Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            <span>Sort By Engagement:</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSortBy('engagement')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                sortBy === 'engagement' ? 'bg-white/10 text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Trending Fire
            </button>
            <button
              onClick={() => setSortBy('outrage')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                sortBy === 'outrage' ? 'bg-white/10 text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Most Outrageous
            </button>
            <button
              onClick={() => setSortBy('pints')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                sortBy === 'pints' ? 'bg-white/10 text-white font-semibold' : 'hover:text-white'
              }`}
            >
              Most Pints Spilled
            </button>
          </div>
        </div>
      </div>

      {/* Story Feed Grid */}
      <div className="space-y-5">
        {filteredStories.map((story) => {
          const outrageScore = calculateOutragePercent(story.outrageRatings);
          const totalVotes =
            story.outrageRatings.properBanter +
            story.outrageRatings.absoluteWeapon +
            story.outrageRatings.spilledPint +
            story.outrageRatings.nuclearOutrage;

          return (
            <article
              key={story.id}
              className={`bg-[#11131b] border rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all ${
                story.isDailyPromptEntry ? 'border-amber-500/30 bg-[#131520]' : 'border-white/10'
              }`}
            >
              {/* Story Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    story.isGhostMode ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300' : 'bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    {story.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white">{story.author}</span>
                      {story.verifiedLad && (
                        <span title="Verified Lad Contributor" className="flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                      {/* Prominent Lad Tier Badge */}
                      <LadTierBadge tier={story.authorTier || 'Rookie Lad'} />

                      {story.isGhostMode && (
                        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/15 border border-purple-500/30 px-1.5 py-0.5 rounded">
                          GHOST
                        </span>
                      )}

                      {story.isDailyPromptEntry && (
                        <span className="text-[10px] font-mono text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          DAILY PROMPT
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span className="text-amber-400 font-medium">{story.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {story.createdAt}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Outrage Meter Gauge Badge */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5 text-xs font-mono font-bold">
                    <Flame className="w-4 h-4 text-red-500" />
                    <span className="text-white">{outrageScore}%</span>
                    <span className="text-slate-500 font-normal">OUTRAGE</span>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 rounded-full"
                      style={{ width: `${outrageScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Story Title & Body */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold font-heading text-white">{story.title}</h3>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                  {story.content}
                </p>
              </div>

              {/* Anonymous Outrage-O-Meter Rating Buttons */}
              <div className="pt-3 border-t border-white/5">
                <div className="text-xs text-slate-400 font-mono mb-2 flex items-center justify-between">
                  <span>ANONYMOUS OUTRAGE-O-METER:</span>
                  <span className="text-slate-500">{totalVotes} anonymous votes cast</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => {
                      onRateOutrage(story.id, 'properBanter');
                      playBanterSound('pop');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      story.userRating === 'properBanter'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🍻 Proper Banter</span>
                    <span className="font-mono text-slate-400">{story.outrageRatings.properBanter}</span>
                  </button>

                  <button
                    onClick={() => {
                      onRateOutrage(story.id, 'spilledPint');
                      playBanterSound('pint');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      story.userRating === 'spilledPint'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>🍺 Spilled Pint</span>
                    <span className="font-mono text-slate-400">{story.outrageRatings.spilledPint}</span>
                  </button>

                  <button
                    onClick={() => {
                      onRateOutrage(story.id, 'absoluteWeapon');
                      playBanterSound('outrage');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      story.userRating === 'absoluteWeapon'
                        ? 'bg-orange-500/20 border-orange-500 text-orange-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>💥 Absolute Weapon</span>
                    <span className="font-mono text-slate-400">{story.outrageRatings.absoluteWeapon}</span>
                  </button>

                  <button
                    onClick={() => {
                      onRateOutrage(story.id, 'nuclearOutrage');
                      playBanterSound('outrage');
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      story.userRating === 'nuclearOutrage'
                        ? 'bg-red-500/25 border-red-500 text-red-300 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>☢️ Nuclear Outrage</span>
                    <span className="font-mono text-slate-400">{story.outrageRatings.nuclearOutrage}</span>
                  </button>
                </div>
              </div>

              {/* Story Actions & Comment Trigger */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setActiveStoryForComments(story)}
                    className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    <span>{story.commentsCount} Comments</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Eye className="w-4 h-4" />
                    <span>{story.views} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setStoryForAudio(story);
                      playBanterSound('pint');
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 hover:from-amber-500/25 hover:to-orange-500/25 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                    title="Listen to story with Pub Tale experimental audio"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Listen to Story</span>
                    <span className="text-[10px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">TTS</span>
                  </button>

                  <button
                    onClick={() => onShareStory(story)}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Share Story</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Confession Post Modal with Ghost Mode & Daily Prompt Option */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold font-heading text-white mb-1">
              {isDailyPromptEntry ? 'Submit Entry: Daily Banter Prompt' : 'Confess Your Outrageous Experience'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              {isDailyPromptEntry
                ? `Topic: "${activePrompt?.topic}"`
                : 'Submit your real pub incident, stag disaster, or dating fail. Ghost Mode available.'}
            </p>

            <form onSubmit={handlePostSubmit} className="space-y-4">
              {/* Ghost Mode Toggle */}
              <div className="p-3.5 rounded-xl bg-[#0a0b10] border border-purple-500/30 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                      isGhostMode ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    👻
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">Ghost Mode</span>
                      <span className="text-[10px] font-mono text-purple-400 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
                        {isGhostMode ? 'ACTIVE' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isGhostMode
                        ? 'Your name and avatar will be replaced with randomized "Anonymous Lad".'
                        : 'Post publicly with your handle and Lad Tier badge.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGhostMode(!isGhostMode)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors shrink-0 ${
                    isGhostMode ? 'bg-purple-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      isGhostMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Daily Prompt attachment indicator */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <span className="text-slate-300">Submit for Daily Banter Topic</span>
                <button
                  type="button"
                  onClick={() => setIsDailyPromptEntry(!isDailyPromptEntry)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    isDailyPromptEntry ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {isDailyPromptEntry ? 'Topic Attached ✓' : 'Attach Topic'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Catchy Title</label>
                <input
                  type="text"
                  placeholder="e.g. The Benidorm Fire Alarm Incident"
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
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-[#161822] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Pub Tales">Pub Tales</option>
                    <option value="Stag Do">Stag Do</option>
                    <option value="Dating Fails">Dating Fails</option>
                    <option value="Sunday League">Sunday League</option>
                    <option value="Workplace">Workplace</option>
                    <option value="Hangover Horror">Hangover Horror</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    {isGhostMode ? 'Author Identifier' : 'Lad Nickname'}
                  </label>
                  <input
                    type="text"
                    disabled={isGhostMode}
                    placeholder={isGhostMode ? 'Anonymous Lad #Random' : 'Your nickname'}
                    value={isGhostMode ? 'Anonymous Lad (Ghost Mode)' : newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className={`w-full border rounded-xl py-2 px-3 text-xs focus:outline-none ${
                      isGhostMode
                        ? 'bg-purple-900/10 border-purple-500/20 text-purple-300 italic cursor-not-allowed'
                        : 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-amber-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-400">Your Full Story</label>
                  <button
                    type="button"
                    onClick={() => {
                      setCoachModalConfig({
                        isOpen: true,
                        mode: 'story_polish',
                        context: newContent ? `Title: ${newTitle}\nDraft: ${newContent}` : newTitle || 'An outrageous pub disaster tale',
                        onApply: (suggestedText) => {
                          setNewContent((prev) => (prev ? prev + '\n\n' + suggestedText : suggestedText));
                        },
                      });
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-all cursor-pointer bg-amber-500/10 hover:bg-amber-500/20 py-1 px-2.5 rounded-lg border border-amber-500/30"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>✨ Ask Banter Coach (AI)</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder="Don't spare any awkward details. Tell us what happened..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                    isGhostMode
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
                  }`}
                >
                  {isGhostMode ? 'Publish Ghost Confession' : 'Publish Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer Modal with Lad Tier Badges */}
      {activeStoryForComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{activeStoryForComments.title}</h4>
                  <LadTierBadge tier={activeStoryForComments.authorTier || 'Pub Legend'} size="sm" />
                </div>
                <span className="text-xs text-slate-400">Community Discussion & Banter</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setStoryForAudio(activeStoryForComments);
                    playBanterSound('pint');
                  }}
                  className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all cursor-pointer"
                  title="Listen to this story"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Listen</span>
                </button>
                <button
                  onClick={() => setActiveStoryForComments(null)}
                  className="text-slate-400 hover:text-white p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              {(comments[activeStoryForComments.id] || []).length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  No comments yet. Be the first lad to comment on this madness!
                </div>
              ) : (
                (comments[activeStoryForComments.id] || []).map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>{c.avatar}</span>
                        <span>{c.author}</span>
                        <LadTierBadge tier={c.authorTier || 'Rookie Lad'} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 pl-5">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-white/5 flex gap-2 items-center">
              <button
                type="button"
                onClick={() => {
                  setCoachModalConfig({
                    isOpen: true,
                    mode: 'witty_response',
                    context: `Story title: ${activeStoryForComments.title}\nStory content: ${activeStoryForComments.content}`,
                    onApply: (suggestedText) => {
                      setNewCommentText(suggestedText);
                    },
                  });
                }}
                title="Ask Banter Coach for a Witty Comeback"
                className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <input
                type="text"
                placeholder="Drop your banter retort (or click ✨ for Banter Coach)..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </div>
      )}
      {/* AI Banter Coach Modal */}
      <BanterCoachModal
        isOpen={coachModalConfig.isOpen}
        onClose={() => setCoachModalConfig((prev) => ({ ...prev, isOpen: false }))}
        initialMode={coachModalConfig.mode}
        initialContext={coachModalConfig.context}
        onApplyText={coachModalConfig.onApply}
      />

      {/* Experimental Pub Tale Text-to-Speech Player Modal */}
      <StoryAudioPlayerModal
        story={storyForAudio}
        isOpen={!!storyForAudio}
        onClose={() => setStoryForAudio(null)}
      />
    </div>
  );
};
