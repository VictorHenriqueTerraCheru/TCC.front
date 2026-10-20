import { banco } from '../banco'
import { rota } from '../rota'

const cabecalhos = { 'Content-Type': 'application/json', Authorization: 'Bearer teste' }

function registrarIncidente(categoriaId: number) {
  return fetch(rota('/incidentes'), {
    method: 'POST',
    headers: cabecalhos,
    body: JSON.stringify({
      categoriaId,
      lat: -22.95,
      lng: -43.18,
      ocorridoEm: new Date(Date.now() - 60_000).toISOString(),
    }),
  })
}

interface Resumo {
  contagens: { categoriaId: number; nome: string; dias7: number }[]
}

async function resumo(): Promise<Resumo> {
  return (await fetch(rota('/incidentes/area?lat=-22.95&lng=-43.18'))).json()
}

describe('mocks de registro usam as categorias do admin', () => {
  it('categoria criada em runtime pode ser registrada', async () => {
    const criada = banco.criarCategoria({
      nome: 'Rua inundada',
      grupo: 'seguranca',
      tipo: 'incidente',
      icone: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)

    expect((await registrarIncidente(criada.id)).status).toBe(201)
  })

  it('o resumo da área conta o incidente na categoria escolhida, não em Roubo', async () => {
    const criada = banco.criarCategoria({
      nome: 'Rua inundada',
      grupo: 'seguranca',
      tipo: 'incidente',
      icone: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)
    const antes = await resumo()

    const resposta = await registrarIncidente(criada.id)
    const depois = (await resposta.json()) as Resumo

    expect(depois.contagens.find((c) => c.categoriaId === criada.id)).toMatchObject({
      nome: 'Rua inundada',
      dias7: 1,
    })
    expect(depois.contagens.find((c) => c.categoriaId === 7)?.dias7).toBe(
      antes.contagens.find((c) => c.categoriaId === 7)?.dias7,
    )
  })

  it('o calor de um incidente novo aparece só no filtro do grupo da sua categoria', async () => {
    const grupo = banco.criarGrupo('Clima', 'incidente', 'azul')
    if (typeof grupo === 'string') throw new Error(grupo)
    const criada = banco.criarCategoria({
      nome: 'Rua inundada',
      grupo: grupo.chave,
      tipo: 'incidente',
      icone: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)
    await registrarIncidente(criada.id)
    const calor = async (grupos: string) =>
      (await (
        await fetch(
          rota(`/incidentes/calor?minLat=-23&maxLat=-22&minLng=-44&maxLng=-43&grupos=${grupos}`),
        )
      ).json()) as { lat: number; lng: number; quantidade: number }[]

    const doClima = await calor(grupo.chave)
    const deSeguranca = await calor('seguranca')

    expect(doClima).toEqual([{ lat: -22.95, lng: -43.18, quantidade: 1 }])
    expect(deSeguranca.some((c) => c.lat === -22.95 && c.lng === -43.18)).toBe(false)
  })

  it('sem categoria nova, quatro incidentes de roubo não inventam acidente nem somem do total', async () => {
    const antes = await resumo()
    for (let i = 0; i < 4; i++) await registrarIncidente(7)
    const depois = await resumo()
    const acidentes = (r: Resumo) => r.contagens.find((c) => c.categoriaId === 8)?.dias7

    expect(acidentes(depois)).toBe(acidentes(antes))
  })

  it('a área lista toda categoria de incidente ativa, mesmo com zero', async () => {
    const criada = banco.criarCategoria({
      nome: 'Rua inundada',
      grupo: 'seguranca',
      tipo: 'incidente',
      icone: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)

    expect((await resumo()).contagens.find((c) => c.categoriaId === criada.id)).toMatchObject({
      nome: 'Rua inundada',
      dias7: 0,
    })
  })

  it('mover a categoria de grupo move o calor já registrado junto', async () => {
    const grupo = banco.criarGrupo('Clima', 'incidente', 'azul')
    if (typeof grupo === 'string') throw new Error(grupo)
    await registrarIncidente(7)
    banco.editarCategoria(7, { nome: 'Roubo', grupo: grupo.chave, icone: 'roubo' })

    const nasCelulas = (grupos: string[]) =>
      banco.calor(grupos).some((c) => c.lat === -22.95 && c.lng === -43.18)

    expect(nasCelulas([grupo.chave])).toBe(true)
    expect(nasCelulas(['seguranca'])).toBe(false)
  })

  it('categoria desativada some da contagem da área', async () => {
    const criada = banco.criarCategoria({
      nome: 'Rua inundada',
      grupo: 'seguranca',
      tipo: 'incidente',
      icone: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)
    await registrarIncidente(criada.id)
    banco.alterarAtivaCategoria(criada.id, false)

    expect((await resumo()).contagens.some((c) => c.categoriaId === criada.id)).toBe(false)
  })

  it('editar a categoria atualiza os problemas já registrados', () => {
    const antes = banco.problemas().find((p) => p.categoriaId === 3)
    expect(antes).toBeDefined()

    banco.editarCategoria(3, { nome: 'Poste sem luz', grupo: 'limpeza', icone: 'ico_a' })

    const detalhe = banco.detalhe(antes!.id, false)
    expect(detalhe?.categoria).toEqual({
      id: 3,
      nome: 'Poste sem luz',
      grupo: 'limpeza',
      icone: 'ico_a',
    })
  })

  it('categoria desativada não aceita novo registro', async () => {
    banco.alterarAtivaCategoria(8, false)

    expect((await registrarIncidente(8)).status).toBe(400)
  })

  it('categoria de outro tipo continua sendo 422', async () => {
    expect((await registrarIncidente(1)).status).toBe(422)
  })
})
