import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, Globe } from 'lucide-react';
import { playBanterSound } from '../services/syncService';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  type?: 'joke' | 'story' | 'poll';
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  type = 'joke',
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ladjokes.com';
  const shareText = `🍺 "${title}"\n\n${content}\n\n— Read more on Lad Jokes (18+ Adult Banter)`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(currentUrl);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      playBanterSound('pop');
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url: currentUrl,
        });
      } catch {
        // User dismissed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold font-heading text-white">Share To The Lads</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live quote preview box */}
        <div className="mt-4 p-4 rounded-xl bg-[#090a0f] border border-amber-500/20 text-xs text-slate-300 font-mono space-y-2 relative overflow-hidden">
          <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
            {type.toUpperCase()} PREVIEW
          </div>
          <p className="line-clamp-4 italic text-slate-200">"{content}"</p>
          <div className="text-[10px] text-slate-500">Source: Lad Jokes Vault (18+)</div>
        </div>

        {/* Share buttons */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playBanterSound('pint')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 hover:text-white text-xs font-semibold transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Lads</span>
          </a>

          {/* X / Twitter */}
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playBanterSound('pop')}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/20 text-sky-300 hover:text-white text-xs font-semibold transition-all"
          >
            <span className="font-bold">𝕏</span>
            <span>Post to X</span>
          </a>

          {/* Reddit */}
          <a
            href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/20 text-orange-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Globe className="w-4 h-4 text-orange-400" />
            <span>Reddit</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-400/20 text-blue-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Send className="w-4 h-4 text-blue-400" />
            <span>Telegram</span>
          </a>
        </div>

        {/* Copy Quote or Native Share */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Quote Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-amber-400" />
                <span>Copy Formatted Quote</span>
              </>
            )}
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              aria-label="Native share menu"
              className="py-2.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 hover:text-white transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
