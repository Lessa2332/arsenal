/**
 * GoalCelebration — ефект святкування голу
 */

export class GoalCelebration {
  constructor() {
    this.container = document.getElementById('ui-root');
  }

  show(mode, promoCode, onNext) {
    const icon = mode === 'kids' ? '⚽' : '🍺';
    const title = mode === 'kids' ? 'ГОЛ!' : 'ПИВО ЗА МІЙ РАХУНОК!';
    const subtitle = mode === 'kids' 
      ? 'Вітаємо! Ти забив гол!' 
      : 'Забив? Пий на здоров\'я!';

    const overlay = document.createElement('div');
    overlay.id = 'goal-overlay';
    overlay.className = 'overlay enter';
    overlay.style.zIndex = '200';
    overlay.innerHTML = `
      <div style="animation: goalPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
        <div style="font-size: 64px; margin-bottom: 16px;">${icon}</div>
        <h1 style="font-size: clamp(36px, 10vw, 56px); color: #2ecc71; text-shadow: 0 0 40px rgba(46,204,113,0.5); margin-bottom: 8px;">
          ${title}
        </h1>
        <p style="color: #aaa; font-size: 16px; margin-bottom: 20px;">${subtitle}</p>
        
        <div class="promo-code" style="margin: 20px 0;">
          ${promoCode}
        </div>
        
        <p style="color: #888; font-size: 13px; margin-bottom: 24px;">
          Покажіть цей екран офіціанту
        </p>
        
        <button class="btn" id="btn-next-level" style="min-width: 200px;">
          Наступний рівень →
        </button>
      </div>
    `;
    
    this.container.appendChild(overlay);
    
    // Конфеті
    this.triggerConfetti();
    
    // Обробник
    document.getElementById('btn-next-level').addEventListener('click', () => {
      overlay.style.opacity = '0';
      overlay.style.transform = 'scale(0.95)';
      setTimeout(() => {
        overlay.remove();
        if (onNext) onNext();
      }, 300);
    });
  }

  triggerConfetti() {
    if (typeof confetti === 'undefined') return;
    
    const duration = 2000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff1493', '#2ecc71', '#ffd700', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff1493', '#2ecc71', '#ffd700', '#ffffff']
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    
    frame();
  }
}
