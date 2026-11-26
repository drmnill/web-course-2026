import { memo } from 'react'

/**
 * Выпадающий список сортировки. Варианты берутся из конфигурации.
 *
 * @param {Object} props
 * @param {{id: string, label: string}[]} props.sorts — доступные сортировки
 * @param {string} props.current — id выбранной сортировки
 * @param {(id: string) => void} props.onChange — выбрать сортировку
 */
function SortSelect({ sorts, current, onChange }) {
  return (
    <label className="sort">
      <span className="sort__label">Сортировка</span>
      <select
        className="form__select"
        value={current}
        onChange={(event) => onChange(event.target.value)}
      >
        {sorts.map((sort) => (
          <option key={sort.id} value={sort.id}>
            {sort.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default memo(SortSelect)
