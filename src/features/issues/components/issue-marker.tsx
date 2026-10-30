import { DynamicIcon } from '@/common/components/remote-icon'

import { markerSize, TIP, variantFor } from '../models/marker'
import type { TrustBand, IssueStatus } from '../models/issue'

interface IssueMarkerProps {
  color: string
  icon: string
  status: IssueStatus
  band: TrustBand | null
  selected?: boolean
}

export function IssueMarker({ color, icon, status, band, selected = false }: IssueMarkerProps) {
  const { opacity } = variantFor(status, band)
  const { width: d, height } = markerSize(status, band)
  const dashed = status === 'possiblyResolved'
  const pulses = band === 'high' && status !== 'new'

  return (
    <div
      className="issue-marker"
      data-status={status}
      data-band={band ?? 'none'}
      style={{
        position: 'relative',
        width: d,
        height,
        transform: selected ? 'scale(1.15)' : undefined,
        transformOrigin: '50% 100%',
      }}
    >
      {selected && (
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
      {pulses && (
        <span
          className="alert-pulse"
          aria-hidden="true"
          style={{ position: 'absolute', left: 0, top: 0, width: d, height: d, background: color }}
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
          borderTop: `${TIP + 2}px solid #ffffff`,
          opacity,
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
          background: color,
          border: '2.5px solid #ffffff',
          borderStyle: dashed ? 'dashed' : 'solid',
          boxShadow: '0 4px 10px rgba(0,0,0,.28)',
          opacity,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <DynamicIcon
          name={icon}
          filled
          style={{ fontSize: Math.round(d * 0.56), lineHeight: 1, color: '#ffffff' }}
        />
      </span>
      {dashed && (
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
            background: 'var(--brand-solid)',
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
      {status === 'new' && (
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: d * 0.6,
            padding: '1px 5px',
            borderRadius: 6,
            background: 'var(--brand-solid)',
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
