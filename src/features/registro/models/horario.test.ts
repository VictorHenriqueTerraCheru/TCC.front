import { initialOtherTime, MAX_WINDOW, occurredAt, timeStep } from './horario'

const now = new Date('2026-09-26T09:41:30Z')
const minutes = (n: number) => n * 60_000

describe('incident time (rule 16)', () => {
  it('"Agora" sends now − 1 min and "Há 1 hora" now − 60 min', () => {
    expect(occurredAt({ mode: 'now', otherAt: null }, now).getTime()).toBe(
      now.getTime() - minutes(1),
    )
    expect(occurredAt({ mode: 'oneHour', otherAt: null }, now).getTime()).toBe(
      now.getTime() - minutes(60),
    )
  })

  it('"Outro horário" starts at the last quarter hour and moves in steps of 15', () => {
    const initial = initialOtherTime(now)
    expect(initial.toISOString()).toBe('2026-09-26T09:30:00.000Z')
    expect(timeStep(initial, -1, now)?.toISOString()).toBe('2026-09-26T09:15:00.000Z')
    expect(timeStep(initial, 1, now)).toBeNull()
  })

  it('does not go beyond 23 h 45 ago', () => {
    const limit = new Date(now.getTime() - MAX_WINDOW)
    const almostAtLimit = new Date(Math.ceil(limit.getTime() / minutes(15)) * minutes(15))
    expect(timeStep(almostAtLimit, -1, now)).toBeNull()
  })

  it('on submit, a time that left the window goes back inside it', () => {
    const chosenLongAgo = new Date(now.getTime() - minutes(24 * 60)).toISOString()
    const future = new Date(now.getTime() + minutes(5)).toISOString()
    expect(occurredAt({ mode: 'other', otherAt: chosenLongAgo }, now).getTime()).toBe(
      now.getTime() - MAX_WINDOW,
    )
    expect(occurredAt({ mode: 'other', otherAt: future }, now).getTime()).toBe(
      now.getTime() - minutes(1),
    )
  })
})
