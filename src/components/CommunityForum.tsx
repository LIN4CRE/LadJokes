import React, { useState } from 'react';
import {
  MessageSquare,
  Flame,
  Beer,
  Skull,
  Share2,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Eye,
} from 'lucide-react';
import { CommunityStory, OutrageType, Comment } from '../types';
import { playBanterSound } from '../services/syncService';

interface CommunityForumProps {
  stories: CommunityStory[];
  onRateOutrage: (storyId: string, ratingType: OutrageType) => void;
  onShareStory: (story: CommunityStory) => void;
  onPostStory: (newStory: Partial<CommunityStory>) => void;
}

export const CommunityForum: React.FC<CommunityForumProps> = ({
  stories,
  onRateOutrage,
  onShareStory,
  onPostStory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'engagement' | 'outrage' | 'freshest' | 'pints'>('engagement');
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeStoryForComments, setActiveStoryForComments] = useState<CommunityStory | null>(null);

  // New story modal state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityStory['category']>('Pub Tales');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // Story comments state
  const [comments, setComments] = useState<Record<string, Comment[]>>({
    'story-1': [
      {
        id: 'c-1',
        storyId: 'story-1',
        author: 'DutchBanterKing',
        avatar: '🚲',
        text: 'LMAO the brass band playing Sweet Caroline in freezing rain is pure villain behavior!',
        createdAt: '1 hour ago',
        likes: 24,
      },
      {
        id: 'c-2',
        storyId: 'story-1',
        author: 'StanstedVeteran',
        avatar: '✈️',
        text: 'The airport security should have known as soon as they saw the inflatable flamingo.',
        createdAt: '45 mins ago',
        likes: 18,
      },
    ],
  });
  const [newCommentText, setNewCommentText] = useState('');

  // Categories list
  const categories = ['All', 'Stag Do', 'Pub Tales', 'Dating Fails', 'Sunday League', 'Workplace', 'Hangover Horror'];

  // Filter & Sort stories
  const filteredStories = stories
    .filter((s) => {
      const matchCategory = selectedCategory === 'All' || s.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
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

    onPostStory({
      title: newTitle,
      category: newCategory,
      content: newContent,
      author: newAuthor.trim() || 'AnonymousLad_' + Math.floor(Math.random() * 900 + 100),
      authorBadge: 'Rookie Contributor',
      avatar: '🍺',
      verifiedLad: true,
    });

    playBanterSound('pint');
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setShowPostModal(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoryForComments || !newCommentText.trim()) return;

    const commentId = 'c-' + Date.now();
    const commentItem: Comment = {
      id: commentId,
      storyId: activeStoryForComments.id,
      author: 'You (Anonymous Lad)',
      avatar: '🍺',
      text: newCommentText.trim(),
      createdAt: 'Just now',
      likes: 1,
    };

    setComments((prev) => ({
      ...prev,
      [activeStoryForComments.id]: [...(prev[activeStoryForComments.id] || []), commentItem],
    }));

    activeStoryForComments.commentsCount += 1;
    setNewCommentText('');
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
              The unedited archives of stag disasters, hangover catastrophes, pub brawls, and Sunday league shame. Cast your anonymous Outrage-O-Meter vote.
            </p>
          </div>

          <button
            onClick={() => setShowPostModal(true)}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Confess Your Tale</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#10121a] border border-white/10 rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
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
              className="bg-[#11131b] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 hover:border-white/20 transition-all"
            >
              {/* Story Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl shrink-0">
                    {story.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{story.author}</span>
                      {story.verifiedLad && (
                        <span title="Verified Lad Contributor" className="flex items-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        </span>
                      )}
                      <span className="text-[11px] text-slate-500 font-mono">· {story.authorBadge}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
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

                <button
                  onClick={() => onShareStory(story)}
                  className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Share Story</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Confession Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold font-heading text-white mb-1">
              Confess Your Outrageous Experience
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Submit your real pub incident, stag disaster, or dating fail. All submissions are zero-knowledge anonymized.
            </p>

            <form onSubmit={handlePostSubmit} className="space-y-4">
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">Anonymous Nickname</label>
                  <input
                    type="text"
                    placeholder="Leave blank for random handle"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Your Full Story</label>
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
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Publish Anonymous Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comments Drawer Modal */}
      {activeStoryForComments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="max-w-lg w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div>
                <h4 className="text-base font-bold text-white">{activeStoryForComments.title}</h4>
                <span className="text-xs text-slate-400">Community Discussion & Banter</span>
              </div>
              <button
                onClick={() => setActiveStoryForComments(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
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
                      <div className="flex items-center gap-1.5 font-bold text-amber-400">
                        <span>{c.avatar}</span>
                        <span>{c.author}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 pl-5">{c.text}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post comment input */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Drop your anonymous retort..."
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
    </div>
  );
};
