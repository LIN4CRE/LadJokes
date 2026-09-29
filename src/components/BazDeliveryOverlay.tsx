import React, { useState, useEffect } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Beer,
  Mic,
  ChevronDown,
} from 'lucide-react';
import {
  bazSpeech,
  BazSpeechState,
  BAZ_VOICE_PROFILES,
  BazVoiceType,
} from '../services/bazSpeechEngine';
import { BazAnimatedAvatar } from './BazAnimatedAvatar';
import { playBanterSound } from '../services/syncService';

export const BazDeliveryOverlay: React.FC = () => {
  const [speechState, setSpeechState] = useState<BazSpeechState>({
    phase: 'idle',
    isSpeaking: false,
    activeWord: '',
    currentText: '',
    mouthOpen: false,
    selectedVoice: 'baz',
  });

  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  useEffect(() => {
    const unsub = bazSpeech.subscribe((s) => {
      setSpeechState(s);
    });
    return unsub;
  }, []);

  if (!speechState.isSpeaking && speechState.phase === 'idle') {
    return null;
  }

  const voiceProfile = BAZ_VOICE_PROFILES[speechState.selectedVoice];

  // Stage badges
  const phaseLabels: Record<string, { label: string; color: string }> = {
    intro: { label: 'TAVERN INTRO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
    setup: { label: 'THE SETUP', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    pause: { label: 'HOLD YOUR PINTS...', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse' },
    punchline: { label: '💥 THE PUNCHLINE', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold' },
    reaction: { label: 'THE LANDLORD’S VERDICT', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  };

  const currentPhaseMeta = phaseLabels[speechState.phase] || {
    label: 'LIVE BANTER',
    color: 'bg-white/10 text-white',
  };

  const handleSelectVoice = (v: BazVoiceType) => {
    bazSpeech.setVoice(v);
    setShowVoiceMenu(false);
    playBanterSound('pop');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-[94%] max-w-xl animate-in slide-in-from-bottom duration-300">
      <div className="bg-[#11131c]/95 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-amber-500/20 flex flex-col gap-3">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider ${currentPhaseMeta.color}`}>
              {currentPhaseMeta.label}
            </span>

            {/* Voice Profile Picker */}
            <div className="relative">
              <button
                onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                className="flex items-center gap-1.5 py-0.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span>{voiceProfile.flag}</span>
                <span className="font-semibold">{voiceProfile.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showVoiceMenu && (
                <div className="absolute top-8 left-0 z-50 w-56 bg-[#161824] border border-amber-500/30 rounded-xl p-1 shadow-2xl space-y-1">
                  {(Object.keys(BAZ_VOICE_PROFILES) as BazVoiceType[]).map((vKey) => {
                    const prof = BAZ_VOICE_PROFILES[vKey];
                    const isSelected = vKey === speechState.selectedVoice;

                    return (
                      <button
                        key={vKey}
                        onClick={() => handleSelectVoice(vKey)}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{prof.flag}</span>
                          <div>
                            <div>{prof.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono font-normal">
                              {prof.tagline.slice(0, 24)}...
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Audio Waves */}
            <div className="flex items-center gap-0.5 h-4 px-2">
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.45s] h-2.5" />
              <span className="w-1 bg-amber-400 rounded-full animate-bounce h-3.5" />
            </div>

            <button
              onClick={() => bazSpeech.stop()}
              aria-label="Stop Baz"
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Speaking Body */}
        <div className="flex items-center gap-4">
          {/* Animated Baz Avatar with Lip-Sync */}
          <div className="shrink-0 p-1 rounded-2xl bg-amber-500/10 border border-amber-500/30">
            <BazAnimatedAvatar
              mouthOpen={speechState.mouthOpen}
              phase={speechState.phase}
              isSpeaking={speechState.isSpeaking}
              size="md"
            />
          </div>

          {/* Subtitle / Speech Bubble */}
          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 font-display tracking-wider">
                BAZ SAYS:
              </span>
              {speechState.activeWord && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {speechState.activeWord}
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base font-medium text-white leading-snug line-clamp-3 font-sans">
              {speechState.currentText || '...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
