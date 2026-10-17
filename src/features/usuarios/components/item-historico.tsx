import type { MaterialSymbol } from 'material-symbols'
import { Link } from 'react-router'

import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { aparenciaDoGrupo, CategoriaIcone, grupoDe } from '@/features/categorias'

import { tituloItem, type ItemHistorico } from '../models/historico'

const chips: Partial<
  Record<NonNullable<ItemHistorico['statusProblema']>, { rotulo: string; classe: string }>
> = {
  nova: { rotulo: 'Nova', classe: 'bg-primario-suave text-primario' },
  ativa: { rotulo: 'Ativa', classe: 'bg-muted text-foreground' },
  possivelmenteResolvida: {
    rotulo: 'Possivelmente resolvida',
    classe: 'bg-primario-suave text-primario',
  },
  resolvida: { rotulo: 'Resolvida', classe: 'bg-primario-suave text-primario' },
}

function IconeItem({ item }: { item: ItemHistorico }) {
  if (item.tipo.startsWith('registro')) return <CategoriaIcone categoria={item.categoria} />
  const aparencia = aparenciaDoGrupo[grupoDe(item.categoria)]
  const icone: MaterialSymbol = 'how_to_vote'
  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full',
        aparencia.claro,
        aparencia.forte,
      )}
    >
      <Icone nome={icone} className="text-[22px]" />
    </span>
  )
}

/** Linha do histórico (telas 10 e 29). Problemas abrem o detalhe; incidentes não são navegáveis. */
export function ItemHistoricoLinha({ item, quando }: { item: ItemHistorico; quando: string }) {
  const chip =
    item.tipo === 'registroProblema' && item.statusProblema ? chips[item.statusProblema] : undefined
  const conteudo = (
    <>
      <IconeItem item={item} />
      <div className="min-w-0 flex-1">
        <p className="leading-5">{tituloItem(item)}</p>
        <p className="text-sm text-muted-foreground">
          {[item.endereco, quando].filter(Boolean).join(' · ')}
        </p>
      </div>
      {chip && (
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-xs font-medium', chip.classe)}>
          {chip.rotulo}
        </span>
      )}
    </>
  )
  const classe = 'flex items-center gap-3 py-2.5'
  return item.ocorrenciaId ? (
    <Link
      to={`/mapa/problema/${item.ocorrenciaId}`}
      className={cn(classe, '-mx-2 rounded-xl px-2 hover:bg-card focus-visible:outline-2')}
    >
      {conteudo}
    </Link>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}
