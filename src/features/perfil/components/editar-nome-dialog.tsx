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

export function EditarNomeDialog({ nomeAtual, aberto, aoMudarAberto }: EditarNomeDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent showCloseButton={false}>
        <FormularioNome nomeAtual={nomeAtual} aoFechar={() => aoMudarAberto(false)} />
      </DialogContent>
    </Dialog>
  )
}

function FormularioNome({ nomeAtual, aoFechar }: { nomeAtual: string; aoFechar(): void }) {
  const [nome, setNome] = useState(nomeAtual)
  const atualizar = useAtualizarNome()
  const invalido = nome.trim().length === 0 || nome.trim().length > 120
  const erroApi = isApiError(atualizar.error) ? atualizar.error.erroDoCampo('name') : undefined

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!invalido) atualizar.mutate(nome.trim(), { onSuccess: aoFechar })
      }}
      className="space-y-6"
    >
      <DialogHeader>
        <DialogTitle>Editar nome</DialogTitle>
      </DialogHeader>
      <CampoTexto
        label="Nome"
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
        <Button type="button" variant="ghost" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={invalido || atualizar.isPending}>
          Salvar
        </Button>
      </DialogFooter>
    </form>
  )
}
