import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Link } from 'react-router'

import { Icone } from '@/common/components/icone'
import { Pagina } from '@/common/components/pagina'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { ItemAnimado } from '@/common/components/item-animado'
import { useAutenticado } from '@/features/auth'
import {
  aparenciaPerfil,
  Avatar,
  ItemHistoricoLinha,
  quandoItemResumo,
  useHistoricoResumo,
  useMe,
  type Me,
} from '@/features/usuarios'
import { CartaoVerificacao } from '@/features/verificacao'

import { ConviteVisitante } from '../components/convite-visitante'

function Cabecalho({ me }: { me: Me }) {
  const aparencia = aparenciaPerfil[me.role]
  const verificado = me.role === 'verifiedCitizen'
  return (
    <div className="mb-4 flex items-center gap-4">
      <Avatar name={me.name} pageSize="lg" verificado={verificado} />
      <div className="min-w-0">
        <h2 className="text-[22px] leading-7">{me.name}</h2>
        <p className="mb-1.5 text-xs text-muted-foreground">
          desde {format(new Date(me.createdAt), 'MMM. yyyy', { locale: ptBR })}
        </p>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium',
            verificado ? 'bg-primary text-primary-foreground' : 'border border-input',
          )}
        >
          <Icone name={aparencia.icon} preenchido={verificado} className="text-[16px]" />
          {aparencia.label}
        </span>
      </div>
    </div>
  )
}

function Totais({ me }: { me: Me }) {
  return (
    <div className="mb-4 grid grid-cols-2 gap-2">
      {[
        ['Registros', me.totalReports],
        ['Votos', me.totalVotes],
      ].map(([rotulo, valor]) => (
        <div key={rotulo} className="rounded-[20px] border border-border bg-card p-4 shadow-1">
          <p className="text-xs text-muted-foreground">{rotulo}</p>
          <p className="text-3xl">{valor}</p>
        </div>
      ))}
    </div>
  )
}

function HistoricoResumo() {
  const { data: itens, isPending } = useHistoricoResumo()
  return (
    <section aria-labelledby="titulo-historico" className="mt-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 id="titulo-historico" className="text-sm font-medium">
          Histórico
        </h2>
        <Button asChild variant="link" size="sm">
          <Link to="/perfil/historico">Ver tudo</Link>
        </Button>
      </div>
      {isPending ? (
        <Skeleton className="h-32 rounded-2xl bg-muted" />
      ) : itens?.length ? (
        <ul>
          {itens.map((item, i) => (
            <ItemAnimado key={`${item.date}-${i}`} indice={i}>
              <ItemHistoricoLinha item={item} quando={quandoItemResumo(item.date)} />
            </ItemAnimado>
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

export function PerfilPage() {
  const autenticado = useAutenticado()
  const { data: me, isPending, isError, refetch } = useMe()

  return (
    <Pagina
      titulo="Perfil"
      acoes={
        autenticado && (
          <Link
            to="/perfil/configuracoes"
            aria-label="Configurações"
            className="flex size-12 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
          >
            <Icone name="settings" />
          </Link>
        )
      }
    >
      {!autenticado ? (
        <ConviteVisitante />
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
          <Cabecalho me={me} />
          {me.role === 'verifiedCitizen' && (
            <div className="mb-4">
              <CartaoVerificacao me={me} />
            </div>
          )}
          <Totais me={me} />
          {me.role === 'citizen' && <CartaoVerificacao me={me} />}
          {me.role === 'administrator' && (
            <div className="space-y-2">
              <Link
                to="/admin/verificacoes"
                className="flex pressionavel items-center gap-3 rounded-[20px] bg-card p-4 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
              >
                <Icone name="admin_panel_settings" className="text-primario" />
                <span className="flex-1">
                  <span className="block font-medium">Fila de verificação</span>
                  <span className="text-xs text-muted-foreground">
                    Analisar pedidos de verificação
                  </span>
                </span>
                <Icone name="chevron_right" />
              </Link>
              <Link
                to="/admin/categorias"
                className="flex pressionavel items-center gap-3 rounded-[20px] bg-card p-4 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
              >
                <Icone name="category" className="text-primario" />
                <span className="flex-1">
                  <span className="block font-medium">Categorias</span>
                  <span className="text-xs text-muted-foreground">
                    Criar e editar categorias, grupos e ícones
                  </span>
                </span>
                <Icone name="chevron_right" />
              </Link>
              <Link
                to="/admin/usuarios"
                className="flex pressionavel items-center gap-3 rounded-[20px] bg-card p-4 shadow-1 hover:bg-superficie-2 focus-visible:outline-2"
              >
                <Icone name="group" className="text-primario" />
                <span className="flex-1">
                  <span className="block font-medium">Usuários</span>
                  <span className="text-xs text-muted-foreground">
                    Ver quem se cadastrou e alterar perfis
                  </span>
                </span>
                <Icone name="chevron_right" />
              </Link>
            </div>
          )}
          <HistoricoResumo />
        </>
      )}
    </Pagina>
  )
}
