import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { useCategorias, type TipoGrupo } from '@/features/categorias'
import { useEnderecoReverso } from '@/features/geocodificacao'

import { caminhoDaCategoria } from '../models/rotas'
import { useRascunhoStore } from '../stores/rascunho-store'

export function useRascunho() {
  const rascunho = useRascunhoStore()
  const { data: categorias } = useCategorias()
  const categoria = categorias?.find((c) => c.id === rascunho.categoriaId) ?? null
  return { ...rascunho, categoria }
}

export function useEnderecoDoRascunho() {
  const local = useRascunhoStore((s) => s.local)
  const parado = useDebouncedValue(local, 600)
  const consulta = useEnderecoReverso(parado)
  const atualizando = local !== parado || consulta.isPending
  return { ...consulta, atualizando }
}

export function useExigirCategoria(tipo: TipoGrupo) {
  const { categoria, categoriaId } = useRascunho()
  const { isSuccess } = useCategorias()
  useExigirPasso(
    categoriaId !== null && (!isSuccess || categoria?.tipo === tipo),
    caminhoDaCategoria(tipo),
  )
}

export function useExigirPasso(ok: boolean, rota: string) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!ok) navigate(rota, { replace: true })
  }, [ok, rota, navigate])
}
