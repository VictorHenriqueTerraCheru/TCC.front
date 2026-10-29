import { m } from 'motion/react'
import { useId } from 'react'

import { Icone } from '@/common/components/icone'
import { useTemaStore, type PreferenciaTema, type Tema } from '@/common/hooks/use-tema'
import { MOLA_SUAVE } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

const OPCOES: { value: PreferenciaTema; label: string; description?: string }[] = [
  { value: 'claro', label: 'Claro' },
  { value: 'escuro', label: 'Escuro' },
  { value: 'automatico', label: 'Automático', description: 'Igual ao celular' },
]

const CORES: Record<Tema, { chao: string; via: string; cartao: string; linha: string }> = {
  claro: { chao: '#efe9df', via: '#ffffff', cartao: '#ffffff', linha: '#d5d9e0' },
  escuro: { chao: '#1b2735', via: '#3a4b60', cartao: '#1a2431', linha: '#33445a' },
}

function Tela({ tema }: { tema: Tema }) {
  const cor = CORES[tema]
  return (
    <>
      <rect width="60" height="100" fill={cor.chao} />
      <path d="M-5 30 65 48M22 -5 34 105" stroke={cor.via} strokeWidth="5" />
      <circle cx="40" cy="30" r="6" fill="#ff7a1a" stroke="#fff" strokeWidth="1.5" />
      <rect x="5" y="64" width="50" height="31" rx="7" fill={cor.cartao} />
      <rect x="11" y="72" width="26" height="4" rx="2" fill={cor.linha} />
      <rect x="11" y="81" width="38" height="4" rx="2" fill={cor.linha} />
    </>
  )
}

function Miniatura({ preferencia }: { preferencia: PreferenciaTema }) {
  const recorte = useId()
  return (
    <svg viewBox="0 0 60 100" aria-hidden="true" className="h-24 w-[58px] rounded-xl shadow-1">
      {preferencia === 'automatico' ? (
        <>
          <Tela tema="claro" />
          <clipPath id={recorte}>
            <path d="M60 0V100H0Z" />
          </clipPath>
          <g clipPath={`url(#${recorte})`}>
            <Tela tema="escuro" />
          </g>
        </>
      ) : (
        <Tela tema={preferencia} />
      )}
    </svg>
  )
}

export function SeletorTema({ className }: { className?: string }) {
  const preferencia = useTemaStore((s) => s.preferencia)
  const definirPreferencia = useTemaStore((s) => s.definirPreferencia)
  const idAnel = useId()

  return (
    <div role="radiogroup" aria-label="Aparência" className={cn('grid grid-cols-3', className)}>
      {OPCOES.map((opcao) => {
        const selecionado = opcao.value === preferencia
        return (
          <button
            key={opcao.value}
            type="button"
            role="radio"
            aria-checked={selecionado}
            onClick={() => definirPreferencia(opcao.value)}
            className="flex pressionavel flex-col items-center gap-2 rounded-2xl py-3 focus-visible:outline-2"
          >
            <span className="relative rounded-[14px] p-[3px]">
              {selecionado && (
                <m.span
                  layoutId={idAnel}
                  transition={MOLA_SUAVE}
                  className="absolute inset-0 rounded-[14px] ring-2 ring-primario"
                />
              )}
              <Miniatura preferencia={opcao.value} />
            </span>
            <span className="text-sm font-medium">{opcao.label}</span>
            {opcao.description && (
              <span className="-mt-2 text-xs text-muted-foreground">{opcao.description}</span>
            )}
            <Icone
              name={selecionado ? 'check_circle' : 'radio_button_unchecked'}
              preenchido={selecionado}
              className={cn('text-[22px]', selecionado ? 'text-primario' : 'text-muted-foreground')}
            />
          </button>
        )
      })}
    </div>
  )
}
