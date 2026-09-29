import React, { useState, useEffect } from 'react';
import { Flame, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AgeDisclaimerModalProps {
  onConfirm: () => void;
}

export const AgeDisclaimerModal: React.FC<AgeDisclaimerModalProps> = ({ onConfirm }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const confirmed = localStorage.getItem('lad_jokes_18_plus_confirmed');
    if (!confirmed) {
      setIsOpen(true);
    }
  }, []);

  const handleAgree = () => {
    localStorage.setItem('lad_jokes_18_plus_confirmed', 'true');
    setIsOpen(false);
    onConfirm();
  };

  const handleDecline = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-[#10121a] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Provocative glowing accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-red-600 to-amber-500 animate-pulse" />

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-amber-500/80 font-bold">Age Verification · 18+ Only</span>
            <h2 className="text-2xl font-bold font-display tracking-wide text-white uppercase">Adult Content Warning</h2>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-5">
          <strong className="text-amber-400">Lad Jokes & Crude Confessions</strong> contains unfiltered pub humor, raunchy anecdotes, adult language, and questionable life decisions intended strictly for mature audiences (18+).
        </p>

        <div className="bg-[#171a24] rounded-xl p-4 border border-slate-800 text-xs text-slate-400 space-y-2 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Outrageous banter, stag do fiascos & crude adult humor</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Anonymous community confessions & Outrage-O-Meter ratings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>End-to-end encrypted private banter vault</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAgree}
            className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] cursor-pointer"
          >
            I am 18+ Enter Banter Vault
          </button>
          <button
            onClick={handleDecline}
            className="py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Exit Site
          </button>
        </div>
      </div>
    </div>
  );
};
