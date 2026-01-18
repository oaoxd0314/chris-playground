import { useState } from 'react'
import { cva } from 'class-variance-authority'
import {
  CheckIcon,
  PencilIcon,
  SaveIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDeleteTodo, useToggleTodo, useUpdateTodo } from '@/endpoints/todo'
import type { Todo } from '.'

export const todoItemClass = cva('flex items-center gap-3 rounded border p-3', {
  variants: {
    completed: {
      true: 'bg-muted/50 opacity-60',
      false: '',
    },
  },
})

export function TodoItem({ todo }: { todo: Todo }) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.name)

  const { mutate: updateTodo, isPending: isUpdating } = useUpdateTodo()
  const { mutate: toggleTodo, isPending: isToggling } = useToggleTodo()
  const { mutate: deleteTodo, isPending: isDeleting } = useDeleteTodo()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editValue.trim()) return
    updateTodo(
      { id: todo.id, name: editValue },
      { onSuccess: () => setIsEditing(false) }
    )
  }

  const handleToggle = () => {
    toggleTodo({ id: todo.id, isCompleted: !todo.isCompleted })
  }

  const handleDelete = () => {
    deleteTodo(todo.id)
  }

  const handleCancel = () => {
    setEditValue(todo.name)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <li className={todoItemClass({ completed: todo.isCompleted })}>
        <form
          className="flex flex-1 items-center gap-3"
          onSubmit={handleSubmit}
        >
          <Input
            type="text"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            autoFocus
          />
          <div className="flex gap-1">
            <Button type="submit" size="icon" disabled={isUpdating}>
              <SaveIcon className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCancel}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className={todoItemClass({ completed: todo.isCompleted })}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex size-5 shrink-0 items-center justify-center rounded border"
        disabled={isToggling}
      >
        {todo.isCompleted && <CheckIcon className="size-3" />}
      </button>
      <span className={todo.isCompleted ? 'flex-1 line-through' : 'flex-1'}>
        {todo.name}
      </span>
      <div className="flex gap-1">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
          <PencilIcon className="size-4" />
        </Button>
        <Button
          variant="ghost"
          className="cursor-pointer"
          size="icon"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2Icon className="size-4" />
        </Button>
      </div>
    </li>
  )
}
