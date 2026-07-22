/**
 * RenderLoop — синхронізація фізики та рендерингу 60fps
 */

export class RenderLoop {
  constructor() {
    this.isRunning = false;
    this.rafId = null;
    this.lastTime = 0;
    this.accumulator = 0;
    this.timeStep = 1 / 60;
  }

  start(callback) {
    this.isRunning = true;
    this.lastTime = performance.now();
    
    const loop = (currentTime) => {
      if (!this.isRunning) return;
      
      const frameTime = Math.min((currentTime - this.lastTime) / 1000, 0.1); // Cap at 100ms
      this.lastTime = currentTime;
      
      // Fixed timestep для стабільної фізики
      this.accumulator += frameTime;
      while (this.accumulator >= this.timeStep) {
        callback(this.timeStep);
        this.accumulator -= this.timeStep;
      }
      
      this.rafId = requestAnimationFrame(loop);
    };
    
    this.rafId = requestAnimationFrame(loop);
  }

  stop() {
    this.isRunning = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
