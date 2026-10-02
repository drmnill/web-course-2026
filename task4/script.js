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
function validateInput(value) {
  if (value.length !== 4) {
    return { valid: false, message: "Нужно ввести ровно 4 цифры." };
  }

  if (!/^[0-9]{4}$/.test(value)) {
    return { valid: false, message: "Можно вводить только цифры." };
  }

  const uniqueDigits = new Set(value.split(""));
  if (uniqueDigits.size !== 4) {
    return { valid: false, message: "Цифры не должны повторяться." };
  }

  return { valid: true, message: "" };
}
function countBullsAndCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  const secretDigits = secret.split("");
  const guessDigits = guess.split("");

  guessDigits.forEach((digit, index) => {
    if (digit === secretDigits[index]) {
      bulls++;
    } else if (secretDigits.includes(digit)) {
      cows++;
    }
  });

  return { bulls, cows };
}
