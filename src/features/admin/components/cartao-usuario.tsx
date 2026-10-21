import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useState } from 'react'

import { FolhaResponsiva } from '@/common/components/folha-responsiva'
import { Icone } from '@/common/components/icone'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/ui/button'
import { aparenciaPerfil, Avatar, type Perfil } from '@/features/usuarios'

import { useAlterarPerfilUsuario, type UsuarioAdmin } from '../api/use-usuarios-admin'
import { mensagemErroUsuarios } from '../errors'

const ordemPerfis: Perfil[] = ['cidadao', 'cidadaoVerificado', 'administrador']

const descricaoPerfil: Record<Perfil, string> = {
  cidadao: 'Registra e vota com o peso padrão.',
  cidadaoVerificado: 'O voto passa a valer mais no cálculo de confiança.',
  administrador: 'Acesso total ao painel: fila, categorias e usuários.',
}

interface CartaoUsuarioProps {
  usuario: UsuarioAdmin
  /** O admin não altera o próprio perfil (a API recusa com 422). */
  ehVoce: boolean
}

/** Cartão de um usuário na administração; "Alterar perfil" abre a folha com os três perfis. */
export function CartaoUsuario({ usuario, ehVoce }: CartaoUsuarioProps) {
  const [aberta, setAberta] = useState(false)
  const { rotulo, icone } = aparenciaPerfil[usuario.perfil]

  return (
    <article
      aria-label={`Usuário ${usuario.nome}`}
      className="rounded-2xl border border-border/60 bg-card p-4"
    >
      <header className="flex items-center gap-3">
        <Avatar nome={usuario.nome} verificado={usuario.perfil !== 'cidadao'} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-medium">
            {usuario.nome}
            {ehVoce && (
              <span className="ml-2 rounded-full bg-primario-suave px-2 py-0.5 text-xs font-semibold text-primario">
                Você
              </span>
            )}
          </h2>
          <p className="truncate text-sm text-muted-foreground">{usuario.email}</p>
        </div>
      </header>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm">
          <Icone nome={icone} className="text-[18px] text-primario" />
          <span>{rotulo}</span>
          <span className="text-xs text-muted-foreground">
            · desde {format(new Date(usuario.criadoEm), 'd MMM yyyy', { locale: ptBR })}
          </span>
        </p>
        {!ehVoce && (
          <Button variant="outline" size="sm" onClick={() => setAberta(true)}>
            Alterar perfil
          </Button>
        )}
      </div>
      {aberta && <FolhaPerfil usuario={usuario} aoFechar={() => setAberta(false)} />}
    </article>
  )
}

function FolhaPerfil({ usuario, aoFechar }: { usuario: UsuarioAdmin; aoFechar(): void }) {
  const alterar = useAlterarPerfilUsuario()
  const [escolhido, setEscolhido] = useState<Perfil>(usuario.perfil)
  const rebaixandoAdmin = usuario.perfil === 'administrador' && escolhido !== 'administrador'

  function salvar() {
    if (escolhido === usuario.perfil) return aoFechar()
    alterar.mutate({ id: usuario.id, perfil: escolhido }, { onSuccess: aoFechar })
  }

  return (
    <FolhaResponsiva
      aberto
      aoMudarAberto={(aberto) => !aberto && aoFechar()}
      titulo="Alterar perfil"
    >
      <p className="mb-4 text-sm text-muted-foreground">{usuario.nome}</p>
      <div role="radiogroup" aria-label="Perfil" className="space-y-2">
        {ordemPerfis.map((perfil) => {
          const selecionado = perfil === escolhido
          return (
            <button
              key={perfil}
              type="button"
              role="radio"
              aria-checked={selecionado}
              onClick={() => setEscolhido(perfil)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border p-3 text-left focus-visible:outline-2',
                selecionado ? 'border-primario bg-primario-suave' : 'border-border',
              )}
            >
              <Icone nome={aparenciaPerfil[perfil].icone} className="text-primario" />
              <span className="flex-1">
                <span className="block font-medium">{aparenciaPerfil[perfil].rotulo}</span>
                <span className="text-xs text-muted-foreground">{descricaoPerfil[perfil]}</span>
              </span>
            </button>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        A mudança vale para os votos seguintes; os votos já dados mantêm o peso que tinham.
      </p>
      {rebaixandoAdmin && (
        <p className="mt-2 text-xs text-muted-foreground">
          Quem já está com a sessão aberta pode manter o acesso de administrador até ela expirar
          (até 7 dias).
        </p>
      )}
      {alterar.error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {mensagemErroUsuarios(alterar.error)}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button disabled={alterar.isPending} onClick={salvar}>
          Salvar
        </Button>
      </div>
    </FolhaResponsiva>
  )
}
