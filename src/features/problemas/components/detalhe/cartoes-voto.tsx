import { Icone } from '@/common/components/icone'
import { distanciaTexto } from '@/common/lib/formatacao'
import { useExigirConta } from '@/features/auth'

import { useVotarExistencia, useVotarPersistencia } from '../../api/use-votar'
import { mensagemErroVoto } from '../../errors'
import { useDistanciaAte } from '../../hooks/use-distancia-ate'
import type { DetalheProblema } from '../../models/problema'
import { BotaoVoto } from './botao-voto'

interface CartaoProps {
  problema: DetalheProblema
}

const DICA_AUTOR = 'Você registrou este problema'

function ErroVoto({ erro }: { erro: unknown }) {
  if (!erro) return null
  return (
    <p role="alert" className="mt-2 text-xs text-destructive">
      {mensagemErroVoto(erro)}
    </p>
  )
}

function useVotos(problema: DetalheProblema) {
  const exigirConta = useExigirConta()
  const existencia = useVotarExistencia(problema.id)
  const persistencia = useVotarPersistencia(problema.id)
  return {
    existencia,
    persistencia,
    votarExistencia: (valor: 'confirma' | 'naoVi') =>
      exigirConta('votar', () => existencia.mutate(valor)),
    votarPersistencia: (valor: 'continua' | 'resolvido') =>
      exigirConta('votar', () => persistencia.mutate(valor)),
    meus: problema.meusVotos ?? { existencia: null, persistencia: null },
  }
}

/** Tela 3: os dois cartões lado a lado (Ativa). */
export function CartoesAtiva({ problema }: CartaoProps) {
  const { existencia, persistencia, votarExistencia, votarPersistencia, meus } = useVotos(problema)
  const { confirmacoes } = problema.existencia
  const { continua, resolvido } = problema.persistencia

  return (
    <div className="grid grid-cols-2 gap-2">
      <section className="flex flex-col rounded-2xl border border-border/60 bg-card p-3">
        <h3 className="text-xs font-medium">Confirmações de existência</h3>
        <p className="mt-1">
          <span className="text-4xl">{confirmacoes}</span>{' '}
          <span className="text-xs text-muted-foreground">
            {confirmacoes === 1 ? 'pessoa' : 'pessoas'}
          </span>
        </p>
        <p className="mb-3 text-xs text-muted-foreground">Viram o problema no local</p>
        <BotaoVoto
          className="mt-auto"
          variante="tonal"
          selecionado={meus.existencia === 'confirma'}
          disabled={problema.souAutor || existencia.isPending}
          title={problema.souAutor ? DICA_AUTOR : undefined}
          onClick={() => votarExistencia('confirma')}
        >
          Confirmar que existe
        </BotaoVoto>
        {problema.souAutor && <p className="mt-2 text-xs text-muted-foreground">{DICA_AUTOR}</p>}
        <ErroVoto erro={existencia.error} />
      </section>

      <section className="flex flex-col rounded-2xl border border-border/60 bg-card p-3">
        <h3 className="text-xs font-medium">Ainda está lá?</h3>
        <p className="mt-1 mb-3">
          <span className="text-4xl">{continua}</span>{' '}
          <span className="text-xs text-muted-foreground">sim</span>{' '}
          <span className="text-4xl">{resolvido}</span>{' '}
          <span className="text-xs text-muted-foreground">não</span>
        </p>
        <div className="mt-auto flex flex-col gap-2">
          <BotaoVoto
            variante="tonal"
            selecionado={meus.persistencia === 'continua'}
            disabled={persistencia.isPending}
            onClick={() => votarPersistencia('continua')}
          >
            Sim, continua
          </BotaoVoto>
          <BotaoVoto
            variante="outline"
            selecionado={meus.persistencia === 'resolvido'}
            disabled={persistencia.isPending}
            onClick={() => votarPersistencia('resolvido')}
          >
            Não, foi resolvido
          </BotaoVoto>
        </div>
        <ErroVoto erro={persistencia.error} />
      </section>
    </div>
  )
}

// "Viu este fio?" — substantivo por categoria (seed fixo).
const substantivo: Record<string, string> = {
  buraco: 'buraco',
  calcada: 'dano na calçada',
  poste: 'poste apagado',
  fio: 'fio',
  descarte: 'descarte',
  lixo: 'lixo',
}

/** Tela 22: cartão azul convidando a confirmar um registro novo. */
export function CartaoAvaliarNova({ problema }: CartaoProps) {
  const { existencia, votarExistencia, meus } = useVotos(problema)
  const distancia = useDistanciaAte(problema)
  const pergunta = `Viu este ${substantivo[problema.categoria.icone] ?? 'problema'}?`

  return (
    <section className="rounded-2xl bg-info p-4 text-info-foreground">
      <div className="mb-1 flex items-start gap-3">
        <Icone nome="near_me" preenchido className="mt-0.5 text-[20px]" />
        <div>
          <h3 className="font-medium">
            {distancia !== null
              ? `Você está a ${distanciaTexto(distancia)}. ${pergunta}`
              : pergunta}
          </h3>
          <p className="text-sm">Quem está perto ajuda mais a avaliar registros novos.</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <BotaoVoto
          className="flex-1"
          variante="default"
          selecionado={meus.existencia === 'confirma'}
          disabled={problema.souAutor || existencia.isPending}
          onClick={() => votarExistencia('confirma')}
        >
          Confirmar que existe
        </BotaoVoto>
        <BotaoVoto
          variante="outline"
          className="border-info-foreground/40 text-info-foreground"
          selecionado={meus.existencia === 'naoVi'}
          disabled={problema.souAutor || existencia.isPending}
          onClick={() => votarExistencia('naoVi')}
        >
          Não vi
        </BotaoVoto>
      </div>
      {problema.souAutor && <p className="mt-2 text-xs">{DICA_AUTOR}</p>}
      <ErroVoto erro={existencia.error} />
    </section>
  )
}

/** Tela 23: "Ainda está lá?" em destaque, com os votos de resolvido nas últimas 24 h. */
export function CartaoAindaEstaLa({ problema }: CartaoProps) {
  const { persistencia, votarPersistencia, meus } = useVotos(problema)
  const { continua, resolvido, resolvidoUltimas24h } = problema.persistencia

  return (
    <section className="rounded-2xl bg-info p-4 text-info-foreground">
      <h3 className="mb-2 text-2xl">Ainda está lá?</h3>
      <p className="text-sm">
        {resolvidoUltimas24h === 1
          ? '1 pessoa disse que foi resolvido nas últimas 24 h.'
          : `${resolvidoUltimas24h} pessoas disseram que foi resolvido nas últimas 24 h.`}{' '}
        Se você passou por lá, ajude a confirmar.
      </p>
      <p className="mt-2 text-xs font-medium">
        {resolvido} · foi resolvido <span className="ml-3">{continua} · continua</span>
      </p>
      <div className="mt-3 flex gap-2">
        <BotaoVoto
          className="flex-1"
          variante="default"
          selecionado={meus.persistencia === 'continua'}
          disabled={persistencia.isPending}
          onClick={() => votarPersistencia('continua')}
        >
          Sim, continua
        </BotaoVoto>
        <BotaoVoto
          className="flex-1 border-info-foreground/40 text-info-foreground"
          variante="outline"
          selecionado={meus.persistencia === 'resolvido'}
          disabled={persistencia.isPending}
          onClick={() => votarPersistencia('resolvido')}
        >
          Não, foi resolvido
        </BotaoVoto>
      </div>
      <ErroVoto erro={persistencia.error} />
    </section>
  )
}
