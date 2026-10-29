import { horarioInicialOutro, JANELA_MAXIMA, ocorridoEm, passoHorario } from './horario'

const agora = new Date('2026-09-26T09:41:30Z')
const minutos = (n: number) => n * 60_000

describe('horário do incidente (regra 16)', () => {
  it('"Agora" envia agora − 1 min e "Há 1 hora" agora − 60 min', () => {
    expect(ocorridoEm({ modo: 'agora', outroEm: null }, agora).getTime()).toBe(
      agora.getTime() - minutos(1),
    )
    expect(ocorridoEm({ modo: 'umaHora', outroEm: null }, agora).getTime()).toBe(
      agora.getTime() - minutos(60),
    )
  })

  it('"Outro horário" começa no último quarto de hora e anda de 15 em 15', () => {
    const inicial = horarioInicialOutro(agora)
    expect(inicial.toISOString()).toBe('2026-09-26T09:30:00.000Z')
    expect(passoHorario(inicial, -1, agora)?.toISOString()).toBe('2026-09-26T09:15:00.000Z')
    expect(passoHorario(inicial, 1, agora)).toBeNull()
  })

  it('não passa de 23 h 45 atrás', () => {
    const limite = new Date(agora.getTime() - JANELA_MAXIMA)
    const quaseNoLimite = new Date(Math.ceil(limite.getTime() / minutos(15)) * minutos(15))
    expect(passoHorario(quaseNoLimite, -1, agora)).toBeNull()
  })

  it('no envio, um horário que saiu da janela volta para dentro dela', () => {
    const escolhidoHaMuito = new Date(agora.getTime() - minutos(24 * 60)).toISOString()
    const futuro = new Date(agora.getTime() + minutos(5)).toISOString()
    expect(ocorridoEm({ modo: 'other', outroEm: escolhidoHaMuito }, agora).getTime()).toBe(
      agora.getTime() - JANELA_MAXIMA,
    )
    expect(ocorridoEm({ modo: 'other', outroEm: futuro }, agora).getTime()).toBe(
      agora.getTime() - minutos(1),
    )
  })
})
