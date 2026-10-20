import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MapaVetorial } from '@/common/components/mapa-vetorial'
import type { Categoria } from '@/features/categorias'
import { categorias } from '@/infrastructure/mocks/fixtures/categorias'
import { problemasNaArea } from '@/infrastructure/mocks/fixtures/problemas'
import { renderizar } from '@/test/render'

import { CamadaProblemas } from './camada-problemas'

const porId = new Map(categorias.map((c) => [c.id, c as Categoria]))

function montar(selecionadoId?: string, mapa = porId) {
  const aoSelecionar = vi.fn()
  const aoTocar = vi.fn()
  renderizar(
    <MapaVetorial centro={[-22.9519, -43.1866]} aoTocar={aoTocar}>
      <CamadaProblemas
        problemas={problemasNaArea}
        categorias={mapa}
        selecionadoId={selecionadoId}
        aoSelecionar={aoSelecionar}
      />
    </MapaVetorial>,
  )
  return { aoSelecionar, aoTocar }
}

describe('CamadaProblemas', () => {
  it('clicar no marcador seleciona o problema e não chega ao toque do mapa (regra 7)', async () => {
    const { aoSelecionar, aoTocar } = montar()

    await userEvent.click(screen.getAllByTestId('marcador')[0]!)

    expect(aoSelecionar).toHaveBeenCalledWith(problemasNaArea[0]!.id)
    expect(aoTocar).not.toHaveBeenCalled()
  })

  it('marcador selecionado fica por cima; alta acima de baixa', () => {
    const alta = problemasNaArea.find((p) => p.faixa === 'alta' && p.status !== 'nova')!
    const baixa = problemasNaArea.find((p) => p.faixa === 'baixa' && p.status !== 'nova')!
    montar(baixa.id)

    const zDe = (id: string) =>
      screen.getAllByTestId('marcador').find((m) => m.querySelector(`[data-problema="${id}"]`))!
        .style.zIndex
    expect(zDe(baixa.id)).toBe('1000')
    expect(zDe(alta.id)).toBe('300')
  })

  it('problema de categoria desativada continua no mapa, em cinza', () => {
    montar(undefined, new Map())

    expect(screen.getAllByTestId('marcador')).toHaveLength(problemasNaArea.length)
    expect(screen.getAllByRole('button', { name: 'Problema' })).toHaveLength(problemasNaArea.length)
  })
})
