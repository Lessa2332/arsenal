/**
 * GameState — централізований стан гри
 */

export class GameState {
  constructor() {
    this.mode = 'kids'; // 'kids' | 'adult'
    this.level = 0;
    this.score = 0;
    this.isComplete = false;
    this.startTime = null;
    this.endTime = null;
  }

  setMode(mode) {
    this.mode = mode;
    this.startTime = Date.now();
  }

  addScore() {
    this.score++;
  }

  setComplete() {
    this.isComplete = true;
    this.endTime = Date.now();
  }

  getDuration() {
    if (!this.startTime) return 0;
    return ((this.endTime || Date.now()) - this.startTime) / 1000;
  }

  getStats() {
    return {
      mode: this.mode,
      score: this.score,
      level: this.level,
      duration: this.getDuration(),
      isComplete: this.isComplete
    };
  }

  save() {
    const history = JSON.parse(localStorage.getItem('arsenar-ar-scores') || '[]');
    history.push({
      ...this.getStats(),
      date: new Date().toISOString()
    });
    localStorage.setItem('arsenar-ar-scores', JSON.stringify(history.slice(-20)));
  }
}
