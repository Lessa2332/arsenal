/**
 * ScannerOverlay — екран сканування маркера
 */

export class ScannerOverlay {
  constructor() {
    this.container = document.getElementById('ui-root');
  }

  render() {
    this.container.innerHTML += `
      <div id="scan-overlay" class="overlay enter">
        <h2>Сканування маркера</h2>
        <p>Наведіть камеру на підставку під пиво на столі</p>
        
        <div class="scanner-frame" style="margin: 20px 0;">
          <div style="position: absolute; inset: 0; border: 2px dashed rgba(255,20,147,0.3); border-radius: 20px;"></div>
        </div>
        
        <div style="display: flex; gap: 8px; align-items: center; color: #888; font-size: 13px;">
          <span style="width: 8px; height: 8px; background: #2ecc71; border-radius: 50%; display: inline-block; animation: pulse 2s infinite;"></span>
          Камера активна
        </div>
        
        <button class="btn btn-secondary" id="btn-cancel-scan" style="margin-top: 24px; padding: 12px 24px; font-size: 14px;">
          ← Назад
        </button>
      </div>
    `;

    document.getElementById('btn-cancel-scan')?.addEventListener('click', () => {
      this.hide();
      // Тригеримо повернення до вибору режиму
      window.dispatchEvent(new CustomEvent('scan-cancelled'));
    });
  }

  hide() {
    const overlay = document.getElementById('scan-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 400);
    }
  }

  showSuccess() {
    const frame = document.querySelector('.scanner-frame');
    if (frame) {
      frame.style.borderColor = '#2ecc71';
      frame.style.boxShadow = '0 0 30px rgba(46, 204, 113, 0.5)';
    }
    
    const title = document.querySelector('#scan-overlay h2');
    if (title) title.textContent = '✅ Маркер знайдено!';
    
    const subtitle = document.querySelector('#scan-overlay p');
    if (subtitle) subtitle.textContent = 'Зафіксуйте поле для початку гри';
  }
}
