import { Marker } from '@vis.gl/react-maplibre'

import {
  aparenciaDaCor,
  ICONE_PADRAO,
  iconeDe,
  useAparencia,
  type Categoria,
} from '@/features/categorias'

import type { ProblemaNaArea } from '../models/problema'
import { MarcadorProblema } from './marcador-problema'

// Mais confiáveis por cima.
const camadaZ: Record<string, number> = { alta: 300, media: 200, baixa: 100 }

interface CamadaProblemasProps {
  problemas: ProblemaNaArea[]
  categorias: Map<number, Categoria>
  selecionadoId?: string
  aoSelecionar(id: string): void
}

export function CamadaProblemas({
  problemas,
  categorias,
  selecionadoId,
  aoSelecionar,
}: CamadaProblemasProps) {
  const { aparenciaDe } = useAparencia()
  return problemas.map((problema) => {
    // GET /categorias só traz as ativas: problema de categoria desativada continua no mapa, em cinza.
    const categoria = categorias.get(problema.categoriaId)
    const selecionado = problema.id === selecionadoId
    const z = selecionado
      ? 1000
      : problema.status === 'nova'
        ? 0
        : (camadaZ[problema.faixa ?? 'baixa'] ?? 0)
    return (
      <Marker
        key={problema.id}
        latitude={problema.lat}
        longitude={problema.lng}
        anchor="bottom"
        style={{ zIndex: z }}
        onClick={(e) => {
          // Regra 7: o clique no marcador não pode chegar ao toque do mapa (abriria a área).
          e.originalEvent.stopPropagation()
          aoSelecionar(problema.id)
        }}
      >
        <button
          type="button"
          aria-label={categoria?.nome ?? 'Problema'}
          data-problema={problema.id}
          className="block cursor-pointer focus-visible:outline-2"
        >
          <MarcadorProblema
            cor={(categoria ? aparenciaDe(categoria) : aparenciaDaCor.cinza).corForte}
            icone={categoria ? iconeDe(categoria) : ICONE_PADRAO}
            status={problema.status}
            faixa={problema.faixa}
            selecionado={selecionado}
          />
        </button>
      </Marker>
    )
  })
}
