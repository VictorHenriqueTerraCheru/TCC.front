import { useNavigate } from 'react-router'

import { Skeleton } from '@/common/ui/skeleton'
import { Button } from '@/common/ui/button'
import { CategoriaIcone } from '@/features/categorias'

import { MapaRegistro } from '../components/mapa-registro'
import { PassoRegistro } from '../components/passo-registro'
import { SeletorHorario } from '../components/seletor-horario'
import { useEnderecoDoRascunho, useExigirCategoria, useRascunho } from '../hooks/use-rascunho'
import { caminhoDaCategoria } from '../models/rotas'

export function LocalIncidentePage() {
  const navigate = useNavigate()
  const { category: categoria, local, horario, definirHorario } = useRascunho()
  const { data: endereco, atualizando } = useEnderecoDoRascunho()
  useExigirCategoria('incident')

  return (
    <PassoRegistro
      titulo="Onde aconteceu?"
      passo={{ atual: 2, total: 3, label: `Local · ${categoria?.name ?? ''}` }}
      acaoTopo="voltar"
      aoTopo={() => navigate(caminhoDaCategoria('incident'))}
      mapa={<MapaRegistro modo="area" />}
      rodape={
        <Button
          className="w-full"
          disabled={!local}
          onClick={() => navigate('/registrar/incidente/revisao')}
        >
          Continuar
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-3" aria-live="polite">
          {categoria && <CategoriaIcone category={categoria} />}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Área aproximada · raio de 150 m</p>
            {atualizando || !endereco ? (
              <Skeleton className="mt-1 h-5 w-4/5 bg-muted" />
            ) : (
              <p className="font-medium">{endereco.areaLabel ?? endereco.address}</p>
            )}
            <p className="text-xs text-muted-foreground">O ponto exato não é salvo nem exibido.</p>
          </div>
        </div>
        <SeletorHorario horario={horario} aoMudar={definirHorario} />
      </div>
    </PassoRegistro>
  )
}
