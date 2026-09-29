import React from 'react';
import {
  X,
  BookOpen,
  Trophy,
  Shield,
  Volume2,
  Calendar,
  Lock,
  Heart,
  Code2,
  CheckCircle2,
  Beer,
  Zap,
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalJokesCount: number;
  totalStoriesCount: number;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  totalJokesCount,
  totalStoriesCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-[#11131c] border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Banner Graphic Header */}
        <div className="relative bg-gradient-to-r from-[#171424] via-[#1a172c] to-[#12111d] border-b border-white/10 shrink-0">
          <img
            src="/banner.svg"
            alt="The Banter Vault Banner"
            className="w-full h-44 object-cover opacity-90"
          />
          <button
            onClick={onClose}
            aria-label="Close About"
            className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors cursor-pointer border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-200">
          {/* Header Title & Version */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                  LAD JOKES &amp; BANTER VAULT
                </h3>
                <span className="py-0.5 px-2.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/30">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The Definitive Digital Encyclopedia of British &amp; Aussie Tavern Culture
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <span className="py-1 px-2.5 rounded-lg bg-white/5 border border-white/10">
                🍺 {totalJokesCount} Total Jokes
              </span>
              <span className="py-1 px-2.5 rounded-lg bg-white/5 border border-white/10">
                📜 {totalStoriesCount} Confessions
              </span>
            </div>
          </div>

          {/* The Manifesto */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Beer className="w-4 h-4 text-amber-400" />
              <span>THE TAVERN MANIFESTO</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every nation has its grand national archives, but true culture lives in the back of the pub on a wet Tuesday night: the post-match debrief, the 3 AM kebab philosophy, the stag do cover-ups, and the legendary blunders that get recounted for forty years.
            </p>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong>The Banter Vault</strong> was created to immortalize these unwritten laws, catastrophic confessions, and laugh-out-loud tales in an unfiltered, democratic space.
            </p>
          </div>

          {/* Key Feature Pillars */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>WHAT LIVES IN THE VAULT</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>The 6-Chapter Book</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  From tavern lock-ins to Sunday League 5-a-side carnage and extreme raunchy hospital humor.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Weekly Pub Quiz</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Timed multiple-choice trivia on Crude History, Pop Culture, and Pub Laws with admin setup.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Volume2 className="w-4 h-4 text-amber-400" />
                  <span>Pub Tale Narrator (TTS)</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Full audio stream of stories with authentic pub murmur ambience and character voices.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>7-Day Banter Archive</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  The official Hall of Champions preserving past daily challenge winners with instant playback.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Backroom Lounge</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Private, client-side AES-GCM encrypted ephemeral chat that decays automatically.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Lad Tier Progression</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Level up from Rookie Lad to Immortal Weapon based on karma and pints poured.
                </p>
              </div>
            </div>
          </div>

          {/* The 4 Golden Laws of Banter */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>THE 4 UNWRITTEN LAWS OF BANTER</span>
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Affection Over Malice:</strong> True banter is love disguised as outrage. No racism, hate speech, or real harassment.</li>
              <li><strong>Protect The Round:</strong> Never disappear to the bathroom when it is your turn to buy the round.</li>
              <li><strong>Anonymize The Disasters:</strong> Protect dignity where needed—what happens on the stag stays in the vault.</li>
              <li><strong>Democratic Consensus:</strong> Settle heated pub arguments with cold hard community polling percentages.</li>
            </ul>
          </div>

          {/* Tech & Credits */}
          <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-mono">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-slate-400" />
              <span>React 19 · TypeScript · Tailwind CSS · Gemini AI</span>
            </div>
            <span>Open Source · MIT License</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141624] border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
          >
            Enter The Vault 🍻
          </button>
        </div>
      </div>
    </div>
  );
};
