/**
 * Device Utils — визначення пристрою, можливостей та оптимізації
 */

/**
 * Інформація про пристрій
 */
export const DeviceInfo = {
  // Ініціалізація при першому імпорті
  isMobile: checkIsMobile(),
  isIOS: checkIsIOS(),
  isAndroid: checkIsAndroid(),
  isSafari: checkIsSafari(),
  isChrome: checkIsChrome(),
  hasCamera: checkCameraSupport(),
  hasVibration: 'vibrate' in navigator,
  hasWebGL: checkWebGLSupport(),
  hasWebXR: 'xr' in navigator,
  pixelRatio: Math.min(window.devicePixelRatio, 2), // Обмежуємо для продуктивності
  screenSize: {
    width: window.innerWidth,
    height: window.innerHeight
  }
};

/**
 * Перевірка, чи мобільний пристрій
 */
function checkIsMobile() {
  const ua = navigator.userAgent;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}

/**
 * Перевірка iOS
 */
function checkIsIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Перевірка Android
 */
function checkIsAndroid() {
  return /Android/.test(navigator.userAgent);
}

/**
 * Перевірка Safari
 */
function checkIsSafari() {
  const ua = navigator.userAgent;
  return /^((?!chrome|android).)*safari/i.test(ua);
}

/**
 * Перевірка Chrome
 */
function checkIsChrome() {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

/**
 * Перевірка підтримки камери
 */
function checkCameraSupport() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Перевірка WebGL
 */
function checkWebGLSupport() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

/**
 * Запит дозволу на камеру з обробкою помилок
 */
export async function requestCameraPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    
    // Зупиняємо стрім одразу — MindAR створить свій
    stream.getTracks().forEach(track => track.stop());
    
    return { granted: true, error: null };
  } catch (error) {
    let message = 'Неможливо отримати доступ до камери';
    
    if (error.name === 'NotAllowedError') {
      message = 'Доступ до камери заборонено. Перевірте налаштування браузера.';
    } else if (error.name === 'NotFoundError') {
      message = 'Камера не знайдена. Переконайтеся, що пристрій має камеру.';
    } else if (error.name === 'NotReadableError') {
      message = 'Камера використовується іншою програмою.';
    }
    
    return { granted: false, error: message };
  }
}

/**
 * Вібрація з перевіркою підтримки
 */
export function vibrate(pattern) {
  if (DeviceInfo.hasVibration && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

/**
 * Оптимізація продуктивності в залежності від пристрою
 */
export function getPerformanceProfile() {
  // Визначаємо "важкість" пристрою
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 2;
  
  if (memory <= 2 || cores <= 2) {
    return 'low'; // Старі пристрої
  } else if (memory <= 4 || cores <= 4) {
    return 'medium'; // Середні
  }
  return 'high'; // Флагмани
}

/**
 * Налаштування якості рендерингу
 */
export function getRenderQuality() {
  const profile = getPerformanceProfile();
  
  const settings = {
    low: {
      antialias: false,
      shadows: false,
      pixelRatio: 1,
      physicsSteps: 5,
      particleCount: 10
    },
    medium: {
      antialias: true,
      shadows: true,
      pixelRatio: Math.min(window.devicePixelRatio, 1.5),
      physicsSteps: 10,
      particleCount: 20
    },
    high: {
      antialias: true,
      shadows: true,
      pixelRatio: Math.min(window.devicePixelRatio, 2),
      physicsSteps: 10,
      particleCount: 30
    }
  };
  
  return settings[profile];
}

/**
 * Перевірка орієнтації екрану
 */
export function checkOrientation() {
  const isLandscape = window.innerWidth > window.innerHeight;
  return {
    isLandscape,
    isPortrait: !isLandscape,
    angle: screen.orientation?.angle || 0
  };
}

/**
 * Блокування орієнтації (якщо підтримується)
 */
export async function lockOrientation(orientation = 'portrait') {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock(orientation);
      return true;
    }
  } catch (e) {
    console.warn('Orientation lock not supported');
  }
  return false;
}

/**
 * Визначення, чи пристрій в режимі енергозбереження
 */
export function isLowPowerMode() {
  // iOS: перевірка через Battery API
  if ('getBattery' in navigator) {
    // Асинхронна перевірка
    return navigator.getBattery().then(battery => {
      return battery.level < 0.2 && !battery.charging;
    });
  }
  return Promise.resolve(false);
}

/**
 * Моніторинг FPS для адаптивної якості
 */
export class FPSMonitor {
  constructor() {
    this.frames = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.history = [];
    this.callback = null;
  }

  start(callback) {
    this.callback = callback;
    this.tick();
  }

  tick() {
    this.frames++;
    const now = performance.now();
    
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.history.push(this.fps);
      
      // Зберігаємо останні 10 значень
      if (this.history.length > 10) this.history.shift();
      
      // Перевіряємо, чи FPS стабільно низький
      const avgFPS = this.history.reduce((a, b) => a + b, 0) / this.history.length;
      if (avgFPS < 30 && this.history.length >= 5) {
        this.callback?.('low-performance', avgFPS);
      }
      
      this.frames = 0;
      this.lastTime = now;
    }
    
    requestAnimationFrame(() => this.tick());
  }

  getAverageFPS() {
    if (this.history.length === 0) return 60;
    return this.history.reduce((a, b) => a + b, 0) / this.history.length;
  }
}

/**
 * Дебаунс для resize подій
 */
export function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Тротлінг для частих подій (touchmove, scroll)
 */
export function throttle(fn, limit) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Перевірка підключення до мережі
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * Очікування стабільного з'єднання
 */
export function waitForConnection(timeout = 5000) {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }
    
    const onOnline = () => {
      window.removeEventListener('online', onOnline);
      clearTimeout(timer);
      resolve(true);
    };
    
    window.addEventListener('online', onOnline);
    
    const timer = setTimeout(() => {
      window.removeEventListener('online', onOnline);
      resolve(false);
    }, timeout);
  });
}
