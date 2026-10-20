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

  it('categoria desativada não aceita novo registro', async () => {
    banco.alterarAtivaCategoria(8, false)

    expect((await registrarIncidente(8)).status).toBe(400)
  })

  it('categoria de outro tipo continua sendo 422', async () => {
    expect((await registrarIncidente(1)).status).toBe(422)
  })
})
