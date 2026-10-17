import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'

import { aparenciaDoGrupo, grupoDe, iconeDe, type Categoria } from '@/features/categorias'

import { MarcadorProblema } from '../components/marcador-problema'
import { dimensoesMarcador } from '../models/marcador'
import type { FaixaConfianca, StatusProblema } from '../models/problema'

// Um divIcon por combinação (categoria, status, faixa): o mapa pode ter até 500 marcadores.
const icones = new Map<string, L.DivIcon>()

/** L.divIcon do pino (cacheado). Usado na camada do mapa e no mapa do registro. */
export function iconeMarcadorProblema(
  categoria: Pick<Categoria, 'id' | 'grupo' | 'icone'>,
  status: StatusProblema,
  faixa: FaixaConfianca | null,
  selecionado = false,
) {
  const chave = `${categoria.id}|${status}|${faixa}|${selecionado}`
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
          selecionado={selecionado}
        />,
      ),
      iconSize: [largura, altura],
      iconAnchor: [largura / 2, altura],
    })
    icones.set(chave, icone)
  }
  return icone
}
