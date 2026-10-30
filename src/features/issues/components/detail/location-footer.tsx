import { Icon } from '@/common/components/icon'
import { distanceText } from '@/common/lib/formatting'
import { Button } from '@/common/ui/button'
import { useEnableLocation, useGeolocation } from '@/features/location'

import { MAX_FOOTER_DISTANCE_M, useDistanceTo } from '../../hooks/use-distance-to'

export function LocationFooter({
  point,
  showDistance = true,
}: {
  point: { lat: number; lng: number }
  showDistance?: boolean
}) {
  const { state } = useGeolocation()
  const distance = useDistanceTo(point)
  const { activate, dialog } = useEnableLocation()

  if (state === 'prompt' || state === 'denied') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-superficie-2 py-2 pr-2 pl-4">
        <Icon name="location_disabled" className="text-[20px] text-muted-foreground" />
        <p className="flex-1 text-sm">
          Ative a localização para seu voto pesar mais quando estiver perto
        </p>
        <Button variant="ghost" size="sm" onClick={() => void activate()}>
          Ativar
        </Button>
        {dialog}
      </div>
    )
  }

  if (!showDistance || distance === null || distance > MAX_FOOTER_DISTANCE_M) return null

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-primario-suave p-3 text-primario">
      <Icon name="navigation" filled className="text-[20px] text-primario" />
      <p className="text-sm">
        Você está a {distanceText(distance)} — seu voto pesa mais por estar perto
      </p>
    </div>
  )
}
