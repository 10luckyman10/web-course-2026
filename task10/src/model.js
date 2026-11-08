const STORAGE_KEY = 'todos'

export const FILTERS = {
  all: { label: 'Все', test: () => true },
  active: { label: 'Невыполненные', test: (todo) => !todo.done },
  done: { label: 'Выполненные', test: (todo) => todo.done },
}

export const SORTS = {
  newFirst: { label: 'Сначала новые', compare: (a, b) => b.createdAt - a.createdAt },
  oldFirst: { label: 'Сначала старые', compare: (a, b) => a.createdAt - b.createdAt },
  az: { label: 'По алфавиту (А→Я)', compare: (a, b) => a.text.localeCompare(b.text) },
  za: { label: 'По алфавиту (Я→А)', compare: (a, b) => b.text.localeCompare(a.text) },
}

export function createTodo(text, done) {
  return { id: crypto.randomUUID(), text, done, createdAt: Date.now() }
}

export function addTodo(todos, text, done) {
  return [...todos, createTodo(text, done)]
}

export function toggleTodo(todos, id) {
  return todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
}

export function removeTodo(todos, id) {
  return todos.filter((todo) => todo.id !== id)
}

export function getVisibleTodos(todos, filterKey, sortKey) {
  const filtered = todos.filter(FILTERS[filterKey].test)
  return [...filtered].sort(SORTS[sortKey].compare)
}

export function getStats(todos) {
  const done = todos.filter((t) => t.done).length
  return { total: todos.length, done, active: todos.length - done }
}

export function loadTodos() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}
