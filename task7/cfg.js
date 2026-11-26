// настройки и общее состояние приложения

const API_URL = "https://jsonplaceholder.typicode.com/posts";
const PAGE_SIZE = 10;        // сколько постов подгружаем за раз
const MAX_POSTS = 100;       // всего постов в API
const SCROLL_OFFSET = 200;   // за сколько пикселей до конца страницы начинаем подгрузку
const DEBOUNCE_MS = 300;     // задержка перед применением фильтра

const state = {
  posts: [],        // все загруженные посты (общий массив)
  query: "",        // текущая строка поиска в нижнем регистре
  isLoading: false, // идёт ли запрос прямо сейчас
  hasMore: true,    // есть ли ещё посты на сервере
  hasError: false,  // последняя загрузка закончилась ошибкой
};