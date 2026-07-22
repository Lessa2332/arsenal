// generate-assets.js — запустіть Node.js або вставте в консоль браузера

function createTexture(width, height, drawFn) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  drawFn(ctx, width, height);
  return canvas.toDataURL('image/jpeg', 0.9);
}

// 1. field-grass.jpg
const grass = createTexture(512, 512, (ctx, w, h) => {
  // Базовий зелений
  ctx.fillStyle = '#3a8c3a';
  ctx.fillRect(0, 0, w, h);
  
  // Смуги трави
  for (let y = 0; y < h; y += 4) {
    ctx.fillStyle = Math.random() > 0.5 ? '#4a9c4a' : '#2a7c2a';
    ctx.fillRect(0, y, w, 2);
  }
  
  // Точки
  for (let i = 0; i < 1000; i++) {
    ctx.fillStyle = `rgba(${100 + Math.random()*50}, ${150 + Math.random()*50}, ${100 + Math.random()*50}, 0.3)`;
    ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
  }
});

// 2. wood-floor.jpg
const wood = createTexture(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(0, 0, w, h);
  
  // Дошки
  for (let x = 0; x < w; x += 20) {
    ctx.fillStyle = Math.random() > 0.5 ? '#9B5523' : '#7B3503';
    ctx.fillRect(x, 0, 18, h);
    
    // Тріщини
    ctx.fillStyle = '#5B2503';
    ctx.fillRect(x + 18, 0, 2, h);
  }
});

// 3. goal-net.png (прозорий фон)
const netCanvas = document.createElement('canvas');
netCanvas.width = 256;
netCanvas.height = 256;
const netCtx = netCanvas.getContext('2d');
netCtx.clearRect(0, 0, 256, 256);
netCtx.strokeStyle = 'rgba(255,255,255,0.6)';
netCtx.lineWidth = 2;
for (let i = 0; i <= 256; i += 16) {
  netCtx.beginPath();
  netCtx.moveTo(i, 0);
  netCtx.lineTo(i, 256);
  netCtx.stroke();
  netCtx.beginPath();
  netCtx.moveTo(0, i);
  netCtx.lineTo(256, i);
  netCtx.stroke();
}
const net = netCanvas.toDataURL('image/png');

// Виведіть base64 або збережіть файли
console.log('GRASS_BASE64=', grass.slice(0, 100) + '...');
console.log('WOOD_BASE64=', wood.slice(0, 100) + '...');
console.log('NET_BASE64=', net.slice(0, 100) + '...');
