/**
 * Arsenal AR Tabletop — Main Entry Point
 * WebAR гра з фізикою для бару "Арсенал 2.0"
 */

import './style.css';
import { GameEngine } from './core/game-engine.js';
import { UIManager } from './ui/ui-manager.js';
import { SoundEngine } from './effects/sound-engine.js';

// Глобальний стан
const App = {
  engine: null,
  ui: null,
  sound: null,
  isReady: false
};

// Ініціалізація після завантаження DOM
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Ініціалізуємо звук (lazy — після першої взаємодії)
    App.sound = new SoundEngine();
    
    // Створюємо UI
    App.ui = new UIManager();
    App.ui.renderModeSelector();
    
    // Ховаємо екран завантаження
    setTimeout(() => {
      document.getElementById('loading-screen')?.classList.add('hidden');
    }, 500);
    
  } catch (error) {
    console.error('❌ Помилка ініціалізації:', error);
    alert('Помилка завантаження. Оновіть сторінку.');
  }
});

// Експорт для доступу з консолі
window.ArsenalAR = App;
