import React from 'react';
import { BazSpeechPhase } from '../services/bazSpeechEngine';

interface BazAnimatedAvatarProps {
  mouthOpen: boolean;
  phase: BazSpeechPhase;
  isSpeaking: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BazAnimatedAvatar: React.FC<BazAnimatedAvatarProps> = ({
  mouthOpen,
  phase,
  isSpeaking,
  size = 'md',
}) => {
  const pixelSizes = {
    sm: 52,
    md: 84,
    lg: 120,
  };

  const dim = pixelSizes[size];

  // Dynamic expressions based on phase
  const isSurprised = phase === 'pause';
  const isPunchline = phase === 'punchline';

  return (
    <div
      className="relative flex items-center justify-center shrink-0 select-none"
      style={{ width: dim, height: dim }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-lg transition-transform duration-150"
      >
        <defs>
          <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>

          <linearGradient id="mustacheGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <linearGradient id="beerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#eab308" />
          </linearGradient>
        </defs>

        {/* Head Base */}
        <circle cx="50" cy="54" r="32" fill="url(#skinGrad)" stroke="#ea580c" strokeWidth="1.5" />

        {/* Rosy Cheeks from Pub Warmth */}
        <circle cx="30" cy="60" r="5" fill="#f87171" fillOpacity="0.35" />
        <circle cx="70" cy="60" r="5" fill="#f87171" fillOpacity="0.35" />

        {/* Ears */}
        <circle cx="17" cy="54" r="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />
        <circle cx="83" cy="54" r="6" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />

        {/* Eyebrows */}
        <g stroke="#334155" strokeWidth="3.5" strokeLinecap="round">
          {isSurprised ? (
            <>
              <path d="M 30 38 Q 38 30 44 36" />
              <path d="M 56 36 Q 62 30 70 38" />
            </>
          ) : isPunchline ? (
            <>
              <path d="M 28 42 Q 36 36 44 40" />
              <path d="M 56 40 Q 64 36 72 42" />
            </>
          ) : (
            <>
              <path d="M 30 40 Q 37 38 44 41" />
              <path d="M 56 41 Q 63 38 70 40" />
            </>
          )}
        </g>

        {/* Eyes */}
        <g fill="#0f172a">
          {isPunchline ? (
            <path
              d="M 32 46 Q 37 42 42 46"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <>
              <circle cx="37" cy="46" r="4.5" />
              <circle cx="38.5" cy="44.5" r="1.5" fill="#ffffff" />
            </>
          )}

          {isPunchline ? (
            <path
              d="M 58 46 Q 63 42 68 46"
              fill="none"
              stroke="#0f172a"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <>
              <circle cx="63" cy="46" r="4.5" />
              <circle cx="64.5" cy="44.5" r="1.5" fill="#ffffff" />
            </>
          )}
        </g>

        {/* Pub Nose */}
        <path
          d="M 47 48 Q 50 56 53 48"
          fill="none"
          stroke="#ea580c"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Animated Mouth (Opens & Closes in Sync with Speech) */}
        {mouthOpen && isSpeaking ? (
          <g>
            <ellipse cx="50" cy="70" rx="10" ry="7" fill="#7f1d1d" />
            <path d="M 43 65 Q 50 67 57 65" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M 45 74 Q 50 71 55 74" fill="#f87171" />
          </g>
        ) : isSurprised ? (
          <circle cx="50" cy="70" r="4.5" fill="#7f1d1d" stroke="#f87171" strokeWidth="1.5" />
        ) : isPunchline ? (
          <path
            d="M 35 66 Q 50 78 65 66"
            fill="#7f1d1d"
            stroke="#b91c1c"
            strokeWidth="1.5"
          />
        ) : (
          <path
            d="M 38 67 Q 50 73 62 67"
            fill="none"
            stroke="#9a3412"
            strokeWidth="3"
            strokeLinecap="round"
          />
        )}

        {/* Magnificent British Mustache */}
        <path
          d="M 33 64 C 40 60 48 64 50 66 C 52 64 60 60 67 64 C 69 66 61 71 50 68 C 39 71 31 66 33 64 Z"
          fill="url(#mustacheGrad)"
          stroke="#334155"
          strokeWidth="0.8"
        />

        {/* Flat Cap (Tilted with Swagger) */}
        <g transform="rotate(-6, 50, 30)">
          <path
            d="M 18 29 Q 50 37 82 29 Q 50 24 18 29 Z"
            fill="#0f172a"
          />
          <path
            d="M 20 28 C 18 10 82 10 80 28 Q 50 22 20 28 Z"
            fill="url(#capGrad)"
            stroke="#0f172a"
            strokeWidth="1.5"
          />
          <circle cx="50" cy="12" r="3" fill="#334155" />
        </g>
      </svg>

      {/* Foamy Pint Glass in Corner */}
      <div className="absolute -bottom-1 -right-1 text-base transform -rotate-12 transition-transform duration-200">
        🍺
      </div>
    </div>
  );
};
