/**
 * Storage — localStorage, кеш та робота з даними
 */

const STORAGE_PREFIX = 'arsenal-ar_';
const VERSION = '1.0.0';

/**
 * Безпечний доступ до localStorage з обробкою помилок
 */
class SafeStorage {
  constructor() {
    this.available = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  get(key) {
    if (!this.available) return null;
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.warn('Storage get error:', e);
      return null;
    }
  }

  set(key, value) {
    if (!this.available) return false;
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      // Перевірка на переповнення
      if (e.name === 'QuotaExceededError') {
        this.cleanup();
        try {
          localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
          return true;
        } catch (e2) {
          console.error('Storage quota exceeded:', e2);
        }
      }
      return false;
    }
  }

  remove(key) {
    if (!this.available) return false;
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      return true;
    } catch (e) {
      return false;
    }
  }

  clear() {
    if (!this.available) return;
    try {
      // Видаляємо тільки наші ключі
      Object.keys(localStorage)
        .filter(k => k.startsWith(STORAGE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
  }

  cleanup() {
    // Видаляємо старі записи при переповненні
    const keys = Object.keys(localStorage)
      .filter(k => k.startsWith(STORAGE_PREFIX))
      .map(k => ({
        key: k,
        size: localStorage.getItem(k).length,
        time: this.getTimestamp(k) || 0
      }))
      .sort((a, b) => a.time - b.time); // Сортуємо за часом (старіші першими)

    // Видаляємо 30% найстарших записів
    const toRemove = Math.ceil(keys.length * 0.3);
    keys.slice(0, toRemove).forEach(item => {
      localStorage.removeItem(item.key);
    });
  }

  getTimestamp(key) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return data?._meta?.timestamp || 0;
    } catch {
      return 0;
    }
  }
}

export const storage = new SafeStorage();

/**
 * Менеджер ігрових рекордів
 */
export class ScoreManager {
  constructor() {
    this.key = 'scores';
  }

  /**
   * Додати новий рекорд
   */
  add(score, mode, level, duration) {
    const entry = {
      score,
      mode,
      level,
      duration,
      date: new Date().toISOString(),
      timestamp: Date.now()
    };

    const scores = this.getAll();
    scores.push(entry);
    
    // Сортуємо за рахунком (спадання)
    scores.sort((a, b) => b.score - a.score);
    
    // Зберігаємо топ-50
    const topScores = scores.slice(0, 50);
    storage.set(this.key, topScores);
    
    return this.getRank(entry);
  }

  /**
   * Отримати всі рекорди
   */
  getAll() {
    return storage.get(this.key) || [];
  }

  /**
   * Отримати рекорди за режимом
   */
  getByMode(mode) {
    return this.getAll().filter(s => s.mode === mode);
  }

  /**
   * Отримати топ-N рекордів
   */
  getTop(n = 10, mode = null) {
    const scores = mode ? this.getByMode(mode) : this.getAll();
    return scores.slice(0, n);
  }

  /**
   * Отримати особистий рекорд гравця
   */
  getPersonalBest(mode = null) {
    const scores = mode ? this.getByMode(mode) : this.getAll();
    return scores.length > 0 ? scores[0] : null;
  }

  /**
   * Визначити ранг нового рекорду
   */
  getRank(entry) {
    const scores = this.getAll();
    return scores.findIndex(s => s.timestamp === entry.timestamp) + 1;
  }

  /**
   * Очистити всі рекорди
   */
  clear() {
    storage.remove(this.key);
  }

  /**
   * Експорт рекордів (для бекапу)
   */
  export() {
    return JSON.stringify(this.getAll(), null, 2);
  }

  /**
   * Імпорт рекордів
   */
  import(data) {
    try {
      const scores = JSON.parse(data);
      if (Array.isArray(scores)) {
        storage.set(this.key, scores);
        return true;
      }
    } catch (e) {
      console.error('Invalid scores data:', e);
    }
    return false;
  }
}

/**
 * Кеш для зображень та ресурсів
 */
export class AssetCache {
  constructor(maxSize = 50) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.accessOrder = [];
  }

  /**
   * Додати ресурс в кеш
   */
  set(key, data, metadata = {}) {
    // Видаляємо найстаріший, якщо переповнено
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }

    this.cache.set(key, {
      data,
      metadata,
      timestamp: Date.now()
    });
    
    // Оновлюємо порядок доступу
    this.updateAccess(key);
  }

  /**
   * Отримати ресурс з кешу
   */
  get(key) {
    const item = this.cache.get(key);
    if (item) {
      this.updateAccess(key);
      return item.data;
    }
    return null;
  }

  /**
   * Перевірити наявність
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Оновити порядок доступу (LRU)
   */
  updateAccess(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  /**
   * Очистити кеш
   */
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Отримати статистику
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    };
  }
}

/**
 * Сесійне сховище (in-memory, очищається при перезавантаженні)
 */
export const sessionStore = {
  data: new Map(),
  
  set(key, value) {
    this.data.set(key, value);
  },
  
  get(key) {
    return this.data.get(key);
  },
  
  has(key) {
    this.data.has(key);
  },
  
  remove(key) {
    this.data.delete(key);
  },
  
  clear() {
    this.data.clear();
  }
};

/**
 * Збереження налаштувань гри
 */
export const Settings = {
  get(key, defaultValue = null) {
    const settings = storage.get('settings') || {};
    return settings[key] !== undefined ? settings[key] : defaultValue;
  },

  set(key, value) {
    const settings = storage.get('settings') || {};
    settings[key] = value;
    return storage.set('settings', settings);
  },

  getAll() {
    return storage.get('settings') || {};
  },

  reset() {
    storage.remove('settings');
  }
};

/**
 * Ініціалізація налаштувань за замовчуванням
 */
export function initDefaultSettings() {
  const defaults = {
    soundEnabled: true,
    vibrationEnabled: true,
    quality: 'auto', // 'low' | 'medium' | 'high' | 'auto'
    tutorialSeen: false,
    version: VERSION
  };

  const current = Settings.getAll();
  
  // Міграція: оновлення версії
  if (current.version !== VERSION) {
    console.log(`Migrating settings from ${current.version || 'none'} to ${VERSION}`);
  }

  // Зливаємо з defaults
  Object.keys(defaults).forEach(key => {
    if (current[key] === undefined) {
      Settings.set(key, defaults[key]);
    }
  });

  Settings.set('version', VERSION);
}

/**
 * Трекінг подій для аналітики (локальний)
 */
export class EventTracker {
  constructor() {
    this.events = [];
    this.batchSize = 20;
    this.flushInterval = 30000; // 30 сек
    this.startFlushTimer();
  }

  track(eventName, data = {}) {
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      session: sessionStore.get('sessionId') || this.generateSessionId()
    };

    this.events.push(event);

    // Флеш при досягненні batch size
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  generateSessionId() {
    const id = 'sess_' + Math.random().toString(36).substr(2, 9);
    sessionStore.set('sessionId', id);
    return id;
  }

  startFlushTimer() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  flush() {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    // Зберігаємо в localStorage для подальшої відправки
    const existing = storage.get('events') || [];
    const combined = [...existing, ...batch];
    
    // Зберігаємо останні 500 подій
    storage.set('events', combined.slice(-500));
  }

  getEvents() {
    return storage.get('events') || [];
  }

  clearEvents() {
    storage.remove('events');
  }
}

// Глобальний трекер
export const tracker = new EventTracker();
