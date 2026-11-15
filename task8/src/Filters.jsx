import { memo } from 'react'
import { FILTERS } from './model.js'

/**
 * @param {string} filter - ключ текущего фильтра
 * @param {(key: string) => void} onFilterChange
 */
function Filters({ filter, onFilterChange }) {
  return (
    <div className="filter-buttons">
      {Object.entries(FILTERS).map(([key, { label }]) => (
        <button
          key={key}
          className={key === filter ? 'active' : ''}
          onClick={() => onFilterChange(key)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default memo(Filters)
