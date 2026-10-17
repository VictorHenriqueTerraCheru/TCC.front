import { Outlet } from 'react-router'

import { useAplicarTema } from '@/common/hooks/use-tema'
import { useRedirecionarEscolhaTema } from '@/features/aparencia'

import {
  EntreParaContinuar,
  useDescartarPendenciaAoSairDoLogin,
  useSincronizarCacheComSessao,
} from '@/features/auth'
import { useMonitorarLocalizacao, useRedirecionarPrePermissao } from '@/features/localizacao'

/** Envolve todas as rotas: serviços que valem para o app inteiro e a folha "Entre para…". */
export function RaizLayout() {
  useAplicarTema()
  useMonitorarLocalizacao()
  // Primeira abertura: tema, depois a pré-permissão de localização (uma tela de cada vez).
  const temaEscolhido = useRedirecionarEscolhaTema()
  useRedirecionarPrePermissao(temaEscolhido)
  useSincronizarCacheComSessao()
  useDescartarPendenciaAoSairDoLogin()
  return (
    <>
      <Outlet />
      <EntreParaContinuar />
    </>
  )
}
