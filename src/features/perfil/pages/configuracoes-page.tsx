import type { MaterialSymbol } from 'material-symbols'
import { useState, type ReactNode } from 'react'
import { Navigate, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { TelaComVoltar } from '@/common/components/tela-com-voltar'
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
import { useAutenticado, useSessaoStore } from '@/features/auth'
import {
  useAtivarLocalizacao,
  useLocalizacao,
  type EstadoLocalizacao,
} from '@/features/localizacao'
import { useMe } from '@/features/usuarios'

import { EditarNomeDialog } from '../components/editar-nome-dialog'

const permissao: Record<EstadoLocalizacao, { rotulo: string; classe: string }> = {
  granted: { rotulo: 'Permitida', classe: 'bg-primario-suave text-primario' },
  denied: { rotulo: 'Negada', classe: 'bg-destructive/15 text-destructive' },
  prompt: { rotulo: 'Não definida', classe: 'bg-muted text-foreground' },
  verificando: { rotulo: 'Verificando', classe: 'bg-muted text-foreground' },
  indisponivel: { rotulo: 'Indisponível', classe: 'bg-muted text-foreground' },
}

function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    // Grupo em cartão, como nos Ajustes do iOS.
    <section className="py-2">
      <h2 className="px-4 pb-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {titulo}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-[20px] bg-card">
        {children}
      </div>
    </section>
  )
}

function Linha({
  icone,
  titulo,
  subtitulo,
  aoClicar,
  seta = true,
}: {
  icone: MaterialSymbol
  titulo: string
  subtitulo?: string
  aoClicar?(): void
  seta?: boolean
}) {
  const conteudo = (
    <>
      <Icone nome={icone} className="text-primario" />
      <span className="min-w-0 flex-1 text-left">
        <span className="block">{titulo}</span>
        {subtitulo && (
          <span className="block truncate text-sm text-muted-foreground">{subtitulo}</span>
        )}
      </span>
      {aoClicar && seta && <Icone nome="chevron_right" className="text-muted-foreground" />}
    </>
  )
  const classe = 'flex w-full items-center gap-4 px-4 py-3'
  return aoClicar ? (
    <button
      type="button"
      onClick={aoClicar}
      className={cn(classe, 'hover:bg-foreground/5 focus-visible:outline-2')}
    >
      {conteudo}
    </button>
  ) : (
    <div className={classe}>{conteudo}</div>
  )
}

/** Tela 28. "Abrir configurações do Android" vira "Como liberar a localização" (docs/TELAS.md). */
export function ConfiguracoesPage() {
  const navigate = useNavigate()
  const autenticado = useAutenticado()
  const { data: me } = useMe()
  const { estado } = useLocalizacao()
  const { ativar, dialogo } = useAtivarLocalizacao()
  const sair = useSessaoStore((s) => s.sair)
  const [editandoNome, setEditandoNome] = useState(false)
  const [sobreAberto, setSobreAberto] = useState(false)
  // Ao sair, a página ainda re-renderiza como visitante: não pode mandar para o login.
  const [saindo, setSaindo] = useState(false)

  if (!autenticado) {
    return saindo ? null : <Navigate to="/login" replace state={{ de: '/perfil/configuracoes' }} />
  }

  function sairDaConta() {
    setSaindo(true)
    navigate('/mapa', { replace: true })
    sair()
  }

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <TelaComVoltar titulo="Configurações" aoVoltar={() => navigate('/perfil')}>
        <Secao titulo="Conta">
          <Linha
            icone="person"
            titulo="Nome"
            subtitulo={me?.nome ?? '…'}
            aoClicar={me ? () => setEditandoNome(true) : undefined}
          />
          <Linha icone="mail" titulo="E-mail" subtitulo={me?.email ?? '…'} />
        </Secao>

        <Secao titulo="Localização">
          <div className="flex gap-4 px-4 py-3">
            <Icone nome="my_location" className="text-primario" />
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <span>Permissão de localização</span>
                <span
                  className={cn(
                    'rounded-md px-2 py-0.5 text-xs font-medium',
                    permissao[estado].classe,
                  )}
                >
                  {permissao[estado].rotulo}
                </span>
              </div>
              <p className="mb-3 text-sm text-muted-foreground">
                Seus votos pesam mais quando você está perto da ocorrência.
              </p>
              {estado !== 'granted' && (
                <Button variant="outline" size="sm" onClick={() => void ativar()}>
                  {estado === 'prompt' ? 'Permitir localização' : 'Como liberar a localização'}
                </Button>
              )}
            </div>
          </div>
        </Secao>

        <Secao titulo="Geral">
          <Linha
            icone="info"
            titulo="Sobre o app"
            subtitulo={`Versão ${__VERSAO_APP__} · termos e privacidade`}
            aoClicar={() => setSobreAberto(true)}
          />
          <Linha icone="logout" titulo="Sair da conta" aoClicar={sairDaConta} seta={false} />
        </Secao>
      </TelaComVoltar>

      {me && (
        <EditarNomeDialog
          nomeAtual={me.nome}
          aberto={editandoNome}
          aoMudarAberto={setEditandoNome}
        />
      )}
      {dialogo}
      <Dialog open={sobreAberto} onOpenChange={setSobreAberto}>
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
            <Button variant="ghost" onClick={() => setSobreAberto(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
