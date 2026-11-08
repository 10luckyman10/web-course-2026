import { memo } from 'react'
import { SORTS } from './model.js'

/**
 * @param {string} sort - ключ текущей сортировки
 * @param {(key: string) => void} onSortChange
 */
function Sorting({ sort, onSortChange }) {
  return (
    <select value={sort} onChange={(e) => onSortChange(e.target.value)}>
      {Object.entries(SORTS).map(([key, { label }]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  )
}

export default memo(Sorting)
