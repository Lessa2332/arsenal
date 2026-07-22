/**
 * LevelManager — керування рівнями та перешкодами
 */

export class LevelManager {
  constructor(physicsWorld) {
    this.world = physicsWorld;
    this.currentLevel = 0;
    this.obstacles = [];
    this.obstacleMeshes = [];
  }

  load(levelIndex, mode) {
    // Очищаємо старі перешкоди
    this.clear();
    
    const config = this.getLevelConfig(levelIndex, mode);
    if (!config) return false;
    
    // Створюємо перешкоди
    config.obstacles.forEach(data => {
      this.createObstacle(data);
    });
    
    this.currentLevel = levelIndex;
    return true;
  }

  next() {
    return this.load(this.currentLevel + 1, window.ArsenalAR?.engine?.state?.mode);
  }

  createObstacle(data) {
    // Фізичне тіло
    const body = this.world.createObstacle(data);
    
    // Візуальна модель
    const mesh = document.createElement('a-box');
    mesh.setAttribute('position', `${data.pos[0]} ${data.pos[1]} ${data.pos[2]}`);
    mesh.setAttribute('width', data.size[0]);
    mesh.setAttribute('height', data.size[1]);
    mesh.setAttribute('depth', data.size[2]);
    mesh.setAttribute('shadow', 'cast: true; receive: true');
    
    if (data.texture) {
      mesh.setAttribute('material', `src: url(${data.texture}); transparent: true; alphaTest: 0.5`);
    } else {
      mesh.setAttribute('color', data.color || '#3498db');
      mesh.setAttribute('metalness', '0.2');
      mesh.setAttribute('roughness', '0.8');
    }
    
    // Додаємо емодзі/текст для "креветки"
    if (data.type === 'shrimp') {
      const label = document.createElement('a-text');
      label.setAttribute('value', '🦐');
      label.setAttribute('align', 'center');
      label.setAttribute('position', `0 ${data.size[1] / 2 + 0.05} 0`);
      label.setAttribute('scale', '0.15 0.15 0.15');
      mesh.appendChild(label);
    }
    
    document.getElementById('obstacles-container').appendChild(mesh);
    
    this.obstacles.push({ body, mesh, data, time: Math.random() * 10 });
    this.obstacleMeshes.push(mesh);
  }

  update(dt) {
    // Анімація рухомих перешкод
    this.obstacles.forEach(obs => {
      if (obs.data.moves === 'x') {
        obs.time += dt * 2;
        const offset = Math.sin(obs.time) * 0.2;
        const newX = obs.data.pos[0] + offset;
        
        obs.body.position.x = newX;
        obs.mesh.object3D.position.x = newX;
      }
    });
  }

  clear() {
    this.obstacles.forEach(obs => {
      this.world.removeBody(obs.body);
    });
    this.obstacleMeshes.forEach(mesh => mesh.remove());
    this.obstacles = [];
    this.obstacleMeshes = [];
  }

  getLevelConfig(index, mode) {
    const levels = {
      kids: [
        { id: 1, name: 'Розминка', obstacles: [] },
        { id: 2, name: 'Захисник', obstacles: [
          { type: 'box', pos: [0, 0.1, -0.2], size: [0.15, 0.2, 0.05], color: '#3498db' }
        ]},
        { id: 3, name: 'Креветка-воротар', obstacles: [
          { type: 'shrimp', pos: [0, 0.05, -0.6], size: [0.2, 0.15, 0.1], color: '#e74c3c', moves: 'x' }
        ]}
      ],
      adult: [
        { id: 1, name: 'Перша пінна', obstacles: [] },
        { id: 2, name: 'Втомлений бармен', obstacles: [
          { type: 'box', pos: [0.2, 0.1, -0.3], size: [0.1, 0.2, 0.1], color: '#2c3e50' }
        ]},
        { id: 3, name: 'Гігантська креветка', obstacles: [
          { type: 'shrimp', pos: [0, 0.05, -0.6], size: [0.25, 0.15, 0.1], color: '#e74c3c', moves: 'x' }
        ]}
      ]
    };
    
    return levels[mode]?.[index];
  }
}
