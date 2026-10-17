import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'
import { Button } from '@/common/ui/button'

import type { EstadoLocalizacao } from '../stores/localizacao-store'

interface AjudaLocalizacaoDialogProps {
  aberto: boolean
  aoMudarAberto(aberto: boolean): void
  estado: EstadoLocalizacao
}

/**
 * "Como liberar a localização": o navegador não reabre o pedido depois de negado (regra 2),
 * então o caminho é a permissão do site na barra de endereço.
 */
export function AjudaLocalizacaoDialog({
  aberto,
  aoMudarAberto,
  estado,
}: AjudaLocalizacaoDialogProps) {
  const indisponivel = estado === 'indisponivel'
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Como liberar a localização</DialogTitle>
          <DialogDescription>
            {indisponivel
              ? 'Este navegador não oferece a localização nesta página. Ela só funciona em conexão segura (https).'
              : 'O navegador não pergunta de novo depois que a permissão é negada. Para liberar:'}
          </DialogDescription>
        </DialogHeader>
        {!indisponivel && (
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
          <Button variant="ghost" onClick={() => aoMudarAberto(false)}>
            Entendi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
