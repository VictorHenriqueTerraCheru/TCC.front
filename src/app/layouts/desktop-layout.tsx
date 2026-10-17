import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { useExigirConta } from '@/features/auth'

import { itensNavegacao } from './navegacao'

/** ≥ 1024 px: trilho de navegação de 72 px à esquerda + conteúdo (mapa em tela cheia ou página centralizada). */
export function DesktopLayout() {
  const exigirConta = useExigirConta()
  const navigate = useNavigate()
  return (
    <div className="flex h-dvh">
      <nav
        aria-label="Navegação principal"
        className="flex w-[72px] shrink-0 flex-col items-center gap-3 bg-surface-container py-4"
      >
        <Link
          to="/registrar"
          onClick={(evento) => {
            evento.preventDefault()
            exigirConta('registrar', () => navigate('/registrar'), { retorno: '/registrar' })
          }}
          aria-label="Registrar ocorrência"
          className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-mint text-mint-foreground shadow-md transition-shadow hover:shadow-lg focus-visible:outline-2"
        >
          <Icone nome="add_location_alt" />
        </Link>
        {itensNavegacao.map((item) => (
          <NavLink
            key={item.rota}
            to={item.rota}
            className="group flex w-full flex-col items-center gap-1 text-xs font-medium focus-visible:outline-2"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'flex h-8 w-14 items-center justify-center rounded-full transition-colors',
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
      <main className="relative min-w-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
