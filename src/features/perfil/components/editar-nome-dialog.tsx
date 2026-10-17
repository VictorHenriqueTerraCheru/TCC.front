import { useState } from 'react'

import { CampoTexto } from '@/common/components/campo-texto'
import { Button } from '@/common/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/common/ui/dialog'
import { useAtualizarNome } from '@/features/usuarios'
import { isApiError } from '@/infrastructure/api'

interface EditarNomeDialogProps {
  nomeAtual: string
  aberto: boolean
  aoMudarAberto(aberto: boolean): void
}

/** PATCH /me: nome de 1 a 120 caracteres (espaços nas pontas são removidos pela API). */
export function EditarNomeDialog({ nomeAtual, aberto, aoMudarAberto }: EditarNomeDialogProps) {
  const [nome, setNome] = useState(nomeAtual)
  const atualizar = useAtualizarNome()
  const invalido = nome.trim().length === 0 || nome.trim().length > 120
  const erroApi = isApiError(atualizar.error) ? atualizar.error.erroDoCampo('nome') : undefined

  return (
    <Dialog
      open={aberto}
      onOpenChange={(abrir) => {
        if (abrir) setNome(nomeAtual)
        aoMudarAberto(abrir)
      }}
    >
      <DialogContent showCloseButton={false}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!invalido) atualizar.mutate(nome.trim(), { onSuccess: () => aoMudarAberto(false) })
          }}
          className="space-y-6"
        >
          <DialogHeader>
            <DialogTitle>Editar nome</DialogTitle>
          </DialogHeader>
          <CampoTexto
            rotulo="Nome"
            value={nome}
            maxLength={120}
            autoComplete="name"
            onChange={(e) => setNome(e.target.value)}
            erro={
              erroApi ?? (atualizar.isError ? 'Não foi possível salvar. Tente de novo.' : undefined)
            }
            autoFocus
          />
          <DialogFooter className="flex-row justify-end">
            <Button type="button" variant="ghost" onClick={() => aoMudarAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={invalido || atualizar.isPending}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
