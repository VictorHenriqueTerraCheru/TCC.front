import { Marker } from 'react-leaflet'

import type { Categoria } from '@/features/categorias'

import { iconeMarcadorProblema } from '../lib/icone-marcador'
import type { ProblemaNaArea } from '../models/problema'

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
  return problemas.map((problema) => {
    const categoria = categorias.get(problema.categoriaId)
    if (!categoria) return null
    const selecionado = problema.id === selecionadoId
    return (
      <Marker
        key={problema.id}
        position={[problema.lat, problema.lng]}
        icon={iconeMarcadorProblema(categoria, problema.status, problema.faixa, selecionado)}
        zIndexOffset={
          selecionado
            ? 1000
            : problema.status === 'nova'
              ? 0
              : (camadaZ[problema.faixa ?? 'baixa'] ?? 0)
        }
        eventHandlers={{ click: () => aoSelecionar(problema.id) }}
        title={categoria.nome}
        alt={categoria.nome}
      />
    )
  })
}
