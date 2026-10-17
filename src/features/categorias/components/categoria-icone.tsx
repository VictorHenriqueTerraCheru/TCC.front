import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'

import { aparenciaDoGrupo, grupoDe, iconeDe, type CategoriaResumo } from '../models/categoria'

interface CategoriaIconeProps {
  categoria: Pick<CategoriaResumo, 'icone' | 'grupo'>
  tamanho?: 'sm' | 'md' | 'lg'
  className?: string
}

const tamanhos = {
  sm: 'size-8 text-[18px]',
  md: 'size-10 text-[22px]',
  lg: 'size-12 text-[26px]',
}

/** Ícone circular da categoria: fundo claro + ícone na cor forte do grupo. */
export function CategoriaIcone({ categoria, tamanho = 'md', className }: CategoriaIconeProps) {
  const aparencia = aparenciaDoGrupo[grupoDe(categoria)]
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        aparencia.claro,
        aparencia.forte,
        tamanhos[tamanho],
        className,
      )}
    >
      <Icone nome={iconeDe(categoria)} className="text-[length:inherit]" />
    </span>
  )
}
