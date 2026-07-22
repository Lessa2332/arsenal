/**
 * LightingSetup — HDR-подібне освітлення для AR-сцени
 * Створює реалістичне освітлення без важких HDR-файлів
 */

export class LightingSetup {
  constructor(scene) {
    this.scene = scene || document.querySelector('a-scene');
    this.lights = [];
  }

  /**
   * Базове освітлення для бару (тепле, приглушене)
   */
  setupBarLighting() {
    // Очищаємо старі світла
    this.clear();

    // Ambient — базове заповнення
    this.addLight('ambient', {
      color: '#fff5e6',
      intensity: 0.3
    });

    // Key light — головне джерело (як лампа над столом)
    this.addLight('directional', {
      color: '#ffecd2',
      intensity: 1.0,
      position: '1 3 1',
      castShadow: true,
      shadowMapWidth: 1024,
      shadowMapHeight: 1024
    });

    // Fill light — заповнююче з протилежного боку
    this.addLight('directional', {
      color: '#d4e6f1',
      intensity: 0.4,
      position: '-1 2 -1'
    });

    // Rim light — контурне для об'ємності
    this.addLight('point', {
      color: '#ff1493',
      intensity: 0.3,
      distance: 3,
      position: '0 1 -0.5'
    });

    // Підсвітка поля знизу
    this.addLight('point', {
      color: '#2ecc71',
      intensity: 0.2,
      distance: 2,
      position: '0 0.1 0'
    });
  }

  /**
   * Освітлення для ефекту голу
   */
  setupGoalLighting() {
    this.addLight('point', {
      color: '#ffd700',
      intensity: 2,
      distance: 4,
      position: '0 1 -0.7'
    });

    // Повертаємо через 3 секунди
    setTimeout(() => this.setupBarLighting(), 3000);
  }

  /**
   * Додати світло
   */
  addLight(type, params) {
    const light = document.createElement('a-entity');
    let lightAttr = `type: ${type}`;
    
    Object.entries(params).forEach(([key, value]) => {
      if (key === 'position') {
        light.setAttribute('position', value);
      } else {
        lightAttr += `; ${key}: ${value}`;
      }
    });
    
    light.setAttribute('light', lightAttr);
    this.scene.appendChild(light);
    this.lights.push(light);
    return light;
  }

  /**
   * Очистити всі світла
   */
  clear() {
    this.lights.forEach(l => l.remove());
    this.lights = [];
  }
}
