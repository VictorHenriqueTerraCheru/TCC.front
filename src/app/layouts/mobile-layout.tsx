import { NavLink, Outlet, useLocation } from 'react-router'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

import { itensNavegacao } from './navegacao'

/** < 1024 px: conteúdo + barra de abas flutuante de vidro (Mapa / Recentes / Perfil). */
export function MobileLayout() {
  // Registro e subpáginas com "←" (verificação, histórico, configurações, fila do admin) ocupam a
  // tela inteira, como nos prints 5–8, 11, 13, 28 e 29.
  const { pathname } = useLocation()
  const telaCheia = /^\/(registrar|admin)(\/|$)|^\/perfil\/.+/.test(pathname)
  const noMapa = pathname.startsWith('/mapa')
  return (
    <div className="relative h-dvh">
      {/* O mapa passa por baixo da barra; nas outras páginas o conteúdo termina acima dela. */}
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
      className="absolute inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex h-[58px] items-stretch rounded-[22px] shadow-[0_8px_24px_rgb(0_0_0/0.35)] vidro"
    >
      {itensNavegacao.map((item) => (
        <NavLink
          key={item.rota}
          to={item.rota}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] text-[10px] font-semibold focus-visible:outline-2"
        >
          {({ isActive }) => (
            <>
              <Icone
                nome={item.icone}
                preenchido={isActive}
                className={cn('text-[23px]', isActive ? 'text-primario' : 'text-muted-foreground')}
              />
              <span className={cn(isActive ? 'text-primario' : 'text-muted-foreground')}>
                {item.rotulo}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
