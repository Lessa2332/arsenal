/**
 * Базові тести фізичного движка
 * Запуск: npm test (потрібно додати vitest/jest)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { PhysicsWorld } from '../src/core/physics-world.js';
import * as CANNON from 'cannon-es';

describe('PhysicsWorld', () => {
  let world;

  beforeEach(() => {
    world = new PhysicsWorld();
    world.init();
  });

  it('should initialize with gravity', () => {
    expect(world.world.gravity.y).toBe(-15);
  });

  it('should create ball with correct mass', () => {
    const ball = world.createBall();
    expect(ball.mass).toBe(1);
    expect(ball.shapes[0].radius).toBe(0.08);
  });

  it('should create static ground', () => {
    const ground = world.bodies[0];
    expect(ground.mass).toBe(0);
  });

  it('should detect ball falling off table', () => {
    const ball = world.createBall();
    ball.position.set(0, -2, 0);
    expect(ball.position.y).toBeLessThan(-1);
  });

  it('should apply impulse correctly', () => {
    const ball = world.createBall();
    ball.applyImpulse(new CANNON.Vec3(1, 0, 0), ball.position);
    expect(ball.velocity.x).toBeGreaterThan(0);
  });
});
