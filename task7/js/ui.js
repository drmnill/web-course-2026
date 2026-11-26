// всё, что связано с отображением: элементы страницы и отрисовка

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

// показывает или прячет индикатор загрузки
function setLoader(visible) {
  loaderEl.hidden = !visible;
}

// показывает блок с ошибкой
function showError(message) {
  errorTextEl.textContent = message;
  errorEl.hidden = false;
}

// прячет блок с ошибкой
function hideError() {
  errorEl.hidden = true;
}