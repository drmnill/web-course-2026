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
