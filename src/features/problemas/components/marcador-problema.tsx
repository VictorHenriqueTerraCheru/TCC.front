import type { MaterialSymbol } from 'material-symbols'

import { dimensoesMarcador, PINO, varianteDo } from '../models/marcador'
import type { FaixaConfianca, StatusProblema } from '../models/problema'

interface MarcadorProblemaProps {
  /** Cor forte da categoria como valor CSS (ex.: var(--cat-eletrica)). */
  cor: string
  icone: MaterialSymbol
  status: StatusProblema
  faixa: FaixaConfianca | null
}

/**
 * Pino do problema no mapa. Vira HTML estático (renderToStaticMarkup) dentro de um L.divIcon,
 * por isso só usa estilos inline e classes globais. Tela 24: possivelmenteResolvida = contorno
 * tracejado + selo de check. `resolvida` nunca chega aqui (a API não devolve).
 */
export function MarcadorProblema({ cor, icone, status, faixa }: MarcadorProblemaProps) {
  const variante = varianteDo(status, faixa)
  const { largura, altura } = dimensoesMarcador(status, faixa)
  const tracejado = status === 'possivelmenteResolvida'

  return (
    <div
      className="marcador-problema"
      data-status={status}
      data-faixa={faixa ?? 'nenhuma'}
      style={{ position: 'relative', width: largura, height: altura }}
    >
      <svg
        viewBox="0 0 40 50"
        width={largura}
        height={altura}
        style={{
          display: 'block',
          opacity: variante.opacidade,
          filter: variante.sombra,
          overflow: 'visible',
        }}
        aria-hidden="true"
      >
        <path
          d={PINO}
          fill={tracejado ? '#ffffff' : cor}
          stroke={tracejado ? cor : '#ffffff'}
          strokeWidth={tracejado ? 2.5 : 1.5}
          strokeDasharray={tracejado ? '4 3' : undefined}
        />
      </svg>
      <span
        className="material-symbols-rounded"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: largura * 0.48 - largura * 0.25,
          width: largura,
          textAlign: 'center',
          fontSize: largura * 0.5,
          color: tracejado ? cor : '#ffffff',
          opacity: tracejado ? 1 : Math.max(variante.opacidade, 0.9),
          fontVariationSettings: "'FILL' 1",
        }}
      >
        {icone}
      </span>
      {tracejado && (
        <span
          className="material-symbols-rounded"
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: -4,
            right: -6,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: 'var(--nova)',
            color: 'var(--nova-foreground)',
            border: '1.5px solid #fff',
            fontSize: 12,
            lineHeight: '13px',
            textAlign: 'center',
          }}
        >
          check
        </span>
      )}
      {status === 'nova' && (
        <span
          style={{
            position: 'absolute',
            top: -10,
            left: largura * 0.55,
            padding: '1px 6px',
            borderRadius: 6,
            background: 'var(--nova)',
            color: 'var(--nova-foreground)',
            fontSize: 11,
            fontWeight: 500,
            lineHeight: '16px',
            whiteSpace: 'nowrap',
          }}
        >
          Nova
        </span>
      )}
    </div>
  )
}
