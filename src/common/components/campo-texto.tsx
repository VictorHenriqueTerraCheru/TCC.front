import { useId, useState, type ComponentProps } from 'react'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

interface CampoTextoProps extends ComponentProps<'input'> {
  rotulo: string
  /** Mensagem de erro (substitui a ajuda e deixa o campo vermelho). */
  erro?: string
  ajuda?: string
}

/** Campo "outlined" do Material 3, com o rótulo sobre a borda (telas 11, 15, 16). */
export function CampoTexto({ rotulo, erro, ajuda, className, id, ...props }: CampoTextoProps) {
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
          className={cn(
            'h-14 w-full rounded-md border border-input bg-background px-4 text-base transition-colors outline-none',
            'focus:border-2 focus:border-primary focus:px-[15px]',
            erro && 'border-destructive focus:border-destructive',
          )}
          {...props}
        />
        <label
          htmlFor={idCampo}
          className={cn(
            'pointer-events-none absolute -top-2 left-3 bg-background px-1 text-xs text-muted-foreground',
            erro && 'text-destructive',
          )}
        >
          {rotulo}
        </label>
      </div>
      {descricao && (
        <p
          id={idDescricao}
          className={cn('mt-1 px-4 text-xs', erro ? 'text-destructive' : 'text-muted-foreground')}
        >
          {descricao}
        </p>
      )}
    </div>
  )
}

/** Campo de senha com o botão de olho. */
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
        className="absolute top-2 right-2 flex size-10 items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
      >
        <Icone nome={visivel ? 'visibility' : 'visibility_off'} className="text-muted-foreground" />
      </button>
    </div>
  )
}
