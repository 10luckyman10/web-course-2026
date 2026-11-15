import { memo } from 'react'

/**
 * Счётчики задач.
 * @param {number} total - всего
 * @param {number} active - невыполненных
 * @param {number} done - выполненных
 */
function Stats({ total, active, done }) {
  return (
    <div className="stats">
      Всего: <b>{total}</b> · Осталось: <b>{active}</b> · Выполнено: <b>{done}</b>
    </div>
  )
}

export default memo(Stats)
