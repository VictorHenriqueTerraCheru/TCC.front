import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'
import { Marker } from 'react-leaflet'

import { aparenciaDoGrupo, grupoDe, iconeDe, type Categoria } from '@/features/categorias'

import type { FaixaConfianca, ProblemaNaArea, StatusProblema } from '../models/problema'
import { dimensoesMarcador } from '../models/marcador'
import { MarcadorProblema } from './marcador-problema'

// Um divIcon por combinação (categoria, status, faixa): o mapa pode ter até 500 marcadores.
const icones = new Map<string, L.DivIcon>()

function iconeDoMarcador(
  categoria: Categoria,
  status: StatusProblema,
  faixa: FaixaConfianca | null,
) {
  const chave = `${categoria.id}|${status}|${faixa}`
  let icone = icones.get(chave)
  if (!icone) {
    const { largura, altura } = dimensoesMarcador(status, faixa)
    icone = L.divIcon({
      className: 'marcador-problema-icone',
      html: renderToStaticMarkup(
        <MarcadorProblema
          cor={aparenciaDoGrupo[grupoDe(categoria)].corForte}
          icone={iconeDe(categoria)}
          status={status}
          faixa={faixa}
        />,
      ),
      iconSize: [largura, altura],
      iconAnchor: [largura / 2, altura],
    })
    icones.set(chave, icone)
  }
  return icone
}

// Mais confiáveis por cima.
const camadaZ: Record<string, number> = { alta: 300, media: 200, baixa: 100 }

interface CamadaProblemasProps {
  problemas: ProblemaNaArea[]
  categorias: Map<number, Categoria>
}

export function CamadaProblemas({ problemas, categorias }: CamadaProblemasProps) {
  return problemas.map((problema) => {
    const categoria = categorias.get(problema.categoriaId)
    if (!categoria) return null
    return (
      <Marker
        key={problema.id}
        position={[problema.lat, problema.lng]}
        icon={iconeDoMarcador(categoria, problema.status, problema.faixa)}
        zIndexOffset={problema.status === 'nova' ? 0 : (camadaZ[problema.faixa ?? 'baixa'] ?? 0)}
        title={categoria.nome}
        alt={categoria.nome}
      />
    )
  })
}
