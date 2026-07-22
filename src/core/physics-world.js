/**
 * PhysicsWorld — Cannon-es ініціалізація та керування
 */

import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  constructor() {
    this.world = null;
    this.bodies = [];
    this.materials = {};
  }

  init() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -15, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.solver.iterations = 10;
    this.world.allowSleep = true;

    // Матеріали
    this.materials.ground = new CANNON.Material('ground');
    this.materials.ball = new CANNON.Material('ball');
    this.materials.wall = new CANNON.Material('wall');
    this.materials.obstacle = new CANNON.Material('obstacle');

    // Контактні матеріали
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.materials.ground, this.materials.ball, {
        friction: 0.4,
        restitution: 0.6
      })
    );
    
    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.materials.wall, this.materials.ball, {
        friction: 0.1,
        restitution: 0.8
      })
    );

    this.world.addContactMaterial(
      new CANNON.ContactMaterial(this.materials.obstacle, this.materials.ball, {
        friction: 0.3,
        restitution: 0.5
      })
    );

    // Створюємо статичні тіла поля
    this.createField();
  }

  createField() {
    // Стіл (поле) — повернутий на 90° по X
    const groundShape = new CANNON.Box(new CANNON.Vec3(0.6, 0.01, 0.9));
    const groundBody = new CANNON.Body({
      mass: 0,
      material: this.materials.ground
    });
    groundBody.addShape(groundShape);
    
    const q = new CANNON.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    groundBody.quaternion = q;
    
    this.world.addBody(groundBody);
    this.bodies.push(groundBody);

    // Стінки поля
    const wallThickness = 0.02;
    const walls = [
      { pos: [0, 0.05, -0.9], size: [0.6, 0.1, wallThickness] },   // Ворота (логічно відкриті)
      { pos: [0, 0.05, 0.9], size: [0.6, 0.1, wallThickness] },    // Задня стінка
      { pos: [-0.6, 0.05, 0], size: [wallThickness, 0.1, 0.9] },   // Ліва
      { pos: [0.6, 0.05, 0], size: [wallThickness, 0.1, 0.9] }     // Права
    ];

    walls.forEach(w => {
      const shape = new CANNON.Box(new CANNON.Vec3(...w.size));
      const body = new CANNON.Body({ mass: 0, material: this.materials.wall });
      body.addShape(shape);
      body.position.set(...w.pos);
      this.world.addBody(body);
      this.bodies.push(body);
    });
  }

  createBall() {
    const shape = new CANNON.Sphere(0.08);
    const body = new CANNON.Body({
      mass: 1,
      material: this.materials.ball,
      shape,
      linearDamping: 0.3,
      angularDamping: 0.3
    });
    body.position.set(0, 0.2, 0.4);
    this.world.addBody(body);
    this.bodies.push(body);
    return body;
  }

  createObstacle(data) {
    const shape = new CANNON.Box(new CANNON.Vec3(
      data.size[0] / 2,
      data.size[1] / 2,
      data.size[2] / 2
    ));
    const body = new CANNON.Body({
      mass: 0,
      material: this.materials.obstacle
    });
    body.addShape(shape);
    body.position.set(...data.pos);
    this.world.addBody(body);
    this.bodies.push(body);
    return body;
  }

  step(dt) {
    if (this.world) {
      this.world.step(1 / 60, dt, 3);
    }
  }

  destroy() {
    this.bodies.forEach(b => this.world?.removeBody(b));
    this.bodies = [];
    this.world = null;
  }
}
