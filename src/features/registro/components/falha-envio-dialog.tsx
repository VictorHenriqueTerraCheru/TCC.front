import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'

interface FalhaEnvioDialogProps {
  aberto: boolean
  aoMudarAberto(aberto: boolean): void
  aoTentarNovamente(): void
}

/** Tela 26: falha de rede/timeout no envio. Os dados continuam no rascunho (regra 5). */
export function FalhaEnvioDialog({
  aberto,
  aoMudarAberto,
  aoTentarNovamente,
}: FalhaEnvioDialogProps) {
  return (
    <Dialog open={aberto} onOpenChange={aoMudarAberto}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <Icone nome="cloud_off" className="text-[28px] text-destructive" />
          <DialogTitle>Não foi possível enviar</DialogTitle>
          <DialogDescription className="text-left">
            Parece que você está sem conexão. Os dados continuam preenchidos — é só tentar de novo
            quando a conexão voltar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end">
          <Button variant="ghost" onClick={aoTentarNovamente}>
            Tentar novamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
