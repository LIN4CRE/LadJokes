// Experimental Pub Tale Text-to-Speech Engine
// Combines Neural Gemini Audio generation with Web Audio API Pub Ambience & Web Speech Fallback

export type PubVoiceId = 'baz' | 'callum' | 'sarah';

export interface StoryAudioOptions {
  title: string;
  text: string;
  voice: PubVoiceId;
  speed?: number;
  ambienceEnabled?: boolean;
  ambienceVolume?: number;
}

// Procedural Pub Ambience Synthesizer using Web Audio API
class PubAmbienceGenerator {
  private ctx: AudioContext | null = null;
  private noiseNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;
  private clinkInterval: any = null;

  public start(volume = 0.25) {
    if (this.isRunning) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      // Create brown noise buffer (warm low-frequency pub room tone)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 2.5; // boost
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Low-pass filter to simulate muffled conversation through wooden tavern walls
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
      this.isRunning = true;

      // Periodically trigger a subtle pint glass clink
      this.clinkInterval = setInterval(() => {
        if (!this.ctx || !this.isRunning || !this.gainNode) return;
        if (Math.random() > 0.45) {
          this.triggerGlassClink();
        }
      }, 3500);
    } catch (e) {
      console.warn('Pub Ambience generator initialisation skipped:', e);
    }
  }

  private triggerGlassClink() {
    if (!this.ctx || !this.gainNode) return;
    try {
      const osc = this.ctx.createOscillator();
      const clinkGain = this.ctx.createGain();

      const freq = 2200 + Math.random() * 600;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.type = 'sine';

      const now = this.ctx.currentTime;
      clinkGain.gain.setValueAtTime(0.06, now);
      clinkGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(clinkGain);
      clinkGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // ignore
    }
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop() {
    if (!this.isRunning) return;
    if (this.clinkInterval) {
      clearInterval(this.clinkInterval);
      this.clinkInterval = null;
    }
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        this.ctx.close();
      } catch {}
    }
    this.ctx = null;
    this.noiseNode = null;
    this.gainNode = null;
    this.isRunning = false;
  }
}

export const pubAmbience = new PubAmbienceGenerator();

export interface PlaybackState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  engineUsed: 'gemini-neural' | 'client-synthesizer';
  activeParagraphIndex: number;
}

export class PubStorytellerController {
  private audioElement: HTMLAudioElement | null = null;
  private speechUtterance: SpeechSynthesisUtterance | null = null;
  private onStateChange: ((state: PlaybackState) => void) | null = null;
  private paragraphs: string[] = [];
  private currentParagraph = 0;
  private durationEstimate = 60;
  private elapsedTimer: any = null;
  private startTime = 0;
  private isUsingSpeech = false;

  private state: PlaybackState = {
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    currentTime: 0,
    duration: 60,
    engineUsed: 'gemini-neural',
    activeParagraphIndex: 0,
  };

  constructor(onStateChange?: (state: PlaybackState) => void) {
    this.onStateChange = onStateChange || null;
  }

  public updateCallback(cb: (state: PlaybackState) => void) {
    this.onStateChange = cb;
  }

  private notify() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  // Request & Play Story
  public async playStory(options: StoryAudioOptions) {
    this.stop();
    this.state.isLoading = true;
    this.paragraphs = options.text.split('\n').filter((p) => p.trim().length > 0);
    this.currentParagraph = 0;
    this.state.activeParagraphIndex = 0;
    this.state.currentTime = 0;

    // Estimate duration based on word count (~130 words per min)
    const wordCount = options.text.split(/\s+/).length;
    this.durationEstimate = Math.max(15, Math.round((wordCount / 130) * 60));
    this.state.duration = this.durationEstimate;
    this.notify();

    // Start background ambiance if enabled
    if (options.ambienceEnabled !== false) {
      pubAmbience.start(options.ambienceVolume ?? 0.2);
    }

    try {
      // Step 1: Attempt Neural Gemini Audio generation via Express backend
      const res = await fetch('/api/story-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: options.title,
          text: options.text,
          voice: options.voice,
          speed: options.speed || 1.0,
        }),
      });

      const data = await res.json();

      if (data.success && data.audioUrl) {
        // Successfully generated Neural Audio via Gemini!
        this.playHtmlAudio(data.audioUrl, options.speed || 1.0);
        return;
      }
    } catch (err) {
      console.warn('Neural audio fetch failed, falling back to client synthesizer:', err);
    }

    // Step 2: Fallback to high-fidelity client pub synthesis engine
    this.playWithClientSynthesis(options);
  }

  private playHtmlAudio(audioUrl: string, speed: number) {
    this.isUsingSpeech = false;
    this.audioElement = new Audio(audioUrl);
    this.audioElement.playbackRate = speed;

    this.audioElement.onloadedmetadata = () => {
      if (this.audioElement && !isNaN(this.audioElement.duration)) {
        this.state.duration = this.audioElement.duration;
      }
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.engineUsed = 'gemini-neural';
      this.notify();
    };

    this.audioElement.ontimeupdate = () => {
      if (this.audioElement) {
        this.state.currentTime = this.audioElement.currentTime;
        if (this.state.duration > 0 && this.paragraphs.length > 0) {
          const ratio = this.state.currentTime / this.state.duration;
          this.state.activeParagraphIndex = Math.min(
            this.paragraphs.length - 1,
            Math.floor(ratio * this.paragraphs.length)
          );
        }
        this.notify();
      }
    };

    this.audioElement.onended = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      pubAmbience.stop();
      this.notify();
    };

    this.audioElement.play().catch((e) => {
      console.warn('Audio play prevented:', e);
      this.state.isLoading = false;
      this.notify();
    });
  }

  private playWithClientSynthesis(options: StoryAudioOptions) {
    if (!('speechSynthesis' in window)) {
      this.state.isLoading = false;
      this.notify();
      return;
    }

    this.isUsingSpeech = true;
    window.speechSynthesis.cancel();

    const fullScript = `${options.title}. ... ${options.text}`;
    this.speechUtterance = new SpeechSynthesisUtterance(fullScript);

    // Apply voice personality based on selection
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;

    if (options.voice === 'callum') {
      // Younger, lively Aussie / British lad
      preferredVoice = voices.find(
        (v) => v.lang.includes('en-AU') || v.name.includes('Australia') || v.name.includes('Oliver')
      );
      this.speechUtterance.rate = (options.speed || 1.0) * 1.05;
      this.speechUtterance.pitch = 1.05;
    } else if (options.voice === 'sarah') {
      // Sarcastic barmaid
      preferredVoice = voices.find(
        (v) => (v.lang.includes('en-GB') || v.lang.includes('en-IE')) && (v.name.includes('Female') || v.name.includes('Kate') || v.name.includes('Serena'))
      );
      this.speechUtterance.rate = (options.speed || 1.0) * 0.96;
      this.speechUtterance.pitch = 1.0;
    } else {
      // Big Baz - deep, hearty, gruff tavern landlord
      preferredVoice = voices.find(
        (v) => (v.lang.includes('en-GB') || v.lang.includes('UK')) && (v.name.includes('Male') || v.name.includes('George') || v.name.includes('David'))
      );
      this.speechUtterance.rate = (options.speed || 1.0) * 0.92;
      this.speechUtterance.pitch = 0.82; // low, gruff timbre
    }

    if (!preferredVoice) {
      preferredVoice = voices.find((v) => v.lang.startsWith('en')) || null;
    }

    if (preferredVoice) {
      this.speechUtterance.voice = preferredVoice;
    }

    this.speechUtterance.onstart = () => {
      this.state.isLoading = false;
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.state.engineUsed = 'client-synthesizer';
      this.startTime = Date.now();

      // Start elapsed timer
      if (this.elapsedTimer) clearInterval(this.elapsedTimer);
      this.elapsedTimer = setInterval(() => {
        if (this.state.isPlaying && !this.state.isPaused) {
          this.state.currentTime = (Date.now() - this.startTime) / 1000;
          if (this.state.duration > 0 && this.paragraphs.length > 0) {
            const ratio = this.state.currentTime / this.state.duration;
            this.state.activeParagraphIndex = Math.min(
              this.paragraphs.length - 1,
              Math.floor(ratio * this.paragraphs.length)
            );
          }
          this.notify();
        }
      }, 500);

      this.notify();
    };

    this.speechUtterance.onend = () => {
      this.state.isPlaying = false;
      this.state.isPaused = false;
      if (this.elapsedTimer) clearInterval(this.elapsedTimer);
      pubAmbience.stop();
      this.notify();
    };

    this.speechUtterance.onerror = () => {
      this.state.isPlaying = false;
      this.state.isLoading = false;
      if (this.elapsedTimer) clearInterval(this.elapsedTimer);
      pubAmbience.stop();
      this.notify();
    };

    window.speechSynthesis.speak(this.speechUtterance);
  }

  public togglePlayPause() {
    if (this.audioElement) {
      if (this.state.isPlaying) {
        this.audioElement.pause();
        this.state.isPlaying = false;
        this.state.isPaused = true;
        pubAmbience.setVolume(0.08); // lower ambiance when paused
      } else {
        this.audioElement.play();
        this.state.isPlaying = true;
        this.state.isPaused = false;
        pubAmbience.setVolume(0.25);
      }
      this.notify();
      return;
    }

    if ('speechSynthesis' in window && this.isUsingSpeech) {
      if (this.state.isPlaying) {
        window.speechSynthesis.pause();
        this.state.isPlaying = false;
        this.state.isPaused = true;
        pubAmbience.setVolume(0.08);
      } else {
        window.speechSynthesis.resume();
        this.state.isPlaying = true;
        this.state.isPaused = false;
        pubAmbience.setVolume(0.25);
      }
      this.notify();
    }
  }

  public seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(this.state.duration, seconds));
      this.state.currentTime = this.audioElement.currentTime;
      this.notify();
    }
  }

  public setPlaybackRate(rate: number) {
    if (this.audioElement) {
      this.audioElement.playbackRate = rate;
    }
  }

  public stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.elapsedTimer) {
      clearInterval(this.elapsedTimer);
      this.elapsedTimer = null;
    }
    pubAmbience.stop();

    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.isLoading = false;
    this.notify();
  }
}
