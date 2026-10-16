// const

const PAD_COUNT = 4;
const LIGHT_MS = 500;            // сколько горит сектор при показе
const GAP_MS = 250;              // пауза между секторами
const SHOW_START_DELAY_MS = 700; // пауза перед началом показа
const NEXT_ROUND_DELAY_MS = 900; // пауза после верного ввода
const CLICK_FLASH_MS = 220;      // вспышка при клике игрока
const TONES = [261.63, 329.63, 392.0, 523.25]; // частоты для четырёх секторов

//game state

const state = {
  sequence: [],       // последовательность компьютера, например [2, 0, 3]
  playerInput: [],    // то, что уже нажал игрок
  isRunning: false,   // идёт ли игра
  isShowing: false,   // true — компьютер показывает (или пауза), клики игнорируются
  runId: 0,           // номер партии
  soundOn: true,
};

const pendingTimers = new Set(); // все активные таймеры, чтобы уметь их отменять
let audioCtx = null;


const board = document.getElementById("board");
const pads = Array.from(board.querySelectorAll(".pad"));
const levelEl = document.getElementById("level");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const soundBtn = document.getElementById("sound-btn");


function setMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.classList.remove("message--ok", "message--error");
  if (type) {
    messageEl.classList.add(`message--${type}`);
  }
}

function updateLevel() {
  levelEl.textContent = state.sequence.length;
}

function setPadsDisabled(disabled) {
  pads.forEach((pad) => {
    pad.disabled = disabled;
  });
}

function clearLitPads() {
  pads.forEach((pad) => pad.classList.remove("active"));
}

function lockInput() {
  state.isShowing = true;
  setPadsDisabled(true);
}

function unlockInput() {
  state.isShowing = false;
  setPadsDisabled(false);
}
