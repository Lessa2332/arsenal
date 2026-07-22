/**
 * SoundEngine — Web Audio API для звукових ефектів
 */

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.sounds = {};
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.initialized = true;
    
    // Генеруємо звуки процедурно (не потрібні файли!)
    this.sounds.kick = this.generateKickSound();
    this.sounds.goal = this.generateGoalSound();
    this.sounds.bounce = this.generateBounceSound();
  }

  generateKickSound() {
    // Короткий ударний звук
    const duration = 0.15;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.ctx.sampleRate;
      data[i] = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 20) * 0.5;
    }
    
    return buffer;
  }

  generateGoalSound() {
    // Свисток + фанфари
    const duration = 1.0;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.ctx.sampleRate;
      // Свисток
      const whistle = Math.sin(t * 2000 * Math.PI * 2) * (t < 0.3 ? 1 : 0);
      // Фанфара
      const fanfare = Math.sin(t * 523 * Math.PI * 2) * Math.exp(-t * 3) * 0.3;
      data[i] = (whistle + fanfare) * 0.5;
    }
    
    return buffer;
  }

  generateBounceSound() {
    const duration = 0.1;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * duration, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / this.ctx.sampleRate;
      data[i] = Math.sin(t * 400 * Math.PI * 2) * Math.exp(-t * 30) * 0.3;
    }
    
    return buffer;
  }

  play(name) {
    if (!this.initialized) {
      this.init().then(() => this.play(name));
      return;
    }
    
    const buffer = this.sounds[name];
    if (!buffer) return;
    
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.ctx.createGain();
    gain.gain.value = 0.5;
    
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  }
}
