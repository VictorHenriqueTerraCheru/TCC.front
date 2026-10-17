import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MapaVetorial } from '@/common/components/mapa-vetorial'
import type { Categoria } from '@/features/categorias'
import { categorias } from '@/infrastructure/mocks/fixtures/categorias'
import { problemasNaArea } from '@/infrastructure/mocks/fixtures/problemas'

import { CamadaProblemas } from './camada-problemas'

const porId = new Map(categorias.map((c) => [c.id, c as Categoria]))

function renderizar(selecionadoId?: string) {
  const aoSelecionar = vi.fn()
  const aoTocar = vi.fn()
  render(
    <MapaVetorial centro={[-22.9519, -43.1866]} aoTocar={aoTocar}>
      <CamadaProblemas
        problemas={problemasNaArea}
        categorias={porId}
        selecionadoId={selecionadoId}
        aoSelecionar={aoSelecionar}
      />
    </MapaVetorial>,
  )
  return { aoSelecionar, aoTocar }
}

describe('CamadaProblemas', () => {
  it('clicar no marcador seleciona o problema e não chega ao toque do mapa (regra 7)', async () => {
    const { aoSelecionar, aoTocar } = renderizar()

    await userEvent.click(screen.getAllByTestId('marcador')[0]!)

    expect(aoSelecionar).toHaveBeenCalledWith(problemasNaArea[0]!.id)
    expect(aoTocar).not.toHaveBeenCalled()
  })

  it('marcador selecionado fica por cima; alta acima de baixa', () => {
    const alta = problemasNaArea.find((p) => p.faixa === 'alta' && p.status !== 'nova')!
    const baixa = problemasNaArea.find((p) => p.faixa === 'baixa' && p.status !== 'nova')!
    renderizar(baixa.id)

    const zDe = (id: string) =>
      screen.getAllByTestId('marcador').find((m) => m.querySelector(`[data-problema="${id}"]`))!
        .style.zIndex
    expect(zDe(baixa.id)).toBe('1000')
    expect(zDe(alta.id)).toBe('300')
  })
})
