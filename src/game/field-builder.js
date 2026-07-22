/**
 * FieldBuilder — створення та оновлення 3D поля
 */

export class FieldBuilder {
  constructor() {
    this.effects = [];
  }

  build(mode) {
    const anchor = document.getElementById('game-anchor');
    
    // Додаємо ефект трави (мікро-частинки)
    this.createGrassParticles();
    
    // Додаємо освітлення в залежності від режиму
    if (mode === 'adult') {
      this.createNeonGlow();
    }
  }

  createGrassParticles() {
    // Спрощені частинки пилу над полем
    const container = document.getElementById('effects-container');
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('a-sphere');
      particle.setAttribute('radius', '0.005');
      particle.setAttribute('color', '#90EE90');
      particle.setAttribute('opacity', '0.3');
      particle.setAttribute('position', `${(Math.random() - 0.5) * 1} ${0.05 + Math.random() * 0.1} ${(Math.random() - 0.5) * 1.5}`);
      container.appendChild(particle);
      this.effects.push(particle);
    }
  }

  createNeonGlow() {
    const container = document.getElementById('effects-container');
    const glow = document.createElement('a-entity');
    glow.setAttribute('light', 'type: point; color: #ff1493; intensity: 0.8; distance: 3');
    glow.setAttribute('position', '0 0.5 0');
    container.appendChild(glow);
  }

  updateEffects(dt) {
    // Анімація частинок
    this.effects.forEach((p, i) => {
      const pos = p.object3D.position;
      pos.y += Math.sin(performance.now() * 0.001 + i) * 0.001;
    });
  }
}
