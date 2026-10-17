import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'

import { CampoAreaTexto, CampoSelecao } from '@/common/components/campo-texto'
import { Icone } from '@/common/components/icone'
import { TelaComVoltar } from '@/common/components/tela-com-voltar'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useAutenticado } from '@/features/auth'
import { useMe } from '@/features/usuarios'

import { useSolicitarVerificacao } from '../api/use-solicitar'
import { mensagemErroVerificacao } from '../errors'
import { rotuloVinculo, tiposVinculo, type TipoVinculo } from '../models/verificacao'
import { solicitarSchema, type SolicitarForm } from '../validators/solicitar'

const LIMITE = 500

/** Tela 11. */
export function SolicitarVerificacaoPage() {
  const navigate = useNavigate()
  const autenticado = useAutenticado()
  const { data: me, isPending } = useMe()
  const solicitar = useSolicitarVerificacao()
  const { register, handleSubmit, control, formState } = useForm<SolicitarForm>({
    resolver: zodResolver(solicitarSchema),
    defaultValues: { tipoVinculo: 'moradorRegiao', justificativa: '' },
  })
  const justificativa = useWatch({ control, name: 'justificativa' })

  if (!autenticado) return <Navigate to="/login" replace state={{ de: '/perfil/verificacao' }} />
  if (me && me.perfil !== 'cidadao') return <Navigate to="/perfil" replace />

  const enviar = handleSubmit((form) =>
    solicitar.mutate(
      { tipoVinculo: form.tipoVinculo as TipoVinculo, justificativa: form.justificativa },
      { onSuccess: () => navigate('/perfil', { replace: true }) },
    ),
  )
  const recusa = me?.verificacao?.status === 'recusada' ? me.verificacao : null
  const pendente = me?.verificacao?.status === 'pendente'

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <TelaComVoltar titulo="Solicitar verificação" aoVoltar={() => navigate('/perfil')}>
        {isPending ? (
          <Skeleton className="h-60 rounded-2xl bg-muted" />
        ) : (
          <form onSubmit={enviar} noValidate className="flex flex-1 flex-col">
            {recusa && (
              <div
                role="status"
                className="mb-4 flex gap-3 rounded-2xl bg-error-container p-4 text-error-container-foreground"
              >
                <Icone nome="cancel" preenchido className="text-[22px] text-destructive" />
                <div className="text-sm">
                  <p className="text-xs">Último pedido</p>
                  <p className="text-base font-medium">Recusada</p>
                  {recusa.motivoRecusa && <p>Motivo: {recusa.motivoRecusa}</p>}
                  <p>Você pode enviar um novo pedido.</p>
                </div>
              </div>
            )}
            <p className="mb-6 text-sm text-muted-foreground">
              Verificamos pessoas com vínculo comprovado com a região ou com serviços urbanos. O
              pedido é analisado pela equipe de moderação.
            </p>

            {pendente ? (
              <p className="rounded-2xl bg-surface-container p-4 text-sm">
                Você já tem um pedido em análise. Assim que a moderação responder, o resultado
                aparece no seu perfil.
              </p>
            ) : (
              <>
                <div className="space-y-6">
                  <CampoSelecao rotulo="Tipo de vínculo" {...register('tipoVinculo')}>
                    {tiposVinculo.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {rotuloVinculo[tipo]}
                      </option>
                    ))}
                  </CampoSelecao>
                  <CampoAreaTexto
                    rotulo="Justificativa *"
                    placeholder="Ex.: moro na Rua São Clemente há 8 anos e passo pelo trecho todos os dias."
                    maximo={LIMITE}
                    valorAtual={justificativa}
                    erro={formState.errors.justificativa?.message}
                    ajuda="Conte seu vínculo com a região (mínimo de 30 caracteres)."
                    {...register('justificativa')}
                  />
                </div>
                {solicitar.error && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {mensagemErroVerificacao(solicitar.error)}
                  </p>
                )}
                <Button type="submit" className="mt-auto w-full" disabled={solicitar.isPending}>
                  {solicitar.isPending ? 'Enviando…' : 'Enviar pedido'}
                </Button>
              </>
            )}
          </form>
        )}
      </TelaComVoltar>
    </div>
  )
}
