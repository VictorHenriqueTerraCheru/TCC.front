import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { groupsOfType, useCategories, useGroups } from '@/features/categorias'

import { ReportStep } from '../components/passo-registro'
import { CategoryPicker } from '../components/seletor-categoria'
import { useDraft } from '../hooks/use-rascunho'
import { readType } from '../models/rotas'
import { useRecentStore } from '../stores/recentes-store'

export function CategoryPage() {
  const type = readType(useSearchParams()[0].get('type'))
  if (!type) return <Navigate to="/registrar" replace />
  return <TypeCategory type={type} />
}

function TypeCategory({ type }: { type: NonNullable<ReturnType<typeof readType>> }) {
  const navigate = useNavigate()
  const categories = useCategories()
  const groups = useGroups()
  const { category, chooseCategory } = useDraft()
  const recentIds = useRecentStore((s) => s.ids)
  const addRecent = useRecentStore((s) => s.report)

  const ofType = categories.data?.filter((c) => c.type === type) ?? []
  const chosen = category?.type === type ? category : null

  function proceed() {
    if (!chosen) return
    addRecent(chosen.id)
    navigate(type === 'incident' ? '/registrar/incidente/local' : '/registrar/local')
  }

  return (
    <ReportStep
      title="Nova ocorrência"
      step={{ current: 1, total: 4, label: 'Categoria' }}
      topAction="back"
      onTopAction={() => navigate('/registrar')}
      footer={
        <div className="space-y-2">
          <p className="min-h-5 text-center text-[13px] text-muted-foreground" aria-live="polite">
            {chosen ? `Selecionada: ${chosen.name}` : 'Escolha uma categoria para continuar'}
          </p>
          <Button className="w-full" disabled={!chosen} onClick={proceed}>
            Continuar
          </Button>
        </div>
      }
    >
      <h2 className="mb-4 text-2xl">
        {type === 'issue' ? 'Qual é o estado?' : 'Qual foi o evento?'}
      </h2>
      {categories.isPending || groups.isPending ? (
        <Skeleton className="h-60 rounded-2xl bg-muted" />
      ) : categories.isError || groups.isError ? (
        <div role="alert" className="space-y-3 py-6">
          <p>Não foi possível carregar as categorias.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void categories.refetch()
              void groups.refetch()
            }}
          >
            Tentar novamente
          </Button>
        </div>
      ) : (
        <CategoryPicker
          categories={ofType}
          groups={groupsOfType(groups.data, type)}
          selectedId={chosen?.id ?? null}
          recentIds={recentIds}
          onChoose={chooseCategory}
        />
      )}
    </ReportStep>
  )
}
