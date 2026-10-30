import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import { ResponsiveSheet } from '@/common/components/responsive-sheet'
import { Icon } from '@/common/components/icon'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { roleAppearance, Avatar, type Role } from '@/features/users'

import { useSetUserRole, type AdminUser } from '../api/use-admin-users'
import { userErrorMessage } from '../errors'

const roleOrder: Role[] = ['citizen', 'verifiedCitizen', 'administrator']

const roleDescription: Record<Role, string> = {
  citizen: 'Registra e vota com o peso padrão.',
  verifiedCitizen: 'O voto passa a valer mais no cálculo de confiança.',
  administrator: 'Acesso total ao painel: fila, categorias e usuários.',
}

interface UserCardProps {
  user: AdminUser
  isSelf: boolean
}

export function UserCard({ user, isSelf }: UserCardProps) {
  const [open, setOpen] = useState(false)
  const { label, icon } = roleAppearance[user.role]

  return (
    <article
      aria-label={`Usuário ${user.name}`}
      className="rounded-2xl border border-border/60 bg-card p-4 shadow-1"
    >
      <header className="flex items-center gap-3">
        <Avatar name={user.name} verified={user.role !== 'citizen'} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-medium">
            {user.name}
            {isSelf && (
              <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">
                Você
              </span>
            )}
          </h2>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </header>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm">
          <Icon name={icon} className="text-[18px] text-brand" />
          <span>{label}</span>
          <span className="text-xs text-muted-foreground">
            · desde {format(new Date(user.createdAt), 'd MMM yyyy', { locale: ptBR })}
          </span>
        </p>
        {!isSelf && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            Alterar perfil
          </Button>
        )}
      </div>
      {open && <ProfileSheet user={user} onClose={() => setOpen(false)} />}
    </article>
  )
}

function ProfileSheet({ user, onClose }: { user: AdminUser; onClose(): void }) {
  const change = useSetUserRole()
  const [chosen, setChosen] = useState<Role>(user.role)
  const demotingAdmin = user.role === 'administrator' && chosen !== 'administrator'

  function save() {
    if (chosen === user.role) return onClose()
    change.mutate({ id: user.id, role: chosen }, { onSuccess: onClose })
  }

  return (
    <ResponsiveSheet open onOpenChange={(open) => !open && onClose()} title="Alterar perfil">
      <p className="mb-4 text-sm text-muted-foreground">{user.name}</p>
      <div role="radiogroup" aria-label="Perfil" className="space-y-2">
        {roleOrder.map((role) => {
          const selected = role === chosen
          return (
            <button
              key={role}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setChosen(role)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border p-3 text-left focus-visible:outline-2',
                selected ? 'border-brand bg-brand-soft' : 'border-border',
              )}
            >
              <Icon name={roleAppearance[role].icon} className="text-brand" />
              <span className="flex-1">
                <span className="block font-medium">{roleAppearance[role].label}</span>
                <span className="text-xs text-muted-foreground">{roleDescription[role]}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        A mudança vale para os votos seguintes; os votos já dados mantêm o peso que tinham.
      </p>
      {demotingAdmin && (
        <p className="mt-2 text-xs text-muted-foreground">
          Quem já está com a sessão aberta pode manter o acesso de administrador até ela expirar
          (até 7 dias).
        </p>
      )}
      {change.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {userErrorMessage(change.error)}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button loading={change.isPending} onClick={save}>
          Salvar
        </Button>
      </div>
    </ResponsiveSheet>
  )
}
