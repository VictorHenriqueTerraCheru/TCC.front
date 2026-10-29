import { useState } from 'react'
import { useLocation } from 'react-router'

import { useExigirConta } from '@/features/auth'
import { isApiError, isErroDeRede } from '@/infrastructure/api'

import { mensagemErroRegistro } from '../errors'

export function useEnvio<Variaveis, Resultado>(
  executar: (variaveis: Variaveis) => Promise<Resultado>,
  aoSucesso: (resultado: Resultado, variaveis: Variaveis) => void,
) {
  const exigirConta = useExigirConta()
  const { pathname } = useLocation()
  const [falhaAberta, setFalhaAberta] = useState(false)
  const [erroRegra, setErroRegra] = useState<string | null>(null)
  const [ultimas, setUltimas] = useState<Variaveis | null>(null)

  function enviar(variaveis: Variaveis) {
    setErroRegra(null)
    setFalhaAberta(false)
    setUltimas(variaveis)
    executar(variaveis).then(
      (resultado) => aoSucesso(resultado, variaveis),
      (erro: unknown) => {
        if (isErroDeRede(erro)) setFalhaAberta(true)
        else if (isApiError(erro) && erro.status === 401)
          exigirConta('registrar', () => {}, {
            retorno: pathname,
            pendente: { tipo: 'continuarRegistro', passo: 'enviar' },
          })
        else setErroRegra(mensagemErroRegistro(erro))
      },
    )
  }

  return {
    enviar,
    erroRegra,
    falha: {
      aberto: falhaAberta,
      aoMudarAberto: setFalhaAberta,
      aoTentarNovamente: () => ultimas !== null && enviar(ultimas),
    },
  }
}
