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

  it('Nova leva o selo e possivelmente resolvida leva contorno tracejado com check', () => {
    const nova = renderToStaticMarkup(
      <MarcadorProblema cor="red" icone="bolt" status="nova" faixa={null} />,
    )
    const possivel = renderToStaticMarkup(
      <MarcadorProblema cor="red" icone="bolt" status="possivelmenteResolvida" faixa="alta" />,
    )
    expect(nova).toContain('>Nova<')
    expect(possivel).toContain('stroke-dasharray="4 3"')
    expect(possivel).toContain('>check<')
  })
})
