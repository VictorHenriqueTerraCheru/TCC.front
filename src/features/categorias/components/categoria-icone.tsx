import { IconeDinamico } from '@/common/components/icone-remoto'
import { cn } from '@/common/lib/utils'

import { useAparencia } from '../hooks/use-aparencia'
import { iconeDe, type CategoriaResumo } from '../models/categoria'

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

export function CategoriaIcone({ categoria, tamanho = 'md', className }: CategoriaIconeProps) {
  const { aparenciaDe } = useAparencia()
  const aparencia = aparenciaDe(categoria)
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
      <IconeDinamico nome={iconeDe(categoria)} className="text-[length:inherit]" />
    </span>
  )
}
