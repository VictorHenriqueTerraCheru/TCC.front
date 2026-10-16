import { useDesktop } from '@/common/hooks/use-media-query'
import { EntreParaContinuar } from '@/features/auth'
import { useMonitorarLocalizacao } from '@/features/localizacao'

import { DesktopLayout } from './desktop-layout'
import { MobileLayout } from './mobile-layout'

/** Escolhe o layout pelo breakpoint lg; as telas são as mesmas nos dois. */
export function AppLayout() {
  useMonitorarLocalizacao()
  return (
    <>
      {useDesktop() ? <DesktopLayout /> : <MobileLayout />}
      <EntreParaContinuar />
    </>
  )
}
