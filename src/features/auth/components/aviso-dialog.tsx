import type { ReactNode } from 'react'

import { Button } from '@/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/common/ui/dialog'

/** Diálogo informativo curto (termos, recuperação de senha). */
export function AvisoDialog({
  gatilho,
  titulo,
  children,
}: {
  gatilho: ReactNode
  titulo: string
  children: ReactNode
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{gatilho}</DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-left">{children}</div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogTrigger asChild>
            <Button variant="ghost">Fechar</Button>
          </DialogTrigger>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
