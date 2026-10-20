import { useNavigate } from 'react-router'

import { Skeleton } from '@/common/ui/skeleton'
import { Button } from '@/common/ui/button'
import { CategoriaIcone } from '@/features/categorias'

import { MapaRegistro } from '../components/mapa-registro'
import { PassoRegistro } from '../components/passo-registro'
import { SeletorHorario } from '../components/seletor-horario'
import { useEnderecoDoRascunho, useExigirPasso, useRascunho } from '../hooks/use-rascunho'
import { caminhoDaCategoria } from '../models/rotas'

/** Tela 21a: incidente, passo 2 de 3 — área de 150 m + "Quando aconteceu?". */
export function LocalIncidentePage() {
  const navigate = useNavigate()
  const { categoria, categoriaId, local, horario, definirHorario } = useRascunho()
  const { data: endereco, atualizando } = useEnderecoDoRascunho()
  useExigirPasso(categoriaId !== null, '/registrar')

  return (
    <PassoRegistro
      titulo="Onde aconteceu?"
      passo={{ atual: 2, total: 3, rotulo: `Local · ${categoria?.nome ?? ''}` }}
      acaoTopo="voltar"
      aoTopo={() => navigate(caminhoDaCategoria('incidente'))}
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
          {categoria && <CategoriaIcone categoria={categoria} />}
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground">Área aproximada · raio de 150 m</p>
            {atualizando || !endereco ? (
              <Skeleton className="mt-1 h-5 w-4/5 bg-muted" />
            ) : (
              <p className="font-medium">{endereco.rotuloArea ?? endereco.endereco}</p>
            )}
            <p className="text-xs text-muted-foreground">O ponto exato não é salvo nem exibido.</p>
          </div>
        </div>
        <SeletorHorario horario={horario} aoMudar={definirHorario} />
      </div>
    </PassoRegistro>
  )
}
