/**
 * HUD — ігровий інтерфейс під час гри
 */

export class HUD {
  constructor() {
    this.container = document.getElementById('ui-root');
    this.score = 0;
    this.level = 0;
    this.mode = 'kids';
  }

  show(mode) {
    this.mode = mode;
    const icon = mode === 'kids' ? '⚽' : '🍺';
    
    // Видаляємо старий HUD
    document.getElementById('game-hud')?.remove();
    
    const hud = document.createElement('div');
    hud.id = 'game-hud';
    hud.className = 'hud';
    hud.innerHTML = `
      <div class="hud-panel hud-score">
        <span class="icon" id="hud-icon">${icon}</span>
        <span id="hud-score">0</span>
      </div>
      <div class="hud-panel">
        Рівень <span id="hud-level">1</span>/3
      </div>
      <div class="hud-panel" id="hud-timer" style="font-variant-numeric: tabular-nums;">
        00:00
      </div>
    `;
    
    this.container.appendChild(hud);
    this.startTimer();
    
    // Підказка свайпу
    this.showSwipeHint();
  }

  updateScore(score) {
    this.score = score;
    const el = document.getElementById('hud-score');
    if (el) {
      el.style.transform = 'scale(1.5)';
      el.textContent = score;
      setTimeout(() => el.style.transform = 'scale(1)', 200);
    }
  }

  updateLevel(level) {
    this.level = level;
    const el = document.getElementById('hud-level');
    if (el) el.textContent = level + 1;
  }

  startTimer() {
    this.startTime = Date.now();
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      
      const el = document.getElementById('hud-timer');
      if (el) el.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  showSwipeHint() {
    const hint = document.createElement('div');
    hint.id = 'swipe-hint';
    hint.className = 'swipe-hint';
    hint.innerHTML = '👆 Свайпни, щоб кинути м\'яч<br><span style="font-size: 11px; opacity: 0.7;">або тапни по полю</span>';
    this.container.appendChild(hint);
    
    setTimeout(() => {
      hint.style.opacity = '0';
      setTimeout(() => hint.remove(), 500);
    }, 4000);
  }

  hide() {
    document.getElementById('game-hud')?.remove();
    document.getElementById('swipe-hint')?.remove();
    this.stopTimer();
  }
}
