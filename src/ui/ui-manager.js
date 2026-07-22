/**
 * UIManager — керування всіма UI екранами
 */

export class UIManager {
  constructor() {
    this.root = document.getElementById('ui-root');
    this.currentOverlay = null;
  }

  renderModeSelector() {
    this.root.innerHTML = `
      <div id="mode-overlay" class="overlay enter">
        <h1>🍺 Arsenal AR</h1>
        <p>Оберіть режим гри та наведіть камеру на підставку</p>
        <div class="btn-group">
          <div class="mode-card" id="btn-kids">
            <span class="emoji">⚽</span>
            <h3>ДИТЯЧИЙ</h3>
            <span>до 18 років</span>
          </div>
          <div class="mode-card" id="btn-adult">
            <span class="emoji">🍺</span>
            <h3>18+</h3>
            <span>Для своїх</span>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-kids').addEventListener('click', () => this.startGame('kids'));
    document.getElementById('btn-adult').addEventListener('click', () => this.startGame('adult'));
  }

  async startGame(mode) {
    this.hideOverlay('mode-overlay');
    this.showScanner();
    
    try {
      const { GameEngine } = await import('../core/game-engine.js');
      const engine = new GameEngine();
      window.ArsenalAR.engine = engine;
      
      await engine.init(mode);
      this.hideOverlay('scan-overlay');
      this.showHUD();
      
    } catch (error) {
      console.error('Game init error:', error);
      this.showError('Не вдалося запустити AR. Перевірте дозволи камери.');
    }
  }

  showScanner() {
    this.showOverlay('scan-overlay', `
      <h2>Сканування маркера</h2>
      <p>Наведіть камеру на підставку на столі</p>
      <div class="scanner-frame"></div>
    `);
  }

  showHUD() {
    const hud = document.createElement('div');
    hud.className = 'hud';
    hud.id = 'game-hud';
    hud.innerHTML = `
      <div class="hud-panel hud-score">
        <span class="icon" id="hud-icon">⚽</span>
        <span id="hud-score">0</span>
      </div>
      <div class="hud-panel">
        Рівень <span id="hud-level">1</span>/3
      </div>
    `;
    this.root.appendChild(hud);
    
    // Свайп підказка
    const hint = document.createElement('div');
    hint.className = 'swipe-hint';
    hint.id = 'swipe-hint';
    hint.textContent = '👆 Свайпни, щоб кинути м\'яч';
    this.root.appendChild(hint);
    
    setTimeout(() => hint.remove(), 5000);
  }

  showGoal(mode) {
    const icon = mode === 'kids' ? '⚽' : '🍺';
    const title = mode === 'kids' ? 'ГОЛ!' : 'ПИВО ЗА МІЙ РАХУНОК!';
    const promo = mode === 'kids' ? 'ARSENALKIDS' : 'ARSENAL15';
    
    this.showOverlay('goal-overlay', `
      <div class="goal-title">${icon} ${title}</div>
      <div class="promo-code">${promo}</div>
      <p style="color: var(--text-secondary); margin-top: 16px;">Покажіть цей екран офіціанту</p>
      <button class="btn" id="next-level-btn" style="margin-top: 24px;">Наступний рівень →</button>
    `, true);
    
    document.getElementById('next-level-btn')?.addEventListener('click', () => {
      this.hideOverlay('goal-overlay');
    });
  }

  showWinScreen(state) {
    state.save();
    
    this.showOverlay('win-overlay', `
      <h1>🏆 Вітаємо!</h1>
      <p>Ви пройшли всі рівні!</p>
      <div style="background: var(--arsenal-card); border: 1px solid var(--arsenal-border); border-radius: 16px; padding: 20px; margin: 20px 0; min-width: 250px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--text-secondary);">Рахунок</span>
          <span style="color: var(--text-primary); font-weight: bold;">${state.score}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: var(--text-secondary);">Час</span>
          <span style="color: var(--text-primary); font-weight: bold;">${Math.round(state.getDuration())}с</span>
        </div>
      </div>
      <button class="btn" onclick="location.reload()">🔄 Зіграти ще</button>
    `);
  }

  showError(message) {
    this.showOverlay('error-overlay', `
      <h2 style="color: var(--danger);">😕 Ой!</h2>
      <p>${message}</p>
      <button class="btn btn-secondary" onclick="location.reload()" style="margin-top: 20px;">Спробувати знову</button>
    `);
  }

  updateHUD(score, level) {
    document.getElementById('hud-score').textContent = score;
    document.getElementById('hud-level').textContent = level + 1;
  }

  showOverlay(id, content, keepExisting = false) {
    if (!keepExisting) this.clearOverlays();
    
    const overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'overlay enter';
    overlay.innerHTML = content;
    this.root.appendChild(overlay);
    this.currentOverlay = overlay;
  }

  hideOverlay(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('hidden');
      setTimeout(() => el.remove(), 400);
    }
  }

  clearOverlays() {
    this.root.querySelectorAll('.overlay').forEach(el => {
      el.classList.add('hidden');
      setTimeout(() => el.remove(), 400);
    });
  }
}
