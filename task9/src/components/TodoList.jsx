import { memo } from 'react'
import TodoItem from './TodoItem.jsx'

/**
 * Список задач. Если задач нет, показывает подсказку.
 *
 * @param {Object} props
 * @param {{id: string, text: string, completed: boolean}[]} props.todos — задачи для показа
 * @param {(id: string) => void} props.onToggle — переключить выполнение
 * @param {(id: string) => void} props.onDelete — удалить задачу
 * @param {(id: string, text: string) => void} props.onEdit — изменить текст
 */
function TodoList({ todos, onToggle, onDelete, onEdit }) {
  if (todos.length === 0) {
    return <p className="empty">Задач нет</p>
  }

  return (
    <ul className="list">
      {todos.map((todo) => (
        // key — стабильный id задачи, а не индекс в массиве
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  )
}

export default memo(TodoList)
