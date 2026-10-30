import { Icon } from '@/common/components/icon'
import { Button } from '@/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'

interface SubmissionFailedDialogProps {
  open: boolean
  onOpenChange(open: boolean): void
  onRetry(): void
}

export function SubmissionFailedDialog({
  open,
  onOpenChange,
  onRetry,
}: SubmissionFailedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader className="items-center text-center sm:text-center">
          <Icon name="cloud_off" className="text-[28px] text-destructive" />
          <DialogTitle>Não foi possível enviar</DialogTitle>
          <DialogDescription className="text-left">
            Parece que você está sem conexão. Os dados continuam preenchidos — é só tentar de novo
            quando a conexão voltar.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row justify-end">
          <Button variant="ghost" onClick={onRetry}>
            Tentar novamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
