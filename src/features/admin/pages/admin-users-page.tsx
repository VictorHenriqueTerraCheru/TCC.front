import { useState } from 'react'

import { SearchField } from '@/common/components/search-field'
import { InfiniteList } from '@/common/components/infinite-list'
import { SegmentedControl } from '@/common/components/segmented-control'
import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useMe, type Role } from '@/features/users'

import { useAdminUsers } from '../api/use-admin-users'
import { UserCard } from '../components/user-card'
import { AdminGuard } from '../components/admin-guard'

type RoleFilter = Role | 'all'

const filters: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'citizen', label: 'Cidadão' },
  { value: 'verifiedCitizen', label: 'Verificado' },
  { value: 'administrator', label: 'Admin' },
]

function UserList() {
  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const debouncedSearch = useDebouncedValue(search.trim(), 300)
  const users = useAdminUsers({
    search: debouncedSearch,
    role: role === 'all' ? null : role,
  })
  const { data: me } = useMe()

  const total = users.data?.pages[0]?.total
  const items = users.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <>
      <div className="mb-4 space-y-3">
        <SearchField
          value={search}
          onChange={setSearch}
          label="Buscar usuário"
          placeholder="Buscar por nome ou e-mail"
        />
        <SegmentedControl<RoleFilter>
          label="Perfil"
          options={filters}
          value={role}
          onChange={setRole}
        />
        {total !== undefined && (
          <p className="text-sm text-muted-foreground">
            {total === 1 ? '1 usuário' : `${total} usuários`}
          </p>
        )}
      </div>

      {users.isPending ? (
        <Skeleton className="h-40 rounded-2xl bg-muted" />
      ) : users.isError ? (
        <div role="alert" className="space-y-3 py-6">
          <p>Não foi possível carregar os usuários.</p>
          <Button variant="outline" size="sm" onClick={() => void users.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum usuário encontrado.
        </p>
      ) : (
        <InfiniteList query={users}>
          <div className="space-y-3">
            {items.map((u) => (
              <UserCard key={u.id} user={u} isSelf={u.id === me?.id} />
            ))}
          </div>
        </InfiniteList>
      )}
    </>
  )
}

export function AdminUsersPage() {
  return (
    <AdminGuard title="Usuários" path="/admin/usuarios">
      <UserList />
    </AdminGuard>
  )
}
