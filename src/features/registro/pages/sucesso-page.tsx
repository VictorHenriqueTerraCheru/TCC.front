import { m } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { MOLA_RAPIDA } from '@/common/lib/movimento'
import { Button } from '@/common/ui/button'
import { iconeDe, useAparencia } from '@/features/categorias'
import { MarcadorProblema, type DetalheProblemaDados } from '@/features/problemas'

import { useRascunhoStore } from '../stores/rascunho-store'

interface TelaSucessoProps {
  titulo: string
  texto: string
  cartao?: ReactNode
  verNoMapa: string
}

/** Telas 20 e 21c. */
export function TelaSucesso({ titulo, texto, cartao, verNoMapa }: TelaSucessoProps) {
  const navigate = useNavigate()
  const limpar = useRascunhoStore((s) => s.limpar)

  // O rascunho só some aqui, já fora dos passos: as guardas de passo não veem o rascunho vazio.
  useEffect(() => limpar(), [limpar])

  return (
    <div className="mx-auto flex h-full max-w-md flex-col px-6 pt-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:pt-16">
      {/* O círculo cresce com mola e o check é desenhado em seguida. */}
      <m.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={MOLA_RAPIDA}
        className="mb-8 flex size-16 items-center justify-center rounded-full bg-primario-suave text-primario"
      >
        <svg viewBox="0 0 24 24" aria-hidden className="size-9">
          <circle cx="12" cy="12" r="10" fill="currentColor" />
          <m.path
            d="M7.5 12.5l3 3 6-6.5"
            fill="none"
            stroke="var(--card)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.35, delay: 0.2, ease: 'easeOut' }}
          />
        </svg>
      </m.span>
      <h1 className="mb-4 text-[28px] leading-9">{titulo}</h1>
      <p className="mb-6">{texto}</p>
      {cartao}
      <div className="mt-auto flex flex-col gap-2 pt-8">
        <Button onClick={() => navigate(verNoMapa, { replace: true })}>Ver no mapa</Button>
        <Button
          variant="outline"
          onClick={() => {
            limpar()
            navigate('/registrar', { replace: true })
          }}
        >
          Registrar outra
        </Button>
      </div>
    </div>
  )
}

/** Tela 20: problema registrado — ou confirmação de um existente (tela 7). */
export function SucessoProblemaPage() {
  const { state } = useLocation()
  const { aparenciaDe } = useAparencia()
  const { problema, confirmacao } = (state ?? {}) as {
    problema?: DetalheProblemaDados
    confirmacao?: boolean
  }

  const cartao = problema && (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-1">
      <span className="shrink-0 pr-6">
        <MarcadorProblema
          cor={aparenciaDe(problema.categoria).corForte}
          icone={iconeDe(problema.categoria)}
          status={problema.status}
          faixa={problema.faixa}
        />
      </span>
      <div className="min-w-0">
        <p className="font-medium">{problema.categoria.nome}</p>
        <p className="text-xs text-muted-foreground">{problema.endereco}</p>
      </div>
    </div>
  )

  if (confirmacao) {
    return (
      <TelaSucesso
        titulo="Confirmação registrada"
        texto="Sua confirmação foi registrada e reforça o registro que já estava no mapa, em vez de criar uma duplicata."
        cartao={cartao}
        verNoMapa={problema ? `/mapa/problema/${problema.id}` : '/mapa'}
      />
    )
  }

  return (
    <TelaSucesso
      titulo="Registro enviado"
      texto='Sua ocorrência já aparece no mapa com o selo "Nova". Ela fica em período de avaliação até que pessoas por perto confirmem.'
      cartao={cartao}
      verNoMapa={problema ? `/mapa/problema/${problema.id}` : '/mapa'}
    />
  )
}
