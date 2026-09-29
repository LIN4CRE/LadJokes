import React from 'react';
import { LadTier } from '../types';
import { getTierBadgeStyle } from '../services/tierService';

interface LadTierBadgeProps {
  tier?: LadTier;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const LadTierBadge: React.FC<LadTierBadgeProps> = ({
  tier = 'Rookie Lad',
  size = 'sm',
  showIcon = true,
}) => {
  const { icon, colorClass, borderClass, textClass } = getTierBadgeStyle(tier);

  const sizeClasses = {
    sm: 'text-[10px] py-0.5 px-2 font-mono gap-1',
    md: 'text-xs py-1 px-2.5 font-mono gap-1.5',
    lg: 'text-sm py-1.5 px-3 font-mono gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-md font-semibold border ${colorClass} ${borderClass} ${textClass} ${sizeClasses} select-none shrink-0 tracking-wide`}
      title={`Lad Tier Rank: ${tier}`}
    >
      {showIcon && <span>{icon}</span>}
      <span className="uppercase">{tier}</span>
    </span>
  );
};
