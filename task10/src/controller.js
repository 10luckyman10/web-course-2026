import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  loadTodos,
  saveTodos,
  addTodo,
  toggleTodo,
  removeTodo,
  getVisibleTodos,
  getStats,
} from './model.js'

export function useTodoController() {
  const [todos, setTodos] = useState(loadTodos)
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('newFirst')

  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  const handleAdd = useCallback((text, done) => {
    setTodos((prev) => addTodo(prev, text, done))
  }, [])

  const handleToggle = useCallback((id) => {
    setTodos((prev) => toggleTodo(prev, id))
  }, [])

  const handleDelete = useCallback((id) => {
    setTodos((prev) => removeTodo(prev, id))
  }, [])

  const visibleTodos = useMemo(() => getVisibleTodos(todos, filter, sort), [todos, filter, sort])
  const stats = useMemo(() => getStats(todos), [todos])

  return {
    visibleTodos,
    stats,
    filter,
    sort,
    setFilter,
    setSort,
    handleAdd,
    handleToggle,
    handleDelete,
  }
}
