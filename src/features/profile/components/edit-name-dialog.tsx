import { useState } from 'react'

import { TextField } from '@/common/components/text-field'
import { Button } from '@/common/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/common/ui/dialog'
import { useUpdateName } from '@/features/users'
import { isApiError } from '@/infrastructure/api'

interface EditNameDialogProps {
  currentName: string
  open: boolean
  onOpenChange(open: boolean): void
}

export function EditNameDialog({ currentName, open, onOpenChange }: EditNameDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <NameForm currentName={currentName} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}

function NameForm({ currentName, onClose }: { currentName: string; onClose(): void }) {
  const [name, setNome] = useState(currentName)
  const update = useUpdateName()
  const invalid = name.trim().length === 0 || name.trim().length > 120
  const apiError = isApiError(update.error) ? update.error.fieldError('name') : undefined

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!invalid) update.mutate(name.trim(), { onSuccess: onClose })
      }}
      className="space-y-6"
    >
      <DialogHeader>
        <DialogTitle>Editar nome</DialogTitle>
      </DialogHeader>
      <TextField
        label="Nome"
        value={name}
        maxLength={120}
        autoComplete="name"
        onChange={(e) => setNome(e.target.value)}
        error={apiError ?? (update.isError ? 'Não foi possível salvar. Tente de novo.' : undefined)}
        autoFocus
      />
      <DialogFooter className="flex-row justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={invalid || update.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  )
}
