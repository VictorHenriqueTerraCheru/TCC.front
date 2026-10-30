import { useEffect } from 'react'
import { useOutletContext, useParams } from 'react-router'

import { ResponsivePanel } from '@/common/components/responsive-panel'
import { SUMMARY_HEIGHT, IssueDetail, useIssueDetail } from '@/features/issues'

import { useMapNavigation } from '../hooks/use-map-navigation'
import type { MapContext } from '../models/context'

export function IssueDetailPage() {
  const { id = '' } = useParams()
  const { focus } = useOutletContext<MapContext>()
  const { close } = useMapNavigation()
  const { data } = useIssueDetail(id)

  const lat = data?.lat
  const lng = data?.lng
  useEffect(() => {
    if (lat !== undefined && lng !== undefined) focus({ lat, lng })
  }, [id, lat, lng, focus])

  return (
    <ResponsivePanel title="Detalhe do problema" onClose={close} summaryHeight={SUMMARY_HEIGHT}>
      <IssueDetail id={id} />
    </ResponsivePanel>
  )
}
