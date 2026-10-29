import { useGuardaStore, type AcaoPendente } from './guarda-store'

const voto: AcaoPendente = { type: 'votar', problemaId: 'p-1', value: 'yes' }
const pendencia = { retorno: '/problemas/p-1?aba=1', acao: voto }

beforeEach(() => {
  useGuardaStore.setState({ reason: null, expirou: false, pendencia: null })
  sessionStorage.clear()
})

describe('guarda-store (regras 1 e 13)', () => {
  it('pedirConta abre a folha e guarda a ação com a rota de retorno', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia)

    expect(useGuardaStore.getState()).toMatchObject({ reason: 'votar', expirou: false, pendencia })
  })

  it('pedirConta marca a expiração quando o token venceu', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia, true)

    expect(useGuardaStore.getState().expirou).toBe(true)
  })

  it('fecharFolha mantém a pendência (o visitante foi para login/cadastro)', () => {
    useGuardaStore.getState().pedirConta('registrar', pendencia)
    useGuardaStore.getState().fecharFolha()

    expect(useGuardaStore.getState().reason).toBeNull()
    expect(useGuardaStore.getState().pendencia).toEqual(pendencia)
  })

  it('descartar ("Agora não") esquece folha, ação e expiração', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia, true)
    useGuardaStore.getState().descartar()

    expect(useGuardaStore.getState()).toMatchObject({
      reason: null,
      expirou: false,
      pendencia: null,
    })
  })

  it('concluirLogin devolve o retorno e mantém a ação para a tela de destino', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia, true)

    expect(useGuardaStore.getState().concluirLogin()).toBe('/problemas/p-1?aba=1')
    expect(useGuardaStore.getState()).toMatchObject({ reason: null, expirou: false, pendencia })
  })

  it('concluirLogin sem ação pendente devolve o retorno mas não guarda nada', () => {
    useGuardaStore.getState().pedirConta('registrar', { retorno: '/mapa', acao: null })

    expect(useGuardaStore.getState().concluirLogin()).toBe('/mapa')
    expect(useGuardaStore.getState().pendencia).toBeNull()
  })

  it('concluirLogin sem pendência devolve null', () => {
    expect(useGuardaStore.getState().concluirLogin()).toBeNull()
  })

  it('consumirAcao entrega a ação uma só vez', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia)

    expect(useGuardaStore.getState().consumirAcao((a) => a.type === 'votar')).toEqual(voto)
    expect(useGuardaStore.getState().consumirAcao((a) => a.type === 'votar')).toBeNull()
  })

  it('consumirAcao deixa a ação quando ela não é da tela que perguntou', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia)

    expect(useGuardaStore.getState().consumirAcao((a) => a.type === 'continuarRegistro')).toBeNull()
    expect(useGuardaStore.getState().pendencia).toEqual(pendencia)
  })

  it('só a pendência vai para o sessionStorage; a folha aberta não sobrevive ao recarregar', () => {
    useGuardaStore.getState().pedirConta('votar', pendencia, true)

    const guardado = JSON.parse(sessionStorage.getItem('ocorrencias.pendencia') ?? '{}')
    expect(guardado.state).toEqual({ pendencia })
  })
})
