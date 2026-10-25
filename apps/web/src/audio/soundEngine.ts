import type { MusicMoodId } from '@cafetulia/ui';

export type SoundChannelVolumes = {
  music: number;
  ambience: number;
  sfx: number;
  muted: boolean;
  haptics: boolean;
  mood: MusicMoodId;
};

export type ScreenMusicTheme = 'title' | 'lobby' | 'playing' | 'finished';

export type SfxKind =
  | 'cardSelect'
  | 'tilePlace'
  | 'chairSlide'
  | 'coffeeSip'
  | 'pureTableToast'
  | 'barPositive'
  | 'barNegative'
  | 'coinClink'
  | 'coinPenalty'
  | 'bell'
  | 'calloutSting'
  | 'victoryFanfare'
  | 'uiPlay'
  | 'uiCreateRoom'
  | 'uiJoinRoom'
  | 'uiTutorial'
  | 'uiRules'
  | 'uiSettings'
  | 'uiCopy'
  | 'uiReady'
  | 'uiStart'
  | 'uiLeave'
  | 'uiOpen'
  | 'uiClose'
  | 'uiConfirm'
  | 'uiCancel'
  | 'uiToggle'
  | 'uiAvatar'
  | 'uiSlider'
  | 'uiError'
  | 'uiHover'
  | 'botJoin';

type BarStepSpec = {
  section: 'A1' | 'A2' | 'B' | 'A3';
  bass: [number, number];
  chord: number[];
  melody: Array<{ beatOffset: number; freq: number; dur: number; voice: 'rhodes' | 'trumpet' }>;
};

// 24-bar evolving lo-fi café progression (~80 seconds per cycle at 72 BPM)
// Sections: A1 (bars 0-7), A2 (bars 8-15), B bridge (bars 16-19), A3 turnaround (bars 20-23)
const LOFI_PROGRESSION_24_BARS: BarStepSpec[] = [
  // --- SECTION A1: Warm afternoon Rhodes & bass ---
  {
    section: 'A1',
    bass: [174.61, 130.81], // F3 -> C3
    chord: [261.63, 329.63, 392.0, 440.0], // Fmaj9
    melody: [{ beatOffset: 1.5, freq: 523.25, dur: 0.7, voice: 'rhodes' }],
  },
  {
    section: 'A1',
    bass: [164.81, 123.47], // E3 -> B2
    chord: [246.94, 293.66, 392.0, 493.88], // Em7
    melody: [{ beatOffset: 2.0, freq: 493.88, dur: 0.9, voice: 'rhodes' }],
  },
  {
    section: 'A1',
    bass: [146.83, 110.0], // D3 -> A2
    chord: [261.63, 329.63, 349.23, 440.0], // Dm9
    melody: [
      { beatOffset: 1.0, freq: 440.0, dur: 0.5, voice: 'rhodes' },
      { beatOffset: 2.5, freq: 523.25, dur: 0.8, voice: 'rhodes' },
    ],
  },
  {
    section: 'A1',
    bass: [130.81, 146.83], // C3 -> D3
    chord: [246.94, 293.66, 329.63, 392.0], // Cmaj9
    melody: [{ beatOffset: 3.0, freq: 392.0, dur: 0.7, voice: 'rhodes' }],
  },
  {
    section: 'A1',
    bass: [116.54, 146.83], // Bb2 -> D3
    chord: [220.0, 261.63, 293.66, 349.23], // Bbmaj7
    melody: [{ beatOffset: 1.5, freq: 440.0, dur: 0.9, voice: 'rhodes' }],
  },
  {
    section: 'A1',
    bass: [110.0, 164.81], // A2 -> E3
    chord: [246.94, 261.63, 329.63, 392.0], // Am9
    melody: [{ beatOffset: 2.5, freq: 392.0, dur: 0.6, voice: 'rhodes' }],
  },
  {
    section: 'A1',
    bass: [98.0, 146.83], // G2 -> D3
    chord: [220.0, 261.63, 293.66, 349.23], // Gm9
    melody: [
      { beatOffset: 1.0, freq: 349.23, dur: 0.5, voice: 'rhodes' },
      { beatOffset: 2.0, freq: 392.0, dur: 0.8, voice: 'rhodes' },
    ],
  },
  {
    section: 'A1',
    bass: [130.81, 98.0], // C3 -> G2
    chord: [220.0, 293.66, 329.63, 392.0], // C13
    melody: [{ beatOffset: 1.5, freq: 440.0, dur: 1.1, voice: 'rhodes' }],
  },

  // --- SECTION A2: Melodic answer with gentle syncopation ---
  {
    section: 'A2',
    bass: [174.61, 146.83], // F3 -> D3
    chord: [261.63, 329.63, 392.0, 523.25], // Fmaj9 high
    melody: [
      { beatOffset: 0.5, freq: 587.33, dur: 0.6, voice: 'rhodes' },
      { beatOffset: 2.0, freq: 523.25, dur: 0.9, voice: 'rhodes' },
    ],
  },
  {
    section: 'A2',
    bass: [164.81, 110.0], // E3 -> A2
    chord: [246.94, 311.13, 392.0, 493.88], // E7alt -> Am
    melody: [{ beatOffset: 1.5, freq: 493.88, dur: 0.8, voice: 'rhodes' }],
  },
  {
    section: 'A2',
    bass: [146.83, 174.61], // D3 -> F3
    chord: [261.63, 329.63, 349.23, 440.0], // Dm9
    melody: [
      { beatOffset: 1.0, freq: 523.25, dur: 0.5, voice: 'rhodes' },
      { beatOffset: 2.5, freq: 440.0, dur: 0.8, voice: 'rhodes' },
    ],
  },
  {
    section: 'A2',
    bass: [130.81, 116.54], // C3 -> Bb2
    chord: [220.0, 261.63, 329.63, 392.0], // C9
    melody: [{ beatOffset: 2.0, freq: 466.16, dur: 0.9, voice: 'rhodes' }],
  },
  {
    section: 'A2',
    bass: [116.54, 130.81], // Bb2 -> C3
    chord: [220.0, 261.63, 349.23, 440.0], // Bbmaj9
    melody: [{ beatOffset: 1.0, freq: 523.25, dur: 1.0, voice: 'trumpet' }],
  },
  {
    section: 'A2',
    bass: [110.0, 146.83], // A2 -> D3
    chord: [246.94, 261.63, 329.63, 440.0], // Am11
    melody: [{ beatOffset: 2.0, freq: 493.88, dur: 0.9, voice: 'trumpet' }],
  },
  {
    section: 'A2',
    bass: [146.83, 98.0], // D3 -> G2
    chord: [246.94, 293.66, 349.23, 440.0], // G13
    melody: [
      { beatOffset: 1.0, freq: 440.0, dur: 0.6, voice: 'rhodes' },
      { beatOffset: 2.5, freq: 392.0, dur: 0.8, voice: 'rhodes' },
    ],
  },
  {
    section: 'A2',
    bass: [130.81, 164.81], // C3 -> E3
    chord: [246.94, 293.66, 329.63, 392.0], // Cmaj9
    melody: [{ beatOffset: 1.5, freq: 329.63, dur: 1.1, voice: 'rhodes' }],
  },

  // --- SECTION B: Café bridge with muted trumpet & warm key shift ---
  {
    section: 'B',
    bass: [138.59, 103.83], // Db3 -> Ab2
    chord: [261.63, 311.13, 392.0, 466.16], // Dbmaj9
    melody: [
      { beatOffset: 0.5, freq: 523.25, dur: 1.1, voice: 'trumpet' },
      { beatOffset: 2.25, freq: 466.16, dur: 0.8, voice: 'trumpet' },
    ],
  },
  {
    section: 'B',
    bass: [130.81, 98.0], // C3 -> G2
    chord: [233.08, 293.66, 349.23, 466.16], // Cm9
    melody: [{ beatOffset: 1.25, freq: 392.0, dur: 1.2, voice: 'trumpet' }],
  },
  {
    section: 'B',
    bass: [116.54, 146.83], // Bb2 -> D3
    chord: [220.0, 261.63, 293.66, 349.23], // Bbmaj7
    melody: [
      { beatOffset: 1.0, freq: 440.0, dur: 0.7, voice: 'trumpet' },
      { beatOffset: 2.25, freq: 523.25, dur: 0.9, voice: 'rhodes' },
    ],
  },
  {
    section: 'B',
    bass: [130.81, 130.81], // C3 pedal
    chord: [220.0, 261.63, 329.63, 392.0], // C9sus4
    melody: [{ beatOffset: 1.5, freq: 587.33, dur: 1.1, voice: 'trumpet' }],
  },

  // --- SECTION A3: Cozy turnaround back to home ---
  {
    section: 'A3',
    bass: [174.61, 110.0], // F3 -> A2
    chord: [261.63, 329.63, 392.0, 440.0], // Fmaj9
    melody: [{ beatOffset: 1.0, freq: 523.25, dur: 0.9, voice: 'rhodes' }],
  },
  {
    section: 'A3',
    bass: [146.83, 110.0], // D3 -> A2
    chord: [261.63, 329.63, 349.23, 440.0], // Dm9
    melody: [
      { beatOffset: 1.5, freq: 493.88, dur: 0.5, voice: 'rhodes' },
      { beatOffset: 2.5, freq: 440.0, dur: 0.7, voice: 'rhodes' },
    ],
  },
  {
    section: 'A3',
    bass: [98.0, 146.83], // G2 -> D3
    chord: [220.0, 261.63, 293.66, 349.23], // Gm9
    melody: [{ beatOffset: 1.0, freq: 392.0, dur: 0.9, voice: 'rhodes' }],
  },
  {
    section: 'A3',
    bass: [130.81, 98.0], // C3 -> G2
    chord: [220.0, 280.0, 329.63, 392.0], // C13b9 gentle resolve
    melody: [{ beatOffset: 2.0, freq: 349.23, dur: 1.0, voice: 'rhodes' }],
  },
];

const STORAGE_KEY = 'cafetulia_audio_settings_v7';

function loadSavedVolumes(): SoundChannelVolumes {
  const defaults: SoundChannelVolumes = {
    music: 0.28,
    ambience: 0.36,
    sfx: 0.68,
    muted: false,
    haptics: true,
    mood: 'tertulia',
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<SoundChannelVolumes>;
    return {
      music: typeof parsed.music === 'number' ? Math.max(0, Math.min(1, parsed.music)) : defaults.music,
      ambience:
        typeof parsed.ambience === 'number'
          ? Math.max(0, Math.min(1, parsed.ambience))
          : defaults.ambience,
      sfx: typeof parsed.sfx === 'number' ? Math.max(0, Math.min(1, parsed.sfx)) : defaults.sfx,
      muted: Boolean(parsed.muted),
      haptics: parsed.haptics !== undefined ? Boolean(parsed.haptics) : defaults.haptics,
      mood:
        parsed.mood === 'tertulia' || parsed.mood === 'lluvia' || parsed.mood === 'noche'
          ? parsed.mood
          : defaults.mood,
    };
  } catch {
    return defaults;
  }
}

class CafetuliaSoundEngine {
  private ctx: AudioContext | null = null;
  private musicBus: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private volumes: SoundChannelVolumes = loadSavedVolumes();
  private screenTheme: ScreenMusicTheme = 'title';
  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextBarTime = 0;
  private currentBarIndex = 0;
  private cycleCount = 0;
  private unlocked = false;
  private lastSliderTickMs = 0;
  private lastHoverTickMs = 0;
  private duckTimeout: ReturnType<typeof setTimeout> | null = null;

  public getVolumes(): SoundChannelVolumes {
    return { ...this.volumes };
  }

  private saveVolumes(): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.volumes));
    } catch {
      // ignore storage errors
    }
  }

  public setVolumes(patch: Partial<SoundChannelVolumes>): SoundChannelVolumes {
    this.volumes = { ...this.volumes, ...patch };
    this.saveVolumes();
    this.syncBusGains();

    if (this.volumes.muted || (this.volumes.music <= 0.01 && this.volumes.ambience <= 0.01)) {
      this.stopLoops();
    } else if (this.unlocked && !this.schedulerTimer) {
      this.startLoops();
    }
    return this.getVolumes();
  }

  public setScreenTheme(theme: ScreenMusicTheme): void {
    if (this.screenTheme === theme) return;
    this.screenTheme = theme;
    // Crossfade bus gains subtly when transitioning between Title, Lobby, Playing, and Finished
    this.syncBusGains(0.32);
  }

  public getScreenTheme(): ScreenMusicTheme {
    return this.screenTheme;
  }

  public unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      try {
        this.ctx = new AudioCtx();
      } catch {
        return;
      }
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {
        // Ignore iOS/Safari gesture race
      });
    }
    this.ensureBuses();
    this.unlocked = true;
    if (
      !this.volumes.muted &&
      (this.volumes.music > 0.01 || this.volumes.ambience > 0.01) &&
      !this.schedulerTimer
    ) {
      this.startLoops();
    }
  }

  private ensureBuses(): void {
    if (!this.ctx) return;
    if (!this.musicBus) {
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.setValueAtTime(this.computeMusicTargetGain(), this.ctx.currentTime);
      this.musicBus.connect(this.ctx.destination);
    }
    if (!this.ambienceBus) {
      this.ambienceBus = this.ctx.createGain();
      this.ambienceBus.gain.setValueAtTime(this.computeAmbienceTargetGain(), this.ctx.currentTime);
      this.ambienceBus.connect(this.ctx.destination);
    }
    if (!this.noiseBuffer) {
      // Create a 1.5s soft pink-ish noise buffer for brushed percussion, steam, vinyl, and rain
      const sampleRate = this.ctx.sampleRate;
      const length = Math.floor(sampleRate * 1.5);
      const buffer = this.ctx.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0;
      let b1 = 0;
      let b2 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + white * 0.029;
        b1 = 0.985 * b1 + white * 0.032;
        b2 = 0.95 * b2 + white * 0.048;
        data[i] = (b0 + b1 + b2 + white * 0.04) * 0.35;
      }
      this.noiseBuffer = buffer;
    }
  }

  private computeMusicTargetGain(): number {
    if (this.volumes.muted || this.volumes.music <= 0.01) return 0.0001;
    const screenMult =
      this.screenTheme === 'title'
        ? 0.95
        : this.screenTheme === 'lobby'
          ? 1.0
          : this.screenTheme === 'playing'
            ? 0.85
            : 0.9;
    return Math.max(0.0001, this.volumes.music * 0.14 * screenMult);
  }

  private computeAmbienceTargetGain(): number {
    if (this.volumes.muted || this.volumes.ambience <= 0.01) return 0.0001;
    return Math.max(0.0001, this.volumes.ambience * 0.12);
  }

  private syncBusGains(rampSeconds = 0.12): void {
    if (!this.ctx) return;
    this.ensureBuses();
    const now = this.ctx.currentTime;
    if (this.musicBus) {
      this.musicBus.gain.cancelScheduledValues(now);
      this.musicBus.gain.setValueAtTime(Math.max(0.0001, this.musicBus.gain.value), now);
      this.musicBus.gain.exponentialRampToValueAtTime(
        this.computeMusicTargetGain(),
        now + rampSeconds,
      );
    }
    if (this.ambienceBus) {
      this.ambienceBus.gain.cancelScheduledValues(now);
      this.ambienceBus.gain.setValueAtTime(Math.max(0.0001, this.ambienceBus.gain.value), now);
      this.ambienceBus.gain.exponentialRampToValueAtTime(
        this.computeAmbienceTargetGain(),
        now + rampSeconds,
      );
    }
  }

  /**
   * Ducks background music briefly when an important UI/game SFX or subtitle callout plays,
   * then smoothly restores it.
   */
  public duckMusic(durationMs = 420): void {
    if (!this.ctx || !this.musicBus || this.volumes.muted || this.volumes.music <= 0.01) return;
    const now = this.ctx.currentTime;
    const target = this.computeMusicTargetGain();
    const ducked = Math.max(0.0001, target * 0.38);

    this.musicBus.gain.cancelScheduledValues(now);
    this.musicBus.gain.setValueAtTime(Math.max(0.0001, this.musicBus.gain.value), now);
    this.musicBus.gain.exponentialRampToValueAtTime(ducked, now + 0.04);

    if (this.duckTimeout) {
      clearTimeout(this.duckTimeout);
    }
    this.duckTimeout = setTimeout(() => {
      if (!this.ctx || !this.musicBus) return;
      const restoreNow = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(restoreNow);
      this.musicBus.gain.setValueAtTime(Math.max(0.0001, this.musicBus.gain.value), restoreNow);
      this.musicBus.gain.exponentialRampToValueAtTime(
        this.computeMusicTargetGain(),
        restoreNow + 0.55,
      );
    }, durationMs);
  }

  private triggerHaptic(pattern: number | number[]): void {
    if (!this.volumes.haptics || this.volumes.muted) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported mobile browsers
      }
    }
  }

  /**
   * Lookahead Web Audio scheduler for evolving 24-bar lo-fi café music
   */
  public startLoops(): void {
    if (
      !this.unlocked ||
      this.volumes.muted ||
      (this.volumes.music <= 0.01 && this.volumes.ambience <= 0.01) ||
      this.schedulerTimer
    ) {
      return;
    }
    if (!this.ctx) return;
    this.ensureBuses();
    this.nextBarTime = this.ctx.currentTime + 0.08;

    const scheduleAheadSec = 0.25;
    const lookaheadIntervalMs = 85;

    this.schedulerTimer = setInterval(() => {
      if (!this.ctx || this.volumes.muted) return;
      if (this.ctx.state === 'suspended') return;

      while (this.nextBarTime < this.ctx.currentTime + scheduleAheadSec) {
        this.scheduleBar(this.currentBarIndex, this.nextBarTime);
        const barDuration = this.getBarDurationSeconds();
        this.nextBarTime += barDuration;
        this.currentBarIndex = (this.currentBarIndex + 1) % LOFI_PROGRESSION_24_BARS.length;
        if (this.currentBarIndex === 0) {
          this.cycleCount += 1;
        }
      }
    }, lookaheadIntervalMs);
  }

  private getBarDurationSeconds(): number {
    // Slightly different tempo feel per mood & screen (~68 to 76 BPM, 4 beats per bar)
    const baseBpm =
      this.volumes.mood === 'noche' ? 66 : this.volumes.mood === 'lluvia' ? 70 : 74;
    const screenOffset =
      this.screenTheme === 'playing' ? 2 : this.screenTheme === 'finished' ? -3 : 0;
    const bpm = baseBpm + screenOffset;
    return (60 / bpm) * 4;
  }

  private scheduleBar(barIdx: number, barStartTime: number): void {
    if (!this.ctx) return;

    // On odd cycles, swap A1 and A2 so the progression order varies naturally
    let effectiveIdx = barIdx;
    if (this.cycleCount % 2 === 1 && barIdx < 16) {
      effectiveIdx = (barIdx + 8) % 16;
    }
    const spec = LOFI_PROGRESSION_24_BARS[effectiveIdx] ?? LOFI_PROGRESSION_24_BARS[0];
    if (!spec) return;
    const barDur = this.getBarDurationSeconds();
    const beatDur = barDur / 4;

    // Pitch shift subtly for 'noche' (-2 semitones) or 'lluvia' (-1 semitone)
    const pitchRatio =
      this.volumes.mood === 'noche' ? 0.8909 : this.volumes.mood === 'lluvia' ? 0.94387 : 1.0;

    if (this.volumes.music > 0.01 && this.musicBus) {
      // 1. Warm Upright Bass (Beat 1 and Beat 3 with gentle swing)
      const [bass1, bass2] = spec.bass;
      this.scheduleBassNote(bass1 * pitchRatio, barStartTime, beatDur * 1.85, 0.34);
      this.scheduleBassNote(
        bass2 * pitchRatio,
        barStartTime + beatDur * 2.04,
        beatDur * 1.75,
        0.28,
      );

      // 2. Rhodes Electric Piano Voicing (warm rolled chord with humanized micro-arpeggio)
      spec.chord.forEach((freq, i) => {
        const rollOffset = i * 0.022 + (barIdx % 2) * 0.008;
        this.scheduleRhodesVoice(
          freq * pitchRatio,
          barStartTime + rollOffset,
          barDur * 0.88,
          0.18 - i * 0.018,
        );
      });

      // Secondary comping chord hit on beat 3.5 in Lobby & Playing
      if ((this.screenTheme === 'lobby' || this.screenTheme === 'playing') && barIdx % 2 === 0) {
        spec.chord.slice(1).forEach((freq, i) => {
          this.scheduleRhodesVoice(
            freq * pitchRatio,
            barStartTime + beatDur * 2.55 + i * 0.015,
            beatDur * 1.1,
            0.09,
          );
        });
      }

      // 3. Melodic motif (Rhodes bell or Muted Café Trumpet)
      for (const note of spec.melody) {
        const noteStart = barStartTime + note.beatOffset * beatDur;
        const noteDur = note.dur * beatDur;
        if (note.voice === 'trumpet' && this.screenTheme !== 'title') {
          this.scheduleMutedTrumpet(note.freq * pitchRatio, noteStart, noteDur, 0.16);
        } else {
          this.scheduleRhodesVoice(note.freq * pitchRatio, noteStart, noteDur, 0.15);
        }
      }

      // 4. Soft Brushed Percussion (Beats 2 and 4 + swung 8thhat in lobby/playing)
      if (this.screenTheme !== 'finished') {
        const brushLevel = this.screenTheme === 'title' ? 0.06 : 0.11;
        this.scheduleBrushHit(barStartTime + beatDur * 1.0, 0.065, brushLevel);
        this.scheduleBrushHit(barStartTime + beatDur * 2.58, 0.045, brushLevel * 0.65);
        this.scheduleBrushHit(barStartTime + beatDur * 3.0, 0.07, brushLevel);
      }
    }

    // 5. Café Ambience Layer (Vinyl warmth / Rain drops / Porcelain murmur)
    if (this.volumes.ambience > 0.01 && this.ambienceBus) {
      if (this.volumes.mood === 'lluvia') {
        this.scheduleAmbientNoiseWash(barStartTime, barDur, 950, 0.14);
      } else {
        this.scheduleAmbientNoiseWash(barStartTime, barDur, 1600, 0.06);
      }

      // Occasional distant porcelain cup clink every 3 bars
      if (barIdx % 3 === 1) {
        const clinkTime = barStartTime + beatDur * 1.75;
        const clinkFreq = 1780 + ((barIdx * 137) % 340);
        this.scheduleDistantCupClink(clinkFreq, clinkTime, 0.07);
      }
    }
  }

  private scheduleBassNote(freq: number, startTime: number, duration: number, level: number): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(340, startTime);
    filter.frequency.exponentialRampToValueAtTime(170, startTime + duration);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), startTime + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private scheduleRhodesVoice(
    freq: number,
    startTime: number,
    duration: number,
    level: number,
  ): void {
    if (!this.ctx || !this.musicBus) return;
    // Fundamental sine + gentle triangle tine overtone
    const oscFund = this.ctx.createOscillator();
    const oscTine = this.ctx.createOscillator();
    const gainFund = this.ctx.createGain();
    const gainTine = this.ctx.createGain();

    oscFund.type = 'sine';
    oscFund.frequency.setValueAtTime(freq, startTime);

    oscTine.type = 'triangle';
    oscTine.frequency.setValueAtTime(freq * 2, startTime);

    gainFund.gain.setValueAtTime(0.0001, startTime);
    gainFund.gain.exponentialRampToValueAtTime(Math.max(0.001, level), startTime + 0.03);
    gainFund.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    gainTine.gain.setValueAtTime(0.0001, startTime);
    gainTine.gain.exponentialRampToValueAtTime(Math.max(0.001, level * 0.22), startTime + 0.015);
    gainTine.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(0.28, duration * 0.45));

    oscFund.connect(gainFund);
    oscTine.connect(gainTine);
    gainFund.connect(this.musicBus);
    gainTine.connect(this.musicBus);

    oscFund.start(startTime);
    oscTine.start(startTime);
    oscFund.stop(startTime + duration + 0.02);
    oscTine.stop(startTime + duration + 0.02);
  }

  private scheduleMutedTrumpet(
    freq: number,
    startTime: number,
    duration: number,
    level: number,
  ): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq * 0.992, startTime);
    osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.06);

    // Harmon-style bandpass mute
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150, startTime);
    filter.Q.setValueAtTime(3.2, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), startTime + 0.065);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private scheduleBrushHit(startTime: number, duration: number, level: number): void {
    if (!this.ctx || !this.musicBus || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    src.buffer = this.noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3200, startTime);
    filter.Q.setValueAtTime(1.4, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    src.start(startTime, Math.random() * 0.5, duration + 0.02);
  }

  private scheduleAmbientNoiseWash(
    startTime: number,
    duration: number,
    cutoffHz: number,
    level: number,
  ): void {
    if (!this.ctx || !this.ambienceBus || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    src.buffer = this.noiseBuffer;
    src.loop = true;

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffHz, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), startTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ambienceBus);

    src.start(startTime, 0, duration);
  }

  private scheduleDistantCupClink(freq: number, startTime: number, level: number): void {
    if (!this.ctx || !this.ambienceBus) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, level), startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.14);
    osc.connect(gain);
    gain.connect(this.ambienceBus);
    osc.start(startTime);
    osc.stop(startTime + 0.15);
  }

  public stopLoops(): void {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  public playHover(): void {
    if (!this.unlocked) return;
    if (typeof window !== 'undefined' && window.matchMedia) {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    }
    this.playSfx('uiHover');
  }

  public playSfx(kind: SfxKind): void {
    if (this.volumes.muted || this.volumes.sfx <= 0.01) return;

    // Throttle high-frequency UI ticks so dragging sliders or hovering never buzzes
    const nowMs = Date.now();
    if (kind === 'uiSlider') {
      if (nowMs - this.lastSliderTickMs < 48) return;
      this.lastSliderTickMs = nowMs;
    } else if (kind === 'uiHover') {
      if (nowMs - this.lastHoverTickMs < 75) return;
      this.lastHoverTickMs = nowMs;
    }

    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const vol = this.volumes.sfx * 0.14;

    // Duck background music slightly on meaningful UI/game events
    if (kind !== 'uiHover' && kind !== 'uiSlider') {
      this.duckMusic(kind === 'victoryFanfare' || kind === 'uiPlay' ? 680 : 360);
    }

    switch (kind) {
      // --- GAMEPLAY SFX ---
      case 'cardSelect': {
        this.tone(520, 620, 0.07, vol * 0.6, 'triangle', now);
        break;
      }
      case 'chairSlide': {
        this.tone(180, 140, 0.11, vol * 0.5, 'sine', now);
        break;
      }
      case 'tilePlace': {
        this.tone(310, 440, 0.12, vol * 0.85, 'triangle', now);
        this.tone(620, 780, 0.09, vol * 0.45, 'sine', now + 0.04);
        break;
      }
      case 'coffeeSip': {
        this.tone(420, 510, 0.14, vol * 0.4, 'sine', now);
        break;
      }
      case 'pureTableToast': {
        this.tone(523.25, 659.25, 0.18, vol, 'triangle', now);
        this.tone(659.25, 783.99, 0.22, vol, 'triangle', now + 0.09);
        this.tone(1046.5, 1046.5, 0.32, vol * 0.9, 'sine', now + 0.18);
        break;
      }
      case 'barPositive': {
        this.tone(523.25, 659.25, 0.11, vol * 0.72, 'triangle', now);
        this.tone(659.25, 783.99, 0.13, vol * 0.58, 'sine', now + 0.065);
        break;
      }
      case 'barNegative': {
        this.tone(293.66, 220.0, 0.12, vol * 0.68, 'sawtooth', now);
        this.tone(220.0, 164.81, 0.16, vol * 0.62, 'triangle', now + 0.075);
        break;
      }
      case 'coinClink': {
        // Arcade-inspired synthesized 2-note ascending coin chime (~988 Hz -> 1318.5 Hz)
        this.tone(987.77, 987.77, 0.048, vol * 0.68, 'triangle', now);
        this.tone(987.77, 987.77, 0.042, vol * 0.24, 'square', now);
        this.tone(1318.51, 1318.51, 0.068, vol * 0.72, 'triangle', now + 0.044);
        this.tone(1318.51, 1318.51, 0.056, vol * 0.22, 'square', now + 0.044);
        this.tone(2637.02, 2793.83, 0.032, vol * 0.26, 'sine', now + 0.088);
        break;
      }
      case 'coinPenalty': {
        this.tone(659.25, 587.33, 0.055, vol * 0.6, 'triangle', now);
        this.tone(493.88, 392.0, 0.08, vol * 0.55, 'sawtooth', now + 0.05);
        break;
      }
      case 'bell': {
        this.tone(880, 880, 0.28, vol * 0.75, 'sine', now);
        this.tone(1318.5, 1318.5, 0.22, vol * 0.4, 'sine', now + 0.02);
        break;
      }
      case 'calloutSting': {
        this.tone(587.33, 880, 0.14, vol * 0.75, 'triangle', now);
        this.tone(880, 1174.66, 0.18, vol * 0.6, 'sine', now + 0.06);
        break;
      }
      case 'victoryFanfare': {
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.5];
        notes.forEach((n, idx) => {
          this.tone(n, n, 0.22, vol * 0.78, 'triangle', now + idx * 0.08);
        });
        this.tone(523.25, 523.25, 0.35, vol * 0.45, 'sine', now + 0.32);
        break;
      }

      // --- v7 DIFFERENTIATED UI & MENU SFX ---
      case 'uiPlay': {
        // Jugar: vapor puff + tintineo de taza + acorde cálido
        this.noiseBurst(1800, 0.14, vol * 0.38, now);
        this.tone(1567.98, 1760, 0.065, vol * 0.55, 'sine', now + 0.03);
        this.tone(523.25, 523.25, 0.22, vol * 0.5, 'triangle', now + 0.07);
        this.tone(659.25, 659.25, 0.22, vol * 0.45, 'triangle', now + 0.09);
        this.tone(783.99, 783.99, 0.24, vol * 0.42, 'sine', now + 0.11);
        this.triggerHaptic(14);
        break;
      }
      case 'uiCreateRoom': {
        // Crear sala: sello de papel (low paper thump + crisp ink snap)
        this.tone(165, 95, 0.075, vol * 0.8, 'triangle', now);
        this.noiseBurst(2400, 0.045, vol * 0.45, now + 0.02);
        this.tone(660, 880, 0.06, vol * 0.4, 'sine', now + 0.035);
        this.triggerHaptic(10);
        break;
      }
      case 'uiJoinRoom': {
        // Unirse: llave / pestillo metálico
        this.tone(740, 587.33, 0.04, vol * 0.55, 'triangle', now);
        this.tone(987.77, 1174.66, 0.065, vol * 0.65, 'sine', now + 0.045);
        this.triggerHaptic(10);
        break;
      }
      case 'uiTutorial': {
        // Tutorial: página que se pasa
        this.noiseBurst(2900, 0.09, vol * 0.42, now);
        this.tone(440, 587.33, 0.06, vol * 0.35, 'sine', now + 0.02);
        break;
      }
      case 'uiRules': {
        // Reglas: libro que se apoya en madera
        this.tone(145, 88, 0.09, vol * 0.72, 'triangle', now);
        this.tone(330, 293.66, 0.06, vol * 0.38, 'sine', now + 0.03);
        break;
      }
      case 'uiSettings': {
        // Ajustes: clic cerámico limpio
        this.tone(1244.5, 1480, 0.045, vol * 0.52, 'sine', now);
        break;
      }
      case 'uiCopy': {
        // Copiar código: campanita de dos notas
        this.tone(1046.5, 1046.5, 0.08, vol * 0.58, 'sine', now);
        this.tone(1318.51, 1318.51, 0.13, vol * 0.64, 'sine', now + 0.065);
        this.triggerHaptic(10);
        break;
      }
      case 'uiReady': {
        // Listo: campana pequeña + sello
        this.tone(190, 120, 0.05, vol * 0.48, 'triangle', now);
        this.tone(1174.66, 1174.66, 0.16, vol * 0.62, 'sine', now + 0.02);
        this.triggerHaptic(12);
        break;
      }
      case 'uiStart': {
        // Empezar: campana de cafetería + taza
        this.tone(880, 880, 0.24, vol * 0.72, 'sine', now);
        this.tone(1318.51, 1318.51, 0.22, vol * 0.58, 'triangle', now + 0.055);
        this.tone(1760, 1864.66, 0.08, vol * 0.45, 'sine', now + 0.13);
        this.triggerHaptic(16);
        break;
      }
      case 'uiLeave': {
        // Salir: silla que se retira
        this.tone(220, 135, 0.12, vol * 0.58, 'triangle', now);
        this.noiseBurst(900, 0.07, vol * 0.25, now + 0.01);
        break;
      }
      case 'uiOpen': {
        // Abrir menú/popover: soplo suave ascendente
        this.noiseBurst(2200, 0.065, vol * 0.3, now);
        this.tone(480, 660, 0.055, vol * 0.38, 'sine', now);
        break;
      }
      case 'uiClose': {
        // Cerrar menú/popover: soplo suave descendente
        this.noiseBurst(1600, 0.055, vol * 0.24, now);
        this.tone(600, 420, 0.05, vol * 0.34, 'sine', now);
        break;
      }
      case 'uiConfirm': {
        // Confirmar: clic cálido ascendente
        this.tone(523.25, 783.99, 0.065, vol * 0.58, 'triangle', now);
        this.triggerHaptic(12);
        break;
      }
      case 'uiCancel': {
        // Cancelar: madera seca
        this.tone(320, 210, 0.055, vol * 0.48, 'triangle', now);
        break;
      }
      case 'uiToggle': {
        // Conmutador táctil
        this.tone(680, 820, 0.04, vol * 0.45, 'triangle', now);
        break;
      }
      case 'uiAvatar': {
        // Selección de avatar/subtítulo: pop aterciopelado distinto
        this.tone(587.33, 880, 0.06, vol * 0.5, 'sine', now);
        break;
      }
      case 'uiSlider': {
        // Tick de cerámica al mover slider
        this.tone(1380, 1460, 0.024, vol * 0.3, 'sine', now);
        break;
      }
      case 'uiError': {
        // Golpe sordo en madera, sin agresión
        this.tone(160, 105, 0.09, vol * 0.65, 'triangle', now);
        this.tone(130, 92, 0.11, vol * 0.55, 'sine', now + 0.065);
        this.triggerHaptic([16, 35, 16]);
        break;
      }
      case 'uiHover': {
        // Roce sutil solo para escritorio
        this.tone(920, 980, 0.018, vol * 0.14, 'sine', now);
        break;
      }
      case 'botJoin': {
        // Bot ocupa silla: doble nota de autómata de madera
        this.tone(440, 523.25, 0.06, vol * 0.55, 'triangle', now);
        this.tone(659.25, 783.99, 0.075, vol * 0.55, 'sine', now + 0.055);
        break;
      }
    }
  }

  private noiseBurst(
    centerFreq: number,
    duration: number,
    gainPeak: number,
    startTime: number,
  ): void {
    if (!this.ctx || !this.noiseBuffer) return;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    src.buffer = this.noiseBuffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(centerFreq, startTime);
    filter.Q.setValueAtTime(1.8, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    src.start(startTime, Math.random() * 0.4, duration + 0.02);
  }

  private tone(
    startFreq: number,
    endFreq: number,
    duration: number,
    gainPeak: number,
    type: OscillatorType,
    startTime: number,
  ): void {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), startTime + duration);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }
}

export const soundEngine = new CafetuliaSoundEngine();
