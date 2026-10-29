import { useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'
import { CategoriaIcone } from '@/features/categorias'

import { useRegistrarIncidente } from '../api/use-registro'
import { FalhaEnvioDialog } from '../components/falha-envio-dialog'
import { PassoRegistro } from '../components/passo-registro'
import { LinhaResumo, Resumo } from '../components/resumo'
import { useEnvio } from '../hooks/use-envio'
import { useRetomarRegistro } from '../hooks/use-retomar-registro'
import {
  useEnderecoDoRascunho,
  useExigirCategoria,
  useExigirPasso,
  useRascunho,
} from '../hooks/use-rascunho'
import { descreverHorario, ocorridoEm } from '../models/horario'
import { caminhoDaCategoria } from '../models/rotas'

export function RevisaoIncidentePage() {
  const navigate = useNavigate()
  const { category: categoria, categoryId: categoriaId, local, horario } = useRascunho()
  const { data: endereco } = useEnderecoDoRascunho()
  const registrar = useRegistrarIncidente()
  useExigirCategoria('incident')
  useExigirPasso(local !== null, '/registrar/incidente/local')

  const envio = useEnvio(registrar.mutateAsync, (area, { categoryId: idCategoria, lat, lng }) => {
    navigate('/registrar/incidente/sucesso', {
      replace: true,
      state: {
        area,
        categoryId: idCategoria,
        areaLabel: endereco?.areaLabel ?? null,
        neighborhood: endereco?.neighborhood ?? null,
        ponto: { lat, lng },
      },
    })
  })

  function enviar() {
    if (categoriaId === null || !local) return
    envio.enviar({ categoryId: categoriaId, ...local, occurredAt: ocorridoEm(horario) })
  }
  useRetomarRegistro('enviar', enviar)

  return (
    <PassoRegistro
      titulo="Revisão"
      passo={{ atual: 3, total: 3, label: 'Revisão' }}
      acaoTopo="voltar"
      aoTopo={() => navigate('/registrar/incidente/local')}
      rodape={
        <Button className="w-full" carregando={registrar.isPending} onClick={enviar}>
          <Icone name="send" className="text-[18px]" />
          {registrar.isPending ? 'Enviando…' : 'Enviar registro'}
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        <section className="flex gap-3 rounded-2xl bg-primario-suave p-4 text-primario">
          <Icone name="visibility_off" className="text-[22px]" />
          <div>
            <h2 className="font-medium">Registro anônimo e agregado</h2>
            <p className="text-sm">
              Seu nome não aparece. O relato soma-se ao mapa de calor da região e não vira marcador
              individual. Incidentes não recebem votos.
            </p>
          </div>
        </section>

        <Resumo>
          <LinhaResumo
            icon={
              categoria ? (
                <CategoriaIcone category={categoria} pageSize="sm" className="bg-transparent" />
              ) : (
                'category'
              )
            }
            label="Categoria"
            value={categoria?.name ?? '—'}
            aoEditar={() => navigate(caminhoDaCategoria('incident'))}
          />
          <LinhaResumo icon="blur_on" label="Tipo" value="Incidente — entra no mapa de calor" />
          <LinhaResumo
            icon="location_on"
            label="Área aproximada"
            value={endereco ? (endereco.areaLabel ?? endereco.address) : 'Buscando endereço…'}
            aoEditar={() => navigate('/registrar/incidente/local')}
          />
          <LinhaResumo
            icon="schedule"
            label="Quando"
            value={descreverHorario(horario)}
            aoEditar={() => navigate('/registrar/incidente/local')}
          />
        </Resumo>

        {envio.erroRegra && (
          <p role="alert" className="text-sm text-destructive">
            {envio.erroRegra}
          </p>
        )}
      </div>
      <FalhaEnvioDialog {...envio.falha} />
    </PassoRegistro>
  )
}
