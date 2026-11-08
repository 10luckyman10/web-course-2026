import { memo } from 'react'
import TodoItem from './TodoItem.jsx'

/**
 * Список задач.
 * @param {Array} todos - задачи для показа (уже отфильтрованные и отсортированные)
 * @param {(id: string) => void} onToggle
 * @param {(id: string) => void} onDelete
 */
function TodoList({ todos, onToggle, onDelete }) {
  if (todos.length === 0) {
    return <p className="empty">Задач нет</p>
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

export default memo(TodoList)
