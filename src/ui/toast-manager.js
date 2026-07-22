/**
 * ToastManager — спливаючі повідомлення
 */

export class ToastManager {
  constructor() {
    this.container = document.getElementById('ui-root');
    this.activeToasts = [];
    this.maxToasts = 3;
  }

  show(message, type = 'info', duration = 3000) {
    // Видаляємо старі, якщо забагато
    while (this.activeToasts.length >= this.maxToasts) {
      this.activeToasts[0].remove();
      this.activeToasts.shift();
    }

    const colors = {
      info: '#4a90d9',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c'
    };

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.cssText = `
      position: fixed;
      top: ${80 + this.activeToasts.length * 60}px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: rgba(17, 17, 24, 0.95);
      border: 1px solid ${colors[type]};
      color: white;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      z-index: 150;
      opacity: 0;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      max-width: 300px;
      text-align: center;
    `;
    toast.textContent = message;
    
    this.container.appendChild(toast);
    this.activeToasts.push(toast);
    
    // Показуємо
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    
    // Ховаємо через duration
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(-20px)';
      setTimeout(() => {
        toast.remove();
        const idx = this.activeToasts.indexOf(toast);
        if (idx > -1) this.activeToasts.splice(idx, 1);
      }, 300);
    }, duration);
  }

  success(message) { this.show(message, 'success'); }
  error(message) { this.show(message, 'error'); }
  warning(message) { this.show(message, 'warning'); }
  info(message) { this.show(message, 'info'); }
}
