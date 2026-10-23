import type { MaterialSymbol } from 'material-symbols'
import { Link, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import type { TipoGrupo } from '@/features/categorias'

import { PassoRegistro } from '../components/passo-registro'
import { caminhoDaCategoria } from '../models/rotas'
import { useRascunhoStore } from '../stores/rascunho-store'

interface Opcao {
  tipo: TipoGrupo
  titulo: string
  /** Em uma frase, o que o nome quer dizer. */
  significado: string
  exemplos: string
  consequencia: string
  iconeConsequencia: MaterialSymbol
  /** Três ícones sobrepostos, com o fundo claro e a cor forte de cada um. */
  icones: { nome: MaterialSymbol; fundo: string; cor: string }[]
}

const opcoes: Opcao[] = [
  {
    tipo: 'problema',
    titulo: 'Estado',
    significado: 'Continua lá até ser resolvido',
    exemplos: 'Buraco, poste apagado, lixo acumulado…',
    consequencia: 'Vira um ponto no mapa até alguém confirmar que foi resolvido.',
    iconeConsequencia: 'location_on',
    icones: [
      { nome: 'edit_road', fundo: 'bg-cat-laranja-claro', cor: 'text-cat-laranja' },
      { nome: 'light_off', fundo: 'bg-cat-ocre-claro', cor: 'text-cat-ocre' },
      { nome: 'delete_sweep', fundo: 'bg-cat-marrom-claro', cor: 'text-cat-marrom' },
    ],
  },
  {
    tipo: 'incidente',
    titulo: 'Evento',
    significado: 'Aconteceu e passou',
    exemplos: 'Roubo, acidente, rua inundada…',
    consequencia: 'Anônimo. Entra no mapa de calor da região, sem ponto exato.',
    iconeConsequencia: 'visibility_off',
    icones: [
      { nome: 'error', fundo: 'bg-cat-vermelho-claro', cor: 'text-cat-vermelho' },
      { nome: 'car_crash', fundo: 'bg-cat-terracota-claro', cor: 'text-cat-terracota' },
      { nome: 'flood', fundo: 'bg-cat-azul-claro', cor: 'text-cat-azul' },
    ],
  },
]

/** Tela 5, passo 1a: o rascunho nasce aqui; o tipo decide o resto do fluxo. */
export function TipoPage() {
  const navigate = useNavigate()
  const limpar = useRascunhoStore((s) => s.limpar)

  function fechar() {
    limpar()
    navigate('/mapa')
  }

  return (
    <PassoRegistro
      titulo="Nova ocorrência"
      passo={{ atual: 1, total: 4, rotulo: 'Tipo' }}
      acaoTopo="fechar"
      aoTopo={fechar}
      rodape={
        <p className="text-center text-[13px] leading-snug text-muted-foreground">
          Em dúvida? Se daqui a uma semana ainda der pra ver no local, é{' '}
          <strong className="font-semibold text-foreground">estado</strong>.
        </p>
      }
    >
      <h2 className="text-[28px] leading-tight font-bold tracking-tight">Estado ou evento?</h2>
      <p className="mt-2 mb-5 text-[15px] text-muted-foreground">
        Escolha como registrar o que você viu.
      </p>
      <div className="space-y-3">
        {opcoes.map((opcao) => (
          <Link
            key={opcao.tipo}
            to={caminhoDaCategoria(opcao.tipo)}
            className="block pressionavel space-y-3.5 rounded-[20px] border border-border bg-card p-5 shadow-1 hover:border-primario focus-visible:outline-2"
          >
            <div className="flex items-center">
              <div className="flex">
                {opcao.icones.map((icone, i) => (
                  <span
                    key={icone.nome}
                    className={`flex size-11 items-center justify-center rounded-full border-2 border-card ${icone.fundo} ${icone.cor} ${i > 0 ? '-ml-2.5' : ''}`}
                  >
                    <Icone nome={icone.nome} className="text-[24px]" />
                  </span>
                ))}
              </div>
              <Icone nome="chevron_right" className="ml-auto text-[24px] text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{opcao.titulo}</p>
              <p className="mt-0.5 text-[15px] font-medium text-foreground">{opcao.significado}</p>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">
                {opcao.exemplos}
              </p>
            </div>
            <p className="flex items-center gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
              <Icone nome={opcao.iconeConsequencia} className="text-[18px] text-primario" />
              {opcao.consequencia}
            </p>
          </Link>
        ))}
      </div>
    </PassoRegistro>
  )
}
