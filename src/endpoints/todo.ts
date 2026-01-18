import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import type { TodoOrder } from '@/server/functions/todos/schema'
import {
  createTodoFn,
  deleteTodoFn,
  getTodosFn,
  toggleTodoFn,
  updateTodoFn,
} from '@/server/functions/todos'

type TodosOptions = {
  order?: TodoOrder
}

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
    queryFn: () => getTodosFn(),
    select: data =>
      options?.order ? [...data].sort(sortByCreatedAt(options.order)) : data,
  })

export function useTodos(options?: TodosOptions) {
  return useSuspenseQuery(todosQueryOptions(options))
}

export function useCreateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => createTodoFn({ data: { name } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: number; name: string }) => updateTodoFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useToggleTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { id: number; isCompleted: boolean }) =>
      toggleTodoFn({ data }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export function useDeleteTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTodoFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}
