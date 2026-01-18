import { createFileRoute } from '@tanstack/react-router'
import { todosQueryOptions, useTodos } from '@/endpoints/todo'
import { TodoList } from '@/features/todo'

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(todosQueryOptions({ order: 'newest' })),
})

function HomePage() {
  const { data: todos } = useTodos({ order: 'newest' })

  return (
    <div className="project-container">
      <h1 className="mb-6 text-2xl font-bold">Todos</h1>

      <ul className="space-y-2">
        <TodoList todos={todos} />
      </ul>
    </div>
  )
}
