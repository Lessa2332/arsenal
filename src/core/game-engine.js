/**
 * GameEngine — головний контроллер гри
 * Координує AR, фізику, рендеринг та ігрову логіку
 */

import { AREngine } from './ar-engine.js';
import { PhysicsWorld } from './physics-world.js';
import { RenderLoop } from './render-loop.js';
import { BallController } from '../game/ball-controller.js';
import { FieldBuilder } from '../game/field-builder.js';
import { GoalDetector } from '../game/goal-detector.js';
import { LevelManager } from '../game/level-manager.js';
import { GameState } from '../game/game-state.js';

export class GameEngine {
  constructor() {
    this.state = new GameState();
    this.ar = new AREngine();
    this.physics = new PhysicsWorld();
    this.renderer = new RenderLoop();
    this.ball = null;
    this.field = null;
    this.goal = null;
    this.levels = null;
    
    this.isRunning = false;
    this.isAnchored = false;
  }

  async init(mode) {
    this.state.setMode(mode);
    
    // 1. Ініціалізуємо AR
    await this.ar.init();
    
    // 2. Чекаємо на маркер
    await this.ar.waitForMarker();
    
    // 3. Фіксуємо поле
    this.anchorField();
    
    // 4. Ініціалізуємо фізику
    this.physics.init();
    
    // 5. Будуємо 3D сцену
    this.field = new FieldBuilder();
    this.field.build(this.state.mode);
    
    // 6. Створюємо м'яч
    this.ball = new BallController(this.physics.world);
    this.ball.create(this.state.mode);
    
    // 7. Завантажуємо рівень
    this.levels = new LevelManager(this.physics.world);
    this.levels.load(0, this.state.mode);
    
    // 8. Ініціалізуємо детектор голу
    this.goal = new GoalDetector();
    this.goal.onGoal = () => this.handleGoal();
    
    // 9. Запускаємо рендер-цикл
    this.renderer.start((dt) => this.update(dt));
    
    // 10. Налаштовуємо керування
    this.setupControls();
    
    this.isRunning = true;
    return true;
  }

  anchorField() {
    const markerContainer = document.getElementById('marker-container');
    const gameAnchor = document.getElementById('game-anchor');
    
    // Отримуємо world transform маркера
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scale = new THREE.Vector3();
    
    markerContainer.object3D.getWorldPosition(position);
    markerContainer.object3D.getWorldQuaternion(quaternion);
    markerContainer.object3D.getWorldScale(scale);
    
    // Застосовуємо до game-anchor
    gameAnchor.object3D.position.copy(position);
    gameAnchor.object3D.quaternion.copy(quaternion);
    gameAnchor.object3D.scale.copy(scale);
    gameAnchor.setAttribute('visible', 'true');
    
    // Ефект "розкриття" поля
    gameAnchor.setAttribute('animation', {
      property: 'scale',
      from: '0 0 0',
      to: `${scale.x} ${scale.y} ${scale.z}`,
      dur: 800,
      easing: 'easeOutElastic'
    });
    
    // Ховаємо маркер та зупиняємо трекінг
    markerContainer.setAttribute('visible', 'false');
    this.ar.stopTracking();
    
    this.isAnchored = true;
  }

  update(dt) {
    if (!this.isRunning) return;
    
    // Оновлюємо фізику
    this.physics.step(dt);
    
    // Синхронізуємо м'яч
    this.ball.sync();
    
    // Оновлюємо перешкоди
    this.levels.update(dt);
    
    // Перевіряємо гол
    this.goal.check(this.ball.body);
    
    // Оновлюємо частинки
    this.field.updateEffects(dt);
  }

  handleGoal() {
    this.state.addScore();
    
    // Ефекти
    import('../effects/celebration.js').then(m => m.trigger());
    
    // Звук
    window.ArsenalAR?.sound?.play('goal');
    
    // Вібрація
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
    
    // Наступний рівень через 3 сек
    setTimeout(() => {
      const hasNext = this.levels.next();
      if (!hasNext) {
        this.handleWin();
      }
    }, 3000);
  }

  handleWin() {
    this.state.setComplete();
    window.ArsenalAR?.ui?.showWinScreen(this.state);
  }

  setupControls() {
    const canvas = document.querySelector('a-scene canvas');
    if (!canvas) return;
    
    let startX, startY, startTime;
    
    canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = performance.now();
    }, { passive: true });
    
    canvas.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = performance.now() - startTime;
      
      // Свайп: достатня відстань та швидкість
      const dist = Math.sqrt(dx * dx + dy * dy);
      const velocity = dist / dt;
      
      if (dist > 30 && velocity > 0.5) {
        this.ball.kick(dx, dy, velocity);
        window.ArsenalAR?.sound?.play('kick');
        if (navigator.vibrate) navigator.vibrate(30);
      }
    }, { passive: true });
    
    // Mouse fallback для десктопу
    canvas.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
    });
    
    canvas.addEventListener('mouseup', (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        this.ball.kick(dx, dy);
      }
    });
  }

  destroy() {
    this.isRunning = false;
    this.renderer.stop();
    this.physics.destroy();
    this.ar.destroy();
  }
}
