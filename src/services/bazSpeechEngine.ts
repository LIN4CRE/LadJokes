// Baz Speech & Comedy Delivery Engine
// Controls voice profiles, comedic timing pauses, and animated mouth/expression state

export type BazVoiceType = 'baz' | 'gazza' | 'trev' | 'archie';

export interface BazVoiceProfile {
  id: BazVoiceType;
  name: string;
  tagline: string;
  flag: string;
  langPrefixes: string[];
  pitch: number;
  rate: number;
  intros: string[];
  outros: string[];
}

export const BAZ_VOICE_PROFILES: Record<BazVoiceType, BazVoiceProfile> = {
  baz: {
    id: 'baz',
    name: 'Baz (The Gaffer)',
    tagline: 'Hearty Yorkshire landlord banter with steady comic timing',
    flag: '🍺',
    langPrefixes: ['en-GB', 'en-UK', 'en'],
    pitch: 0.92,
    rate: 0.95,
    intros: [
      'Right then lads, quiet down at the bar, listen to this one...',
      'Hold onto your pints, this one is an absolute classic...',
      'Check this out, straight from the archives...',
    ],
    outros: [
      'Get the beers in!',
      'I thank you! Try the scampi!',
      'Absolute gold that.',
    ],
  },
  gazza: {
    id: 'gazza',
    name: 'Gazza (The Livewire)',
    tagline: 'High-energy, fast-paced Aussie & Cockney party banter',
    flag: '⚡',
    langPrefixes: ['en-AU', 'en-GB', 'en'],
    pitch: 1.15,
    rate: 1.1,
    intros: [
      'Oi oi! Gather round you legends, get a load of this...',
      'Fair dinkum, listen to this belter right now...',
      'Stop scrolling, Gazza has got a proper joke for ya...',
    ],
    outros: [
      'What a ripper!',
      'Top drawer, mate!',
      'Legendary stuff right there!',
    ],
  },
  trev: {
    id: 'trev',
    name: 'Big Trev (Sunday League)',
    tagline: 'Deep, gruff, gravelly center-back with no filter',
    flag: '⚽',
    langPrefixes: ['en-GB', 'en-US', 'en'],
    pitch: 0.72,
    rate: 0.88,
    intros: [
      'Alright, pay attention before I two-foot ya...',
      'Heard this in the changing room at half time...',
      'Listen up, I only tell this once...',
    ],
    outros: [
      'Now get back on the pitch.',
      'Ref was blind anyway.',
      'Whose round is it?',
    ],
  },
  archie: {
    id: 'archie',
    name: 'Archie (The Oxford Wit)',
    tagline: 'Dry, crisp, intellectual sarcasm delivered with a smirk',
    flag: '🎩',
    langPrefixes: ['en-GB', 'en-IE', 'en'],
    pitch: 1.05,
    rate: 1.02,
    intros: [
      'Allow me to elevate the intellectual tone of this tavern...',
      'A whimsical observation for the discerning gentleman...',
      'Do observe this rather splendid piece of drollery...',
    ],
    outros: [
      'Exquisite, wouldn’t you agree?',
      'Quite.',
      'Smashing.',
    ],
  },
};

export type BazSpeechPhase = 'idle' | 'intro' | 'setup' | 'pause' | 'punchline' | 'reaction';

export interface BazSpeechState {
  phase: BazSpeechPhase;
  isSpeaking: boolean;
  activeWord: string;
  currentText: string;
  mouthOpen: boolean;
  selectedVoice: BazVoiceType;
}

class BazSpeechController {
  private state: BazSpeechState = {
    phase: 'idle',
    isSpeaking: false,
    activeWord: '',
    currentText: '',
    mouthOpen: false,
    selectedVoice: 'baz',
  };

  private listeners: ((state: BazSpeechState) => void)[] = [];
  private mouthInterval: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private abortController: AbortController | null = null;

  constructor() {
    // Warm up voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }

  public subscribe(fn: (state: BazSpeechState) => void) {
    this.listeners.push(fn);
    fn({ ...this.state });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    const copy = { ...this.state };
    this.listeners.forEach((l) => l(copy));
  }

  public setVoice(voice: BazVoiceType) {
    this.state.selectedVoice = voice;
    this.notify();
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (this.mouthInterval) {
      clearInterval(this.mouthInterval);
      this.mouthInterval = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.state.isSpeaking = false;
    this.state.phase = 'idle';
    this.state.mouthOpen = false;
    this.state.currentText = '';
    this.state.activeWord = '';
    this.notify();
  }

  private startMouthAnimation() {
    if (this.mouthInterval) clearInterval(this.mouthInterval);
    this.mouthInterval = setInterval(() => {
      this.state.mouthOpen = !this.state.mouthOpen;
      this.notify();
    }, 140);
  }

  private stopMouthAnimation() {
    if (this.mouthInterval) {
      clearInterval(this.mouthInterval);
      this.mouthInterval = null;
    }
    this.state.mouthOpen = false;
    this.notify();
  }

  private getSystemVoice(profile: BazVoiceProfile): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    for (const prefix of profile.langPrefixes) {
      // Find matching language voice
      const match = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(prefix.toLowerCase()) &&
          (profile.id === 'trev' || profile.id === 'baz'
            ? v.name.toLowerCase().includes('male') || !v.name.toLowerCase().includes('female')
            : true)
      );
      if (match) return match;
    }

    return voices.find((v) => v.lang.startsWith('en')) || voices[0] || null;
  }

  private speakSentence(text: string, voiceProfile: BazVoiceProfile): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setTimeout(resolve, text.length * 50);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;

      const chosenVoice = this.getSystemVoice(voiceProfile);
      if (chosenVoice) utterance.voice = chosenVoice;

      utterance.pitch = voiceProfile.pitch;
      utterance.rate = voiceProfile.rate;

      this.startMouthAnimation();

      utterance.onboundary = (e) => {
        if (e.name === 'word') {
          const word = text.substring(e.charIndex, e.charIndex + (e.charLength || 6));
          this.state.activeWord = word.trim();
          this.notify();
        }
      };

      utterance.onend = () => {
        this.stopMouthAnimation();
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = () => {
        this.stopMouthAnimation();
        this.currentUtterance = null;
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  // Deliver Joke with dramatic comedic timing
  public async deliverJoke(setup: string, punchline: string, customVoice?: BazVoiceType) {
    this.stop();

    const voiceType = customVoice || this.state.selectedVoice;
    const profile = BAZ_VOICE_PROFILES[voiceType];

    this.state.isSpeaking = true;
    this.state.selectedVoice = voiceType;
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    try {
      // Step 1: Comedic Intro
      this.state.phase = 'intro';
      const introText = profile.intros[Math.floor(Math.random() * profile.intros.length)];
      this.state.currentText = introText;
      this.notify();
      await this.speakSentence(introText, profile);
      if (signal.aborted) return;

      // Small beat
      await new Promise((r) => setTimeout(r, 400));
      if (signal.aborted) return;

      // Step 2: Setup
      this.state.phase = 'setup';
      this.state.currentText = setup;
      this.notify();
      await this.speakSentence(setup, profile);
      if (signal.aborted) return;

      // Step 3: Comedic Suspense Beat (Raise the pint glass!)
      this.state.phase = 'pause';
      this.state.currentText = '...wait for it lads...';
      this.notify();
      await new Promise((r) => setTimeout(r, 1200));
      if (signal.aborted) return;

      // Step 4: Punchline with gusto
      this.state.phase = 'punchline';
      this.state.currentText = punchline;
      this.notify();
      // Punchline slightly higher energy
      const punchlineProfile = { ...profile, rate: profile.rate * 0.98, pitch: profile.pitch * 1.05 };
      await this.speakSentence(punchline, punchlineProfile);
      if (signal.aborted) return;

      // Step 5: Outro / Reaction
      this.state.phase = 'reaction';
      const outroText = profile.outros[Math.floor(Math.random() * profile.outros.length)];
      this.state.currentText = outroText;
      this.notify();
      await this.speakSentence(outroText, profile);
      if (signal.aborted) return;

      // Wrap up
      await new Promise((r) => setTimeout(r, 1000));
    } catch {
      // aborted or error
    } finally {
      this.stop();
    }
  }
}

export const bazSpeech = new BazSpeechController();
