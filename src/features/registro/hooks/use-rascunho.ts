import { useEffect } from 'react'
import { useNavigate } from 'react-router'

import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { useCategories, type GroupType } from '@/features/categorias'
import { useReverseGeocode } from '@/features/geocodificacao'

import { categoryPath } from '../models/rotas'
import { useDraftStore } from '../stores/rascunho-store'

export function useDraft() {
  const draft = useDraftStore()
  const { data: categories } = useCategories()
  const category = categories?.find((c) => c.id === draft.categoryId) ?? null
  return { ...draft, category }
}

export function useDraftAddress() {
  const location = useDraftStore((s) => s.location)
  const stopped = useDebouncedValue(location, 600)
  const query = useReverseGeocode(stopped)
  const updating = location !== stopped || query.isPending
  return { ...query, updating }
}

export function useRequireCategory(type: GroupType) {
  const { category, categoryId } = useDraft()
  const { isSuccess } = useCategories()
  useRequireStep(categoryId !== null && (!isSuccess || category?.type === type), categoryPath(type))
}

export function useRequireStep(ok: boolean, route: string) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!ok) navigate(route, { replace: true })
  }, [ok, route, navigate])
}
