// Настройки приложения: чтобы добавить новый фильтр или сортировку,
// достаточно дописать один объект в соответствующий массив. Остальной код менять не нужно.

/** Ключ, под которым список задач хранится в localStorage */
export const STORAGE_KEY = 'todo-react:todos'

/** Адрес для необязательной загрузки задач с сервера */
export const SERVER_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=5'

/**
 * Фильтры списка.
 * predicate(todo) возвращает true, если задачу нужно показать.
 */
export const FILTERS = [
  { id: 'all', label: 'Все', predicate: () => true },
  { id: 'active', label: 'Активные', predicate: (todo) => !todo.completed },
  { id: 'completed', label: 'Выполненные', predicate: (todo) => todo.completed },
]

/**
 * Сортировки списка.
 * compare(a, b) — обычная функция сравнения для Array.prototype.sort.
 */
export const SORTS = [
  { id: 'new', label: 'Сначала новые', compare: (a, b) => b.createdAt - a.createdAt },
  { id: 'old', label: 'Сначала старые', compare: (a, b) => a.createdAt - b.createdAt },
  { id: 'az', label: 'По алфавиту А→Я', compare: (a, b) => a.text.localeCompare(b.text, 'ru') },
  { id: 'za', label: 'По алфавиту Я→А', compare: (a, b) => b.text.localeCompare(a.text, 'ru') },
]

export const DEFAULT_FILTER = 'all'
export const DEFAULT_SORT = 'new'
