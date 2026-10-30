import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'
import { Button } from '@/common/ui/button'

import type { LocationStatus } from '../stores/localizacao-store'

interface LocationHelpDialogProps {
  open: boolean
  onOpenChange(open: boolean): void
  state: LocationStatus
}

export function LocationHelpDialog({ open, onOpenChange, state }: LocationHelpDialogProps) {
  const unavailable = state === 'unavailable'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Como liberar a localização</DialogTitle>
          <DialogDescription>
            {unavailable
              ? 'Este navegador não oferece a localização nesta página. Ela só funciona em conexão segura (https).'
              : 'O navegador não pergunta de novo depois que a permissão é negada. Para liberar:'}
          </DialogDescription>
        </DialogHeader>
        {!unavailable && (
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>Toque no cadeado (ou no ícone de ajustes) ao lado do endereço do site.</li>
            <li>Abra Permissões ou Configurações do site.</li>
            <li>Em Localização, escolha Permitir.</li>
            <li>Recarregue a página.</li>
          </ol>
        )}
        <p className="text-sm text-muted-foreground">
          Sem localização você continua votando, com peso base.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
