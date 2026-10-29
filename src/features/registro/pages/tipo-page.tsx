import type { MaterialSymbol } from 'material-symbols'
import { Link, useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import type { TipoGrupo } from '@/features/categorias'

import { PassoRegistro } from '../components/passo-registro'
import { caminhoDaCategoria } from '../models/rotas'
import { useRascunhoStore } from '../stores/rascunho-store'

interface Opcao {
  type: TipoGrupo
  titulo: string
  significado: string
  exemplos: string
  consequencia: string
  iconeConsequencia: MaterialSymbol
  icones: { name: MaterialSymbol; fundo: string; color: string }[]
}

const opcoes: Opcao[] = [
  {
    type: 'issue',
    titulo: 'Estado',
    significado: 'Continua lá até ser resolvido',
    exemplos: 'Buraco, poste apagado, lixo acumulado…',
    consequencia: 'Vira um ponto no mapa até alguém confirmar que foi resolvido.',
    iconeConsequencia: 'location_on',
    icones: [
      { name: 'edit_road', fundo: 'bg-cat-laranja-claro', color: 'text-cat-laranja' },
      { name: 'light_off', fundo: 'bg-cat-ocre-claro', color: 'text-cat-ocre' },
      { name: 'delete_sweep', fundo: 'bg-cat-marrom-claro', color: 'text-cat-marrom' },
    ],
  },
  {
    type: 'incident',
    titulo: 'Evento',
    significado: 'Aconteceu e passou',
    exemplos: 'Roubo, acidente, rua inundada…',
    consequencia: 'Anônimo. Entra no mapa de calor da região, sem ponto exato.',
    iconeConsequencia: 'visibility_off',
    icones: [
      { name: 'error', fundo: 'bg-cat-vermelho-claro', color: 'text-cat-vermelho' },
      { name: 'car_crash', fundo: 'bg-cat-terracota-claro', color: 'text-cat-terracota' },
      { name: 'flood', fundo: 'bg-cat-azul-claro', color: 'text-cat-azul' },
    ],
  },
]

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
      passo={{ atual: 1, total: 4, label: 'Tipo' }}
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
            key={opcao.type}
            to={caminhoDaCategoria(opcao.type)}
            className="block pressionavel space-y-3.5 rounded-[20px] border border-border bg-card p-5 shadow-1 hover:border-primario focus-visible:outline-2"
          >
            <div className="flex items-center">
              <div className="flex">
                {opcao.icones.map((icone, i) => (
                  <span
                    key={icone.name}
                    className={`flex size-11 items-center justify-center rounded-full border-2 border-card ${icone.fundo} ${icone.color} ${i > 0 ? '-ml-2.5' : ''}`}
                  >
                    <Icone name={icone.name} className="text-[24px]" />
                  </span>
                ))}
              </div>
              <Icone name="chevron_right" className="ml-auto text-[24px] text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{opcao.titulo}</p>
              <p className="mt-0.5 text-[15px] font-medium text-foreground">{opcao.significado}</p>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">
                {opcao.exemplos}
              </p>
            </div>
            <p className="flex items-center gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
              <Icone name={opcao.iconeConsequencia} className="text-[18px] text-primario" />
              {opcao.consequencia}
            </p>
          </Link>
        ))}
      </div>
    </PassoRegistro>
  )
}
