// настройки
const API_URL = "https://jsonplaceholder.typicode.com/posts";
const PAGE_SIZE = 10;        // сколько постов подгружаем за раз
const MAX_POSTS = 100;       // всего постов в API
const SCROLL_OFFSET = 200;   // за сколько пикселей до конца страницы начинаем подгрузку
const DEBOUNCE_MS = 300;     // задержка перед применением фильтра

// состояние
const state = {
  posts: [],        // все загруженные посты (общий массив)
  query: "",        // текущая строка поиска в нижнем регистре
  isLoading: false, // идёт ли запрос прямо сейчас
  hasMore: true,    // есть ли ещё посты на сервере
  hasError: false,  // последняя загрузка закончилась ошибкой
};

let debounceTimer = null;

// элементы страницы
const postsEl = document.getElementById("posts");
const searchEl = document.getElementById("search");
const emptyEl = document.getElementById("empty");
const loaderEl = document.getElementById("loader");
const errorEl = document.getElementById("error");
const errorTextEl = document.getElementById("error-text");
const retryBtn = document.getElementById("retry-btn");
const endEl = document.getElementById("end");

// создаёт карточку одного поста
function createPostCard(post) {
  const card = document.createElement("article");
  card.className = "post";

  const author = document.createElement("span");
  author.className = "post__author";
  author.textContent = `Автор #${post.userId}`;

  const title = document.createElement("h2");
  title.className = "post__title";
  title.textContent = post.title;

  const body = document.createElement("p");
  body.className = "post__body";
  body.textContent = post.body;

  card.append(author, title, body);
  return card;
}

// возвращает посты, у которых title содержит строку поиска (без учёта регистра)
function getVisiblePosts() {
  if (!state.query) return state.posts;
  return state.posts.filter((post) => post.title.toLowerCase().includes(state.query));
}

// перерисовывает ленту по массиву state.posts и текущему фильтру
function render() {
  const visible = getVisiblePosts();

  postsEl.innerHTML = "";
  visible.forEach((post) => postsEl.appendChild(createPostCard(post)));

  emptyEl.hidden = !(state.query && visible.length === 0);
  endEl.hidden = state.hasMore;
}

function showError(message) {
  errorTextEl.textContent = message;
  errorEl.hidden = false;
}

// загружает следующую порцию постов
async function loadPosts() {
  if (state.isLoading || !state.hasMore) return;

  state.isLoading = true;
  state.hasError = false;
  errorEl.hidden = true;
  loaderEl.hidden = false;

  try {
    const url = `${API_URL}?_start=${state.posts.length}&_limit=${PAGE_SIZE}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Сервер ответил с ошибкой ${response.status}`);
    }

    const portion = await response.json();
    state.posts.push(...portion);

    // постов больше нет: пришло меньше порции или достигли лимита API
    if (portion.length < PAGE_SIZE || state.posts.length >= MAX_POSTS) {
      state.hasMore = false;
    }
  } catch (error) {
    state.hasError = true;
    showError("Не удалось загрузить посты. Проверьте интернет и попробуйте ещё раз.");
  } finally {
    state.isLoading = false;
    loaderEl.hidden = true;
  }

  render();
  checkScroll(); // вдруг экран ещё не заполнен и надо подгрузить дальше
}

// подгружает посты, если пользователь долистал почти до конца страницы
function checkScroll() {
  if (state.query) return;     // при поиске подгрузку не запускаем
  if (state.hasError) return;  // после ошибки ждём нажатия «Повторить»

  const scrolled = window.innerHeight + window.scrollY;
  const pageHeight = document.documentElement.scrollHeight;

  if (scrolled >= pageHeight - SCROLL_OFFSET) {
    loadPosts();
  }
}

// применяет фильтр по заголовку (запросов к серверу нет, работаем с массивом)
function applyFilter() {
  state.query = searchEl.value.trim().toLowerCase();
  render();
  checkScroll(); // если поиск очистили, а экран не заполнен — догружаем
}

// дебаунс: фильтр применяется через 300 мс после последнего символа
searchEl.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilter, DEBOUNCE_MS);
});

window.addEventListener("scroll", checkScroll);
retryBtn.addEventListener("click", loadPosts);

// первая порция при загрузке страницы
loadPosts();
