import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/common/ui/button'
import { useExigirConta } from '@/features/auth'
import { isApiError } from '@/infrastructure/api'

import { duplicatasQuery } from '../api/use-registro'
import { CartaoEndereco } from '../components/cartao-endereco'
import { MapaRegistro } from '../components/mapa-registro'
import { PassoRegistro } from '../components/passo-registro'
import { useExigirCategoria, useRascunho } from '../hooks/use-rascunho'
import { useRetomarRegistro } from '../hooks/use-retomar-registro'
import { caminhoDaCategoria } from '../models/rotas'

export function LocalProblemaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const exigirConta = useExigirConta()
  const { category: categoria, categoryId: categoriaId, local } = useRascunho()
  const [conferindo, setConferindo] = useState(false)
  useExigirCategoria('issue')

  async function confirmar() {
    if (categoriaId === null || !local) return
    setConferindo(true)
    try {
      const duplicatas = await queryClient.fetchQuery(duplicatasQuery(categoriaId, local))
      navigate(duplicatas.length > 0 ? '/registrar/conferencia' : '/registrar/revisao')
    } catch (erro) {
      if (isApiError(erro) && erro.status === 401) {
        exigirConta('registrar', () => {}, {
          retorno: '/registrar/local',
          pending: { type: 'continuarRegistro', passo: 'conferir' },
        })
        return
      }
      navigate('/registrar/revisao')
    } finally {
      setConferindo(false)
    }
  }
  useRetomarRegistro('conferir', () => void confirmar())

  return (
    <PassoRegistro
      titulo="Onde fica?"
      passo={{ atual: 2, total: 4, label: 'Local' }}
      acaoTopo="voltar"
      aoTopo={() => navigate(caminhoDaCategoria('issue'))}
      mapa={<MapaRegistro modo="pino" category={categoria} />}
      rodape={
        <Button className="w-full" disabled={!local || conferindo} onClick={() => void confirmar()}>
          {conferindo ? 'Conferindo…' : 'Confirmar local'}
        </Button>
      }
    >
      <CartaoEndereco />
    </PassoRegistro>
  )
}
