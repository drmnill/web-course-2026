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
function createHistoryItem(attempt) {
  const li = document.createElement("li");
  li.className = "history__item";

  const code = document.createElement("span");
  code.className = "history__code";
  code.textContent = attempt.guess;

  const result = document.createElement("div");
  result.className = "history__result";

  const dotsWrap = document.createElement("div");
  dotsWrap.className = "history__dots";

  for (let i = 0; i < attempt.bulls; i++) {
    const dot = document.createElement("span");
    dot.className = "history__dot history__dot--bull";
    dotsWrap.appendChild(dot);
  }
  for (let i = 0; i < attempt.cows; i++) {
    const dot = document.createElement("span");
    dot.className = "history__dot history__dot--cow";
    dotsWrap.appendChild(dot);
  }

  const text = document.createElement("span");
  text.textContent = `${attempt.bulls} ${declineBulls(attempt.bulls)}, ${attempt.cows} ${declineCows(attempt.cows)}`;

  result.append(dotsWrap, text);
  li.append(code, result);
  return li;
}

function declineBulls(n) {
  if (n === 1) return "бык";
  if (n >= 2 && n <= 4) return "быка";
  return "быков";
}

function declineCows(n) {
  if (n === 1) return "корова";
  if (n >= 2 && n <= 4) return "коровы";
  return "коров";
}

function render() {
  historyEl.innerHTML = "";

  attempts.forEach((attempt) => {
    historyEl.appendChild(createHistoryItem(attempt));
  });

  attemptsCountEl.textContent = attempts.length;
}
function startNewGame() {
  secretNumber = generateSecretNumber();
  attempts = [];
  isGameOver = false;

  input.value = "";
  input.disabled = false;
  submitBtn.disabled = false;
  errorMsg.classList.remove("guess-form__error--visible");
  statusEl.textContent = "";
  statusEl.classList.remove("vault__status--win");

  render();
  input.focus();
}

function endGame(attemptsMade) {
  isGameOver = true;
  input.disabled = true;
  submitBtn.disabled = true;
  statusEl.textContent = `Победа! Угадано за ${attemptsMade} попыток.`;
  statusEl.classList.add("vault__status--win");
}
form.addEventListener("submit", (event) => {
  event.preventDefault(); // 1. Отменяем перезагрузку страницы

  if (isGameOver) return; // 2. Если игра окончена, ничего не делаем

  const guess = input.value.trim(); // 3. Убираем лишние пробелы
  const validation = validateInput(guess); // 4. Проверяем валидность

  if (!validation.valid) {
    errorMsg.textContent = validation.message;
    errorMsg.classList.add("guess-form__error--visible");
    return; // Прерываем выполнение, если ввод некорректный
  }

  errorMsg.classList.remove("guess-form__error--visible"); // Скрываем прошлую ошибку

  const { bulls, cows } = countBullsAndCows(secretNumber, guess); // Считаем результат
  attempts.push({ guess, bulls, cows }); // Добавляем попытку в массив
  render() // Перерисовываем историю

  input.value = ""; // Очищаем поле ввода
  input.focus(); // Возвращаем фокус

  if (bulls === 4) {
    endGame(attempts.length); // Если угадал все 4 цифры — победа!
  }
});

input.addEventListener("input", () => {
  errorMsg.classList.remove("guess-form__error--visible");
});

newGameBtn.addEventListener("click", startNewGame);

startNewGame();
