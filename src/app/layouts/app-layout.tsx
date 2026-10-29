import { useDesktop } from '@/common/hooks/use-media-query'

import { DesktopLayout } from './desktop-layout'
import { MobileLayout } from './mobile-layout'

export function AppLayout() {
  return useDesktop() ? <DesktopLayout /> : <MobileLayout />
}
