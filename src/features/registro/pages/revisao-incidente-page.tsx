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
import { useEnderecoDoRascunho, useExigirPasso, useRascunho } from '../hooks/use-rascunho'
import { descreverHorario, ocorridoEm } from '../models/horario'

/** Tela 21b: incidente, passo 3 de 3 — aviso de anonimato, resumo e envio. */
export function RevisaoIncidentePage() {
  const navigate = useNavigate()
  const { categoria, categoriaId, local, horario } = useRascunho()
  const { data: endereco } = useEnderecoDoRascunho()
  const registrar = useRegistrarIncidente()
  useExigirPasso(categoriaId !== null && local !== null, '/registrar/incidente/local')

  const envio = useEnvio(registrar.mutateAsync, (area, { categoriaId: idCategoria, lat, lng }) => {
    navigate('/registrar/incidente/sucesso', {
      replace: true,
      state: {
        area,
        categoriaId: idCategoria,
        rotuloArea: endereco?.rotuloArea ?? null,
        bairro: endereco?.bairro ?? null,
        ponto: { lat, lng },
      },
    })
  })

  function enviar() {
    if (categoriaId === null || !local) return
    // O instante é calculado agora, no envio (regra 16).
    envio.enviar({ categoriaId, ...local, ocorridoEm: ocorridoEm(horario) })
  }
  useRetomarRegistro('enviar', enviar)

  return (
    <PassoRegistro
      titulo="Revisão"
      passo={{ atual: 3, total: 3, rotulo: 'Revisão' }}
      acaoTopo="voltar"
      aoTopo={() => navigate('/registrar/incidente/local')}
      rodape={
        <Button className="w-full" disabled={registrar.isPending} onClick={enviar}>
          <Icone nome="send" className="text-[18px]" />
          {registrar.isPending ? 'Enviando…' : 'Enviar registro'}
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        <section className="flex gap-3 rounded-2xl bg-primario-suave p-4 text-primario">
          <Icone nome="visibility_off" className="text-[22px]" />
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
            icone={
              categoria ? (
                <CategoriaIcone categoria={categoria} tamanho="sm" className="bg-transparent" />
              ) : (
                'category'
              )
            }
            rotulo="Categoria"
            valor={categoria?.nome ?? '—'}
            aoEditar={() => navigate('/registrar')}
          />
          <LinhaResumo icone="blur_on" rotulo="Tipo" valor="Incidente — entra no mapa de calor" />
          <LinhaResumo
            icone="location_on"
            rotulo="Área aproximada"
            valor={endereco ? (endereco.rotuloArea ?? endereco.endereco) : 'Buscando endereço…'}
            aoEditar={() => navigate('/registrar/incidente/local')}
          />
          <LinhaResumo
            icone="schedule"
            rotulo="Quando"
            valor={descreverHorario(horario)}
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
