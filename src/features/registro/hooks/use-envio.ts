import { useState } from 'react'
import { useLocation } from 'react-router'

import { useExigirConta } from '@/features/auth'
import { isApiError, isErroDeRede } from '@/infrastructure/api'

import { mensagemErroRegistro } from '../errors'

interface OpcoesEnvio<Resultado> {
  onError(erro: unknown): void
  onSuccess(resultado: Resultado): void
}

/**
 * Trata o erro do envio como a tela 26 pede: rede/timeout → diálogo "Tentar novamente";
 * 401 → guarda (o rascunho fica salvo); regra de negócio → mensagem.
 */
export function useEnvio<Variaveis, Resultado>(
  executar: (variaveis: Variaveis, opcoes: OpcoesEnvio<Resultado>) => void,
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
    executar(variaveis, {
      onSuccess: (resultado) => aoSucesso(resultado, variaveis),
      onError: (erro) => {
        if (isErroDeRede(erro)) setFalhaAberta(true)
        else if (isApiError(erro) && erro.status === 401)
          exigirConta('registrar', () => {}, { retorno: pathname })
        else setErroRegra(mensagemErroRegistro(erro))
      },
    })
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
