import { m } from 'motion/react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { Icon } from '@/common/components/icone'
import { SOFT_SPRING } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

import { navigationItems } from './navegacao'

export function MobileLayout() {
  const { pathname } = useLocation()
  const fullScreen = /^\/(registrar|admin)(\/|$)|^\/perfil\/.+/.test(pathname)
  const onMap = pathname.startsWith('/mapa')
  return (
    <div data-layout-celular className="relative h-dvh">
      <main className={cn('relative h-full overflow-y-auto', !fullScreen && !onMap && 'pb-24')}>
        <Outlet />
      </main>
      {!fullScreen && <BottomBar />}
    </div>
  )
}

function BottomBar() {
  return (
    <nav
      aria-label="Navegação principal"
      className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-[58px] items-stretch gap-1 rounded-[22px] p-1 shadow-2 vidro"
    >
      {navigationItems.map((item) => (
        <NavLink
          key={item.route}
          to={item.route}
          className="relative flex flex-1 pressionavel flex-col items-center justify-center gap-0.5 rounded-[18px] text-[10px] font-semibold focus-visible:outline-2"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <m.span
                  layoutId="active-tab-mobile"
                  transition={SOFT_SPRING}
                  className="absolute inset-0 rounded-[18px] bg-primario-suave"
                />
              )}
              <m.span
                initial={false}
                animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative flex"
              >
                <Icon
                  name={item.icon}
                  filled={isActive}
                  className={cn(
                    'text-[23px] transition-colors',
                    isActive ? 'text-primario' : 'text-muted-foreground',
                  )}
                />
              </m.span>
              <span
                className={cn(
                  'relative transition-colors',
                  isActive ? 'text-primario' : 'text-muted-foreground',
                )}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
