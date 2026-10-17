import { useDesktop } from '@/common/hooks/use-media-query'

import { DesktopLayout } from './desktop-layout'
import { MobileLayout } from './mobile-layout'

/** Escolhe o layout pelo breakpoint lg; as telas são as mesmas nos dois. */
export function AppLayout() {
  return useDesktop() ? <DesktopLayout /> : <MobileLayout />
}
