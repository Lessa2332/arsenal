/**
 * BallController — керування м'ячем (фізика + візуал)
 */

import * as CANNON from 'cannon-es';

export class BallController {
  constructor(physicsWorld) {
    this.world = physicsWorld;
    this.body = null;
    this.mesh = null;
    this.container = document.getElementById('ball-container');
  }

  create(mode) {
    // Фізичне тіло
    this.body = new CANNON.Body({
      mass: 1,
      shape: new CANNON.Sphere(0.08),
      linearDamping: 0.3,
      angularDamping: 0.3
    });
    this.body.position.set(0, 0.2, 0.4);
    this.world.addBody(this.body);

    // Візуальна модель
    this.mesh = document.createElement('a-entity');
    this.mesh.id = 'active-ball';
    
    if (mode === 'kids') {
      // Футбольний м'яч
      this.mesh.innerHTML = `
        <a-sphere radius="0.08" color="#ffffff" metalness="0.1" roughness="0.6" shadow="cast: true"></a-sphere>
        <a-icosahedron radius="0.082" color="#111111" wireframe="true" segments="2"></a-icosahedron>
        <a-sphere radius="0.02" color="#ff1493" position="0 0.08 0" opacity="0.8"></a-sphere>
      `;
    } else {
      // Келих пива
      this.mesh.innerHTML = `
        <a-cylinder radius="0.05" height="0.12" color="#ffcc00" opacity="0.85" metalness="0.2" roughness="0.1" position="0 0.06 0" shadow="cast: true"></a-cylinder>
        <a-cylinder radius="0.055" height="0.025" color="#ffffff" metalness="0" roughness="0.9" position="0 0.13 0"></a-cylinder>
        <a-torus radius="0.04" radius-tubular="0.01" color="#ffcc00" rotation="0 0 90" position="0.07 0.06 0"></a-torus>
        <a-sphere radius="0.015" color="#ffffff" opacity="0.4" position="0 0.14 0"></a-sphere>
      `;
    }
    
    this.container.appendChild(this.mesh);
  }

  kick(dx, dy, velocity = 1) {
    if (!this.body) return;
    
    // Нормалізуємо та масштабуємо імпульс
    const forceX = (dx / Math.abs(dx || 1)) * Math.min(Math.abs(dx) * 0.015, 0.8) * velocity;
    const forceZ = -(dy / Math.abs(dy || 1)) * Math.min(Math.abs(dy) * 0.015, 0.8) * velocity;
    const forceY = 0.3 + Math.min(velocity * 0.2, 0.5);
    
    this.body.applyImpulse(
      new CANNON.Vec3(forceX, forceY, forceZ),
      this.body.position
    );
    
    // Додаємо трохи обертання для реалізму
    this.body.angularVelocity.set(
      Math.random() * 5,
      Math.random() * 5,
      Math.random() * 5
    );
  }

  sync() {
    if (!this.body || !this.mesh) return;
    
    this.mesh.object3D.position.copy(this.body.position);
    this.mesh.object3D.quaternion.copy(this.body.quaternion);
    
    // Скидання, якщо впав
    if (this.body.position.y < -1) {
      this.reset();
    }
  }

  reset() {
    if (!this.body) return;
    this.body.position.set(0, 0.2, 0.4);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
  }

  destroy() {
    if (this.body) {
      this.world.removeBody(this.body);
    }
    if (this.mesh) {
      this.mesh.remove();
    }
  }
}
