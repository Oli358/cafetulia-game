export type SoundChannelVolumes = {
  music: number;
  ambience: number;
  sfx: number;
  muted: boolean;
};

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
  | 'victoryFanfare';

class CafetuliaSoundEngine {
  private ctx: AudioContext | null = null;
  private volumes: SoundChannelVolumes = {
    music: 0.4,
    ambience: 0.5,
    sfx: 0.7,
    muted: false,
  };
  private loopTimer: ReturnType<typeof setInterval> | null = null;
  private stepIndex = 0;
  private unlocked = false;

  public getVolumes(): SoundChannelVolumes {
    return { ...this.volumes };
  }

  public setVolumes(patch: Partial<SoundChannelVolumes>): SoundChannelVolumes {
    this.volumes = { ...this.volumes, ...patch };
    if (this.volumes.muted || this.volumes.music <= 0.01) {
      this.stopLoops();
    } else if (this.unlocked && !this.loopTimer) {
      this.startLoops();
    }
    return this.getVolumes();
  }

  public unlock(): void {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    this.unlocked = true;
    if (!this.volumes.muted && this.volumes.music > 0.01 && !this.loopTimer) {
      this.startLoops();
    }
  }

  public startLoops(): void {
    if (!this.unlocked || this.volumes.muted || this.loopTimer) return;
    const chords: number[][] = [
      [261.63, 329.63, 392.0, 493.88],
      [220.0, 261.63, 329.63, 392.0],
      [293.66, 349.23, 440.0, 523.25],
      [196.0, 246.94, 293.66, 349.23],
    ];

    this.loopTimer = setInterval(() => {
      if (!this.ctx || this.volumes.muted) return;
      const now = this.ctx.currentTime;

      if (this.volumes.music > 0.01) {
        const chord = chords[this.stepIndex % chords.length] ?? [261.63, 329.63, 392.0];
        const gainVal = this.volumes.music * 0.035;
        for (const freq of chord) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.45);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.5);
        }
      }

      if (this.volumes.ambience > 0.01 && this.stepIndex % 3 === 1) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1820 + (this.stepIndex % 4) * 90, now + 0.4);
        gain.gain.setValueAtTime(0.0001, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(this.volumes.ambience * 0.02, now + 0.42);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + 0.4);
        osc.stop(now + 0.56);
      }

      this.stepIndex += 1;
    }, 1580);
  }

  public stopLoops(): void {
    if (this.loopTimer) {
      clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
  }

  public playSfx(kind: SfxKind): void {
    if (this.volumes.muted || this.volumes.sfx <= 0.01) return;
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const vol = this.volumes.sfx * 0.14;

    switch (kind) {
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
        this.tone(440, 587.33, 0.15, vol * 0.8, 'triangle', now);
        break;
      }
      case 'barNegative': {
        this.tone(260, 195, 0.22, vol * 0.8, 'sawtooth', now);
        break;
      }
      case 'coinClink': {
        this.tone(1740, 2180, 0.08, vol * 0.65, 'triangle', now);
        this.tone(2350, 2640, 0.09, vol * 0.5, 'sine', now + 0.055);
        this.tone(1980, 2420, 0.07, vol * 0.4, 'triangle', now + 0.11);
        break;
      }
      case 'coinPenalty': {
        this.tone(980, 620, 0.11, vol * 0.6, 'triangle', now);
        this.tone(740, 460, 0.14, vol * 0.55, 'sine', now + 0.07);
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
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((n, idx) => {
          this.tone(n, n, 0.24, vol * 0.85, 'triangle', now + idx * 0.09);
        });
        break;
      }
    }
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
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, gainPeak), startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
  }
}

export const soundEngine = new CafetuliaSoundEngine();
