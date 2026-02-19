import { createFileRoute } from '@tanstack/react-router'
import { TodoList, useTodos } from '@/features/todo'

export const Route = createFileRoute('/todo/')({
  component: TodoPage,
})

function TodoPage() {
  const { data: todos } = useTodos({ order: 'newest' })

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-6 text-2xl font-bold">Todos</h1>
      <TodoList todos={todos} />
    </div>
  )
}
