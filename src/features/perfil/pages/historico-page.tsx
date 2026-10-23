import { Navigate, useNavigate } from 'react-router'
import { useState } from 'react'

import { ListaInfinita } from '@/common/components/lista-infinita'
import { Segmentado } from '@/common/components/segmentado'
import { TelaComVoltar } from '@/common/components/tela-com-voltar'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { ItemAnimado } from '@/common/components/item-animado'
import { useAutenticado } from '@/features/auth'
import {
  agruparPorPeriodo,
  ItemHistoricoLinha,
  quandoItem,
  useHistorico,
  type FiltroHistorico,
} from '@/features/usuarios'

const filtros: { valor: FiltroHistorico; rotulo: string }[] = [
  { valor: 'tudo', rotulo: 'Tudo' },
  { valor: 'registros', rotulo: 'Registros' },
  { valor: 'votos', rotulo: 'Votos' },
]

function Lista({ filtro }: { filtro: FiltroHistorico }) {
  const historico = useHistorico(filtro)
  if (historico.isPending) return <Skeleton className="h-60 rounded-2xl bg-muted" />
  if (historico.isError) {
    return (
      <div role="alert" className="space-y-3 py-6">
        <p>Não foi possível carregar o histórico.</p>
        <Button variant="outline" size="sm" onClick={() => void historico.refetch()}>
          Tentar novamente
        </Button>
      </div>
    )
  }
  const itens = historico.data.pages.flatMap((p) => p.itens)
  if (itens.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">Nada por aqui ainda.</p>
  }
  return (
    <ListaInfinita consulta={historico}>
      {agruparPorPeriodo(itens).map((grupo) => (
        <section key={grupo.titulo} aria-labelledby={`grupo-${grupo.titulo}`} className="mb-4">
          <h2
            id={`grupo-${grupo.titulo}`}
            className="mb-1 text-sm font-medium text-muted-foreground"
          >
            {grupo.titulo}
          </h2>
          <ul>
            {grupo.itens.map((item, i) => (
              <ItemAnimado key={`${item.data}-${i}`} indice={i}>
                <ItemHistoricoLinha item={item} quando={quandoItem(item.data)} />
              </ItemAnimado>
            ))}
          </ul>
        </section>
      ))}
    </ListaInfinita>
  )
}

/** Tela 29. */
export function HistoricoPage() {
  const navigate = useNavigate()
  const autenticado = useAutenticado()
  const [filtro, setFiltro] = useState<FiltroHistorico>('tudo')

  if (!autenticado) return <Navigate to="/login" replace state={{ de: '/perfil/historico' }} />

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <TelaComVoltar titulo="Histórico" aoVoltar={() => navigate('/perfil')}>
        <Segmentado<FiltroHistorico>
          rotulo="Filtrar histórico"
          opcoes={filtros}
          valor={filtro}
          aoMudar={setFiltro}
          className="mb-4"
        />
        <Lista filtro={filtro} />
      </TelaComVoltar>
    </div>
  )
}
