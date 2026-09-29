/**
 * Real-Time Multi-Device Sync & Notification Service
 * Uses BroadcastChannel API for multi-tab/multi-window synchronization,
 * Web Push Notification API for alerts, and Web Audio API for banter sound effects.
 */

type SyncEventType =
  | 'STORY_OUTRAGE_RATED'
  | 'POLL_VOTED'
  | 'NEW_STORY_POSTED'
  | 'NEW_POLL_CREATED'
  | 'NEW_CHAT_MESSAGE'
  | 'STORY_COMMENTED'
  | 'TASK_UPDATED'
  | 'REPORT_RESOLVED';

export interface SyncPayload {
  type: SyncEventType;
  payload: any;
  timestamp: number;
  originClientId: string;
}

const CLIENT_ID = 'client_' + Math.random().toString(36).substring(2, 9);
let channel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel('lad_jokes_realtime_sync_channel');
  }
} catch (e) {
  console.warn('BroadcastChannel not available in this environment', e);
}

export function broadcastSync(type: SyncEventType, payload: any) {
  if (!channel) return;
  try {
    const message: SyncPayload = {
      type,
      payload,
      timestamp: Date.now(),
      originClientId: CLIENT_ID,
    };
    channel.postMessage(message);
  } catch (err) {
    console.error('Broadcast failed:', err);
  }
}

export function subscribeToSync(callback: (event: SyncPayload) => void): () => void {
  if (!channel) return () => {};

  const handler = (e: MessageEvent<SyncPayload>) => {
    // Only accept events from other tabs/clients
    if (e.data && e.data.originClientId !== CLIENT_ID) {
      callback(e.data);
    }
  };

  channel.addEventListener('message', handler);
  return () => {
    channel?.removeEventListener('message', handler);
  };
}

/**
 * Native Browser Push Notification
 */
export async function requestPushPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function triggerPushNotification(title: string, body: string, icon = '🍺') {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://api.iconify.design/lucide:beer.svg',
      });
    } catch {
      // Notification API error handled gracefully
    }
  }
}

/**
 * Web Audio synthesizer for tactile banter feedback
 */
export function playBanterSound(type: 'pint' | 'outrage' | 'laugh' | 'pop') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'pint') {
      // Clinking glass tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'outrage') {
      // Dramatic low buzz / alarm tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'pop') {
      // Cork pop tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}
