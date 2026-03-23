const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

const keys = {
  left: false,
  right: false,
  up: false,
  down: false,
  shoot: false,
};

const player = {
  x: GAME_WIDTH / 2 - 20,
  y: GAME_HEIGHT - 70,
  width: 40,
  height: 40,
  speed: 240,
  color: '#7dd3fc',
};

const bullets = [];
const enemies = [];

const gameState = {
  running: true,
  score: 0,
  lastTime: 0,
  shootCooldown: 0,
  enemySpawnTimer: 0,
};

function update(deltaTime) {
  if (!gameState.running) {
    return;
  }

  const distance = player.speed * deltaTime;

  if (keys.left) player.x -= distance;
  if (keys.right) player.x += distance;
  if (keys.up) player.y -= distance;
  if (keys.down) player.y += distance;

  player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));

  gameState.shootCooldown = Math.max(0, gameState.shootCooldown - deltaTime);
  gameState.enemySpawnTimer += deltaTime;

  if (keys.shoot) {
    shoot();
  }

  if (gameState.enemySpawnTimer >= 1.5) {
    spawnEnemy();
    gameState.enemySpawnTimer = 0;
  }

  for (const bullet of bullets) {
    bullet.y -= bullet.speed * deltaTime;
  }

  for (const enemy of enemies) {
    enemy.y += enemy.speed * deltaTime;
  }

  removeOffscreenItems();
  checkCollisions();
}

function render() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  renderBackground();
  renderPlayer();
  renderBullets();
  renderEnemies();
  renderHud();
}

function shoot() {
  if (gameState.shootCooldown > 0) {
    return;
  }

  bullets.push({
    x: player.x + player.width / 2 - 3,
    y: player.y - 12,
    width: 6,
    height: 12,
    speed: 360,
    color: '#fef08a',
  });

  gameState.shootCooldown = 0.25;
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * (GAME_WIDTH - 32),
    y: -32,
    width: 32,
    height: 32,
    speed: 120,
    color: '#f87171',
  });
}

function checkCollisions() {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    for (let j = enemies.length - 1; j >= 0; j -= 1) {
      if (isOverlapping(bullets[i], enemies[j])) {
        bullets.splice(i, 1);
        enemies.splice(j, 1);
        gameState.score += 10;
        break;
      }
    }
  }
}

function resetGame() {
  player.x = GAME_WIDTH / 2 - player.width / 2;
  player.y = GAME_HEIGHT - 70;
  bullets.length = 0;
  enemies.length = 0;
  gameState.running = true;
  gameState.score = 0;
  gameState.lastTime = 0;
  gameState.shootCooldown = 0;
  gameState.enemySpawnTimer = 0;
}

function removeOffscreenItems() {
  for (let i = bullets.length - 1; i >= 0; i -= 1) {
    if (bullets[i].y + bullets[i].height < 0) {
      bullets.splice(i, 1);
    }
  }

  for (let i = enemies.length - 1; i >= 0; i -= 1) {
    if (enemies[i].y > GAME_HEIGHT) {
      enemies.splice(i, 1);
    }
  }
}

function renderBackground() {
  ctx.fillStyle = '#0a1220';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let y = 0; y < GAME_HEIGHT; y += 40) {
    ctx.fillRect(0, y, GAME_WIDTH, 1);
  }
}

function renderPlayer() {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function renderBullets() {
  for (const bullet of bullets) {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}

function renderEnemies() {
  for (const enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }
}

function renderHud() {
  ctx.fillStyle = '#e5eefc';
  ctx.font = '16px Arial';
  ctx.fillText(`Score: ${gameState.score}`, 12, 24);
}

function isOverlapping(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function gameLoop(timestamp) {
  const deltaTime = (timestamp - gameState.lastTime) / 1000 || 0;
  gameState.lastTime = timestamp;

  update(deltaTime);
  render();

  requestAnimationFrame(gameLoop);
}

function setKeyState(code, pressed) {
  if (code === 'ArrowLeft' || code === 'KeyA') keys.left = pressed;
  if (code === 'ArrowRight' || code === 'KeyD') keys.right = pressed;
  if (code === 'ArrowUp' || code === 'KeyW') keys.up = pressed;
  if (code === 'ArrowDown' || code === 'KeyS') keys.down = pressed;
  if (code === 'Space') keys.shoot = pressed;
}

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyR') {
    resetGame();
    return;
  }

  setKeyState(event.code, true);
});

window.addEventListener('keyup', (event) => {
  setKeyState(event.code, false);
});

resetGame();
requestAnimationFrame(gameLoop);
