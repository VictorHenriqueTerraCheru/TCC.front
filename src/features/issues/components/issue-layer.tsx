import { Marker } from '@vis.gl/react-maplibre'

import {
  colorAppearance,
  DEFAULT_ICON,
  iconOf,
  useAppearance,
  type Category,
} from '@/features/categories'

import type { IssueInArea } from '../models/issue'
import { IssueMarker } from './issue-marker'

const layerZ: Record<string, number> = { high: 300, medium: 200, low: 100 }

interface IssueLayerProps {
  issues: IssueInArea[]
  categories: Map<number, Category>
  selectedId?: string
  onSelect(id: string): void
}

export function IssueLayer({ issues, categories, selectedId, onSelect }: IssueLayerProps) {
  const { appearanceOf } = useAppearance()
  return issues.map((issue) => {
    const category = categories.get(issue.categoryId)
    const selected = issue.id === selectedId
    const z = selected ? 1000 : issue.status === 'new' ? 0 : (layerZ[issue.band ?? 'low'] ?? 0)
    return (
      <Marker
        key={issue.id}
        latitude={issue.lat}
        longitude={issue.lng}
        anchor="bottom"
        style={{ zIndex: z }}
        onClick={(e) => {
          e.originalEvent.stopPropagation()
          onSelect(issue.id)
        }}
      >
        <button
          type="button"
          aria-label={category?.name ?? 'Problema'}
          data-issue={issue.id}
          className="block cursor-pointer focus-visible:outline-2"
        >
          <IssueMarker
            color={(category ? appearanceOf(category) : colorAppearance.gray).strongColor}
            icon={category ? iconOf(category) : DEFAULT_ICON}
            status={issue.status}
            band={issue.band}
            selected={selected}
          />
        </button>
      </Marker>
    )
  })
}
