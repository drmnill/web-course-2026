import { memo } from 'react'

/**
 * Счётчики задач.
 *
 * @param {Object} props
 * @param {{total: number, active: number, completed: number}} props.stats — количества задач
 */
function Stats({ stats }) {
  return (
    <ul className="stats">
      <li className="stats__item">
        Всего: <strong>{stats.total}</strong>
      </li>
      <li className="stats__item">
        Активных: <strong>{stats.active}</strong>
      </li>
      <li className="stats__item">
        Выполнено: <strong>{stats.completed}</strong>
      </li>
    </ul>
  )
}

export default memo(Stats)
