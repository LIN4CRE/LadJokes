import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  X,
  FastForward,
  Rewind,
  Beer,
  Flame,
  Radio,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { CommunityStory } from '../types';
import { LadTierBadge } from './LadTierBadge';
import {
  PubVoiceId,
  PubStorytellerController,
  PlaybackState,
  pubAmbience,
} from '../services/pubTtsEngine';
import { playBanterSound } from '../services/syncService';

interface StoryAudioPlayerModalProps {
  story: CommunityStory | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StoryAudioPlayerModal: React.FC<StoryAudioPlayerModalProps> = ({
  story,
  isOpen,
  onClose,
}) => {
  const [voice, setVoice] = useState<PubVoiceId>('baz');
  const [speed, setSpeed] = useState<number>(1.0);
  const [ambienceEnabled, setAmbienceEnabled] = useState<boolean>(true);
  const [ambienceVol, setAmbienceVol] = useState<number>(0.25);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 60,
    engineUsed: 'gemini-neural',
    activeParagraphIndex: 0,
  });

  const controllerRef = useRef<PubStorytellerController | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new PubStorytellerController((state) => {
      setPlaybackState(state);
    });
  }

  // Paragraph split
  const paragraphs = useMemo(() => {
    if (!story) return [];
    return story.content.split('\n').filter((p) => p.trim().length > 0);
  }, [story]);

  // When opened with a new story, auto-start playback
  useEffect(() => {
    if (isOpen && story && controllerRef.current) {
      controllerRef.current.playStory({
        title: story.title,
        text: story.content,
        voice,
        speed,
        ambienceEnabled,
        ambienceVolume: ambienceVol,
      });
    }

    return () => {
      if (controllerRef.current) {
        controllerRef.current.stop();
      }
    };
  }, [isOpen, story]);

  // Handle Voice Change
  const handleChangeVoice = (newVoice: PubVoiceId) => {
    setVoice(newVoice);
    playBanterSound('pop');
    if (story && controllerRef.current) {
      controllerRef.current.playStory({
        title: story.title,
        text: story.content,
        voice: newVoice,
        speed,
        ambienceEnabled,
        ambienceVolume: ambienceVol,
      });
    }
  };

  // Handle Speed Change
  const handleChangeSpeed = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (controllerRef.current) {
      controllerRef.current.setPlaybackRate(newSpeed);
    }
  };

  // Handle Ambience Toggle
  const handleToggleAmbience = () => {
    const next = !ambienceEnabled;
    setAmbienceEnabled(next);
    if (next) {
      pubAmbience.start(ambienceVol);
    } else {
      pubAmbience.stop();
    }
  };

  const handleClose = () => {
    if (controllerRef.current) {
      controllerRef.current.stop();
    }
    onClose();
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-[#11131c] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#171a27] via-[#1a1e2f] to-[#12141f] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shadow-md shadow-amber-500/10">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-heading">
                  Pub Tale Narrator
                </h3>
                <span className="py-0.5 px-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Experimental TTS</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Immersive storytelling with tavern acoustics & character voices
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close narrator"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Story Metadata & Animated Visualizer Bar */}
        <div className="p-4 bg-[#0d0f17] border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              {story.category} · By {story.author}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              "{story.title}"
            </h4>
          </div>

          {/* Equalizer Sound Waves */}
          <div className="flex items-center gap-1 h-8 px-3 rounded-xl bg-white/5 border border-white/10 self-start sm:self-center">
            {[14, 24, 18, 28, 12, 22, 16, 26, 20].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full bg-amber-400 transition-all duration-150 ${
                  playbackState.isPlaying
                    ? 'animate-pulse'
                    : 'opacity-40'
                }`}
                style={{
                  height: playbackState.isPlaying
                    ? `${Math.max(6, (h * (i % 2 === 0 ? 1.2 : 0.8)))}px`
                    : '6px',
                }}
              />
            ))}
            <span className="ml-2 text-[10px] font-mono text-amber-300 font-bold uppercase">
              {playbackState.isLoading
                ? 'TUNING...'
                : playbackState.isPlaying
                ? 'ON AIR'
                : 'PAUSED'}
            </span>
          </div>
        </div>

        {/* Story Text Scroll View with Highlighted Paragraph */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm leading-relaxed bg-[#0e1018]/50">
          {paragraphs.map((p, idx) => {
            const isActive = playbackState.activeParagraphIndex === idx;
            return (
              <p
                key={idx}
                className={`transition-all duration-300 rounded-xl p-3 ${
                  isActive
                    ? 'bg-amber-500/15 border-l-4 border-amber-500 text-white font-medium shadow-sm'
                    : 'text-slate-300'
                }`}
              >
                {p}
              </p>
            );
          })}
        </div>

        {/* Tavern Voice & Atmosphere Controls Drawer */}
        <div className="p-3 sm:p-4 bg-[#141724] border-t border-white/10 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Voice Persona Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono uppercase font-bold shrink-0">
                Voice:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => handleChangeVoice('baz')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    voice === 'baz'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <span>🍺 Big Baz</span>
                  <span className="text-[10px] font-normal opacity-80">(Landlord)</span>
                </button>

                <button
                  onClick={() => handleChangeVoice('callum')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    voice === 'callum'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <span>⚡ Callum</span>
                  <span className="text-[10px] font-normal opacity-80">(Stag Lad)</span>
                </button>

                <button
                  onClick={() => handleChangeVoice('sarah')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    voice === 'sarah'
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  <span>🍷 Sarah</span>
                  <span className="text-[10px] font-normal opacity-80">(Dry Wit)</span>
                </button>
              </div>
            </div>

            {/* Atmosphere Ambiance Switch */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleToggleAmbience}
                className={`py-1.5 px-3 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ambienceEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
                title="Simulate cozy background pub chatter & clinking glasses"
              >
                <Beer className="w-3.5 h-3.5 text-amber-400" />
                <span>Pub Ambiance: {ambienceEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>

          {/* Scrubber Progress Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>{formatTime(playbackState.currentTime)}</span>
              <span className="text-[10px] text-amber-400/80">
                {playbackState.engineUsed === 'gemini-neural'
                  ? '🎙️ Gemini Neural Voice'
                  : '⚡ Pub Acoustic Synthesizer'}
              </span>
              <span>{formatTime(playbackState.duration)}</span>
            </div>

            <input
              type="range"
              min={0}
              max={playbackState.duration || 60}
              step={0.5}
              value={playbackState.currentTime}
              onChange={(e) => {
                const targetTime = parseFloat(e.target.value);
                if (controllerRef.current) {
                  controllerRef.current.seek(targetTime);
                }
              }}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Primary Playback Bar */}
          <div className="flex items-center justify-between pt-1">
            {/* Speed Selector */}
            <div className="flex items-center gap-1">
              {[0.8, 1.0, 1.25].map((s) => (
                <button
                  key={s}
                  onClick={() => handleChangeSpeed(s)}
                  className={`py-1 px-2 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    speed === s
                      ? 'bg-white/20 text-white'
                      : 'text-slate-400 hover:text-white bg-white/5'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Central Transport Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (controllerRef.current) {
                    controllerRef.current.seek(Math.max(0, playbackState.currentTime - 10));
                  }
                }}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Rewind 10 seconds"
              >
                <Rewind className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (controllerRef.current) {
                    controllerRef.current.togglePlayPause();
                  }
                }}
                disabled={playbackState.isLoading}
                className="w-12 h-12 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-black flex items-center justify-center shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                {playbackState.isLoading ? (
                  <Radio className="w-5 h-5 animate-spin" />
                ) : playbackState.isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  if (controllerRef.current) {
                    controllerRef.current.seek(
                      Math.min(playbackState.duration, playbackState.currentTime + 10)
                    );
                  }
                }}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="Fast-forward 10 seconds"
              >
                <FastForward className="w-4 h-4" />
              </button>
            </div>

            {/* Replay Button */}
            <button
              onClick={() => {
                if (story && controllerRef.current) {
                  controllerRef.current.playStory({
                    title: story.title,
                    text: story.content,
                    voice,
                    speed,
                    ambienceEnabled,
                    ambienceVolume: ambienceVol,
                  });
                }
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Restart from beginning"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
