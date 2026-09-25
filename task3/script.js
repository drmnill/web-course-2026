let tasks = []; 
let currentFilter = "all"; 

const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const warning = document.getElementById("task-warning");
const filtersContainer = document.getElementById("filters");
const taskListEl = document.getElementById("task-list");
const counterEl = document.getElementById("counter");

function generateId() {
  return Date.now();
}

function shouldShowTask(task) {
  if (currentFilter === "active") return !task.completed;
  if (currentFilter === "completed") return task.completed;
  return true;
}

function applyFilter() {
  const items = taskListEl.querySelectorAll(".task");
  items.forEach((item) => {
    const taskId = Number(item.dataset.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    item.classList.toggle("task--hidden", !shouldShowTask(task));
  });
}

function render() {
  taskListEl.innerHTML = "";

  tasks.forEach((task) => {
    const taskEl = createTaskElement(task);
    taskListEl.appendChild(taskEl);
  });

  applyFilter();
  updateCounter();
}

function updateCounter() {
  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.filter((task) => task.completed).length;
  counterEl.textContent = `Осталось: ${activeCount}, Выполнено: ${completedCount}`;
}

function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task";
  li.dataset.id = task.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "task__checkbox";
  checkbox.checked = task.completed;
  checkbox.addEventListener("change", () => toggleTask(task.id));

  const text = document.createElement("span");
  text.className = "task__text" + (task.completed ? " completed" : "");
  text.textContent = task.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "task__delete";
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", () => deleteTask(task.id));

  li.append(checkbox, text, deleteBtn);
  return li;
}


function addTask(text) {
  tasks.push({
    id: generateId(),
    text: text,
    completed: false,
  });
  render();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  render();
}
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    warning.classList.add("task-form__warning--visible");
    return;
  }

  warning.classList.remove("task-form__warning--visible");
  addTask(text);
  input.value = "";
  input.focus();
});

input.addEventListener("input", () => {
  if (input.value.trim() !== "") {
    warning.classList.remove("task-form__warning--visible");
  }
});

filtersContainer.addEventListener("click", (event) => {
  const button = event.target.closest(".filters__btn");
  if (!button) return;

  currentFilter = button.dataset.filter;

  document
    .querySelectorAll(".filters__btn")
    .forEach((btn) => btn.classList.remove("filters__btn--active"));
  button.classList.add("filters__btn--active");

  applyFilter();
});

render();
