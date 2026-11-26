import { useCallback, useEffect, useMemo, useState } from 'react'
import TodoForm from './components/TodoForm.jsx'
import Filters from './components/Filters.jsx'
import SortSelect from './components/SortSelect.jsx'
import Stats from './components/Stats.jsx'
import TodoList from './components/TodoList.jsx'
import {
  DEFAULT_FILTER,
  DEFAULT_SORT,
  FILTERS,
  SERVER_URL,
  SORTS,
  STORAGE_KEY,
} from './constants.js'

/** Создаёт уникальный id для новой задачи */
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Читает сохранённые задачи из localStorage (при ошибке возвращает пустой список) */
function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

function App() {
  // все задачи хранятся здесь и передаются вниз через props;
  // функция в useState выполнится один раз и восстановит список при запуске
  const [todos, setTodos] = useState(loadTodos)
  const [filterId, setFilterId] = useState(DEFAULT_FILTER)
  const [sortId, setSortId] = useState(DEFAULT_SORT)
  const [serverStatus, setServerStatus] = useState('idle') // idle | loading | error

  // сохраняем список при каждом его изменении
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // хранилище недоступно (например, приватный режим), приложение работает и без него
    }
  }, [todos])

  // обработчики обёрнуты в useCallback, чтобы ссылки на них не менялись
  // и memo-компоненты не перерисовывались зря
  const addTodo = useCallback((text, completed) => {
    setTodos((prev) => [...prev, { id: createId(), text, completed, createdAt: Date.now() }])
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }, [])

  const editTodo = useCallback((id, text) => {
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, text } : todo)))
  }, [])

  // необязательная загрузка задач с jsonplaceholder
  const importFromServer = useCallback(async () => {
    setServerStatus('loading')
    try {
      const response = await fetch(SERVER_URL)
      if (!response.ok) throw new Error(`Ошибка ${response.status}`)
      const data = await response.json()

      setTodos((prev) => {
        const known = new Set(prev.map((todo) => todo.id))
        const now = Date.now()
        const imported = data
          .map((item, index) => ({
            id: `server-${item.id}`,
            text: item.title,
            completed: item.completed,
            createdAt: now + index,
          }))
          .filter((todo) => !known.has(todo.id)) // повторный импорт не создаёт дубли
        return [...prev, ...imported]
      })
      setServerStatus('idle')
    } catch {
      setServerStatus('error')
    }
  }, [])

  // список для показа: копия массива, фильтр, затем сортировка.
  // [...todos] нужен, чтобы sort не менял исходный массив
  const visibleTodos = useMemo(() => {
    const filter = FILTERS.find((item) => item.id === filterId)
    const sort = SORTS.find((item) => item.id === sortId)
    return [...todos].filter(filter.predicate).sort(sort.compare)
  }, [todos, filterId, sortId])

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length
    return { total: todos.length, active: todos.length - completed, completed }
  }, [todos])

  return (
    <main className="app">
      <h1 className="app__title">Мои задачи</h1>

      <TodoForm onAdd={addTodo} />

      <div className="toolbar">
        <Filters filters={FILTERS} current={filterId} onChange={setFilterId} />
        <SortSelect sorts={SORTS} current={sortId} onChange={setSortId} />
      </div>

      <Stats stats={stats} />

      <TodoList
        todos={visibleTodos}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onEdit={editTodo}
      />

      <div className="server">
        <button
          className="btn btn--ghost"
          type="button"
          onClick={importFromServer}
          disabled={serverStatus === 'loading'}
        >
          {serverStatus === 'loading' ? 'Загрузка…' : 'Загрузить задачи с сервера'}
        </button>
        {serverStatus === 'error' && (
          <p className="server__error">Не удалось загрузить задачи. Попробуйте ещё раз.</p>
        )}
      </div>
    </main>
  )
}

export default App
