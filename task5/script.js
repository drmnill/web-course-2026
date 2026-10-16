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
// sound

function getAudioContext() {
  if (!state.soundOn) return null;
  try {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (error) {
    return null;
  }
}

function playTone(frequency, duration = 0.35, type = "sine") {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.05);
}

function playPadSound(index) {
  playTone(TONES[index]);
}

function playFailSound() {
  playTone(110, 0.6, "sawtooth");
}
// show subsequence

async function lightPad(index, duration) {
  pads[index].classList.add("active");
  playPadSound(index);
  await delay(duration);
  pads[index].classList.remove("active");
}

async function playSequence(runId) {
  lockInput();
  setMessage("Смотри внимательно…");
  await delay(SHOW_START_DELAY_MS);

  for (const index of state.sequence) {
    if (isStale(runId)) return;
    await lightPad(index, LIGHT_MS);
    if (isStale(runId)) return;
    await delay(GAP_MS);
  }

  if (isStale(runId)) return;
  state.playerInput = [];
  unlockInput();
  setMessage("Твой ход!");
}
// round and enter the player

function randomPad() {
  return Math.floor(Math.random() * PAD_COUNT);
}

function nextRound() {
  state.sequence.push(randomPad());
  state.playerInput = [];
  updateLevel();
  playSequence(state.runId);
}

async function flashPad(index, withSound = true) {
  pads[index].classList.add("active");
  if (withSound) playPadSound(index);
  await delay(CLICK_FLASH_MS);
  pads[index].classList.remove("active");
}

async function finishRound(runId) {
  lockInput();
  setMessage("Верно!", "ok");
  await delay(NEXT_ROUND_DELAY_MS);
  if (isStale(runId)) return;
  nextRound();
}

function handlePadPress(index) {
  if (!state.isRunning || state.isShowing) return; // во время показа клики не считаются

  state.playerInput.push(index);
  const position = state.playerInput.length - 1;

  if (state.playerInput[position] !== state.sequence[position]) {
    flashPad(index, false);
    gameOver();
    return;
  }

  flashPad(index);

  if (state.playerInput.length === state.sequence.length) {
    finishRound(state.runId);
  }
}
