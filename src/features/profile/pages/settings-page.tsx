import type { MaterialSymbol } from 'material-symbols'
import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { Icon } from '@/common/components/icon'
import { ScreenWithBack } from '@/common/components/screen-with-back'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/ui/dialog'
import { ThemePicker } from '@/features/appearance'
import { useAuthenticated, useSessionStore } from '@/features/auth'
import { useEnableLocation, useGeolocation, type LocationStatus } from '@/features/location'
import { useMe } from '@/features/users'

import { EditNameDialog } from '../components/edit-name-dialog'

const permission: Record<LocationStatus, { label: string; cssClass: string }> = {
  granted: { label: 'Permitida', cssClass: 'bg-brand-soft text-brand' },
  denied: { label: 'Negada', cssClass: 'bg-destructive/15 text-destructive' },
  prompt: { label: 'Não definida', cssClass: 'bg-muted text-foreground' },
  checking: { label: 'Verificando', cssClass: 'bg-muted text-foreground' },
  unavailable: { label: 'Indisponível', cssClass: 'bg-muted text-foreground' },
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-2">
      <h2 className="px-4 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-[20px] bg-card shadow-1">
        {children}
      </div>
    </section>
  )
}

function Row({
  icon,
  title,
  subtitle,
  onClick,
  arrow = true,
}: {
  icon: MaterialSymbol
  title: string
  subtitle?: string
  onClick?(): void
  arrow?: boolean
}) {
  const content = (
    <>
      <Icon name={icon} className="text-brand" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block">{title}</span>
        {subtitle && (
          <span className="block truncate text-sm text-muted-foreground">{subtitle}</span>
        )}
      </span>
      {onClick && arrow && <Icon name="chevron_right" className="text-muted-foreground" />}
    </>
  )
  const cssClass = 'flex w-full items-center gap-4 px-4 py-3'
  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        cssClass,
        'transition-colors hover:bg-foreground/5 focus-visible:outline-2 active:bg-foreground/8',
      )}
    >
      {content}
    </button>
  ) : (
    <div className={cssClass}>{content}</div>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()
  const authenticated = useAuthenticated()
  const { data: me } = useMe()
  const { state } = useGeolocation()
  const { activate, dialog } = useEnableLocation()
  const logout = useSessionStore((s) => s.logout)
  const [editingName, setEditingName] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)

  if (!authenticated) {
    return leaving ? null : <Navigate to="/login" replace state={{ de: '/profile/settings' }} />
  }

  function signOut() {
    setLeaving(true)
    navigate('/map', { replace: true })
    logout()
  }

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <ScreenWithBack title="Configurações" onBack={() => navigate('/profile')}>
        <Section title="Conta">
          <Row
            icon="person"
            title="Nome"
            subtitle={me?.name ?? '…'}
            onClick={me ? () => setEditingName(true) : undefined}
          />
          <Row icon="mail" title="E-mail" subtitle={me?.email ?? '…'} />
        </Section>

        <Section title="Aparência">
          <ThemePicker className="px-2 py-1" />
        </Section>

        <Section title="Localização">
          <div className="flex gap-4 px-4 py-3">
            <Icon name="my_location" className="text-brand" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span>Permissão de localização</span>
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    permission[state].cssClass,
                  )}
                >
                  {permission[state].label}
                </span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Seus votos pesam mais quando você está perto da ocorrência.
              </p>
              {state !== 'granted' && (
                <Button variant="outline" size="sm" onClick={() => void activate()}>
                  {state === 'prompt' ? 'Permitir localização' : 'Como liberar a localização'}
                </Button>
              )}
            </div>
          </div>
        </Section>

        <Section title="Geral">
          <Row
            icon="info"
            title="Sobre o app"
            subtitle={`Versão ${__APP_VERSION__} · termos e privacidade`}
            onClick={() => setAboutOpen(true)}
          />
          <Row icon="logout" title="Sair da conta" onClick={signOut} arrow={false} />
        </Section>
      </ScreenWithBack>

      {me && (
        <EditNameDialog currentName={me.name} open={editingName} onOpenChange={setEditingName} />
      )}
      {dialog}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Ocorrências urbanas</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2 text-left">
                <p>
                  Sistema colaborativo de registro e validação de ocorrências urbanas — TCC de
                  Sistemas de Informação, Unilasalle-RJ.
                </p>
                <p>
                  Sua localização só serve para calcular a distância do voto e é descartada.
                  Incidentes são anônimos e aparecem só agregados no mapa de calor.
                </p>
                <p>Mapa © colaboradores do OpenStreetMap.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAboutOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
