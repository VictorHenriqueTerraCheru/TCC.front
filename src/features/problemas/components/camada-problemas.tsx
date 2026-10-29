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

const camadaZ: Record<string, number> = { high: 300, medium: 200, low: 100 }

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
    const categoria = categorias.get(problema.categoryId)
    const selecionado = problema.id === selecionadoId
    const z = selecionado
      ? 1000
      : problema.status === 'new'
        ? 0
        : (camadaZ[problema.band ?? 'low'] ?? 0)
    return (
      <Marker
        key={problema.id}
        latitude={problema.lat}
        longitude={problema.lng}
        anchor="bottom"
        style={{ zIndex: z }}
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          aoSelecionar(problema.id)
        }}
      >
        <button
          type="button"
          aria-label={categoria?.name ?? 'Problema'}
          data-problema={problema.id}
          className="block cursor-pointer focus-visible:outline-2"
        >
          <MarcadorProblema
            color={(categoria ? aparenciaDe(categoria) : aparenciaDaCor.gray).corForte}
            icon={categoria ? iconeDe(categoria) : ICONE_PADRAO}
            status={problema.status}
            band={problema.band}
            selecionado={selecionado}
          />
        </button>
      </Marker>
    )
  })
}
