import type { ReactNode } from 'react'

import { useDesktop } from '@/common/hooks/use-media-query'
import { Dialog, DialogContent, DialogTitle } from '@/common/ui/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '@/common/ui/drawer'

interface ResponsiveSheetProps {
  open: boolean
  onOpenChange(open: boolean): void
  title: string
  icon?: ReactNode
  children: ReactNode
}

export function ResponsiveSheet({
  open,
  onOpenChange,
  title,
  icon,
  children,
}: ResponsiveSheetProps) {
  const desktop = useDesktop()
  const Title = desktop ? DialogTitle : DrawerTitle
  const content = (
    <>
      {icon}
      <Title className="mb-2 text-left text-2xl leading-8 font-semibold tracking-tight">
        {title}
      </Title>
      {children}
    </>
  )

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <div>{content}</div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-describedby={undefined}>
        <div className="overflow-y-auto px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
