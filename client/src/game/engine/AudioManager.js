/**
 * Web Audio API Retro Chiptune Synthesizer
 * Procedurally generates classic NES-style square wave and noise sound effects
 * and background chiptune music without requiring any external audio files.
 */

class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicNode = null;
    this.isPlayingMusic = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.muted;
  }

  // Play a simple frequency envelope
  playTone(freq, duration, type = 'square', endFreq = null, volume = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (endFreq !== null) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  playJump() {
    this.playTone(150, 0.18, 'square', 450, 0.18);
  }

  playDoubleJump() {
    this.playTone(300, 0.22, 'square', 750, 0.18);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Classic Mario 2-note coin sound (B5 to E6)
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(now + 0.4);
  }

  playPowerUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [330, 392, 659, 523, 587, 784];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);
      gain.gain.setValueAtTime(0.25, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.08);
    });
  }

  playStomp() {
    this.playTone(280, 0.12, 'triangle', 60, 0.35);
  }

  playBlockHit() {
    this.playTone(180, 0.1, 'square', 80, 0.2);
  }

  playFireball() {
    this.playTone(700, 0.12, 'sawtooth', 180, 0.18);
  }

  playHurt() {
    this.playTone(120, 0.3, 'sawtooth', 40, 0.3);
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [440, 392, 349, 293, 261];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.25, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.2);
    });
  }

  playVictory() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    // Fanfare: G4, C5, E5, G5, C6
    const notes = [392, 523, 659, 784, 1046];
    const now = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);
      const dur = idx === notes.length - 1 ? 0.6 : 0.14;
      gain.gain.setValueAtTime(0.25, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + dur);
    });
  }

  // Chiptune background music loop
  startMusic() {
    if (this.muted || this.isPlayingMusic) return;
    this.init();
    if (!this.ctx) return;
    this.isPlayingMusic = true;

    // Classic 8-bit Mario style energetic bassline & lead loop
    const bassline = [
      261.63, 0, 261.63, 0, 329.63, 0, 392.00, 0,
      220.00, 0, 220.00, 0, 293.66, 0, 349.23, 0,
      196.00, 0, 196.00, 0, 246.94, 0, 293.66, 0,
      261.63, 0, 392.00, 0, 523.25, 0, 0, 0
    ];

    this.musicStep = 0;
    this.musicTimer = setInterval(() => {
      if (!this.isPlayingMusic || this.muted || !this.ctx) return;
      const note = bassline[this.musicStep % bassline.length];
      if (note > 0) {
        try {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(note / 2, this.ctx.currentTime);
          gain.gain.setValueAtTime(0.09, this.ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.13);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.13);
        } catch (e) {}
      }
      this.musicStep++;
    }, 140);
  }

  stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const audioManager = new AudioManager();
export default audioManager;
