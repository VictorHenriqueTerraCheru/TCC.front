import { IconeDinamico } from '@/common/components/icone-remoto'

import { dimensoesMarcador, PONTA, varianteDo } from '../models/marcador'
import type { FaixaConfianca, StatusProblema } from '../models/problema'

interface MarcadorProblemaProps {
  cor: string
  icone: string
  status: StatusProblema
  faixa: FaixaConfianca | null
  selecionado?: boolean
}

export function MarcadorProblema({
  cor,
  icone,
  status,
  faixa,
  selecionado = false,
}: MarcadorProblemaProps) {
  const { opacidade } = varianteDo(status, faixa)
  const { largura: d, altura } = dimensoesMarcador(status, faixa)
  const tracejado = status === 'possivelmenteResolvida'
  const pulsa = faixa === 'alta' && status !== 'nova'

  return (
    <div
      className="marcador-problema"
      data-status={status}
      data-faixa={faixa ?? 'nenhuma'}
      style={{
        position: 'relative',
        width: d,
        height: altura,
        transform: selecionado ? 'scale(1.15)' : undefined,
        transformOrigin: '50% 100%',
      }}
    >
      {selecionado && (
        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: -4,
            width: d * 0.8,
            height: 8,
            transform: 'translateX(-50%)',
            borderRadius: '50%',
            background: 'rgb(0 0 0 / 0.35)',
          }}
        />
      )}
      {pulsa && (
        <span
          className="pulso-alerta"
          aria-hidden="true"
          style={{ position: 'absolute', left: 0, top: 0, width: d, height: d, background: cor }}
        />
      )}

      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: d - 2,
          transform: 'translateX(-50%)',
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderTop: `${PONTA + 2}px solid #ffffff`,
          opacity: opacidade,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: d,
          height: d,
          boxSizing: 'border-box',
          borderRadius: '50%',
          background: cor,
          border: '2.5px solid #ffffff',
          borderStyle: tracejado ? 'dashed' : 'solid',
          boxShadow: '0 4px 10px rgba(0,0,0,.28)',
          opacity: opacidade,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <IconeDinamico
          nome={icone}
          preenchido
          style={{ fontSize: Math.round(d * 0.56), lineHeight: 1, color: '#ffffff' }}
        />
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
            background: 'var(--primario-cheio)',
            color: '#ffffff',
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
            top: -8,
            left: d * 0.6,
            padding: '1px 5px',
            borderRadius: 6,
            background: 'var(--primario-cheio)',
            color: '#ffffff',
            border: '1.5px solid #ffffff',
            fontSize: 10,
            fontWeight: 700,
            lineHeight: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          Nova
        </span>
      )}
    </div>
  )
}
