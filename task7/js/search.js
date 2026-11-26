// поиск по загруженным постам с дебаунсом

let debounceTimer = null;

// применяет фильтр по заголовку (запросов к серверу нет, работаем с массивом)
function applyFilter() {
  state.query = searchEl.value.trim().toLowerCase();
  render();
  checkScroll(); // если поиск очистили, а экран не заполнен, догружаем
}

// дебаунс: фильтр применяется через 300 мс после последнего символа
searchEl.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilter, DEBOUNCE_MS);
});