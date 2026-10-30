import type { MaterialSymbol } from 'material-symbols'
import { Link, useNavigate } from 'react-router'

import { Icon } from '@/common/components/icon'
import type { GroupType } from '@/features/categories'

import { ReportStep } from '../components/report-step'
import { categoryPath } from '../models/routes'
import { useDraftStore } from '../stores/draft-store'

interface OptionItem {
  type: GroupType
  title: string
  meaning: string
  examples: string
  consequence: string
  consequenceIcon: MaterialSymbol
  icons: { name: MaterialSymbol; background: string; color: string }[]
}

const options: OptionItem[] = [
  {
    type: 'issue',
    title: 'Estado',
    meaning: 'Continua lá até ser resolvido',
    examples: 'Buraco, poste apagado, lixo acumulado…',
    consequence: 'Vira um ponto no mapa até alguém confirmar que foi resolvido.',
    consequenceIcon: 'location_on',
    icons: [
      { name: 'edit_road', background: 'bg-cat-laranja-claro', color: 'text-cat-laranja' },
      { name: 'light_off', background: 'bg-cat-ocre-claro', color: 'text-cat-ocre' },
      { name: 'delete_sweep', background: 'bg-cat-marrom-claro', color: 'text-cat-marrom' },
    ],
  },
  {
    type: 'incident',
    title: 'Evento',
    meaning: 'Aconteceu e passou',
    examples: 'Roubo, acidente, rua inundada…',
    consequence: 'Anônimo. Entra no mapa de calor da região, sem ponto exato.',
    consequenceIcon: 'visibility_off',
    icons: [
      { name: 'error', background: 'bg-cat-vermelho-claro', color: 'text-cat-vermelho' },
      { name: 'car_crash', background: 'bg-cat-terracota-claro', color: 'text-cat-terracota' },
      { name: 'flood', background: 'bg-cat-azul-claro', color: 'text-cat-azul' },
    ],
  },
]

export function TypePage() {
  const navigate = useNavigate()
  const clear = useDraftStore((s) => s.clear)

  function close() {
    clear()
    navigate('/mapa')
  }

  return (
    <ReportStep
      title="Nova ocorrência"
      step={{ current: 1, total: 4, label: 'Tipo' }}
      topAction="close"
      onTopAction={close}
      footer={
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
        {options.map((option) => (
          <Link
            key={option.type}
            to={categoryPath(option.type)}
            className="block pressionavel space-y-3.5 rounded-[20px] border border-border bg-card p-5 shadow-1 hover:border-primario focus-visible:outline-2"
          >
            <div className="flex items-center">
              <div className="flex">
                {option.icons.map((icon, i) => (
                  <span
                    key={icon.name}
                    className={`flex size-11 items-center justify-center rounded-full border-2 border-card ${icon.background} ${icon.color} ${i > 0 ? '-ml-2.5' : ''}`}
                  >
                    <Icon name={icon.name} className="text-[24px]" />
                  </span>
                ))}
              </div>
              <Icon name="chevron_right" className="ml-auto text-[24px] text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-bold tracking-tight">{option.title}</p>
              <p className="mt-0.5 text-[15px] font-medium text-foreground">{option.meaning}</p>
              <p className="mt-1 text-[15px] leading-snug text-muted-foreground">
                {option.examples}
              </p>
            </div>
            <p className="flex items-center gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
              <Icon name={option.consequenceIcon} className="text-[18px] text-primario" />
              {option.consequence}
            </p>
          </Link>
        ))}
      </div>
    </ReportStep>
  )
}
