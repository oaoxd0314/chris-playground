import { createFileRoute } from '@tanstack/react-router'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { TodoList, useTodos } from '@/features/todo'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  // const { data: todos } = useTodos({ order: 'newest' })

  return (
    <div className="project-container">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Todos</h1>
        <ThemeToggle />
      </div>

      <ul className="space-y-2">{/* <TodoList todos={todos} /> */}</ul>
    </div>
  )
}
