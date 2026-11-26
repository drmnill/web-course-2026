// главный файл: загрузка порций, бесконечный скролл и запуск приложения
// (подключается последним, использует функции из config.js, api.js, ui.js, search.js)

// загружает следующую порцию постов
async function loadPosts() {
  if (state.isLoading || !state.hasMore) return;

  state.isLoading = true;
  state.hasError = false;
  hideError();
  setLoader(true);

  try {
    const portion = await fetchPosts(state.posts.length, PAGE_SIZE);
    state.posts.push(...portion);

    // постов больше нет: пришло меньше порции или достигли лимита API
    if (portion.length < PAGE_SIZE || state.posts.length >= MAX_POSTS) {
      state.hasMore = false;
    }
  } catch (error) {
    state.hasError = true;
    showError(error.message);
  } finally {
    state.isLoading = false;
    setLoader(false);
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

window.addEventListener("scroll", checkScroll);
retryBtn.addEventListener("click", loadPosts);

// первая порция при загрузке страницы
loadPosts();