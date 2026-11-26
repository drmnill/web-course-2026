import { memo, useState } from 'react'

/**
 * Форма добавления задачи: поле ввода, выбор типа и кнопка.
 * Текст хранится здесь, в локальном состоянии, поэтому при вводе
 * перерисовывается только форма, а не весь список.
 *
 * @param {Object} props
 * @param {(text: string, completed: boolean) => void} props.onAdd — добавить задачу
 */
function TodoForm({ onAdd }) {
  const [text, setText] = useState('')
  const [completed, setCompleted] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return // пустые задачи не добавляем

    onAdd(trimmed, completed)
    setText('')
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        className="form__input"
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Что нужно сделать?"
        aria-label="Текст задачи"
      />
      <select
        className="form__select"
        value={completed ? 'done' : 'todo'}
        onChange={(event) => setCompleted(event.target.value === 'done')}
        aria-label="Тип задачи"
      >
        <option value="todo">Невыполненная</option>
        <option value="done">Выполненная</option>
      </select>
      <button className="btn btn--primary" type="submit">
        Добавить
      </button>
    </form>
  )
}

export default memo(TodoForm)
