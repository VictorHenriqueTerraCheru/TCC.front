import { NavLink, Outlet, useMatch } from 'react-router'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

import { itensNavegacao } from './navegacao'

/** < 1024 px: conteúdo + barra inferior Mapa / Recentes / Perfil. */
export function MobileLayout() {
  // O fluxo de registro ocupa a tela inteira, como no protótipo.
  const noRegistro = useMatch('/registrar/*') !== null
  return (
    <div className="flex h-dvh flex-col">
      <main className="relative min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
      {!noRegistro && <BarraInferior />}
    </div>
  )
}

function BarraInferior() {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex h-20 shrink-0 items-stretch bg-surface-container pb-[env(safe-area-inset-bottom)]"
    >
      {itensNavegacao.map((item) => (
        <NavLink
          key={item.rota}
          to={item.rota}
          className="group flex flex-1 flex-col items-center justify-center gap-1 text-xs font-medium focus-visible:outline-2"
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  'flex h-8 w-16 items-center justify-center rounded-full transition-colors',
                  isActive ? 'bg-nav-indicator' : 'group-hover:bg-foreground/5',
                )}
              >
                <Icone nome={item.icone} preenchido={isActive} />
              </span>
              <span className={cn(isActive ? 'font-bold' : 'text-muted-foreground')}>
                {item.rotulo}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
