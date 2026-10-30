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
