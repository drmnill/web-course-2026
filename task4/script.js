let secretNumber = "";
let attempts = []; 
let isGameOver = false;

const statusEl = document.getElementById("status");
const form = document.getElementById("guess-form");
const input = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const errorMsg = document.getElementById("error-msg");
const attemptsCountEl = document.getElementById("attempts-count");
const historyEl = document.getElementById("history");
const newGameBtn = document.getElementById("new-game-btn");

function generateSecretNumber() {
  const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }

  return digits.slice(0, 4).join("");
}
