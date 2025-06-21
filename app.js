const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;

// Colors
const BG_GRAD_TOP = "#1a406a";
const BG_GRAD_BOTTOM = "#4ecb3c";
const GROUND_Y = HEIGHT * 0.65;

// Game state
let lives = 5;
let score = 0;

// Player
const player = {
  x: 50,
  y: GROUND_Y - 40,
  w: 32,
  h: 40,
  vy: 0,
  jumping: false,
  color: "#f77e7e"
};

// Drops and obstacles
let items = [];
const ITEM_RADIUS = 16;
const ITEM_SPEED = 3;

// Platforms (for visual only)
const platforms = [
  { x: 120, y: GROUND_Y - 60, w: 90, h: 18 },
  { x: 220, y: GROUND_Y - 110, w: 90, h: 18 }
];

// Controls
document.getElementById('jumpBtn').onclick = jump;
document.addEventListener('keydown', e => {
  if (e.code === 'Space') jump();
});

function jump() {
  if (!player.jumping) {
    player.vy = -10;
    player.jumping = true;
  }
}

// Spawn items
function spawnItem() {
  // 60% blue drop, 40% black drop
  const isBlue = Math.random() < 0.6;
  items.push({
    x: WIDTH + ITEM_RADIUS,
    y: GROUND_Y - (isBlue ? 0 : 0),
    r: ITEM_RADIUS,
    color: isBlue ? "#1cc6f7" : "#111",
    type: isBlue ? "blue" : "black"
  });
}
setInterval(spawnItem, 1200);

// Game loop
function update() {
  // Gravity
  player.vy += 0.5;
  player.y += player.vy;

  // Ground collision
  if (player.y > GROUND_Y - player.h) {
    player.y = GROUND_Y - player.h;
    player.vy = 0;
    player.jumping = false;
  }

  // Move items
  for (let i = items.length - 1; i >= 0; i--) {
    items[i].x -= ITEM_SPEED;

    // Collision with player
    if (
      items[i].x < player.x + player.w &&
      items[i].x + items[i].r > player.x &&
      items[i].y + items[i].r > player.y &&
      items[i].y < player.y + player.h
    ) {
      if (items[i].type === "blue") {
        score += 2;
      } else {
        lives -= 1;
      }
      items.splice(i, 1);
      continue;
    }

    // Remove off-screen
    if (items[i].x < -ITEM_RADIUS) {
      items.splice(i, 1);
    }
  }

  // Update HUD
  document.getElementById('lives').textContent = lives;
  document.getElementById('score').textContent = score;

  // Game over
  if (lives <= 0) {
    alert("Game Over! Refresh to play again.");
    window.location.reload();
  }
}

function draw() {
  // Background
  let grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  grad.addColorStop(0, BG_GRAD_TOP);
  grad.addColorStop(0.7, "#7ec1e3");
  grad.addColorStop(1, BG_GRAD_BOTTOM);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Hills
  ctx.fillStyle = "#3cb13c";
  ctx.beginPath();
  ctx.arc(80, GROUND_Y + 40, 60, Math.PI, 0);
  ctx.arc(320, GROUND_Y + 60, 90, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // Ground
  ctx.fillStyle = "#4ecb3c";
  ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

  // Platforms
  ctx.fillStyle = "#fff7e0";
  platforms.forEach(p => {
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 12);
    ctx.fill();
  });

  // Player (rectangle with head)
  ctx.save();
  ctx.translate(player.x, player.y);
  // Body
  ctx.fillStyle = "#f77e7e";
  ctx.fillRect(0, 10, player.w, player.h - 10);
  // Head
  ctx.beginPath();
  ctx.arc(player.w / 2, 10, 10, 0, 2 * Math.PI);
  ctx.fillStyle = "#eee";
  ctx.fill();
  ctx.restore();

  // Items (drops)
  items.forEach(item => {
    ctx.save();
    ctx.translate(item.x, item.y);
    // Drop shape
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      -item.r, -item.r,
      -item.r, item.r,
      0, item.r * 1.5
    );
    ctx.bezierCurveTo(
      item.r, item.r,
      item.r, -item.r,
      0, 0
    );
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.shadowColor = item.type === "blue" ? "#1cc6f7" : "#000";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.restore();
  });
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();