import { m } from 'motion/react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { MOLA_SUAVE } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'
import { useExigirConta } from '@/features/auth'

import { itensNavegacao } from './navegacao'

export function DesktopLayout() {
  const exigirConta = useExigirConta()
  const navigate = useNavigate()
  return (
    <div className="flex h-dvh">
      <nav
        aria-label="Navegação principal"
        className="z-[1002] flex w-[72px] shrink-0 flex-col items-center gap-3 border-y-0 border-l-0 py-4 vidro"
      >
        <Link
          to="/registrar"
          onClick={(evento) => {
            evento.preventDefault()
            exigirConta('registrar', () => navigate('/registrar'), { retorno: '/registrar' })
          }}
          aria-label="Registrar ocorrência"
          className="mb-4 flex size-14 pressionavel items-center justify-center rounded-2xl bg-primary bg-linear-to-b from-black/0 to-black/12 text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.22),0_8px_22px_color-mix(in_srgb,var(--primary)_45%,transparent)] hover:brightness-110 focus-visible:outline-2"
        >
          <Icone nome="add_location_alt" />
        </Link>
        {itensNavegacao.map((item) => (
          <NavLink
            key={item.rota}
            to={item.rota}
            className="group flex w-full pressionavel flex-col items-center gap-1 text-xs font-medium focus-visible:outline-2"
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'relative flex h-8 w-14 items-center justify-center rounded-full transition-colors',
                    isActive ? 'text-primario' : 'group-hover:bg-foreground/5',
                  )}
                >
                  {isActive && (
                    <m.span
                      layoutId="aba-ativa-trilho"
                      transition={MOLA_SUAVE}
                      className="absolute inset-0 rounded-full bg-primario-suave"
                    />
                  )}
                  <Icone nome={item.icone} preenchido={isActive} className="relative" />
                </span>
                <span
                  className={cn(isActive ? 'font-semibold text-primario' : 'text-muted-foreground')}
                >
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
