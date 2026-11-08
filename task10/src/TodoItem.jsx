import { memo } from 'react'

/**
 * Одна задача.
 * @param {{id: string, text: string, done: boolean, createdAt: number}} todo
 * @param {(id: string) => void} onToggle - переключить выполнение
 * @param {(id: string) => void} onDelete - удалить задачу
 */
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={todo.done ? 'todo done' : 'todo'}>
      <input type="checkbox" checked={todo.done} onChange={() => onToggle(todo.id)} />
      <span className="text">{todo.text}</span>
      <button className="delete" onClick={() => onDelete(todo.id)}>
        ✕
      </button>
    </li>
  )
}

export default memo(TodoItem)
