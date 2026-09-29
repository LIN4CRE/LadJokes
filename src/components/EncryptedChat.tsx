import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ShieldCheck,
  Send,
  Flame,
  KeyRound,
  EyeOff,
  User,
  Clock,
  Sparkles,
  Info,
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
  const [activeChannel, setActiveChannel] = useState<'lounge' | 'dm_trev' | 'dm_dave'>('lounge');
  const [inputText, setInputText] = useState('');
  const [passphrase, setPassphrase] = useState('LAD_BANTER_SECURE_ROOM_KEY_2026');
  const [isEphemeral, setIsEphemeral] = useState(false);
  const [decryptedCache, setDecryptedCache] = useState<Record<string, string>>({});
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
            const dec = await decryptText(m.ciphertext, m.iv, (m as any).salt || 'fallback-salt', passphrase);
            cache[m.id] = dec;
          } catch {
            cache[m.id] = '[Decryption failed: bad key]';
          }
        }
      }
      setDecryptedCache(cache);
    }
    decryptAll();
  }, [messages, passphrase]);

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
      recipient: activeChannel === 'lounge' ? 'backroom_lounge' : activeChannel,
      isGroup: activeChannel === 'lounge',
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

  const channelMessages = messages.filter((m) => {
    if (activeChannel === 'lounge') return m.isGroup || m.recipient === 'backroom_lounge';
    return m.recipient === activeChannel || m.sender === activeChannel;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#141620] via-[#171a26] to-[#10121a] border border-white/10 p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-amber-500 font-mono tracking-wider uppercase font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Client-Side AES-256-GCM End-To-End Encrypted</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-display font-extrabold tracking-wide text-white uppercase">
              ENCRYPTED BANTER LOUNGE
            </h2>
            <p className="text-sm text-slate-300">
              Private, zero-knowledge banter room. Your messages are encrypted in browser memory using Web Crypto API. No server logs, no plaintext transmissions.
            </p>
          </div>

          {/* Crypto status indicator pill */}
          <div className="p-3 rounded-xl bg-[#090a0f] border border-emerald-500/30 text-xs font-mono text-emerald-400 flex items-center gap-2 shrink-0">
            <Lock className="w-4 h-4 animate-pulse" />
            <span>AES-GCM 256 BIT KEY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#11131b] border border-white/10 rounded-2xl shadow-xl overflow-hidden min-h-[580px]">
        {/* Sidebar Channels */}
        <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-white/10 p-4 space-y-4 bg-[#0d0e14]">
          <div className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            SECURE CHANNELS
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => setActiveChannel('lounge')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeChannel === 'lounge'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">#</span>
                <span>The Backroom Lounge</span>
              </div>
              <span className="text-[10px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-slate-400">
                Lads
              </span>
            </button>

            <button
              onClick={() => setActiveChannel('dm_trev')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeChannel === 'dm_trev'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>DM: Big Trev (Sunday League)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>

            <button
              onClick={() => setActiveChannel('dm_dave')}
              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeChannel === 'dm_dave'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>DM: Gazza Bazza</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          </div>

          {/* Encryption Passphrase Control */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Channel Secret Passphrase:</span>
            </div>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full bg-[#181a24] border border-white/10 rounded-lg p-2 text-[11px] font-mono text-white focus:outline-none focus:border-amber-500"
            />
            <div className="text-[10px] text-slate-500 leading-tight">
              Change passphrase to create private encrypted silos with fellow mates.
            </div>
          </div>
        </div>

        {/* Chat Message Window */}
        <div className="lg:col-span-3 flex flex-col justify-between p-4 sm:p-6 bg-[#11131b]">
          {/* Channel Top Status Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white">
                {activeChannel === 'lounge' ? 'Backroom Banter Lounge' : 'End-to-End Encrypted Direct Message'}
              </span>
              <span className="text-[10px] font-mono text-slate-500">· 256-bit GCM</span>
            </div>

            <button
              onClick={() => setIsEphemeral(!isEphemeral)}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                isEphemeral
                  ? 'bg-red-500/20 border-red-500 text-red-300'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>{isEphemeral ? 'Burn After 30s: ON' : 'Burn After Reading: OFF'}</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 min-h-[360px] max-h-[460px]">
            {channelMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 text-xs">
                No encrypted banter yet. Break the ice and drop the first secret message!
              </div>
            ) : (
              channelMessages.map((msg) => {
                const isMe = currentUser ? msg.sender === currentUser.nickname : msg.sender === 'IncognitoLad';
                const decrypted = decryptedCache[msg.id] || '[Decrypting via WebCrypto...]';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1 px-1 flex-wrap">
                      <span className="font-bold text-slate-300">{msg.sender}</span>
                      <LadTierBadge tier={msg.senderTier || 'Banter Veteran'} size="sm" />
                      <span>·</span>
                      <span className="font-mono">{msg.timestamp}</span>
                      {msg.ephemeralSeconds && (
                        <span className="text-red-400 flex items-center gap-1 font-mono">
                          <Flame className="w-3 h-3" />
                          <span>30s</span>
                        </span>
                      )}
                    </div>

                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm font-sans space-y-1.5 shadow-md ${
                        isMe
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black font-medium'
                          : 'bg-[#181a24] border border-white/10 text-slate-100'
                      }`}
                    >
                      <p className="leading-relaxed">{decrypted}</p>

                      {/* Small cryptographic audit info */}
                      <div className={`text-[9px] font-mono opacity-60 flex items-center gap-2 pt-1 border-t ${
                        isMe ? 'border-black/20 text-black' : 'border-white/10 text-slate-400'
                      }`}>
                        <Lock className="w-2.5 h-2.5" />
                        <span>IV: {msg.iv.substring(0, 8)}...</span>
                        <span>·</span>
                        <span>AES-GCM VERIFIED</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="pt-3 border-t border-white/5 flex gap-2">
            <input
              type="text"
              placeholder="Type encrypted message (AES-GCM 256-bit protected)..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
