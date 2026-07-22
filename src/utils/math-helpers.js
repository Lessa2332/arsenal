/**
 * Math Helpers — векторна математика та утиліти для AR/фізики
 */

/**
 * Лінійна інтерполяція між двома значеннями
 */
export function lerp(a, b, t) {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Обмеження значення в діапазоні [min, max]
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Плавна інтерполяція (ease-out cubic)
 */
export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Плавна інтерполяція (ease-out elastic)
 */
export function easeOutElastic(t) {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Випадкове число в діапазоні [min, max]
 */
export function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Випадкове ціле число в діапазоні [min, max]
 */
export function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

/**
 * Випадковий елемент масиву
 */
export function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Перевірка, чи точка всередині прямокутника
 */
export function pointInRect(px, py, rx, ry, rw, rh) {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

/**
 * Відстань між двома точками в 2D
 */
export function distance2D(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Відстань між двома точками в 3D
 */
export function distance3D(x1, y1, z1, x2, y2, z2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
}

/**
 * Нормалізація вектора
 */
export function normalizeVector(x, y, z) {
  const len = Math.sqrt(x * x + y * y + z * z);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: x / len, y: y / len, z: z / len };
}

/**
 * Скалярний добуток двох векторів
 */
export function dotProduct(v1, v2) {
  return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
}

/**
 * Обмеження вектора за довжиною
 */
export function clampVector(x, y, z, maxLength) {
  const len = Math.sqrt(x * x + y * y + z * z);
  if (len <= maxLength) return { x, y, z };
  const scale = maxLength / len;
  return { x: x * scale, y: y * scale, z: z * scale };
}

/**
 * Перетворення свайпу в 3D імпульс з урахуванням камери
 */
export function swipeToImpulse(deltaX, deltaY, cameraQuaternion, power = 1) {
  // Базовий напрямок свайпу (екранні координати → світові)
  const forward = new THREE.Vector3(0, 0, -1);
  forward.applyQuaternion(cameraQuaternion);
  
  const right = new THREE.Vector3(1, 0, 0);
  right.applyQuaternion(cameraQuaternion);
  
  // Нормалізуємо свайп
  const len = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const nx = deltaX / len;
  const ny = deltaY / len;
  
  // Комбінуємо напрямки
  const impulse = new THREE.Vector3()
    .addScaledVector(right, nx * power)
    .addScaledVector(forward, -ny * power);
  
  // Додаємо вертикальну складову для "підкидання"
  impulse.y = 0.3 + power * 0.2;
  
  return impulse;
}

/**
 * Slerp (сферична інтерполяція) для кватерніонів — спрощена версія
 */
export function slerpQuaternions(q1, q2, t) {
  // Використовуємо THREE.js вбудований slerp, якщо доступний
  if (typeof THREE !== 'undefined') {
    const result = new THREE.Quaternion();
    result.copy(q1).slerp(q2, t);
    return result;
  }
  
  // Fallback: проста лінійна інтерполяція (менш точна, але швидша)
  return {
    x: lerp(q1.x, q2.x, t),
    y: lerp(q1.y, q2.y, t),
    z: lerp(q1.z, q2.z, t),
    w: lerp(q1.w, q2.w, t)
  };
}

/**
 * Перевірка перетину променя з площиною
 */
export function rayIntersectPlane(rayOrigin, rayDir, planePoint, planeNormal) {
  const denom = dotProduct(rayDir, planeNormal);
  if (Math.abs(denom) < 1e-6) return null; // Промінь паралельний площині
  
  const t = dotProduct(
    { x: planePoint.x - rayOrigin.x, y: planePoint.y - rayOrigin.y, z: planePoint.z - rayOrigin.z },
    planeNormal
  ) / denom;
  
  if (t < 0) return null; // Перетин позаду променя
  
  return {
    x: rayOrigin.x + rayDir.x * t,
    y: rayOrigin.y + rayDir.y * t,
    z: rayOrigin.z + rayDir.z * t,
    distance: t
  };
}

/**
 * Генерація випадкової позиції на полі (для частинок, бонусів)
 */
export function randomFieldPosition(padding = 0.1) {
  return {
    x: randomRange(-0.5 + padding, 0.5 - padding),
    y: 0.05,
    z: randomRange(-0.8 + padding, 0.8 - padding)
  };
}

/**
 * Перетворення градусів в радіани
 */
export function degToRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * Перетворення радіан в градуси
 */
export function radToDeg(rad) {
  return rad * (180 / Math.PI);
}

/**
 * Плавне наближення значення до цілі (damping)
 */
export function damp(current, target, lambda, dt) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

/**
 * Шум Перліна (спрощена 1D версія для анімацій)
 */
export function noise1D(x) {
  const X = Math.floor(x) & 255;
  x -= Math.floor(x);
  const u = fade(x);
  return lerp(grad(X, x), grad(X + 1, x - 1), u);
}

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function grad(hash, x) {
  return (hash & 1) === 0 ? x : -x;
}
