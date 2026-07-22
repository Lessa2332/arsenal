/**
 * ModeSelector — екран вибору режиму гри
 */

export class ModeSelector {
  constructor(onSelect) {
    this.onSelect = onSelect;
    this.container = document.getElementById('ui-root');
  }

  render() {
    this.container.innerHTML = `
      <div id="mode-overlay" class="overlay enter">
        <div style="margin-bottom: 8px; font-size: 48px;">🍺</div>
        <h1>Arsenal AR</h1>
        <p style="max-width: 280px;">Оберіть режим гри та наведіть камеру на підставку на столі</p>
        
        <div class="btn-group" style="margin-top: 8px;">
          <button class="mode-card" id="btn-kids" aria-label="Дитячий режим">
            <span class="emoji">⚽</span>
            <h3>ДИТЯЧИЙ</h3>
            <span>до 18 років</span>
          </button>
          
          <button class="mode-card" id="btn-adult" aria-label="Дорослий режим">
            <span class="emoji">🍺</span>
            <h3>18+</h3>
            <span>Для своїх</span>
          </button>
        </div>
        
        <p style="font-size: 12px; color: #666; margin-top: 24px;">
          Бар "Арсенал 2.0" · Чорноморськ
        </p>
      </div>
    `;

    // Обробники
    document.getElementById('btn-kids').addEventListener('click', () => {
      this.select('kids');
    });

    document.getElementById('btn-adult').addEventListener('click', () => {
      this.select('adult');
    });
  }

  select(mode) {
    // Анімація виходу
    const overlay = document.getElementById('mode-overlay');
    overlay.style.transform = 'scale(0.9) translateY(20px)';
    overlay.style.opacity = '0';
    
    setTimeout(() => {
      overlay.remove();
      if (this.onSelect) this.onSelect(mode);
    }, 300);
  }

  destroy() {
    const overlay = document.getElementById('mode-overlay');
    if (overlay) overlay.remove();
  }
}
