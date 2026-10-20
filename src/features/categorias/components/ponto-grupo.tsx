import type { AparenciaDaCor } from '../models/categoria'

/** Bolinha na cor do grupo: no lugar do ícone nos chips de filtro (o grupo não tem ícone próprio). */
export function PontoGrupo({ cor }: { cor: Pick<AparenciaDaCor, 'corForte'> }) {
  return (
    <span aria-hidden="true" className="flex size-[18px] shrink-0 items-center justify-center">
      <span className="size-3 rounded-full" style={{ background: cor.corForte }} />
    </span>
  )
}
