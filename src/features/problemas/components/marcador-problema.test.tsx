import { renderToStaticMarkup } from 'react-dom/server'

import type { TrustBand, IssueStatus } from '../models/problema'
import { markerSize } from '../models/marcador'
import { IssueMarker } from './marcador-problema'

const variations: [IssueStatus, TrustBand | null][] = [
  ['active', 'high'],
  ['active', 'medium'],
  ['active', 'low'],
  ['new', null],
  ['possiblyResolved', 'medium'],
]

describe('IssueMarker', () => {
  it.each(variations)('%s / %s', (status, band) => {
    const html = renderToStaticMarkup(
      <IssueMarker color="var(--cat-ocre)" icon="bolt" status={status} band={band} />,
    )
    expect(html).toMatchSnapshot()
  })

  it('High is larger than Medium, which is larger than Low', () => {
    const high = markerSize('active', 'high').width
    const medium = markerSize('active', 'medium').width
    const low = markerSize('active', 'low').width
    expect(high).toBeGreaterThan(medium)
    expect(medium).toBeGreaterThan(low)
  })

  it('sizes by band: high 38, medium 31, low 25 (+7 for the tip)', () => {
    expect(markerSize('active', 'high')).toEqual({ width: 38, height: 45 })
    expect(markerSize('active', 'medium').width).toBe(31)
    expect(markerSize('active', 'low').width).toBe(25)
  })

  it('high pulses; new and low do not', () => {
    const html = (status: IssueStatus, band: TrustBand | null) =>
      renderToStaticMarkup(<IssueMarker color="red" icon="bolt" status={status} band={band} />)
    expect(html('active', 'high')).toContain('pulso-alerta')
    expect(html('active', 'low')).not.toContain('pulso-alerta')
    expect(html('new', null)).not.toContain('pulso-alerta')
  })

  it('New gets the badge and possibly resolved gets a dashed border with check', () => {
    const fresh = renderToStaticMarkup(
      <IssueMarker color="red" icon="bolt" status="new" band={null} />,
    )
    const possible = renderToStaticMarkup(
      <IssueMarker color="red" icon="bolt" status="possiblyResolved" band="high" />,
    )
    expect(fresh).toContain('>Nova<')
    expect(possible).toContain('border-style:dashed')
    expect(possible).toContain('>check<')
  })
})
