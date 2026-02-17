import { useState } from 'react'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Todo } from '../types'
import { TodoForm } from './todo-form'
import { TodoItem } from './todo-item'

export const TodoList = ({ todos }: { todos: Array<Todo> }) => {
  const [isTodoFormOpen, setIsTodoFormOpen] = useState(false)

  return (
    <ul className="space-y-2">
      {isTodoFormOpen ? (
        <TodoForm onCancel={() => setIsTodoFormOpen(false)} />
      ) : (
        <div className="flex h-[62px] items-center justify-end">
          <Button
            className="cursor-pointer"
            size="icon"
            variant="ghost"
            onClick={() => setIsTodoFormOpen(true)}
          >
            <PlusIcon className="size-4" />
          </Button>
        </div>
      )}

      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  )
}
