import { Icon } from '@/common/components/icon'
import { Skeleton } from '@/common/ui/skeleton'
import { distanceMeters, useGeolocation } from '@/features/location'

import { useDraftAddress } from '../hooks/use-draft'
import { useDraftStore } from '../stores/draft-store'

function useAccuracy(): number | null {
  const location = useDraftStore((s) => s.location)
  const { state, position } = useGeolocation()
  if (state !== 'granted' || !position || !location) return null
  const near = distanceMeters(location, position) <= Math.max(position.accuracy, 30)
  return near && position.accuracy >= 1 ? position.accuracy : null
}

export function AddressCard() {
  const { data, updating } = useDraftAddress()
  const accuracy = useAccuracy()
  const details = [data?.city, accuracy !== null && `precisão de ±${Math.round(accuracy)} m`]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="flex gap-3" aria-live="polite">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Icon name="location_on" filled className="text-[22px]" />
      </span>

      <div className="min-h-[84px] min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">Endereço aproximado</p>
        {updating || !data ? (
          <div aria-label="Buscando endereço" className="mt-1 space-y-1.5">
            <Skeleton className="h-5 w-4/5 bg-muted" />
            <Skeleton className="h-3 w-1/2 bg-muted" />
          </div>
        ) : (
          <>
            <p className="text-lg leading-6 font-medium">{data.address}</p>
            {!data.available && (
              <p className="text-xs text-muted-foreground">
                Endereço indisponível agora; o registro segue com o ponto do mapa.
              </p>
            )}
            {details && <p className="text-xs text-muted-foreground">{details}</p>}
          </>
        )}
      </div>
    </div>
  )
}
