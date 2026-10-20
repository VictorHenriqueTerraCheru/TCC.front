import { grupos } from '@/infrastructure/mocks/fixtures/grupos'

import { filtrosDasCamadas, gruposDoModo } from './filtros'

const chaves = (modo: Parameters<typeof gruposDoModo>[1]) =>
  gruposDoModo(grupos, modo).map((g) => g.chave)

describe('filtros do mapa', () => {
  it('cada modo oferece os chips do seu tipo', () => {
    expect(chaves('problemas')).toEqual(['viaPublica', 'eletrica', 'limpeza'])
    expect(chaves('incidentes')).toEqual(['seguranca', 'transito'])
    expect(chaves('ambos')).toHaveLength(5)
  })

  it('um grupo criado pelo admin aparece no modo do seu tipo', () => {
    const comNovo = [
      ...grupos,
      {
        chave: 'clima',
        rotulo: 'Clima',
        tipo: 'incidente' as const,
        cor: 'azul' as const,
        ordem: 6,
      },
    ]
    expect(gruposDoModo(comNovo, 'incidentes').map((g) => g.chave)).toEqual([
      'seguranca',
      'transito',
      'clima',
    ])
  })

  it('Ambos respeita a ordem configurada, misturando os tipos', () => {
    const naOrdem = [grupos[3]!, grupos[0]!, grupos[4]!, grupos[1]!, grupos[2]!]

    expect(gruposDoModo(naOrdem, 'ambos').map((g) => g.chave)).toEqual(naOrdem.map((g) => g.chave))
  })

  it('Problemas liga só os marcadores; Incidentes só o calor', () => {
    expect(
      filtrosDasCamadas({ modo: 'problemas', grupos: [], somenteNovas: false }, grupos),
    ).toEqual({ problemas: { grupos: [], status: [] }, calor: null })
    expect(
      filtrosDasCamadas({ modo: 'incidentes', grupos: [], somenteNovas: false }, grupos),
    ).toEqual({ problemas: null, calor: { grupos: [] } })
  })

  it('o chip de ampulheta pede status=nova', () => {
    expect(
      filtrosDasCamadas({ modo: 'problemas', grupos: ['eletrica'], somenteNovas: true }, grupos)
        .problemas,
    ).toEqual({ grupos: ['eletrica'], status: ['nova'] })
  })

  it('em Ambos, marcar só um grupo de incidente desliga os marcadores', () => {
    expect(
      filtrosDasCamadas({ modo: 'ambos', grupos: ['seguranca'], somenteNovas: false }, grupos),
    ).toEqual({ problemas: null, calor: { grupos: ['seguranca'] } })
  })
})
