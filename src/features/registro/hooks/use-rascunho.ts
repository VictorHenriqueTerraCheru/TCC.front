import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { useCategorias, type TipoGrupo } from '@/features/categorias'
import { useEnderecoReverso } from '@/features/geocodificacao'

import { caminhoDaCategoria } from '../models/rotas'
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

/**
 * Passos de local: o rascunho precisa ter uma categoria do tipo do passo. Categoria que sumiu
 * (desativada) ou de outro tipo volta para a lista. Só decide depois que as categorias chegam.
 */
export function useExigirCategoria(tipo: TipoGrupo) {
  const { categoria, categoriaId } = useRascunho()
  const { isSuccess } = useCategorias()
  useExigirPasso(
    categoriaId !== null && (!isSuccess || categoria?.tipo === tipo),
    caminhoDaCategoria(tipo),
  )
}

/** Passo sem os dados dos anteriores (ex.: recarregou em /registrar/revisao vazio) volta. */
export function useExigirPasso(ok: boolean, rota: string) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!ok) navigate(rota, { replace: true })
  }, [ok, rota, navigate])
}
