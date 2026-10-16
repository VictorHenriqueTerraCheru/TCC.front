import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { useCategorias } from '@/features/categorias'
import { useEnderecoReverso } from '@/features/geocodificacao'

import { useRascunhoStore } from '../stores/rascunho-store'

/** Rascunho + a categoria escolhida já resolvida. */
export function useRascunho() {
  const rascunho = useRascunhoStore()
  const { data: categorias } = useCategorias()
  const categoria = categorias?.find((c) => c.id === rascunho.categoriaId) ?? null
  return { ...rascunho, categoria }
}

/** Endereço do local do rascunho, consultado só quando o mapa para (regra 4: ~600 ms). */
export function useEnderecoDoRascunho() {
  const local = useRascunhoStore((s) => s.local)
  const parado = useDebouncedValue(local, 600)
  const consulta = useEnderecoReverso(parado)
  // Enquanto o mapa ainda se move, o endereço mostrado é o antigo: trata como carregando.
  const atualizando = local !== parado || consulta.isPending
  return { ...consulta, atualizando }
}

/** Passo sem os dados dos anteriores (ex.: recarregou em /registrar/revisao vazio) volta. */
export function useExigirPasso(ok: boolean, rota: string) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!ok) navigate(rota, { replace: true })
  }, [ok, rota, navigate])
}
