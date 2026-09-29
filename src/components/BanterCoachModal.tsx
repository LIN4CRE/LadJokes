import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Copy,
  Check,
  CornerDownLeft,
  Flame,
  Beer,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { askBanterCoach } from '../services/aiService';
import { playBanterSound } from '../services/syncService';

export interface BanterCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'punchline' | 'witty_response' | 'story_polish' | 'chat';
  initialContext?: string;
  onApplyText?: (text: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const BanterCoachModal: React.FC<BanterCoachModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'chat',
  initialContext = '',
  onApplyText,
}) => {
  const [mode, setMode] = useState<'punchline' | 'witty_response' | 'story_polish' | 'chat'>(initialMode);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message or auto-prompt if initialContext is provided
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      if (initialContext) {
        // If context was provided (e.g. from joke editor or confession draft), generate initial guidance
        handleAutoConsult(initialMode, initialContext);
      } else if (messages.length === 0) {
        setMessages([
          {
            id: 'welcome-1',
            role: 'model',
            content: `Alright mate! I'm **Baz, your AI Banter Coach** (powered by Gemini). 🍺

Whether you're struggling to land a killer punchline, need a razor-sharp comeback for a forum argument, or want to punch up a pub catastrophe story—I'm your wingman.

Pick a quick tool below or type your draft in!`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    }
  }, [isOpen, initialContext, initialMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAutoConsult = async (selectedMode: typeof mode, contextText: string) => {
    setLoading(true);
    playBanterSound('pop');

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content:
        selectedMode === 'punchline'
          ? `Need punchline suggestions for this setup: "${contextText}"`
          : selectedMode === 'witty_response'
          ? `Need a witty comeback to this comment: "${contextText}"`
          : `Help me punch up this story draft: "${contextText}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const reply = await askBanterCoach({
        mode: selectedMode,
        context: contextText,
        prompt: userMsg.content,
      });

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      playBanterSound('pint');
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        content: `Bloody hell mate, looks like the pub Wi-Fi cut out: ${err.message || 'Could not connect to Gemini'}. Give it another shot in a moment!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputPrompt.trim();
    if (!trimmed || loading) return;

    setInputPrompt('');
    setLoading(true);
    playBanterSound('pop');

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);

    try {
      const reply = await askBanterCoach({
        mode,
        prompt: trimmed,
        context: initialContext,
        history: newHistory.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        role: 'model',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      playBanterSound('pint');
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'model',
        content: `Sorry mate, technical hiccup: ${err.message || 'Gemini request failed'}. Please retry!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="max-w-2xl w-full bg-[#10121a] border border-amber-500/30 rounded-3xl shadow-2xl flex flex-col h-[85vh] max-h-[750px] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#141724] via-[#191d2c] to-[#12141e] border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-xl shadow-md shadow-amber-500/10">
              🎙️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-heading">
                  Baz The Banter Coach
                </h3>
                <span className="py-0.5 px-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Gemini AI</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>At the bar counter ready to coach your comebacks & punchlines</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Banter Coach"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Chips */}
        <div className="p-3 bg-[#0d0f15] border-b border-white/5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-mono text-slate-500 uppercase px-2 font-bold shrink-0">
            Mode:
          </span>
          <button
            onClick={() => setMode('punchline')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'punchline'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Killer Punchlines</span>
          </button>

          <button
            onClick={() => setMode('witty_response')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'witty_response'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Witty Comebacks</span>
          </button>

          <button
            onClick={() => setMode('story_polish')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'story_polish'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Story Polish</span>
          </button>

          <button
            onClick={() => setMode('chat')}
            className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              mode === 'chat'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Pub Chat</span>
          </button>
        </div>

        {/* Working Context Banner if applicable */}
        {initialContext && (
          <div className="py-2 px-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2 overflow-hidden text-amber-300">
              <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
              <span className="truncate font-mono">
                Working on: "{initialContext.slice(0, 60)}..."
              </span>
            </div>
            <button
              onClick={() => handleAutoConsult(mode, initialContext)}
              disabled={loading}
              className="ml-3 shrink-0 text-[11px] font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer disabled:opacity-50"
            >
              Regenerate
            </button>
          </div>
        )}

        {/* Chat Message List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 text-sm">
                    🍺
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                      : 'bg-[#171a25] border border-white/10 text-slate-200 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                  {/* Actions for Model Messages */}
                  {!isUser && (
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                      <span className="font-mono text-[10px] text-slate-500">
                        {msg.timestamp}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                          title="Copy to clipboard"
                        >
                          {copiedIndex === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span>{copiedIndex === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        {onApplyText && (
                          <button
                            onClick={() => {
                              onApplyText(msg.content);
                              playBanterSound('pint');
                              onClose();
                            }}
                            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors cursor-pointer"
                            title="Insert into your post draft"
                          >
                            <CornerDownLeft className="w-3.5 h-3.5" />
                            <span>Insert to Post</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 text-slate-200 flex items-center justify-center shrink-0 text-xs font-bold">
                    ME
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 animate-bounce">
                🍺
              </div>
              <div className="p-3.5 rounded-2xl bg-[#171a25] border border-white/10 text-xs text-amber-300 font-mono flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                <span>Baz is testing comebacks with the lads...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 sm:p-4 bg-[#0d0f15] border-t border-white/10 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            placeholder={
              mode === 'punchline'
                ? 'Describe your joke setup or unfinished story...'
                : mode === 'witty_response'
                ? 'Paste the comment you need a comeback for...'
                : mode === 'story_polish'
                ? 'Paste your confession or draft to punch up...'
                : 'Ask Baz anything about comedy, banter, or timing...'
            }
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#161822] border border-white/10 rounded-xl py-2.5 px-3.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || loading}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>Ask Baz</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
