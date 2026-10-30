import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router'

import { Icon } from '@/common/components/icon'
import { Page } from '@/common/components/page'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { AnimatedItem } from '@/common/components/animated-item'
import { useAuthenticated } from '@/features/auth'
import {
  roleAppearance,
  Avatar,
  HistoryItemRow,
  itemTimeShort,
  useHistorySummary,
  useMe,
  type Me,
} from '@/features/users'
import { VerificationCard } from '@/features/verification'

import { GuestInvite } from '../components/guest-invite'

function Header({ me }: { me: Me }) {
  const appearance = roleAppearance[me.role]
  const verified = me.role === 'verifiedCitizen'
  return (
    <div className="mb-4 flex items-center gap-4">
      <Avatar name={me.name} pageSize="lg" verified={verified} />
      <div className="min-w-0">
        <h2 className="text-[22px] leading-7">{me.name}</h2>
        <p className="mb-1.5 text-xs text-muted-foreground">
          desde {format(new Date(me.createdAt), 'MMM. yyyy', { locale: ptBR })}
        </p>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
            verified ? 'bg-primary text-primary-foreground' : 'border border-input',
          )}
        >
          <Icon name={appearance.icon} filled={verified} className="text-[16px]" />
          {appearance.label}
        </span>
      </div>
    </div>
  )
}

function Totals({ me }: { me: Me }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      {[
        ['Registros', me.totalReports],
        ['Votos', me.totalVotes],
      ].map(([label, value]) => (
        <div key={label} className="rounded-[20px] border border-border bg-card p-4 shadow-1">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-3xl">{value}</p>
        </div>
      ))}
    </div>
  )
}

function HistorySummary() {
  const { data: items, isPending } = useHistorySummary()
  return (
    <section aria-labelledby="history-title" className="mt-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 id="history-title" className="text-sm font-medium">
          Histórico
        </h2>
        <Button asChild variant="link" size="sm">
          <Link to="/perfil/historico">Ver tudo</Link>
        </Button>
      </div>
      {isPending ? (
        <Skeleton className="h-32 rounded-2xl bg-muted" />
      ) : items?.length ? (
        <ul>
          {items.map((item, i) => (
            <AnimatedItem key={`${item.date}-${i}`} index={i}>
              <HistoryItemRow item={item} when={itemTimeShort(item.date)} />
            </AnimatedItem>
          ))}
        </ul>
      ) : (
        <p className="py-4 text-sm text-muted-foreground">
          Seus registros e votos vão aparecer aqui.
        </p>
      )}
    </section>
  )
}

export function ProfilePage() {
  const authenticated = useAuthenticated()
  const { data: me, isPending, isError, refetch } = useMe()

  return (
    <Page
      title="Perfil"
      actions={
        authenticated && (
          <Link
            to="/perfil/configuracoes"
            aria-label="Configurações"
            className="flex size-12 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
          >
            <Icon name="settings" />
          </Link>
        )
      }
    >
      {!authenticated ? (
        <GuestInvite />
      ) : isPending ? (
        <Skeleton aria-label="Carregando perfil" className="h-60 rounded-2xl bg-muted" />
      ) : isError ? (
        <div role="alert" className="space-y-3">
          <p>Não foi possível carregar seu perfil.</p>
          <Button variant="outline" size="sm" onClick={() => void refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : (
        <>
          <Header me={me} />
          {me.role === 'verifiedCitizen' && (
            <div className="mb-4">
              <VerificationCard me={me} />
            </div>
          )}
          <Totals me={me} />
          {me.role === 'citizen' && <VerificationCard me={me} />}
          {me.role === 'administrator' && (
            <div className="space-y-2">
              <Link
                to="/admin/verificacoes"
                className="flex pressionavel items-center gap-3 rounded-[20px] bg-card p-4 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
              >
                <Icon name="admin_panel_settings" className="text-primario" />
                <span className="flex-1">
                  <span className="block font-medium">Fila de verificação</span>
                  <span className="text-xs text-muted-foreground">
                    Analisar pedidos de verificação
                  </span>
                </span>
                <Icon name="chevron_right" />
              </Link>
              <Link
                to="/admin/categorias"
                className="flex pressionavel items-center gap-3 rounded-[20px] bg-card p-4 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
              >
                <Icon name="category" className="text-primario" />
                <span className="flex-1">
                  <span className="block font-medium">Categorias</span>
                  <span className="text-xs text-muted-foreground">
                    Criar e editar categorias, grupos e ícones
                  </span>
                </span>
                <Icon name="chevron_right" />
              </Link>
              <Link
                to="/admin/usuarios"
                className="flex pressionavel items-center gap-3 rounded-[20px] bg-card p-4 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
              >
                <Icon name="group" className="text-primario" />
                <span className="flex-1">
                  <span className="block font-medium">Usuários</span>
                  <span className="text-xs text-muted-foreground">
                    Ver quem se cadastrou e alterar perfis
                  </span>
                </span>
                <Icon name="chevron_right" />
              </Link>
            </div>
          )}
          <HistorySummary />
        </>
      )}
    </Page>
  )
}
