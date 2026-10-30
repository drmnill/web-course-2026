// ===== Константы =====

const GRID_SIZE = 20;                      // поле 20 x 20 клеток
const CELL_SIZE = 20;                      // клетка 20 x 20 px
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE; // 400 x 400 px
const MOVE_INTERVAL_MS = 140;              // один шаг змейки раз в 140 мс (не зависит от частоты кадров)
const START_LENGTH = 3;                    // начальная длина змейки
const MAX_QUEUED_TURNS = 2;                // сколько нажатий стрелок запоминаем между шагами

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

const COLORS = {
  cellLight: "#16201b",
  cellDark: "#131b17",
  snakeHead: [126, 224, 160],
  snakeTail: [52, 120, 86],
  apple: "#ff7a6b",
  leaf: "#7ee0a0",
  overlay: "rgba(8, 12, 10, 0.76)",
  text: "#e4ece7",
  muted: "#9aaba1",
};

// ===== Элементы страницы =====

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const hintEl = document.getElementById("hint");
const restartBtn = document.getElementById("restart-btn");

// ===== Состояние игры (только данные, без рисования) =====

let state = createInitialState();
let rafId = null;        // id текущего кадра, чтобы не запускать два цикла сразу
let lastMoveTime = null; // момент последнего шага змейки

function createInitialState() {
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  const snake = [];

  // голова первая в массиве, тело тянется влево от неё
  for (let i = 0; i < START_LENGTH; i++) {
    snake.push({ x: startX - i, y: startY });
  }

  return {
    snake,                          // массив координат сегментов
    direction: DIRECTIONS.ArrowRight, // направление последнего сделанного шага
    inputQueue: [],                 // повороты, которые игрок нажал, но они ещё не применены
    apple: null,                    // { x, y }
    score: 0,
    gameOver: false,
    won: false,
  };
}

// ===== Настройка canvas =====

function setupCanvas() {
  // логический размер остаётся 400 x 400, но на «ретине» рисуем чётче
  const ratio = window.devicePixelRatio || 1;
  canvas.width = CANVAS_SIZE * ratio;
  canvas.height = CANVAS_SIZE * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}
// ===== Яблоко =====

function getFreeCells() {
  const occupied = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const free = [];

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y });
      }
    }
  }
  return free;
}

function spawnApple() {
  const freeCells = getFreeCells();

  if (freeCells.length === 0) {
    state.apple = null; // змейка заняла всё поле
    return false;
  }

  state.apple = freeCells[Math.floor(Math.random() * freeCells.length)];
  return true;
}

function isAppleAt(cell) {
  return state.apple !== null && state.apple.x === cell.x && state.apple.y === cell.y;
}
// ===== Управление =====

function isSameDirection(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isOppositeDirection(a, b) {
  return a.x === -b.x && a.y === -b.y;
}

function queueDirection(next) {
  if (state.gameOver) return;
  if (state.inputQueue.length >= MAX_QUEUED_TURNS) return;

  // сравниваем с последним поворотом в очереди, а если очереди нет — с текущим направлением
  const last = state.inputQueue.length > 0
    ? state.inputQueue[state.inputQueue.length - 1]
    : state.direction;

  // разворот на 180° и повтор того же направления просто игнорируем
  if (isSameDirection(next, last) || isOppositeDirection(next, last)) return;

  state.inputQueue.push(next);
}

function handleKeydown(event) {
  if (state.gameOver && event.key === "Enter") {
    startGame();
    return;
  }

  const direction = DIRECTIONS[event.key];
  if (!direction) return;

  event.preventDefault(); // чтобы стрелки не прокручивали страницу
  queueDirection(direction);
}
// ===== Логика игры =====

function applyQueuedDirection() {
  if (state.inputQueue.length > 0) {
    state.direction = state.inputQueue.shift();
  }
}

function getNextHead() {
  const head = state.snake[0];
  return {
    x: head.x + state.direction.x,
    y: head.y + state.direction.y,
  };
}

function checkCollision(head, willGrow) {
  const hitsWall =
    head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
  if (hitsWall) return true;

  // если змейка не растёт, её хвост в этот шаг уйдёт — в его клетку заходить можно
  const body = willGrow ? state.snake : state.snake.slice(0, -1);
  return body.some((segment) => segment.x === head.x && segment.y === head.y);
}

function moveSnake(head, grow) {
  state.snake.unshift(head);
  if (!grow) {
    state.snake.pop();
  }
}

function updateScoreDisplay() {
  scoreEl.textContent = state.score;
}

function endGame(won) {
  state.gameOver = true;
  state.won = won;
  restartBtn.hidden = false;
  hintEl.hidden = true;
}

function update() {
  applyQueuedDirection();

  const head = getNextHead();
  const willGrow = isAppleAt(head);

  if (checkCollision(head, willGrow)) {
    endGame(false);
    return;
  }

  moveSnake(head, willGrow);

  if (willGrow) {
    state.score += 1;
    updateScoreDisplay();

    if (!spawnApple()) {
      endGame(true);
    }
  }
}
// ===== Отрисовка (только рисует по текущему state) =====

function fillRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function mixColor(from, to, t) {
  const channel = (i) => Math.round(from[i] + (to[i] - from[i]) * t);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

function drawBoard() {
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? COLORS.cellLight : COLORS.cellDark;
      ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
}

function drawApple() {
  if (!state.apple) return;

  const cx = state.apple.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = state.apple.y * CELL_SIZE + CELL_SIZE / 2;

  ctx.fillStyle = COLORS.apple;
  ctx.beginPath();
  ctx.arc(cx, cy + 1, CELL_SIZE * 0.38, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // блик
  ctx.beginPath();
  ctx.arc(cx - 3, cy - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.leaf; // листик
  ctx.beginPath();
  ctx.ellipse(cx + 3, cy - CELL_SIZE * 0.34, 3.5, 2, -0.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawEyes() {
  const head = state.snake[0];
  const dir = state.direction;
  const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
  const cy = head.y * CELL_SIZE + CELL_SIZE / 2;

  // глаза смещены вперёд по ходу движения и в стороны
  const eyes = [
    { x: cx + dir.x * 3 - dir.y * 4, y: cy + dir.y * 3 + dir.x * 4 },
    { x: cx + dir.x * 3 + dir.y * 4, y: cy + dir.y * 3 - dir.x * 4 },
  ];

  eyes.forEach((eye) => {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, 2.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#101614";
    ctx.beginPath();
    ctx.arc(eye.x + dir.x, eye.y + dir.y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSnake() {
  const lastIndex = state.snake.length - 1;

  state.snake.forEach((segment, index) => {
    const t = lastIndex === 0 ? 0 : index / lastIndex; // 0 у головы, 1 у хвоста
    ctx.fillStyle = mixColor(COLORS.snakeHead, COLORS.snakeTail, t);
    fillRoundedRect(
      segment.x * CELL_SIZE + 1,
      segment.y * CELL_SIZE + 1,
      CELL_SIZE - 2,
      CELL_SIZE - 2,
      6
    );
  });

  drawEyes();
}

function drawGameOver() {
  ctx.fillStyle = COLORS.overlay;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillStyle = COLORS.text;
  ctx.font = "600 32px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText("Игра окончена", CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 28);

  ctx.fillStyle = COLORS.leaf;
  ctx.font = "500 22px 'Segoe UI', system-ui, sans-serif";
  ctx.fillText(`Итоговый счёт: ${state.score}`, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 14);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 15px 'Segoe UI', system-ui, sans-serif";
  const note = state.won ? "Ты заполнил всё поле!" : "Enter — начать заново";
  ctx.fillText(note, CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 54);
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  drawBoard();
  drawApple();
  drawSnake();

  if (state.gameOver) {
    drawGameOver();
  }
}
