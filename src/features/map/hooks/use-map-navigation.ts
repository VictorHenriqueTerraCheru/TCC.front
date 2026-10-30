import { useNavigate, useSearchParams } from 'react-router'

const PANEL_PARAMETERS = ['lat', 'lng']

export function useMapNavigation() {
  const navigate = useNavigate()
  const [params] = useSearchParams()

  function filters(extra?: Record<string, string>) {
    const upcoming = new URLSearchParams(params)
    PANEL_PARAMETERS.forEach((p) => upcoming.delete(p))
    Object.entries(extra ?? {}).forEach(([key, value]) => upcoming.set(key, value))
    const text = upcoming.toString()
    return text ? `?${text}` : ''
  }

  return {
    openIssue: (id: string) => navigate({ pathname: `/map/issue/${id}`, search: filters() }),
    openArea: (lat: number, lng: number) =>
      navigate({
        pathname: '/map/area',
        search: filters({ lat: lat.toFixed(5), lng: lng.toFixed(5) }),
      }),
    close: () => navigate({ pathname: '/map', search: filters() }),
  }
}
