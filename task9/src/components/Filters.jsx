import { memo } from 'react'

/**
 * Кнопки фильтров. Список кнопок берётся из конфигурации,
 * поэтому новый фильтр появляется без изменения этого компонента.
 *
 * @param {Object} props
 * @param {{id: string, label: string}[]} props.filters — доступные фильтры
 * @param {string} props.current — id выбранного фильтра
 * @param {(id: string) => void} props.onChange — выбрать фильтр
 */
function Filters({ filters, current, onChange }) {
  return (
    <div className="filters" role="group" aria-label="Фильтры">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          className={`btn btn--chip${filter.id === current ? ' is-active' : ''}`}
          onClick={() => onChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}

export default memo(Filters)
