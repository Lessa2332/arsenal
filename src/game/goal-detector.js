/**
 * GoalDetector — перевірка голу та ефекти
 */

export class GoalDetector {
  constructor() {
    this.onGoal = null;
    this.isScored = false;
    this.cooldown = false;
  }

  check(ballBody) {
    if (!ballBody || this.isScored || this.cooldown) return;
    
    // Умова голу: м'яч за лінією воріт (Z < -0.7) і по центру (|X| < 0.2)
    const pos = ballBody.position;
    
    if (pos.z < -0.7 && Math.abs(pos.x) < 0.2 && pos.y < 0.3) {
      this.score();
    }
  }

  score() {
    this.isScored = true;
    this.cooldown = true;
    
    // Колбек
    if (this.onGoal) this.onGoal();
    
    // Скидання через 3 сек
    setTimeout(() => {
      this.isScored = false;
      this.cooldown = false;
    }, 3000);
  }
}
