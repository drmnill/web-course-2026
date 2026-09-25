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

function getFilteredTasks() {
  if (currentFilter === "active") {
    return tasks.filter((task) => !task.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter((task) => task.completed);
  }
  return tasks;
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

  const text = document.createElement("span");
  text.className = "task__text" + (task.completed ? " completed" : "");
  text.textContent = task.text;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "task__delete";
  deleteBtn.textContent = "✕";

  li.append(checkbox, text, deleteBtn);
  return li;
}

function render() {
  taskListEl.innerHTML = "";

  const visibleTasks = getFilteredTasks();

  visibleTasks.forEach((task) => {
    const taskEl = createTaskElement(task);
    taskListEl.appendChild(taskEl);
  });

  updateCounter();
}

render();
