/**
 * Celebration — ефекти при голі
 */

export function trigger() {
  // Canvas Confetti
  if (typeof confetti !== 'undefined') {
    const duration = 2000;
    const end = Date.now() + duration;
    
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#ff1493', '#2ecc71', '#ffd700', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#ff1493', '#2ecc71', '#ffd700', '#ffffff']
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }
  
  // 3D ефект — спалах над полем
  const effects = document.getElementById('effects-container');
  const flash = document.createElement('a-entity');
  flash.setAttribute('light', 'type: point; color: #ffd700; intensity: 2; distance: 4');
  flash.setAttribute('position', '0 0.5 -0.7');
  effects.appendChild(flash);
  
  // Анімація згасання
  let intensity = 2;
  const fade = setInterval(() => {
    intensity -= 0.1;
    if (intensity <= 0) {
      flash.remove();
      clearInterval(fade);
    } else {
      flash.setAttribute('light', `type: point; color: #ffd700; intensity: ${intensity}; distance: 4`);
    }
  }, 50);
}
