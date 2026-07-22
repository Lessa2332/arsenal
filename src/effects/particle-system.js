/**
 * ParticleSystem — кастомні частинки для AR-сцени
 * Пил над полем, іскри при ударі, світлові блиски
 */

export class ParticleSystem {
  constructor(container) {
    this.container = container || document.getElementById('effects-container');
    this.particles = [];
    this.maxParticles = 50;
  }

  /**
   * Створити ефект "пилу" над полем
   */
  createDustField(count = 20) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('a-sphere');
      particle.setAttribute('radius', '0.003');
      particle.setAttribute('color', '#90EE90');
      particle.setAttribute('opacity', '0.2');
      particle.setAttribute('position', this.randomFieldPosition());
      
      this.container.appendChild(particle);
      
      this.particles.push({
        mesh: particle,
        velocity: { x: 0, y: 0.001 + Math.random() * 0.002, z: 0 },
        life: Infinity,
        type: 'dust'
      });
    }
  }

  /**
   * Ефект іскор при ударі м'яча
   */
  createImpactSparks(position, color = '#ffd700') {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('a-sphere');
      spark.setAttribute('radius', '0.01');
      spark.setAttribute('color', color);
      spark.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
      
      this.container.appendChild(spark);
      
      const angle = (Math.PI * 2 * i) / count;
      const speed = 0.02 + Math.random() * 0.03;
      
      this.particles.push({
        mesh: spark,
        velocity: {
          x: Math.cos(angle) * speed,
          y: 0.05 + Math.random() * 0.05,
          z: Math.sin(angle) * speed
        },
        life: 0.5, // секунд
        maxLife: 0.5,
        type: 'spark'
      });
    }
  }

  /**
   * Ефект "світлового сліду" за м'ячем
   */
  createTrail(position, color = '#ffffff') {
    if (this.particles.filter(p => p.type === 'trail').length > 10) return;
    
    const trail = document.createElement('a-sphere');
    trail.setAttribute('radius', '0.02');
    trail.setAttribute('color', color);
    trail.setAttribute('opacity', '0.3');
    trail.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
    
    this.container.appendChild(trail);
    
    this.particles.push({
      mesh: trail,
      velocity: { x: 0, y: 0, z: 0 },
      life: 0.3,
      maxLife: 0.3,
      type: 'trail'
    });
  }

  /**
   * Оновлення всіх частинок
   */
  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      
      if (p.type !== 'dust') {
        p.life -= dt;
        
        // Оновлюємо позицію
        const pos = p.mesh.object3D.position;
        pos.x += p.velocity.x;
        pos.y += p.velocity.y;
        pos.z += p.velocity.z;
        
        // Гравітація для іскор
        if (p.type === 'spark') {
          p.velocity.y -= 0.1 * dt;
        }
        
        // Згасання
        const opacity = Math.max(0, p.life / p.maxLife);
        p.mesh.setAttribute('opacity', opacity * (p.type === 'trail' ? 0.3 : 1));
        
        // Видалення
        if (p.life <= 0) {
          p.mesh.remove();
          this.particles.splice(i, 1);
        }
      } else {
        // Пил плаває вгору
        const pos = p.mesh.object3D.position;
        pos.y += p.velocity.y;
        
        // Циклічне повернення
        if (pos.y > 0.3) {
          pos.y = 0.01;
          pos.x = (Math.random() - 0.5) * 1.2;
          pos.z = (Math.random() - 0.5) * 1.8;
        }
      }
    }
    
    // Ліміт частинок
    while (this.particles.length > this.maxParticles) {
      const oldest = this.particles.find(p => p.type !== 'dust');
      if (oldest) {
        oldest.mesh.remove();
        this.particles.splice(this.particles.indexOf(oldest), 1);
      } else {
        break;
      }
    }
  }

  /**
   * Очистити всі частинки
   */
  clear() {
    this.particles.forEach(p => p.mesh.remove());
    this.particles = [];
  }

  randomFieldPosition() {
    return {
      x: (Math.random() - 0.5) * 1.2,
      y: 0.01 + Math.random() * 0.2,
      z: (Math.random() - 0.5) * 1.8
    };
  }
}
