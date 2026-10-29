import type { ReactNode } from 'react'

import { useDesktop } from '@/common/hooks/use-media-query'
import { Dialog, DialogContent, DialogTitle } from '@/common/ui/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface FolhaResponsivaProps {
  aberto: boolean
  aoMudarAberto(aberto: boolean): void
  titulo: string
  icone?: ReactNode
  children: ReactNode
}

export function FolhaResponsiva({
  aberto,
  aoMudarAberto,
  titulo,
  icone,
  children,
}: FolhaResponsivaProps) {
  const desktop = useDesktop()
  const Titulo = desktop ? DialogTitle : DrawerTitle
  const conteudo = (
    <>
      {icone}
      <Titulo className="mb-2 text-left text-2xl leading-8 font-semibold tracking-tight">
        {titulo}
      </Titulo>
      {children}
    </>
  )

  if (desktop) {
    return (
      <Dialog open={aberto} onOpenChange={aoMudarAberto}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <div>{conteudo}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={aberto} onOpenChange={aoMudarAberto}>
      <DrawerContent aria-describedby={undefined}>
        <div className="overflow-y-auto px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {conteudo}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
