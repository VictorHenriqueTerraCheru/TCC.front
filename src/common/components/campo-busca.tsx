import { AnimatePresence, m } from 'motion/react'
import { useRef } from 'react'

import { Icone } from '@/common/components/icone'
import { SURGIR } from '@/common/lib/movimento'

interface CampoBuscaProps {
  valor: string
  aoMudar(valor: string): void
  /** Também é o nome acessível do campo. */
  rotulo: string
  placeholder?: string
}

/** Campo de busca em pílula cinza, com lupa e botão de limpar. */
export function CampoBusca({ valor, aoMudar, rotulo, placeholder }: CampoBuscaProps) {
  const campo = useRef<HTMLInputElement>(null)
  return (
    // Tocar na lupa ou na borda também foca o campo, como no <label> de antes.
    <div
      onClick={() => campo.current?.focus()}
      className="flex h-11 items-center gap-2 rounded-xl border border-transparent bg-muted px-3 text-muted-foreground transition-[border-color,box-shadow,background-color] duration-200 focus-within:border-ring focus-within:bg-card focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_18%,transparent)]"
    >
      <Icone nome="search" className="text-[20px]" />
      <input
        ref={campo}
        type="search"
        value={valor}
        onChange={(e) => aoMudar(e.target.value)}
        placeholder={placeholder ?? rotulo}
        aria-label={rotulo}
        className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
      />
      <AnimatePresence initial={false}>
        {valor && (
          <m.button
            type="button"
            aria-label="Limpar busca"
            onClick={() => {
              aoMudar('')
              campo.current?.focus()
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={SURGIR}
            className="-mr-1 flex size-7 items-center justify-center rounded-full hover:bg-foreground/10 focus-visible:outline-2"
          >
            <Icone nome="cancel" preenchido className="text-[18px]" />
          </m.button>
        )}
      </AnimatePresence>
    </div>
  )
}
