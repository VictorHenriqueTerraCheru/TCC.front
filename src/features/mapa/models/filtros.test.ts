import { filtrosDasCamadas, gruposDoModo } from './filtros'

describe('filtros do mapa', () => {
  it('cada modo oferece os chips do seu tipo', () => {
    expect(gruposDoModo('problemas')).toEqual(['viaPublica', 'eletrica', 'limpeza'])
    expect(gruposDoModo('incidentes')).toEqual(['seguranca', 'transito'])
    expect(gruposDoModo('ambos')).toHaveLength(5)
  })

  it('Problemas liga só os marcadores; Incidentes só o calor', () => {
    expect(filtrosDasCamadas({ modo: 'problemas', grupos: [], somenteNovas: false })).toEqual({
      problemas: { grupos: [], status: [] },
      calor: null,
    })
    expect(filtrosDasCamadas({ modo: 'incidentes', grupos: [], somenteNovas: false })).toEqual({
      problemas: null,
      calor: { grupos: [] },
    })
  })

  it('o chip de ampulheta pede status=nova', () => {
    expect(
      filtrosDasCamadas({ modo: 'problemas', grupos: ['eletrica'], somenteNovas: true }).problemas,
    ).toEqual({ grupos: ['eletrica'], status: ['nova'] })
  })

  it('em Ambos, marcar só um grupo de incidente desliga os marcadores', () => {
    expect(
      filtrosDasCamadas({ modo: 'ambos', grupos: ['seguranca'], somenteNovas: false }),
    ).toEqual({ problemas: null, calor: { grupos: ['seguranca'] } })
  })
})
