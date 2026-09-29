import React from 'react';
import { X, Bell, BellRing, Flame, Sparkles, Check, Trash2 } from 'lucide-react';
import { AppNotification } from '../types';
import { requestPushPermission, triggerPushNotification, playBanterSound } from '../services/syncService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onAddNotification: (notif: AppNotification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onAddNotification,
}) => {
  if (!isOpen) return null;

  const handleEnablePush = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      triggerPushNotification('🍺 Push Notifications Enabled!', 'You will now receive alerts when your banter goes viral.');
      playBanterSound('pint');
      onAddNotification({
        id: 'notif-push-enabled-' + Date.now(),
        title: 'Native Web Push Active',
        message: 'Browser push notifications successfully connected for viral surges and replies.',
        timestamp: 'Just now',
        read: false,
        type: 'system',
      });
    }
  };

  const handleSimulateSurge = () => {
    playBanterSound('outrage');
    triggerPushNotification(
      '🔥 Viral Banter Surge Alert!',
      'Your story "The Amsterdam Passport Swap" just surpassed 95% on the Outrage-O-Meter! 450 pints spilled.'
    );
    onAddNotification({
      id: 'notif-surge-' + Date.now(),
      title: 'Viral Surge: 95% Outrage Index!',
      message: 'Your confession "The Amsterdam Passport Swap" gained 450 new pints spilled & 64 comments in the community.',
      timestamp: 'Just now',
      read: false,
      type: 'viral',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-[#11131a] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold font-heading text-white">Notifications & Push Alerts</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close notifications panel"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Push Notification Integration Action */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <BellRing className="w-4 h-4" />
              <span>Browser Push Alerts</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Get notified instantly when your anecdotes gain popularity or comments.
            </p>
          </div>
          <button
            onClick={handleEnablePush}
            className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold whitespace-nowrap transition-colors cursor-pointer"
          >
            Enable Push
          </button>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mt-4 text-xs text-slate-400 px-1">
          <button
            onClick={handleSimulateSurge}
            className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Test Viral Surge</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllRead}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={onClearAll}
              className="hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No notifications yet. Grab a pint and check back later!
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.read
                    ? 'bg-white/5 border-white/5 text-slate-400'
                    : 'bg-[#181a24] border-amber-500/20 text-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {n.type === 'viral' ? (
                      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {n.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 pl-6 leading-relaxed">
                  {n.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
