import { useState } from 'react'
import { PlusIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateTodo } from '../hooks'

export function TodoForm({ onCancel }: { onCancel?: () => void }) {
  const [value, setValue] = useState('')
  const createTodo = useCreateTodo()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!value.trim()) return
    createTodo.mutate(value, {
      onSuccess: () => {
        setValue('')
        onCancel?.()
      },
    })
  }

  return (
    <li className="flex items-center gap-3 rounded border p-3">
      <form className="flex flex-1 items-center gap-3" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="What needs to be done?"
          value={value}
          onChange={e => setValue(e.target.value)}
          autoFocus
        />
        <div className="flex gap-1">
          <Button type="submit" size="icon" disabled={createTodo.isPending}>
            <PlusIcon className="size-4" />
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={onCancel}
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </li>
  )
}
