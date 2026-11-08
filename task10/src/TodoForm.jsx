import { useState, memo } from 'react'

/**
 * Форма добавления задачи.
 * @param {(text: string, done: boolean) => void} onAdd - добавить задачу
 */
function TodoForm({ onAdd }) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, done)
    setText('')
    setDone(false)
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Новая задача..."
      />
      <select value={done ? 'done' : 'active'} onChange={(e) => setDone(e.target.value === 'done')}>
        <option value="active">Невыполненная</option>
        <option value="done">Выполненная</option>
      </select>
      <button type="submit">Добавить</button>
    </form>
  )
}

export default memo(TodoForm)
