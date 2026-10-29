import type { AparenciaDaCor } from '../models/categoria'

export function PontoGrupo({ cor }: { cor: Pick<AparenciaDaCor, 'corForte'> }) {
  return (
    <span aria-hidden="true" className="flex size-[18px] shrink-0 items-center justify-center">
      <span className="size-3 rounded-full" style={{ background: cor.corForte }} />
    </span>
  )
}
