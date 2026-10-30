import { database } from '../banco'
import { route } from '../rota'

const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer teste' }

function reportIncident(categoryId: number) {
  return fetch(route('/incidents'), {
    method: 'POST',
    headers,
    body: JSON.stringify({
      categoryId,
      lat: -22.95,
      lng: -43.18,
      occurredAt: new Date(Date.now() - 60_000).toISOString(),
    }),
  })
}

interface Summary {
  counts: { categoryId: number; name: string; days7: number }[]
}

async function summary(): Promise<Summary> {
  return (await fetch(route('/incidents/area?lat=-22.95&lng=-43.18'))).json()
}

describe('report mocks use the admin categories', () => {
  it('category created at runtime can be reported', async () => {
    const created = database.createCategory({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof created === 'string') throw new Error(created)

    expect((await reportIncident(created.id)).status).toBe(201)
  })

  it('the area summary counts the incident in the chosen category, not in Roubo', async () => {
    const created = database.createCategory({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof created === 'string') throw new Error(created)
    const before = await summary()

    const response = await reportIncident(created.id)
    const after = (await response.json()) as Summary

    expect(after.counts.find((c) => c.categoryId === created.id)).toMatchObject({
      name: 'Rua inundada',
      days7: 1,
    })
    expect(after.counts.find((c) => c.categoryId === 7)?.days7).toBe(
      before.counts.find((c) => c.categoryId === 7)?.days7,
    )
  })

  it("the heatmap of a new incident only shows in the filter of its category's group", async () => {
    const group = database.createGroup('Clima', 'incident', 'blue')
    if (typeof group === 'string') throw new Error(group)
    const created = database.createCategory({
      name: 'Rua inundada',
      group: group.key,
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof created === 'string') throw new Error(created)
    await reportIncident(created.id)
    const heatmap = async (groups: string) =>
      (await (
        await fetch(
          route(`/incidents/heatmap?minLat=-23&maxLat=-22&minLng=-44&maxLng=-43&groups=${groups}`),
        )
      ).json()) as { lat: number; lng: number; count: number }[]

    const weatherCells = await heatmap(group.key)
    const fallback = await heatmap('seguranca')

    expect(weatherCells).toEqual([{ lat: -22.95, lng: -43.18, count: 1 }])
    expect(fallback.some((c) => c.lat === -22.95 && c.lng === -43.18)).toBe(false)
  })

  it('without a new category, four robbery incidents do not invent an accident nor vanish from the total', async () => {
    const before = await summary()
    for (let i = 0; i < 4; i++) await reportIncident(7)
    const after = await summary()
    const accidents = (r: Summary) => r.counts.find((c) => c.categoryId === 8)?.days7

    expect(accidents(after)).toBe(accidents(before))
  })

  it('the area lists every active incident category, even with zero', async () => {
    const created = database.createCategory({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof created === 'string') throw new Error(created)

    expect((await summary()).counts.find((c) => c.categoryId === created.id)).toMatchObject({
      name: 'Rua inundada',
      days7: 0,
    })
  })

  it('moving the category to another group moves the already reported heatmap along', async () => {
    const group = database.createGroup('Clima', 'incident', 'blue')
    if (typeof group === 'string') throw new Error(group)
    await reportIncident(7)
    database.editCategory(7, { name: 'Roubo', group: group.key, icon: 'roubo' })

    const inCells = (groups: string[]) =>
      database.heatmap(groups).some((c) => c.lat === -22.95 && c.lng === -43.18)

    expect(inCells([group.key])).toBe(true)
    expect(inCells(['seguranca'])).toBe(false)
  })

  it("editing the category also updates the user's history", () => {
    database.editCategory(1, { name: 'Buraco grande', group: 'eletrica', icon: 'ico_a' })

    const potholeEntries = database.history('all').filter((h) => h.category.id === 1)
    expect(potholeEntries.length).toBeGreaterThan(0)
    for (const item of potholeEntries) {
      expect(item.category).toEqual({
        id: 1,
        name: 'Buraco grande',
        group: 'eletrica',
        icon: 'ico_a',
      })
    }
  })

  it('deactivated category disappears from the area count', async () => {
    const created = database.createCategory({
      name: 'Rua inundada',
      group: 'seguranca',
      type: 'incident',
      icon: 'ico_a',
    })
    if (typeof created === 'string') throw new Error(created)
    await reportIncident(created.id)
    database.setCategoryActive(created.id, false)

    expect((await summary()).counts.some((c) => c.categoryId === created.id)).toBe(false)
  })

  it('editing the category updates the already reported issues', () => {
    const before = database.issues().find((p) => p.categoryId === 3)
    expect(before).toBeDefined()

    database.editCategory(3, { name: 'Poste sem luz', group: 'limpeza', icon: 'ico_a' })

    const detail = database.detail(before!.id, false)
    expect(detail?.category).toEqual({
      id: 3,
      name: 'Poste sem luz',
      group: 'limpeza',
      icon: 'ico_a',
    })
  })

  it('deactivated category does not accept new reports', async () => {
    database.setCategoryActive(8, false)

    expect((await reportIncident(8)).status).toBe(400)
  })

  it('category of another type is still 422', async () => {
    expect((await reportIncident(1)).status).toBe(422)
  })
})
