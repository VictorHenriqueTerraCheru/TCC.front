import type { TrustBand, IssueStatus } from './issue'

interface Variant {
  diameter: number
  opacity: number
}

const variants: Record<TrustBand, Variant> = {
  high: { diameter: 38, opacity: 1 },
  medium: { diameter: 31, opacity: 1 },
  low: { diameter: 25, opacity: 0.55 },
}
const newVariant: Variant = { diameter: 28, opacity: 0.9 }

export const TIP = 7

export function variantFor(status: IssueStatus, band: TrustBand | null): Variant {
  return status === 'new' ? newVariant : variants[band ?? 'low']
}

export function markerSize(status: IssueStatus, band: TrustBand | null) {
  const { diameter } = variantFor(status, band)
  return { width: diameter, height: diameter + TIP }
}
