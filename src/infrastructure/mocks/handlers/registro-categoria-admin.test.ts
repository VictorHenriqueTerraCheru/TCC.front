import { banco } from '../banco'
import { rota } from '../rota'

const cabecalhos = { 'Content-Type': 'application/json', Authorization: 'Bearer teste' }

function registrarIncidente(categoriaId: number) {
  return fetch(rota('/incidents'), {
    method: 'POST',
    headers: cabecalhos,
    body: JSON.stringify({
      categoryId: categoriaId,
      lat: -22.95,
      lng: -43.18,
      occurredAt: new Date(Date.now() - 60_000).toISOString(),
    }),
  })
}

interface Resumo {
  counts: { categoryId: number; name: string; days7: number }[]
}

async function resumo(): Promise<Resumo> {
  return (await fetch(rota('/incidents/area?lat=-22.95&lng=-43.18'))).json()
}

describe('mocks de registro usam as categorias do admin', () => {
  it('categoria criada em runtime pode ser registrada', async () => {
    const criada = banco.criarCategoria({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)

    expect((await registrarIncidente(criada.id)).status).toBe(201)
  })

  it('o resumo da área conta o incidente na categoria escolhida, não em Roubo', async () => {
    const criada = banco.criarCategoria({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)
    const antes = await resumo()

    const resposta = await registrarIncidente(criada.id)
    const depois = (await resposta.json()) as Resumo

    expect(depois.counts.find((c) => c.categoryId === criada.id)).toMatchObject({
      name: 'Rua inundada',
      days7: 1,
    })
    expect(depois.counts.find((c) => c.categoryId === 7)?.days7).toBe(
      antes.counts.find((c) => c.categoryId === 7)?.days7,
    )
  })

  it('o calor de um incidente novo aparece só no filtro do grupo da sua categoria', async () => {
    const grupo = banco.criarGrupo('Clima', 'incident', 'blue')
    if (typeof grupo === 'string') throw new Error(grupo)
    const criada = banco.criarCategoria({
      name: 'Rua inundada',
      group: grupo.key,
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)
    await registrarIncidente(criada.id)
    const calor = async (grupos: string) =>
      (await (
        await fetch(
          rota(`/incidents/heatmap?minLat=-23&maxLat=-22&minLng=-44&maxLng=-43&groups=${grupos}`),
        )
      ).json()) as { lat: number; lng: number; count: number }[]

    const doClima = await calor(grupo.key)
    const deSeguranca = await calor('seguranca')

    expect(doClima).toEqual([{ lat: -22.95, lng: -43.18, count: 1 }])
    expect(deSeguranca.some((c) => c.lat === -22.95 && c.lng === -43.18)).toBe(false)
  })

  it('sem categoria nova, quatro incidentes de roubo não inventam acidente nem somem do total', async () => {
    const antes = await resumo()
    for (let i = 0; i < 4; i++) await registrarIncidente(7)
    const depois = await resumo()
    const acidentes = (r: Resumo) => r.counts.find((c) => c.categoryId === 8)?.days7

    expect(acidentes(depois)).toBe(acidentes(antes))
  })

  it('a área lista toda categoria de incidente ativa, mesmo com zero', async () => {
    const criada = banco.criarCategoria({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)

    expect((await resumo()).counts.find((c) => c.categoryId === criada.id)).toMatchObject({
      name: 'Rua inundada',
      days7: 0,
    })
  })

  it('mover a categoria de grupo move o calor já registrado junto', async () => {
    const grupo = banco.criarGrupo('Clima', 'incident', 'blue')
    if (typeof grupo === 'string') throw new Error(grupo)
    await registrarIncidente(7)
    banco.editarCategoria(7, { name: 'Roubo', group: grupo.key, icon: 'roubo' })

    const nasCelulas = (grupos: string[]) =>
      banco.calor(grupos).some((c) => c.lat === -22.95 && c.lng === -43.18)

    expect(nasCelulas([grupo.key])).toBe(true)
    expect(nasCelulas(['seguranca'])).toBe(false)
  })

  it('editar a categoria atualiza também o histórico do usuário', () => {
    banco.editarCategoria(1, { name: 'Buraco grande', group: 'eletrica', icon: 'ico_a' })

    const doBuraco = banco.historico('todos').filter((h) => h.category.id === 1)
    expect(doBuraco.length).toBeGreaterThan(0)
    for (const item of doBuraco) {
      expect(item.category).toEqual({
        id: 1,
        name: 'Buraco grande',
        group: 'eletrica',
        icon: 'ico_a',
      })
    }
  })

  it('categoria desativada some da contagem da área', async () => {
    const criada = banco.criarCategoria({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof criada === 'string') throw new Error(criada)
    await registrarIncidente(criada.id)
    banco.alterarAtivaCategoria(criada.id, false)

    expect((await resumo()).counts.some((c) => c.categoryId === criada.id)).toBe(false)
  })

  it('editar a categoria atualiza os problemas já registrados', () => {
    const antes = banco.problemas().find((p) => p.categoryId === 3)
    expect(antes).toBeDefined()

    banco.editarCategoria(3, { name: 'Poste sem luz', group: 'limpeza', icon: 'ico_a' })

    const detalhe = banco.detalhe(antes!.id, false)
    expect(detalhe?.category).toEqual({
      id: 3,
      name: 'Poste sem luz',
      group: 'limpeza',
      icon: 'ico_a',
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
