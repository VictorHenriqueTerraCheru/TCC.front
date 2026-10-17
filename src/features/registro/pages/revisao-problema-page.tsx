import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useId } from 'react'
import { useNavigate } from 'react-router'

import { Icone } from '@/common/components/icone'
import { Button } from '@/common/ui/button'
import { CategoriaIcone } from '@/features/categorias'

import { useRegistrarProblema } from '../api/use-registro'
import { FalhaEnvioDialog } from '../components/falha-envio-dialog'
import { PassoRegistro } from '../components/passo-registro'
import { LinhaResumo, Resumo } from '../components/resumo'
import { useEnvio } from '../hooks/use-envio'
import { useRetomarRegistro } from '../hooks/use-retomar-registro'
import { useEnderecoDoRascunho, useExigirPasso, useRascunho } from '../hooks/use-rascunho'

const LIMITE_DESCRICAO = 280

/** Tela 8: passo 4 — descrição opcional, resumo e envio. */
export function RevisaoProblemaPage() {
  const navigate = useNavigate()
  const idDescricao = useId()
  const { categoria, categoriaId, local, descricao, definirDescricao } = useRascunho()
  const { data: endereco } = useEnderecoDoRascunho()
  const registrar = useRegistrarProblema()
  useExigirPasso(categoriaId !== null && local !== null, '/registrar/local')

  // Sucesso: a tela de sucesso recebe o problema criado (e limpa o rascunho ao abrir).
  const envio = useEnvio(registrar.mutateAsync, (problema) => {
    navigate('/registrar/sucesso', { replace: true, state: { problema } })
  })

  function enviar() {
    if (categoriaId === null || !local) return
    envio.enviar({ categoriaId, ...local, descricao })
  }
  useRetomarRegistro('enviar', enviar)

  return (
    <PassoRegistro
      titulo="Revisão"
      passo={{ atual: 4, total: 4, rotulo: 'Revisão' }}
      acaoTopo="voltar"
      aoTopo={() => navigate('/registrar/local')}
      rodape={
        <Button className="w-full" disabled={registrar.isPending} onClick={enviar}>
          <Icone nome="send" className="text-[18px]" />
          {registrar.isPending ? 'Enviando…' : 'Enviar registro'}
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        <div>
          <div className="relative">
            <textarea
              id={idDescricao}
              value={descricao}
              maxLength={LIMITE_DESCRICAO}
              onChange={(e) => definirDescricao(e.target.value)}
              rows={4}
              aria-describedby={`${idDescricao}-ajuda`}
              className="w-full resize-none rounded-md border border-input bg-background px-4 py-4 text-base outline-none focus:border-2 focus:border-primary focus:px-[15px]"
            />
            <label
              htmlFor={idDescricao}
              className="absolute -top-2 left-3 bg-background px-1 text-xs text-muted-foreground"
            >
              Descrição (opcional)
            </label>
          </div>
          <p
            id={`${idDescricao}-ajuda`}
            className="mt-1 flex justify-between px-4 text-xs text-muted-foreground"
          >
            <span>O que ajuda a identificar o problema</span>
            <span aria-label={`${descricao.length} de ${LIMITE_DESCRICAO} caracteres`}>
              {descricao.length}/{LIMITE_DESCRICAO}
            </span>
          </p>
        </div>

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
          <LinhaResumo
            icone="keep"
            rotulo="Tipo"
            valor="Problema — fica no mapa até ser resolvido"
          />
          <LinhaResumo
            icone="location_on"
            rotulo="Local aproximado"
            valor={endereco?.endereco ?? 'Buscando endereço…'}
            aoEditar={() => navigate('/registrar/local')}
          />
          <LinhaResumo
            icone="schedule"
            rotulo="Data e hora"
            valor={format(new Date(), "'Hoje', d MMM. · HH:mm", { locale: ptBR })}
          />
        </Resumo>

        <p className="flex gap-2 text-xs text-muted-foreground">
          <Icone nome="info" className="text-[18px]" />
          Seu registro entra com o selo "Nova" até receber avaliações de quem está por perto.
        </p>

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
