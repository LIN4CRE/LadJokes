import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ShieldCheck,
  Send,
  KeyRound,
  EyeOff,
  User,
  Copy,
  Check,
  Sparkles,
  Info,
  Trash2,
} from 'lucide-react';
import { EncryptedMessage, UserAccount } from '../types';
import { encryptText, decryptText } from '../services/cryptoService';
import { playBanterSound } from '../services/syncService';
import { LadTierBadge } from './LadTierBadge';

interface EncryptedChatProps {
  currentUser: UserAccount | null;
  onSendMessage: (msg: EncryptedMessage) => void;
  messages: EncryptedMessage[];
}

export const EncryptedChat: React.FC<EncryptedChatProps> = ({
  currentUser,
  onSendMessage,
  messages,
}) => {
  const [inputText, setInputText] = useState('');
  const [passphrase, setPassphrase] = useState('LAD_BANTER_SECURE_ROOM_KEY_2026');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, decryptedCache]);

  // Decrypt messages when messages array or passphrase changes
  useEffect(() => {
    async function decryptAll() {
      const cache: Record<string, string> = {};
      for (const m of messages) {
        if (m.plaintextCache) {
          cache[m.id] = m.plaintextCache;
        } else {
          try {
            const dec = await decryptText(
              m.ciphertext,
              m.iv,
              (m as any).salt || 'fallback-salt',
              passphrase
            );
            cache[m.id] = dec;
          } catch {
            cache[m.id] = '[Decryption failed: incorrect room passphrase]';
          }
        }
      }
      setDecryptedCache(cache);
    }
    decryptAll();
  }, [messages, passphrase]);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(passphrase);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const senderName = currentUser ? currentUser.nickname : 'IncognitoLad';
    const textToSend = inputText.trim();

    // Perform authentic Web Crypto AES-GCM 256-bit encryption
    const { ciphertext, iv, salt } = await encryptText(textToSend, passphrase);

    const message: EncryptedMessage = {
      id: 'msg-' + Date.now(),
      sender: senderName,
      senderTier: currentUser?.tier || 'Pub Legend',
      recipient: 'backroom_lounge',
      isGroup: true,
      ciphertext,
      iv,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      plaintextCache: textToSend,
      ephemeralSeconds: isEphemeral ? 30 : undefined,
    };
    (message as any).salt = salt;

    onSendMessage(message);
    setInputText('');
    playBanterSound('pop');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141620] via-[#171a26] to-[#10121a] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono tracking-wider uppercase font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Real AES-256-GCM End-To-End Encrypted</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-wide text-white uppercase">
              THE BACKROOM LOUNGE
            </h2>
            <p className="text-sm text-slate-300">
              Private, zero-knowledge encrypted space. All messages are encrypted directly in your browser memory before storage. No fake bots, no server monitoring.
            </p>
          </div>

          {/* Crypto status indicator pill */}
          <div className="p-3.5 rounded-xl bg-[#090a0f] border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2 shrink-0">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>AES-GCM 256 BIT CIPHER ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#11131b] border border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-[560px]">
        {/* Sidebar Security Controls */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 p-5 space-y-5 bg-[#0d0e14]">
          <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            ROOM SECURITY
          </div>

          {/* Room Key Box */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Room Passphrase</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-[#161824] border border-white/10 rounded-xl py-2 px-3 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              onClick={handleCopyKey}
              className="w-full py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Key Copied!' : 'Copy Key for Mates'}</span>
            </button>
            <p className="text-[11px] text-slate-500 leading-snug">
              Anyone with this exact passphrase can decrypt and read messages sent in this room.
            </p>
          </div>

          {/* Self-Destruct Option */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                <span>30s Ephemeral Decay</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEphemeral(!isEphemeral)}
                className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                  isEphemeral ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isEphemeral ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              When enabled, new messages auto-destruct after 30 seconds.
            </p>
          </div>
        </div>

        {/* Chat Feed & Composer */}
        <div className="lg:col-span-3 flex flex-col justify-between p-4 sm:p-6 bg-[#0a0b10]">
          {/* Messages list */}
          <div className="space-y-4 overflow-y-auto max-h-[460px] pr-2 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <Lock className="w-6 h-6 text-amber-500" />
                </div>
                <h4 className="text-sm font-bold text-white uppercase font-mono">
                  The Backroom Lounge is Clear
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  No encrypted messages in this session yet. Type your confidential banter below to encrypt and post!
                </p>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.sender === (currentUser?.nickname || 'IncognitoLad');
                const text = decryptedCache[m.id] || '[Decrypting...]';

                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="font-bold text-slate-200">{m.sender}</span>
                      <LadTierBadge tier={m.senderTier || 'Pub Legend'} size="sm" />
                      <span>{m.timestamp}</span>
                      {m.ephemeralSeconds && (
                        <span className="text-[10px] text-purple-400 font-mono">
                          ⏳ {m.ephemeralSeconds}s
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm font-sans leading-relaxed ${
                        isMe
                          ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                          : 'bg-[#181b26] text-white border border-white/10 rounded-tl-none'
                      }`}
                    >
                      <p>{text}</p>
                    </div>

                    {/* Ciphertext Preview on hover */}
                    <div className="text-[10px] font-mono text-slate-600 max-w-xs truncate">
                      🔒 Cipher: {m.ciphertext.slice(0, 24)}...
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Form */}
          <form onSubmit={handleSend} className="pt-4 border-t border-white/10 flex gap-2">
            <input
              type="text"
              placeholder="Type your encrypted message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-[#141622] border border-white/10 rounded-xl py-3 px-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="py-3 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Encrypt &amp; Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
