/**
 * ToastManager — спливаючі повідомлення
 * Версія 2.0 — фікси для деплою та стабільності
 */

export class ToastManager {
  constructor() {
    this.container = this.ensureContainer();
    this.activeToasts = [];
    this.maxToasts = 3;
    this.toastId = 0;
  }

  /**
   * Гарантуємо наявність контейнера з правильним z-index
   */
  ensureContainer() {
    let container = document.getElementById('ui-root');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'ui-root';
      document.body.appendChild(container);
    }
    
    // Критично: контейнер має бути НАД A-Frame
    container.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      display: flex;
      flex-direction: column;
    `;
    
    return container;
  }

  show(message, type = 'info', duration = 3000) {
    // Видаляємо найстаріший toast, якщо досягли ліміту
    if (this.activeToasts.length >= this.maxToasts) {
      const oldest = this.activeToasts.shift();
      if (oldest && oldest.element) {
        this.removeToast(oldest.element, false);
      }
    }

    const id = ++this.toastId;
    const colors = {
      info: '#4a90d9',
      success: '#2ecc71',
      warning: '#f39c12',
      error: '#e74c3c'
    };

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const toast = document.createElement('div');
    toast.id = `toast-${id}`;
    toast.className = 'toast';
    
    // Використовуємо CSS змінні замість inline для кращої продуктивності
    toast.style.cssText = `
      position: fixed;
      top: ${80 + this.activeToasts.length * 70}px;
      left: 50%;
      transform: translateX(-50%) translateY(-30px) scale(0.9);
      background: rgba(17, 17, 24, 0.95);
      border: 2px solid ${colors[type]};
      color: #ffffff;
      padding: 14px 28px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 500;
      z-index: 100000;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      max-width: min(320px, 90vw);
      text-align: center;
      pointer-events: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
      word-break: break-word;
      line-height: 1.4;
    `;
    
    toast.innerHTML = `
      <span style="margin-right: 8px;">${icons[type]}</span>
      <span>${this.escapeHtml(message)}</span>
    `;

    this.container.appendChild(toast);
    
    const toastData = { id, element: toast, timeout: null };
    this.activeToasts.push(toastData);

    // Анімація появи (на наступному кадрі)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0) scale(1)';
      });
    });

    // Авто-видалення
    toastData.timeout = setTimeout(() => {
      this.removeToast(toast, true);
    }, duration);

    // Клік для ручного закриття
    toast.addEventListener('click', () => {
      clearTimeout(toastData.timeout);
      this.removeToast(toast, true);
    });

    return id;
  }

  /**
   * Безпечне видалення toast з анімацією
   */
  removeToast(element, animate = true) {
    const idx = this.activeToasts.findIndex(t => t.element === element);
    if (idx > -1) {
      clearTimeout(this.activeToasts[idx].timeout);
      this.activeToasts.splice(idx, 1);
    }

    if (!element || !element.parentNode) return;

    if (animate) {
      element.style.opacity = '0';
      element.style.transform = 'translateX(-50%) translateY(-20px) scale(0.9)';
      
      setTimeout(() => {
        element.remove();
        this.repositionToasts();
      }, 300);
    } else {
      element.remove();
      this.repositionToasts();
    }
  }

  /**
   * Перерахунок позицій всіх активних toasts
   */
  repositionToasts() {
    this.activeToasts.forEach((toastData, index) => {
      const el = toastData.element;
      if (el) {
        el.style.top = `${80 + index * 70}px`;
      }
    });
  }

  /**
   * Екранування HTML для безпеки
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Очистити всі toasts
   */
  clearAll() {
    [...this.activeToasts].forEach(t => this.removeToast(t.element, false));
    this.activeToasts = [];
  }

  // Шорткати
  success(message, duration) { return this.show(message, 'success', duration); }
  error(message, duration) { return this.show(message, 'error', duration); }
  warning(message, duration) { return this.show(message, 'warning', duration); }
  info(message, duration) { return this.show(message, 'info', duration); }
}
