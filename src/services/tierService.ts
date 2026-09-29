import { LadTier } from '../types';

export interface TierInfo {
  tier: LadTier;
  icon: string;
  minPoints: number;
  nextTier?: LadTier;
  pointsToNext: number;
  progressPercent: number;
  colorClass: string;
  borderClass: string;
  textClass: string;
  tagline: string;
}

const TIER_THRESHOLDS: Array<{
  tier: LadTier;
  minPoints: number;
  icon: string;
  colorClass: string;
  borderClass: string;
  textClass: string;
  tagline: string;
}> = [
  {
    tier: 'Immortal Weapon',
    minPoints: 2500,
    icon: '⚡',
    colorClass: 'bg-red-500/15',
    borderClass: 'border-red-500/40',
    textClass: 'text-red-400',
    tagline: 'God-tier banter, feared in all 4 nations',
  },
  {
    tier: 'Pub Legend',
    minPoints: 1000,
    icon: '🔥',
    colorClass: 'bg-amber-500/20',
    borderClass: 'border-amber-500/50',
    textClass: 'text-amber-400',
    tagline: 'Has permanent stool at the snug bar',
  },
  {
    tier: 'Meme Lord',
    minPoints: 500,
    icon: '👑',
    colorClass: 'bg-purple-500/15',
    borderClass: 'border-purple-500/40',
    textClass: 'text-purple-300',
    tagline: 'Group chat maestro & sticker machine',
  },
  {
    tier: 'Banter Veteran',
    minPoints: 250,
    icon: '🎖️',
    colorClass: 'bg-blue-500/15',
    borderClass: 'border-blue-500/40',
    textClass: 'text-blue-300',
    tagline: 'Surviving 10+ European stag dos',
  },
  {
    tier: 'Banter Apprentice',
    minPoints: 100,
    icon: '🍻',
    colorClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-300',
    tagline: 'Learning the unwritten pub laws',
  },
  {
    tier: 'Rookie Lad',
    minPoints: 0,
    icon: '🍺',
    colorClass: 'bg-slate-500/15',
    borderClass: 'border-slate-500/30',
    textClass: 'text-slate-400',
    tagline: 'Just ordered his first pint of shandy',
  },
];

export function calculateLadTier(pintsSpilled: number, engagementScore: number): TierInfo {
  // Total points calculation: pints spilled + 2x engagement
  const totalPoints = pintsSpilled + engagementScore * 2;

  for (let i = 0; i < TIER_THRESHOLDS.length; i++) {
    const threshold = TIER_THRESHOLDS[i];
    if (totalPoints >= threshold.minPoints) {
      const prevThreshold = i > 0 ? TIER_THRESHOLDS[i - 1] : null;

      let pointsToNext = 0;
      let progressPercent = 100;
      let nextTier: LadTier | undefined = undefined;

      if (prevThreshold) {
        nextTier = prevThreshold.tier;
        const range = prevThreshold.minPoints - threshold.minPoints;
        const currentProgress = totalPoints - threshold.minPoints;
        pointsToNext = Math.max(0, prevThreshold.minPoints - totalPoints);
        progressPercent = Math.min(100, Math.round((currentProgress / range) * 100));
      }

      return {
        tier: threshold.tier,
        icon: threshold.icon,
        minPoints: threshold.minPoints,
        nextTier,
        pointsToNext,
        progressPercent,
        colorClass: threshold.colorClass,
        borderClass: threshold.borderClass,
        textClass: threshold.textClass,
        tagline: threshold.tagline,
      };
    }
  }

  const base = TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1];
  return {
    tier: base.tier,
    icon: base.icon,
    minPoints: 0,
    nextTier: 'Banter Apprentice',
    pointsToNext: 100 - totalPoints,
    progressPercent: Math.round((totalPoints / 100) * 100),
    colorClass: base.colorClass,
    borderClass: base.borderClass,
    textClass: base.textClass,
    tagline: base.tagline,
  };
}

export function getTierBadgeStyle(tier: LadTier): {
  icon: string;
  colorClass: string;
  borderClass: string;
  textClass: string;
} {
  const match = TIER_THRESHOLDS.find((t) => t.tier === tier);
  if (match) {
    return {
      icon: match.icon,
      colorClass: match.colorClass,
      borderClass: match.borderClass,
      textClass: match.textClass,
    };
  }
  return {
    icon: '🍺',
    colorClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
  };
}
