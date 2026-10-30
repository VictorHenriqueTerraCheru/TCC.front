import { SegmentedControl } from '@/common/components/segmentado'

import { mapModes, type MapMode } from '../models/filtros'

interface ModePickerProps {
  mode: MapMode
  onChange(mode: MapMode): void
}

export function ModePicker({ mode, onChange }: ModePickerProps) {
  return (
    <SegmentedControl
      label="O que mostrar no mapa"
      options={mapModes}
      value={mode}
      onChange={onChange}
      className="pointer-events-auto shadow-1 lg:max-w-[440px]"
    />
  )
}
