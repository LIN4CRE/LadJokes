export type JokeCategoryType = 'classic' | 'raunchy' | 'disturbing';
export type ContentIntensity = 'standard' | 'high' | 'extreme';

export interface Joke {
  id: string;
  title: string;
  chapterId: string;
  content: string;
  punchline: string;
  tags: string[];
  outrageScore: number; // 0 to 100
  pintsSpilled: number;
  bookmarked?: boolean;
  categoryType?: JokeCategoryType;
  intensity?: ContentIntensity;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  jokeCount: number;
}

export type OutrageType = 'properBanter' | 'absoluteWeapon' | 'spilledPint' | 'nuclearOutrage';

export interface OutrageRatings {
  properBanter: number;
  absoluteWeapon: number;
  spilledPint: number;
  nuclearOutrage: number;
}

export type LadTier =
  | 'Rookie Lad'
  | 'Banter Apprentice'
  | 'Banter Veteran'
  | 'Meme Lord'
  | 'Pub Legend'
  | 'Immortal Weapon';

export interface CommunityStory {
  id: string;
  author: string;
  authorBadge: string;
  authorTier?: LadTier;
  avatar: string;
  title: string;
  category: 'Stag Do' | 'Pub Tales' | 'Dating Fails' | 'Sunday League' | 'Workplace' | 'Hangover Horror';
  content: string;
  outrageRatings: OutrageRatings;
  userRating?: OutrageType;
  commentsCount: number;
  createdAt: string;
  verifiedLad: boolean;
  bookmarked?: boolean;
  views: number;
  engagementScore: number;
  isDailyPromptEntry?: boolean;
  isGhostMode?: boolean;
}

export interface Comment {
  id: string;
  storyId: string;
  author: string;
  authorTier?: LadTier;
  avatar: string;
  text: string;
  createdAt: string;
  likes: number;
  isGhostMode?: boolean;
}

export interface DailyBanterPrompt {
  id: string;
  topic: string;
  description: string;
  date: string;
  expiresIn: string;
  entriesCount: number;
  topEntryId?: string;
  dayLabel?: string;
  winnerTitle?: string;
  winnerAuthor?: string;
  winnerAuthorTier?: LadTier;
  winnerAvatar?: string;
  winnerContent?: string;
  winnerPints?: number;
  winnerOutrageScore?: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  id: string;
  question: string;
  author: string;
  category: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
  createdAt: string;
  expiresIn: string;
}

export interface PubQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  points: number;
}

export interface PubQuizRound {
  id: string;
  title: string;
  weekLabel: string;
  category: 'Pop Culture' | 'Crude History' | 'Banter Knowledge' | 'Mixed Tavern';
  description: string;
  timePerQuestionSeconds: number;
  questions: PubQuizQuestion[];
  participantsCount: number;
  topScorerName: string;
  topScore: number;
  createdAt: string;
  status: 'active' | 'archived';
}

export interface EncryptedMessage {
  id: string;
  sender: string;
  senderTier?: LadTier;
  recipient: string; // 'backroom_lounge' or username
  isGroup: boolean;
  ciphertext: string;
  iv: string;
  timestamp: string;
  plaintextCache?: string; // Decrypted client-side with session key
  ephemeralSeconds?: number;
}

export interface UserAccount {
  id: string;
  nickname: string;
  email: string;
  avatar: string;
  role: 'member' | 'moderator' | 'admin';
  tier: LadTier;
  biometricRegistered: boolean;
  karma: number;
  pintsBought: number;
  joinedDate: string;
}

export interface AdminTask {
  id: string;
  title: string;
  status: 'backlog' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignee: string;
  dueDate: string;
}

export interface FlaggedItem {
  id: string;
  storyId: string;
  storyTitle: string;
  reportedBy: string;
  reason: string;
  severity: 'low' | 'medium' | 'critical';
  status: 'pending' | 'approved' | 'quarantined';
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'viral' | 'poll' | 'chat' | 'system';
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'analytics' | 'moderation' | 'team_tasks' | 'file_manager' | 'viral_radar';
  size: 'full' | 'half';
  order: number;
}
