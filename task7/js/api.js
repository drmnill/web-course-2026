// работа с сервером: только запрос и проверка ответа

// загружает порцию постов, при любой проблеме бросает ошибку с понятным текстом
async function fetchPosts(start, limit) {
  const url = `${API_URL}?_start=${start}&_limit=${limit}`;
  let response;

  try {
    response = await fetch(url);
  } catch (error) {
    // fetch отклоняется только при сбое сети
    throw new Error("Нет соединения с сервером. Проверьте интернет.");
  }

  // ответ 404, 500 и подобные fetch ошибкой не считает, проверяем сами
  if (!response.ok) {
    throw new Error(`Сервер вернул ошибку ${response.status}.`);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error("Сервер вернул некорректные данные.");
  }
}