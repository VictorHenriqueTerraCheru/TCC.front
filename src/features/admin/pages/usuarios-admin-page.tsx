import { useState } from 'react'

import { CampoBusca } from '@/common/components/campo-busca'
import { ListaInfinita } from '@/common/components/lista-infinita'
import { Segmentado } from '@/common/components/segmentado'
import { useDebouncedValue } from '@/common/hooks/use-debounced-value'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useMe, type Perfil } from '@/features/usuarios'

import { useUsuariosAdmin } from '../api/use-usuarios-admin'
import { CartaoUsuario } from '../components/cartao-usuario'
import { GuardaAdmin } from '../components/guarda-admin'

type FiltroPerfil = Perfil | 'todos'

const filtros: { value: FiltroPerfil; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'citizen', label: 'Cidadão' },
  { value: 'verifiedCitizen', label: 'Verificado' },
  { value: 'administrator', label: 'Admin' },
]

function ListaUsuarios() {
  const [busca, setBusca] = useState('')
  const [perfil, setPerfil] = useState<FiltroPerfil>('todos')
  const buscaAtrasada = useDebouncedValue(busca.trim(), 300)
  const usuarios = useUsuariosAdmin({
    busca: buscaAtrasada,
    role: perfil === 'todos' ? null : perfil,
  })
  const { data: me } = useMe()

  const total = usuarios.data?.pages[0]?.total
  const itens = usuarios.data?.pages.flatMap((p) => p.items) ?? []

  return (
    <>
      <div className="mb-4 space-y-3">
        <CampoBusca
          value={busca}
          aoMudar={setBusca}
          label="Buscar usuário"
          placeholder="Buscar por nome ou e-mail"
        />
        <Segmentado<FiltroPerfil>
          label="Perfil"
          opcoes={filtros}
          value={perfil}
          aoMudar={setPerfil}
        />
        {total !== undefined && (
          <p className="text-sm text-muted-foreground">
            {total === 1 ? '1 usuário' : `${total} usuários`}
          </p>
        )}
      </div>

      {usuarios.isPending ? (
        <Skeleton className="h-40 rounded-2xl bg-muted" />
      ) : usuarios.isError ? (
        <div role="alert" className="space-y-3 py-6">
          <p>Não foi possível carregar os usuários.</p>
          <Button variant="outline" size="sm" onClick={() => void usuarios.refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : itens.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Nenhum usuário encontrado.
        </p>
      ) : (
        <ListaInfinita consulta={usuarios}>
          <div className="space-y-3">
            {itens.map((u) => (
              <CartaoUsuario key={u.id} user={u} ehVoce={u.id === me?.id} />
            ))}
          </div>
        </ListaInfinita>
      )}
    </>
  )
}

export function UsuariosAdminPage() {
  return (
    <GuardaAdmin titulo="Usuários" caminho="/admin/usuarios">
      <ListaUsuarios />
    </GuardaAdmin>
  )
}
