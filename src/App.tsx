/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  MessageSquare,
  Vote,
  Lock,
  LayoutDashboard,
  Wifi,
  WifiOff,
  Flame,
  Beer,
  Moon,
  Sun,
  Shield,
  Smile,
  Sparkles,
} from 'lucide-react';

import {
  Chapter,
  Joke,
  CommunityStory,
  Poll,
  EncryptedMessage,
  UserAccount,
  AdminTask,
  FlaggedItem,
  AppNotification,
  OutrageType,
  DailyBanterPrompt,
  PubQuizRound,
} from './types';

import {
  INITIAL_CHAPTERS,
  INITIAL_JOKES,
  INITIAL_STORIES,
  INITIAL_POLLS,
  INITIAL_USER,
  INITIAL_TASKS,
  INITIAL_FLAGGED,
  INITIAL_DAILY_PROMPTS,
  INITIAL_PUB_QUIZZES,
} from './data/initialData';

import { calculateLadTier } from './services/tierService';

import {
  broadcastSync,
  subscribeToSync,
  triggerPushNotification,
  playBanterSound,
} from './services/syncService';

import { Navbar } from './components/Navbar';
import { DadJokesStartPage } from './components/DadJokesStartPage';
import { BookReader } from './components/BookReader';
import { CommunityForum } from './components/CommunityForum';
import { InteractivePolls } from './components/InteractivePolls';
import { EncryptedChat } from './components/EncryptedChat';
import { AdminDashboard } from './components/AdminDashboard';
import { BiometricAuthModal } from './components/BiometricAuthModal';
import { SocialShareModal } from './components/SocialShareModal';
import { NotificationCenter } from './components/NotificationCenter';
import { AgeDisclaimerModal } from './components/AgeDisclaimerModal';
import { BanterCoachModal } from './components/BanterCoachModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<'dadJokes' | 'book' | 'community' | 'polls' | 'lounge' | 'admin'>('dadJokes');

  // AI Banter Coach state
  const [isBanterCoachOpen, setIsBanterCoachOpen] = useState(false);

  // Network offline state
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Theme variant
  const [themeMode, setThemeMode] = useState<'obsidian' | 'speakeasy'>('obsidian');

  // Core Data with Local Storage Persistence
  const [chapters] = useState<Chapter[]>(INITIAL_CHAPTERS);

  const [jokes, setJokes] = useState<Joke[]>(() => {
    const saved = localStorage.getItem('lad_jokes_book_items_v7');
    if (saved) return JSON.parse(saved);
    const v6 = localStorage.getItem('lad_jokes_book_items_v6') || localStorage.getItem('lad_jokes_book_items_v5');
    if (v6) {
      try {
        const parsed = JSON.parse(v6);
        const userAdded = parsed.filter((j: Joke) => !INITIAL_JOKES.some((init) => init.id === j.id));
        return [...INITIAL_JOKES, ...userAdded];
      } catch {
        return INITIAL_JOKES;
      }
    }
    return INITIAL_JOKES;
  });

  const [stories, setStories] = useState<CommunityStory[]>(() => {
    const saved = localStorage.getItem('lad_jokes_community_stories_v2');
    return saved ? JSON.parse(saved) : INITIAL_STORIES;
  });

  const [dailyPrompts, setDailyPrompts] = useState<DailyBanterPrompt[]>(INITIAL_DAILY_PROMPTS);

  const [polls, setPolls] = useState<Poll[]>(() => {
    const saved = localStorage.getItem('lad_jokes_polls');
    return saved ? JSON.parse(saved) : INITIAL_POLLS;
  });

  const [quizzes, setQuizzes] = useState<PubQuizRound[]>(() => {
    const saved = localStorage.getItem('lad_jokes_pub_quizzes_v1');
    return saved ? JSON.parse(saved) : INITIAL_PUB_QUIZZES;
  });

  const [chatMessages, setChatMessages] = useState<EncryptedMessage[]>([
    {
      id: 'msg-seed-1',
      sender: 'Big Trev (Sunday League)',
      recipient: 'backroom_lounge',
      isGroup: true,
      ciphertext: 'U2FsdGVkX1+m4eN4',
      iv: '4f8a29c1',
      timestamp: '01:14 AM',
      plaintextCache: 'Who left their muddy shinguards in the boot of my Ford Mondeo after the match?',
    },
    {
      id: 'msg-seed-2',
      sender: 'Gazza_The_Bazza',
      recipient: 'backroom_lounge',
      isGroup: true,
      ciphertext: 'U2FsdGVkX1+x89a0',
      iv: '9b3c41e8',
      timestamp: '01:18 AM',
      plaintextCache: 'Not mine mate, I only brought flip flops to the game.',
    },
  ]);

  const [tasks, setTasks] = useState<AdminTask[]>(INITIAL_TASKS);
  const [flaggedItems, setFlaggedItems] = useState<FlaggedItem[]>(INITIAL_FLAGGED);

  // User State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USER);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-1',
      title: '🍺 Story Viral Surge Alert!',
      message: 'Your confession "The Stag Do Passport Swap" just hit 450 pints spilled!',
      timestamp: '15m ago',
      read: false,
      type: 'viral',
    },
    {
      id: 'notif-2',
      title: 'Poll Update: Kebab Ethics',
      message: 'Over 1,600 lads voted on the 3 AM Uber kebab dilemma.',
      timestamp: '1h ago',
      read: true,
      type: 'poll',
    },
  ]);

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [shareData, setShareData] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
    type?: 'joke' | 'story' | 'poll';
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('lad_jokes_book_items_v7', JSON.stringify(jokes));
  }, [jokes]);

  useEffect(() => {
    localStorage.setItem('lad_jokes_community_stories_v2', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('lad_jokes_polls', JSON.stringify(polls));
  }, [polls]);

  useEffect(() => {
    localStorage.setItem('lad_jokes_pub_quizzes_v1', JSON.stringify(quizzes));
  }, [quizzes]);

  // Online / Offline listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Real-Time Multi-Device / Multi-Tab Synchronization via BroadcastChannel
  useEffect(() => {
    const unsubscribe = subscribeToSync((event) => {
      if (event.type === 'STORY_OUTRAGE_RATED') {
        const { storyId, ratingType } = event.payload as { storyId: string; ratingType: OutrageType };
        setStories((prev) =>
          prev.map((s) => {
            if (s.id === storyId) {
              return {
                ...s,
                outrageRatings: {
                  ...s.outrageRatings,
                  [ratingType]: s.outrageRatings[ratingType] + 1,
                },
              };
            }
            return s;
          })
        );
      } else if (event.type === 'POLL_VOTED') {
        const { pollId, optionId } = event.payload;
        setPolls((prev) =>
          prev.map((p) => {
            if (p.id === pollId) {
              return {
                ...p,
                options: p.options.map((opt) =>
                  opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
                ),
              };
            }
            return p;
          })
        );
      } else if (event.type === 'NEW_CHAT_MESSAGE') {
        setChatMessages((prev) => [...prev, event.payload]);
      } else if (event.type === 'NEW_STORY_POSTED') {
        setStories((prev) => [event.payload, ...prev]);
      }
    });

    return unsubscribe;
  }, []);

  // Handlers for Book Reader
  const handleRateJoke = (jokeId: string) => {
    setJokes((prev) =>
      prev.map((j) => (j.id === jokeId ? { ...j, outrageScore: Math.min(100, j.outrageScore + 1) } : j))
    );
  };

  const handleSpillPint = (jokeId: string) => {
    setJokes((prev) =>
      prev.map((j) => (j.id === jokeId ? { ...j, pintsSpilled: j.pintsSpilled + 1 } : j))
    );

    // Increment user pints and recalculate Lad Tier
    if (currentUser) {
      const newPints = currentUser.pintsBought + 1;
      const { tier: newTier } = calculateLadTier(newPints, currentUser.karma);
      setCurrentUser({
        ...currentUser,
        pintsBought: newPints,
        tier: newTier,
      });
    }
  };

  const handleBookmarkJoke = (jokeId: string) => {
    setJokes((prev) =>
      prev.map((j) => (j.id === jokeId ? { ...j, bookmarked: !j.bookmarked } : j))
    );
  };

  const handleAddNewJoke = (newJokeData: Partial<Joke>) => {
    const joke: Joke = {
      id: 'j-' + Date.now(),
      title: newJokeData.title || 'Untitled Banter',
      chapterId: newJokeData.chapterId || 'ch-1',
      content: newJokeData.content || '',
      punchline: newJokeData.punchline || '',
      tags: newJokeData.tags || ['Pub Banter'],
      outrageScore: 80,
      pintsSpilled: 12,
    };
    setJokes((prev) => [joke, ...prev]);
  };

  // Handlers for Community Stories
  const handleRateOutrage = (storyId: string, ratingType: OutrageType) => {
    setStories((prev) =>
      prev.map((s) => {
        if (s.id === storyId) {
          const updatedRatings = {
            ...s.outrageRatings,
            [ratingType]: s.outrageRatings[ratingType] + 1,
          };
          return {
            ...s,
            outrageRatings: updatedRatings,
            userRating: ratingType,
            engagementScore: s.engagementScore + 1,
          };
        }
        return s;
      })
    );

    // Broadcast in real-time
    broadcastSync('STORY_OUTRAGE_RATED', { storyId, ratingType });

    // Check for viral push notification threshold
    const story = stories.find((s) => s.id === storyId);
    if (story && story.outrageRatings.spilledPint % 25 === 0) {
      triggerPushNotification('🔥 Banter Alert!', `Your story "${story.title}" is catching fire in the community!`);
      setNotifications((prev) => [
        {
          id: 'notif-surge-' + Date.now(),
          title: '🔥 Story Milestone: 25+ Pints Spilled!',
          message: `Your anecdote "${story.title}" gained new viral momentum.`,
          timestamp: 'Just now',
          read: false,
          type: 'viral',
        },
        ...prev,
      ]);
    }
  };

  const handlePostStory = (storyData: Partial<CommunityStory>) => {
    const newStory: CommunityStory = {
      id: 'story-' + Date.now(),
      author: storyData.author || 'AnonymousLad',
      authorBadge: storyData.authorBadge || 'Rookie Contributor',
      authorTier: storyData.authorTier || (currentUser?.tier || 'Rookie Lad'),
      avatar: storyData.avatar || '🍺',
      title: storyData.title || '',
      category: storyData.category || 'Pub Tales',
      content: storyData.content || '',
      outrageRatings: {
        properBanter: 1,
        absoluteWeapon: 0,
        spilledPint: 0,
        nuclearOutrage: 0,
      },
      commentsCount: 0,
      createdAt: 'Just now',
      verifiedLad: !storyData.isGhostMode,
      isGhostMode: storyData.isGhostMode,
      isDailyPromptEntry: storyData.isDailyPromptEntry,
      views: 1,
      engagementScore: 10,
    };

    setStories((prev) => [newStory, ...prev]);
    broadcastSync('NEW_STORY_POSTED', newStory);

    // If attached to daily prompt, increment entries count
    if (storyData.isDailyPromptEntry) {
      setDailyPrompts((prev) =>
        prev.map((dp, i) => (i === 0 ? { ...dp, entriesCount: dp.entriesCount + 1 } : dp))
      );
    }

    // Reward user karma and level up tier
    if (currentUser && !storyData.isGhostMode) {
      const newKarma = currentUser.karma + 25;
      const { tier: newTier } = calculateLadTier(currentUser.pintsBought, newKarma);
      setCurrentUser({
        ...currentUser,
        karma: newKarma,
        tier: newTier,
      });
    }
  };

  // Handlers for Polls
  const handleVotePoll = (pollId: string, optionId: string) => {
    setPolls((prev) =>
      prev.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            userVotedOptionId: optionId,
            options: p.options.map((opt) =>
              opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          };
        }
        return p;
      })
    );

    broadcastSync('POLL_VOTED', { pollId, optionId });
  };

  const handleCreatePoll = (pollData: Partial<Poll>) => {
    const newPoll: Poll = {
      id: 'poll-' + Date.now(),
      question: pollData.question || '',
      author: pollData.author || 'CommunityLad',
      category: pollData.category || 'Pub Ethics',
      options: pollData.options || [],
      totalVotes: 0,
      createdAt: 'Just now',
      expiresIn: '3 days left',
    };
    setPolls((prev) => [newPoll, ...prev]);
  };

  // Handlers for Weekly Pub Quiz
  const handleSaveQuiz = (newRound: PubQuizRound) => {
    setQuizzes((prev) => [newRound, ...prev]);
    triggerPushNotification(
      '🍻 New Weekly Pub Quiz Live!',
      `Admin published: "${newRound.title}" (${newRound.weekLabel})`
    );
    setNotifications((prev) => [
      {
        id: 'notif-' + Date.now(),
        title: '🍻 New Weekly Pub Quiz Live!',
        message: `Admin published: "${newRound.title}" (${newRound.weekLabel})`,
        timestamp: 'Just now',
        read: false,
        type: 'poll',
      },
      ...prev,
    ]);
  };

  const handleShareQuizResult = (title: string, userScore: number, maxScore: number) => {
    setShareData({
      isOpen: true,
      title: '🍻 Weekly Pub Quiz Scorecard',
      content: `I just scored ${userScore}/${maxScore} on "${title}" in the Lad Jokes Weekly Pub Quiz! Settle your pub trivia standing right now:`,
      type: 'poll',
    });
  };

  const handleAwardKarma = (points: number) => {
    if (currentUser) {
      const newKarma = currentUser.karma + points;
      const { tier: newTier } = calculateLadTier(currentUser.pintsBought, newKarma);
      setCurrentUser({
        ...currentUser,
        karma: newKarma,
        tier: newTier,
      });
    }
  };

  // Handlers for Encrypted Chat
  const handleSendMessage = (msg: EncryptedMessage) => {
    setChatMessages((prev) => [...prev, msg]);
    broadcastSync('NEW_CHAT_MESSAGE', msg);
  };

  // Handlers for Admin
  const handleAddTask = (taskData: Partial<AdminTask>) => {
    const newTask: AdminTask = {
      id: 'task-' + Date.now(),
      title: taskData.title || '',
      status: taskData.status || 'in_progress',
      priority: taskData.priority || 'medium',
      assignee: taskData.assignee || 'Sarah',
      dueDate: taskData.dueDate || 'Soon',
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: AdminTask['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  const handleResolveFlag = (id: string, action: 'approved' | 'quarantined') => {
    setFlaggedItems((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: action } : f))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${
        themeMode === 'speakeasy' ? 'bg-[#0b0c10]' : 'bg-[#08090d]'
      } text-slate-100 font-sans`}
    >
      {/* 18+ Adult Disclaimer Gate */}
      <AgeDisclaimerModal onConfirm={() => {}} />

      {/* Offline capability status indicator banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-black px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 tracking-wide sticky top-0 z-50">
          <WifiOff className="w-4 h-4" />
          <span>OFFLINE MODE ACTIVE: All jokes and saved confessions are accessible from local encrypted storage.</span>
        </div>
      )}

      {/* Top Bar Contract Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setCurrentTab(tab as any);
          playBanterSound('pop');
        }}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenBanterCoach={() => setIsBanterCoachOpen(true)}
        user={currentUser}
        isOnline={isOnline}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-12">
        {currentTab === 'dadJokes' && (
          <DadJokesStartPage
            onNavigateToBook={() => setCurrentTab('book')}
            onNavigateToCommunity={() => setCurrentTab('community')}
          />
        )}

        {currentTab === 'book' && (
          <BookReader
            chapters={chapters}
            jokes={jokes}
            onRateJoke={handleRateJoke}
            onSpillPint={handleSpillPint}
            onBookmarkJoke={handleBookmarkJoke}
            onShareJoke={(joke) =>
              setShareData({
                isOpen: true,
                title: joke.title,
                content: `${joke.content}\n\nPunchline: ${joke.punchline}`,
                type: 'joke',
              })
            }
            onAddNewJoke={handleAddNewJoke}
          />
        )}

        {currentTab === 'community' && (
          <CommunityForum
            stories={stories}
            dailyPrompts={dailyPrompts}
            currentUserTier={currentUser?.tier}
            onRateOutrage={handleRateOutrage}
            onShareStory={(story) =>
              setShareData({
                isOpen: true,
                title: story.title,
                content: story.content,
                type: 'story',
              })
            }
            onPostStory={handlePostStory}
          />
        )}

        {currentTab === 'polls' && (
          <InteractivePolls
            polls={polls}
            quizzes={quizzes}
            currentUser={currentUser}
            onVote={handleVotePoll}
            onCreatePoll={handleCreatePoll}
            onSaveQuiz={handleSaveQuiz}
            onAwardKarma={handleAwardKarma}
            onShareQuizResult={handleShareQuizResult}
            onSharePoll={(poll) =>
              setShareData({
                isOpen: true,
                title: 'Banter Poll: ' + poll.question,
                content: poll.options.map((o) => `• ${o.text}`).join('\n'),
                type: 'poll',
              })
            }
          />
        )}

        {currentTab === 'lounge' && (
          <EncryptedChat
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            messages={chatMessages}
          />
        )}

        {currentTab === 'admin' && (
          <AdminDashboard
            tasks={tasks}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            flaggedItems={flaggedItems}
            onResolveFlag={handleResolveFlag}
            totalStoriesCount={stories.length}
            totalJokesCount={jokes.length}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d12]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 flex items-center justify-around">
        <button
          onClick={() => {
            setCurrentTab('dadJokes');
            playBanterSound('pop');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'dadJokes' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smile className="w-4 h-4" />
          <span>Dad Jokes</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('book');
            playBanterSound('pop');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'book' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>The Book</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('community');
            playBanterSound('pop');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'community' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Confessions</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('polls');
            playBanterSound('pop');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'polls' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Vote className="w-4 h-4" />
          <span>Polls</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('lounge');
            playBanterSound('pop');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'lounge' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Lounge</span>
        </button>

        <button
          onClick={() => {
            setCurrentTab('admin');
            playBanterSound('pop');
          }}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Admin</span>
        </button>
      </nav>

      {/* Global Modals */}
      <BiometricAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLogin={(u) => setCurrentUser(u)}
        onLogout={() => setCurrentUser(null)}
      />

      <NotificationCenter
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => setNotifications([])}
        onAddNotification={(n) => setNotifications((prev) => [n, ...prev])}
      />

      <SocialShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData((prev) => ({ ...prev, isOpen: false }))}
        title={shareData.title}
        content={shareData.content}
        type={shareData.type}
      />

      {/* Floating Banter Coach Quick Trigger */}
      <button
        onClick={() => {
          setIsBanterCoachOpen(true);
          playBanterSound('pop');
        }}
        className="fixed bottom-6 right-6 z-30 hidden md:flex items-center gap-2.5 py-3 px-5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-xl shadow-amber-500/25 hover:scale-105 active:scale-95 cursor-pointer border border-amber-300/40"
        title="Ask Baz The AI Banter Coach"
      >
        <Sparkles className="w-4 h-4 text-black animate-pulse" />
        <span>Banter Coach AI</span>
      </button>

      {/* Global Banter Coach Modal */}
      <BanterCoachModal
        isOpen={isBanterCoachOpen}
        onClose={() => setIsBanterCoachOpen(false)}
      />
    </div>
  );
}
