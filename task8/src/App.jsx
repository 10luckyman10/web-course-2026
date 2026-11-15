import TodoForm from './TodoForm.jsx'
import Filters from './Filters.jsx'
import Sorting from './Sorting.jsx'
import Stats from './Stats.jsx'
import TodoList from './TodoList.jsx'
import { useTodoController } from './controller.js'

export default function App() {
  const {
    visibleTodos,
    stats,
    filter,
    sort,
    setFilter,
    setSort,
    handleAdd,
    handleToggle,
    handleDelete,
  } = useTodoController()

  return (
    <div className="app">
      <h1>Список задач</h1>
      <TodoForm onAdd={handleAdd} />
      <Stats total={stats.total} active={stats.active} done={stats.done} />
      <div className="controls">
        <Filters filter={filter} onFilterChange={setFilter} />
        <Sorting sort={sort} onSortChange={setSort} />
      </div>
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </div>
  )
}
