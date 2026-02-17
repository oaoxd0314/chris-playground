import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type { Todo } from '../types'

export type TodoOrder = 'newest' | 'oldest'

type TodosOptions = {
  order?: TodoOrder
}

let todos: Array<Todo> = []
let nextId = 1

export const todoKeys = {
  all: (options?: TodosOptions) => ['todos', options] as const,
  detail: (id: number) => ['todos', id] as const,
}

const sortByCreatedAt = (order: TodoOrder) => {
  const direction = order === 'newest' ? -1 : 1
  return (a: { createdAt: Date }, b: { createdAt: Date }) =>
    direction * (a.createdAt.getTime() - b.createdAt.getTime())
}

export const todosQueryOptions = (options?: TodosOptions) =>
  queryOptions({
    queryKey: todoKeys.all(options),
    queryFn: () => todos,
    select: data =>
      options?.order ? [...data].sort(sortByCreatedAt(options.order)) : data,
  })

export function useTodos(options?: TodosOptions) {
  return useSuspenseQuery(todosQueryOptions(options))
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => {
      const newTodo: Todo = {
        id: nextId++,
        name,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      todos = [...todos, newTodo]
      return newTodo
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: number; name: string }) => {
      todos = todos.map(t =>
        t.id === data.id ? { ...t, name: data.name, updatedAt: new Date() } : t
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: number; isCompleted: boolean }) => {
      todos = todos.map(t =>
        t.id === data.id
          ? { ...t, isCompleted: data.isCompleted, updatedAt: new Date() }
          : t
      )
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => {
      todos = todos.filter(t => t.id !== id)
      return id
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}
