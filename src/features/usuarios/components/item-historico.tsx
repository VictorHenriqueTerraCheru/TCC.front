import type { MaterialSymbol } from 'material-symbols'
import { Link } from 'react-router'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { CategoriaIcone, useAparencia } from '@/features/categorias'

import { tituloItem, type ItemHistorico } from '../models/historico'

const chips: Partial<
  Record<NonNullable<ItemHistorico['issueStatus']>, { label: string; classe: string }>
> = {
  new: { label: 'Nova', classe: 'bg-primario-suave text-primario' },
  active: { label: 'Ativa', classe: 'bg-muted text-foreground' },
  possiblyResolved: {
    label: 'Possivelmente resolvida',
    classe: 'bg-primario-suave text-primario',
  },
  resolved: { label: 'Resolvida', classe: 'bg-primario-suave text-primario' },
}

const isReport = (type: ItemHistorico['type']) =>
  type === 'issueReport' || type === 'incidentReport'

function IconeItem({ item }: { item: ItemHistorico }) {
  const { aparenciaDe } = useAparencia()
  if (isReport(item.type)) return <CategoriaIcone category={item.category} />
  const aparencia = aparenciaDe(item.category)
  const icone: MaterialSymbol = 'how_to_vote'
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        aparencia.claro,
        aparencia.forte,
      )}
    >
      <Icone name={icone} className="text-[22px]" />
    </span>
  )
}

export function ItemHistoricoLinha({ item, quando }: { item: ItemHistorico; quando: string }) {
  const chip = item.type === 'issueReport' && item.issueStatus ? chips[item.issueStatus] : undefined
  const conteudo = (
    <>
      <IconeItem item={item} />
      <div className="min-w-0 flex-1">
        <p className="leading-5">{tituloItem(item)}</p>
        <p className="text-sm text-muted-foreground">
          {[item.address, quando].filter(Boolean).join(' · ')}
        </p>
      </div>
      {chip && (
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', chip.classe)}>
          {chip.label}
        </span>
      )}
    </>
  )
  const classe = 'flex items-center gap-3 py-2.5'
  return item.reportId ? (
    <Link
      to={`/mapa/problema/${item.reportId}`}
      className={cn(classe, '-mx-2 rounded-xl px-2 hover:bg-card focus-visible:outline-2')}
    >
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}
