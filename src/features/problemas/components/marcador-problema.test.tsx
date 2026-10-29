import { renderToStaticMarkup } from 'react-dom/server'

import type { FaixaConfianca, StatusProblema } from '../models/problema'
import { dimensoesMarcador } from '../models/marcador'
import { MarcadorProblema } from './marcador-problema'

const variacoes: [StatusProblema, FaixaConfianca | null][] = [
  ['active', 'high'],
  ['active', 'medium'],
  ['active', 'low'],
  ['new', null],
  ['possiblyResolved', 'medium'],
]

describe('MarcadorProblema', () => {
  it.each(variacoes)('%s / %s', (status, faixa) => {
    const html = renderToStaticMarkup(
      <MarcadorProblema color="var(--cat-ocre)" icon="bolt" status={status} band={faixa} />,
    )
    expect(html).toMatchSnapshot()
  })

  it('Alta é maior que Média, que é maior que Baixa', () => {
    const alta = dimensoesMarcador('active', 'high').largura
    const media = dimensoesMarcador('active', 'medium').largura
    const baixa = dimensoesMarcador('active', 'low').largura
    expect(alta).toBeGreaterThan(media)
    expect(media).toBeGreaterThan(baixa)
  })

  it('tamanhos por faixa: alta 38, média 31, baixa 25 (+7 da ponta)', () => {
    expect(dimensoesMarcador('active', 'high')).toEqual({ largura: 38, altura: 45 })
    expect(dimensoesMarcador('active', 'medium').largura).toBe(31)
    expect(dimensoesMarcador('active', 'low').largura).toBe(25)
  })

  it('alta pulsa; nova e baixa não', () => {
    const html = (status: StatusProblema, faixa: FaixaConfianca | null) =>
      renderToStaticMarkup(
        <MarcadorProblema color="red" icon="bolt" status={status} band={faixa} />,
      )
    expect(html('active', 'high')).toContain('pulso-alerta')
    expect(html('active', 'low')).not.toContain('pulso-alerta')
    expect(html('new', null)).not.toContain('pulso-alerta')
  })

  it('Nova leva o selo e possivelmente resolvida leva borda tracejada com check', () => {
    const nova = renderToStaticMarkup(
      <MarcadorProblema color="red" icon="bolt" status="new" band={null} />,
    )
    const possivel = renderToStaticMarkup(
      <MarcadorProblema color="red" icon="bolt" status="possiblyResolved" band="high" />,
    )
    expect(nova).toContain('>Nova<')
    expect(possivel).toContain('border-style:dashed')
    expect(possivel).toContain('>check<')
  })
})
