import { act, render, renderHook } from '@testing-library/react'

import { useAplicarTema, useTema, useTemaStore } from './use-tema'

/** Simula o tema do celular/computador (prefers-color-scheme). */
function sistemaEscuro(escuro: boolean) {
  const original = window.matchMedia
  vi.stubGlobal('matchMedia', (consulta: string) => ({
    ...original(consulta),
    matches: consulta.includes('prefers-color-scheme: dark') ? escuro : original(consulta).matches,
  }))
}

describe('tema', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.tema
  })

  it('na primeira vez é automático e ainda não foi escolhido', () => {
    useTemaStore.setState(useTemaStore.getInitialState())
    expect(useTemaStore.getState()).toMatchObject({ preferencia: 'automatico', escolhido: false })
  })

  it.each([
    ['automatico', true, 'escuro'],
    ['automatico', false, 'claro'],
    ['claro', true, 'claro'],
    ['escuro', false, 'escuro'],
  ] as const)('preferência %s com o sistema escuro=%s → %s', (preferencia, escuro, esperado) => {
    sistemaEscuro(escuro)
    useTemaStore.setState({ preferencia })
    const { result } = renderHook(() => useTema())
    expect(result.current).toBe(esperado)
  })

  it('aplica o tema no <html> e na cor da barra do navegador, e acompanha a troca', () => {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    document.head.append(meta)
    useTemaStore.setState({ preferencia: 'escuro' })

    function Raiz() {
      useAplicarTema()
      return null
    }
    render(<Raiz />)
    expect(document.documentElement.dataset.tema).toBe('escuro')
    expect(meta.content).toBe('#121a24')

    act(() => useTemaStore.getState().definirPreferencia('claro'))
    expect(document.documentElement.dataset.tema).toBe('claro')
    expect(meta.content).toBe('#f2f2f7')
    meta.remove()
  })

  it('guarda a escolha no localStorage (lida pelo script do index.html antes da pintura)', () => {
    act(() => {
      useTemaStore.getState().definirPreferencia('escuro')
      useTemaStore.getState().concluirEscolha()
    })
    expect(JSON.parse(localStorage.getItem('ocorrencias.tema')!).state).toEqual({
      preferencia: 'escuro',
      escolhido: true,
    })
  })
})
