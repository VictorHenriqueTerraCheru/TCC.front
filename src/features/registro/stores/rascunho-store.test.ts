import { useRascunhoStore } from './rascunho-store'

beforeEach(() => {
  useRascunhoStore.getState().limpar()
  sessionStorage.clear()
})

describe('rascunho do registro (regra 5)', () => {
  it('começa vazio, com horário "agora"', () => {
    expect(useRascunhoStore.getState()).toMatchObject({
      categoriaId: null,
      local: null,
      descricao: '',
      horario: { modo: 'agora', outroEm: null },
    })
  })

  it('guarda categoria, local, descrição e horário', () => {
    const { escolherCategoria, definirLocal, definirDescricao, definirHorario } =
      useRascunhoStore.getState()
    escolherCategoria(3)
    definirLocal({ lat: -22.95, lng: -43.18 })
    definirDescricao('Buraco fundo na calçada')
    definirHorario({ modo: 'outro', outroEm: '2026-10-20T10:00:00.000Z' })

    expect(useRascunhoStore.getState()).toMatchObject({
      categoriaId: 3,
      local: { lat: -22.95, lng: -43.18 },
      descricao: 'Buraco fundo na calçada',
      horario: { modo: 'outro', outroEm: '2026-10-20T10:00:00.000Z' },
    })
  })

  it('definirLocal com o mesmo centro mantém o objeto (não reinicia o debounce do endereço)', () => {
    useRascunhoStore.getState().definirLocal({ lat: -22.95, lng: -43.18 })
    const antes = useRascunhoStore.getState().local

    useRascunhoStore.getState().definirLocal({ lat: -22.95, lng: -43.18 })

    expect(useRascunhoStore.getState().local).toBe(antes)
  })

  it('definirLocal com outro centro troca o objeto', () => {
    useRascunhoStore.getState().definirLocal({ lat: -22.95, lng: -43.18 })
    const antes = useRascunhoStore.getState().local

    useRascunhoStore.getState().definirLocal({ lat: -22.95, lng: -43.19 })

    expect(useRascunhoStore.getState().local).not.toBe(antes)
    expect(useRascunhoStore.getState().local).toEqual({ lat: -22.95, lng: -43.19 })
  })

  it('limpar volta ao estado inicial', () => {
    const { escolherCategoria, definirLocal, definirDescricao, limpar } =
      useRascunhoStore.getState()
    escolherCategoria(3)
    definirLocal({ lat: -22.95, lng: -43.18 })
    definirDescricao('x')

    limpar()

    expect(useRascunhoStore.getState()).toMatchObject({
      categoriaId: null,
      local: null,
      descricao: '',
      horario: { modo: 'agora', outroEm: null },
    })
  })

  it('persiste no sessionStorage, para sobreviver a recarregar e à falha de envio', () => {
    useRascunhoStore.getState().definirDescricao('Poste apagado')

    const guardado = JSON.parse(sessionStorage.getItem('ocorrencias.rascunhoRegistro') ?? '{}')
    expect(guardado.state.descricao).toBe('Poste apagado')
  })
})
