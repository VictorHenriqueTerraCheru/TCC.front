import { renderToStaticMarkup } from 'react-dom/server'

import type { FaixaConfianca, StatusProblema } from '../models/problema'
import { dimensoesMarcador } from '../models/marcador'
import { MarcadorProblema } from './marcador-problema'

const variacoes: [StatusProblema, FaixaConfianca | null][] = [
  ['ativa', 'alta'],
  ['ativa', 'media'],
  ['ativa', 'baixa'],
  ['nova', null],
  ['possivelmenteResolvida', 'media'],
]

describe('MarcadorProblema', () => {
  it.each(variacoes)('%s / %s', (status, faixa) => {
    const html = renderToStaticMarkup(
      <MarcadorProblema cor="var(--cat-eletrica)" icone="bolt" status={status} faixa={faixa} />,
    )
    expect(html).toMatchSnapshot()
  })

  it('Alta é maior que Média, que é maior que Baixa', () => {
    const alta = dimensoesMarcador('ativa', 'alta').largura
    const media = dimensoesMarcador('ativa', 'media').largura
    const baixa = dimensoesMarcador('ativa', 'baixa').largura
    expect(alta).toBeGreaterThan(media)
    expect(media).toBeGreaterThan(baixa)
  })

  it('tamanhos por faixa: alta 38, média 31, baixa 25 (+7 da ponta)', () => {
    expect(dimensoesMarcador('ativa', 'alta')).toEqual({ largura: 38, altura: 45 })
    expect(dimensoesMarcador('ativa', 'media').largura).toBe(31)
    expect(dimensoesMarcador('ativa', 'baixa').largura).toBe(25)
  })

  it('alta pulsa; nova e baixa não', () => {
    const html = (status: StatusProblema, faixa: FaixaConfianca | null) =>
      renderToStaticMarkup(
        <MarcadorProblema cor="red" icone="bolt" status={status} faixa={faixa} />,
      )
    expect(html('ativa', 'alta')).toContain('pulso-alerta')
    expect(html('ativa', 'baixa')).not.toContain('pulso-alerta')
    expect(html('nova', null)).not.toContain('pulso-alerta')
  })

  it('Nova leva o selo e possivelmente resolvida leva borda tracejada com check', () => {
    const nova = renderToStaticMarkup(
      <MarcadorProblema cor="red" icone="bolt" status="nova" faixa={null} />,
    )
    const possivel = renderToStaticMarkup(
      <MarcadorProblema cor="red" icone="bolt" status="possivelmenteResolvida" faixa="alta" />,
    )
    expect(nova).toContain('>Nova<')
    expect(possivel).toContain('border-style:dashed')
    expect(possivel).toContain('>check<')
  })
})
