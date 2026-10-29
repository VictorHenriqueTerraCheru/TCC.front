import { m } from 'motion/react'
import { NavLink, Outlet, useLocation } from 'react-router'

import { Icone } from '@/common/components/icone'
import { MOLA_SUAVE } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

import { itensNavegacao } from './navegacao'

export function MobileLayout() {
  const { pathname } = useLocation()
  const telaCheia = /^\/(registrar|admin)(\/|$)|^\/perfil\/.+/.test(pathname)
  const noMapa = pathname.startsWith('/mapa')
  return (
    <div data-layout-celular className="relative h-dvh">
      <main className={cn('relative h-full overflow-y-auto', !telaCheia && !noMapa && 'pb-24')}>
        <Outlet />
      </main>
      {!telaCheia && <BarraInferior />}
    </div>
  )
}

function BarraInferior() {
  return (
    <nav
      aria-label="Navegação principal"
      className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-[58px] items-stretch gap-1 rounded-[22px] p-1 shadow-2 vidro"
    >
      {itensNavegacao.map((item) => (
        <NavLink
          key={item.rota}
          to={item.rota}
          className="relative flex flex-1 pressionavel flex-col items-center justify-center gap-0.5 rounded-[18px] text-[10px] font-semibold focus-visible:outline-2"
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <m.span
                  layoutId="aba-ativa-celular"
                  transition={MOLA_SUAVE}
                  className="absolute inset-0 rounded-[18px] bg-primario-suave"
                />
              )}
              <m.span
                initial={false}
                animate={isActive ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative flex"
              >
                <Icone
                  nome={item.icone}
                  preenchido={isActive}
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
                {item.rotulo}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
