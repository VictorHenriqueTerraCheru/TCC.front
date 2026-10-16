import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/common/ui/button'

import { duplicatasQuery } from '../api/use-registro'
import { CartaoEndereco } from '../components/cartao-endereco'
import { MapaRegistro } from '../components/mapa-registro'
import { PassoRegistro } from '../components/passo-registro'
import { useExigirPasso, useRascunho } from '../hooks/use-rascunho'

/** Tela 6: passo 2 — pino fixo no centro, mapa que se move. */
export function LocalProblemaPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { categoria, categoriaId, local } = useRascunho()
  const [conferindo, setConferindo] = useState(false)
  useExigirPasso(categoriaId !== null, '/registrar')

  async function confirmar() {
    if (categoriaId === null || !local) return
    setConferindo(true)
    try {
      const duplicatas = await queryClient.fetchQuery(duplicatasQuery(categoriaId, local))
      navigate(duplicatas.length > 0 ? '/registrar/conferencia' : '/registrar/revisao')
    } catch {
      // A conferência é um aviso: se falhar, o registro segue (a API aceita o envio).
      navigate('/registrar/revisao')
    } finally {
      setConferindo(false)
    }
  }

  return (
    <PassoRegistro
      titulo="Onde fica?"
      passo={{ atual: 2, total: 4, rotulo: 'Local' }}
      acaoTopo="voltar"
      aoTopo={() => navigate('/registrar')}
      mapa={<MapaRegistro modo="pino" categoria={categoria} />}
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
