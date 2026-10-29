import { AnimatePresence, m } from 'motion/react'
import { useId, useState, type ComponentProps, type ReactNode } from 'react'

import { Icone } from '@/common/components/icone'
import { SURGIR } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

const caixa = cn(
  'peer w-full rounded-2xl border border-input bg-superficie-2 text-base outline-none',
  'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
  'hover:border-muted-foreground/40 focus:border-ring focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_18%,transparent)]',
  'aria-invalid:border-destructive aria-invalid:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--destructive)_18%,transparent)]',
)

const rotuloFlutuante = cn(
  'pointer-events-none absolute left-4 origin-left text-[11px] font-medium text-muted-foreground',
  'transition-[top,font-size,color] duration-200 ease-out',
  'peer-focus:text-primario peer-aria-invalid:text-destructive',
)

function Descricao({ id, erro, children }: { id: string; erro?: string; children?: ReactNode }) {
  return (
    <p
      id={id}
      className={cn(
        'mt-1.5 flex items-start gap-1 px-4 text-xs',
        erro ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      {erro && <Icone name="error" preenchido className="mt-px text-[14px]" />}
      {children}
    </p>
  )
}

interface CampoTextoProps extends ComponentProps<'input'> {
  label: string
  erro?: string
  ajuda?: string
}

export function CampoTexto({
  label: rotulo,
  erro,
  ajuda,
  className,
  id,
  placeholder,
  ...props
}: CampoTextoProps) {
  const idGerado = useId()
  const idCampo = id ?? idGerado
  const idDescricao = `${idCampo}-descricao`
  const descricao = erro ?? ajuda

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={idCampo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={descricao ? idDescricao : undefined}
          placeholder={placeholder ?? ' '}
          className={cn(caixa, 'h-14 px-4 pt-5 pb-1')}
          {...props}
        />
        <label
          htmlFor={idCampo}
          className={cn(
            rotuloFlutuante,
            'top-2',
            !placeholder &&
              'peer-[:placeholder-shown:not(:focus)]:top-[17px] peer-[:placeholder-shown:not(:focus)]:text-base peer-[:placeholder-shown:not(:focus)]:font-normal',
          )}
        >
          {rotulo}
        </label>
      </div>
      {descricao && (
        <Descricao id={idDescricao} erro={erro}>
          {descricao}
        </Descricao>
      )}
    </div>
  )
}

export function CampoSenha(props: Omit<CampoTextoProps, 'type'>) {
  const [visivel, setVisivel] = useState(false)
  return (
    <div className="relative">
      <CampoTexto
        {...props}
        type={visivel ? 'text' : 'password'}
        className={cn('[&_input]:pr-12', props.className)}
      />
      <button
        type="button"
        onClick={() => setVisivel((v) => !v)}
        aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visivel}
        className="absolute top-2 right-2 flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={visivel ? 'visivel' : 'oculto'}
            initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
            transition={SURGIR}
            className="flex"
          >
            <Icone
              name={visivel ? 'visibility' : 'visibility_off'}
              className="text-muted-foreground"
            />
          </m.span>
        </AnimatePresence>
      </button>
    </div>
  )
}

interface CampoAreaTextoProps extends ComponentProps<'textarea'> {
  label: string
  erro?: string
  ajuda?: string
  maximo?: number
  valorAtual?: string
}

export function CampoAreaTexto({
  label: rotulo,
  erro,
  ajuda,
  maximo,
  valorAtual = '',
  className,
  id,
  placeholder,
  ...props
}: CampoAreaTextoProps) {
  const idGerado = useId()
  const idCampo = id ?? idGerado
  const idDescricao = `${idCampo}-descricao`
  const pertoDoLimite = maximo !== undefined && valorAtual.length >= maximo * 0.9
  return (
    <div className={className}>
      <div className="relative">
        <textarea
          id={idCampo}
          rows={4}
          maxLength={maximo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={idDescricao}
          placeholder={placeholder ?? ' '}
          className={cn(caixa, 'resize-none px-4 pt-7 pb-3')}
          {...props}
        />
        <label
          htmlFor={idCampo}
          className={cn(
            rotuloFlutuante,
            'top-2',
            !placeholder &&
              'peer-[:placeholder-shown:not(:focus)]:top-4 peer-[:placeholder-shown:not(:focus)]:text-base peer-[:placeholder-shown:not(:focus)]:font-normal',
          )}
        >
          {rotulo}
        </label>
      </div>
      <Descricao id={idDescricao} erro={erro}>
        <span className="flex-1">{erro ?? ajuda}</span>
        {maximo !== undefined && (
          <span
            className={cn(
              'shrink-0 tabular-nums transition-colors',
              pertoDoLimite ? 'font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            {valorAtual.length}/{maximo}
          </span>
        )}
      </Descricao>
    </div>
  )
}

interface CampoSelecaoProps extends ComponentProps<'select'> {
  label: string
  erro?: string
}

export function CampoSelecao({
  label: rotulo,
  erro,
  className,
  id,
  children,
  ...props
}: CampoSelecaoProps) {
  const idGerado = useId()
  const idCampo = id ?? idGerado
  const idDescricao = `${idCampo}-descricao`
  return (
    <div className={className}>
      <div className="relative">
        <select
          id={idCampo}
          aria-invalid={erro ? true : undefined}
          aria-describedby={erro ? idDescricao : undefined}
          className={cn(caixa, 'h-14 appearance-none pt-5 pr-12 pb-1 pl-4')}
          {...props}
        >
          {children}
        </select>
        <label htmlFor={idCampo} className={cn(rotuloFlutuante, 'top-2')}>
          {rotulo}
        </label>
        <Icone
          name="keyboard_arrow_down"
          className="pointer-events-none absolute top-4 right-4 text-muted-foreground transition-transform peer-focus:rotate-180"
        />
      </div>
      {erro && (
        <Descricao id={idDescricao} erro={erro}>
          {erro}
        </Descricao>
      )}
    </div>
  )
}
