import { memo, useState } from 'react'

/**
 * Одна задача. Локально хранит только то, что нужно ей одной:
 * включён ли режим редактирования и черновик нового текста.
 * Сами данные задачи и действия приходят из App через props.
 *
 * @param {Object} props
 * @param {{id: string, text: string, completed: boolean}} props.todo — задача
 * @param {(id: string) => void} props.onToggle — переключить выполнение
 * @param {(id: string) => void} props.onDelete — удалить задачу
 * @param {(id: string, text: string) => void} props.onEdit — изменить текст
 */
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)

  function startEditing() {
    setDraft(todo.text)
    setIsEditing(true)
  }

  function saveEditing() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) {
      onEdit(todo.id, trimmed)
    }
    setIsEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') saveEditing()
    if (event.key === 'Escape') setIsEditing(false)
  }

  return (
    <li className={`todo${todo.completed ? ' is-done' : ''}`}>
      <input
        className="todo__check"
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        aria-label="Выполнено"
      />

      {isEditing ? (
        <input
          className="form__input todo__edit"
          type="text"
          value={draft}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={saveEditing}
          aria-label="Изменить текст задачи"
        />
      ) : (
        <span className="todo__text" onDoubleClick={startEditing}>
          {todo.text}
        </span>
      )}

      <div className="todo__actions">
        {!isEditing && (
          <button className="btn btn--ghost" type="button" onClick={startEditing}>
            Изменить
          </button>
        )}
        <button className="btn btn--danger" type="button" onClick={() => onDelete(todo.id)}>
          Удалить
        </button>
      </div>
    </li>
  )
}

export default memo(TodoItem)
