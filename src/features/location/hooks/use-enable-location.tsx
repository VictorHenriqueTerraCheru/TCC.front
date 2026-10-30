import { useState } from 'react'

import { LocationHelpDialog } from '../components/location-help-dialog'
import { useGeolocation } from './use-geolocation'

export function useEnableLocation() {
  const { state, request } = useGeolocation()
  const [helpOpen, setHelpOpen] = useState(false)

  async function activate() {
    if (state === 'denied' || state === 'unavailable') {
      setHelpOpen(true)
      return null
    }
    return request()
  }

  const dialog = <LocationHelpDialog open={helpOpen} onOpenChange={setHelpOpen} state={state} />

  return { activate, dialog }
}
