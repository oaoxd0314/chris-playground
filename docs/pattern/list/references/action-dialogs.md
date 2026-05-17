# Action Dialogs Pattern

> Imperative dialog（confirm / input / type-to-confirm）與 Overlays（自訂 dialog）模式。
> 回到 [README](../README.md)，或精簡版見 [patterns.md → Action Dialogs](../patterns.md#action-dialogs)。

---

## Built-in Imperative Dialogs

For simple confirm/input dialogs, use the existing APIs (already available in `@alison-ui/react`):

```tsx
// Already mounted in AppProvider - just import and use
import { confirmDialog } from '@alison-ui/react/confirm-dialog'
import { inputDialog } from '@alison-ui/react/input-dialog'
import { typeToConfirmDialog } from '@alison-ui/react/type-to-confirm-dialog'
```

### Example Usage

```tsx
export function createColumns({ onDelete }: CreateColumnsOptions) {
  return [
    // ... other columns

    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item
              onClick={() => {
                confirmDialog({
                  title: 'Delete Container',
                  description: `Are you sure you want to delete "${row.original.name}"? This action cannot be undone.`,
                  confirmText: 'Delete',
                  confirmVariant: 'destructive',
                  onConfirm: async () => {
                    await onDelete(row.original.id)
                  },
                })
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={() => {
                inputDialog({
                  title: 'Rename Container',
                  description: 'Enter a new name for the container.',
                  defaultValue: row.original.name,
                  placeholder: 'Container name',
                  onConfirm: async newName => {
                    await renameContainer(row.original.id, newName)
                  },
                })
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Rename
            </DropdownMenu.Item>

            <DropdownMenu.Item
              onClick={() => {
                typeToConfirmDialog({
                  title: 'Terminate Container',
                  description:
                    'This will permanently delete the container and all its data.',
                  confirmText: row.original.name, // User must type the container name
                  onConfirm: async () => {
                    await terminateContainer(row.original.id)
                  },
                })
              }}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Terminate
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      ),
    }),
  ]
}
```

---

## Custom Dialogs (Overlays Pattern)

For complex dialogs with custom UI (edit forms, detail views, multi-step wizards), use the **Overlays** pattern:

```tsx
import { openOverlay } from '@alison-ui/react/overlay'
import { EditContainerDialog } from './edit-container-dialog'

// In columns - open any custom dialog
columnHelper.display({
  id: 'actions',
  cell: ({ row }) => (
    <DropdownMenu.Item
      onClick={() => {
        openOverlay(EditContainerDialog, {
          container: row.original,
          onSuccess: refetch,
        })
      }}
    >
      Edit
    </DropdownMenu.Item>
  ),
})
```

### Dialog Component Requirements

Custom dialog components must accept `open` and `onOpenChange` props:

```tsx
import { Dialog } from '@alison-ui/react/dialog'

interface EditContainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  container: ContainerWithSpec
  onSuccess?: () => void
}

export function EditContainerDialog({
  open,
  onOpenChange,
  container,
  onSuccess,
}: EditContainerDialogProps) {
  const handleSubmit = async (data: FormData) => {
    await updateContainer(container.id, data)
    onOpenChange(false) // Close dialog
    onSuccess?.()
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Edit Container</Dialog.Title>
        </Dialog.Header>
        {/* Form content */}
      </Dialog.Content>
    </Dialog.Root>
  )
}
```

**Setup:** `<Overlays />` is already mounted in `AppProvider`.

---

## Dialog Pattern Summary

| Dialog Type           | When to Use                       | Import From                               |
| --------------------- | --------------------------------- | ----------------------------------------- |
| `confirmDialog`       | Simple yes/no confirmation        | `@alison-ui/react/confirm-dialog`         |
| `inputDialog`         | Single text input (rename, etc.)  | `@alison-ui/react/input-dialog`           |
| `typeToConfirmDialog` | Dangerous action, type to confirm | `@alison-ui/react/type-to-confirm-dialog` |
| `openOverlay`         | Custom UI, forms, complex dialogs | `@alison-ui/react/overlay`                |
