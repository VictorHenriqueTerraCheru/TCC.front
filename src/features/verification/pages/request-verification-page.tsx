import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useNavigate } from 'react-router'

import { TextAreaField, SelectField } from '@/common/components/text-field'
import { Icon } from '@/common/components/icon'
import { ScreenWithBack } from '@/common/components/screen-with-back'
import { Button } from '@/common/ui/button'
import { Skeleton } from '@/common/ui/skeleton'
import { useAuthenticated } from '@/features/auth'
import { useMe } from '@/features/users'

import { useRequestVerification } from '../api/use-request-verification'
import { verificationErrorMessage } from '../errors'
import { affiliationLabel, affiliationTypes } from '../models/verification'
import { requestSchema, type RequestFormValues } from '../validators/request'

const LIMIT = 500

export function RequestVerificationPage() {
  const navigate = useNavigate()
  const authenticated = useAuthenticated()
  const { data: me, isPending } = useMe()
  const request = useRequestVerification()
  const { register, handleSubmit, control, formState } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { affiliationType: 'livesInArea', justification: '' },
  })
  const justification = useWatch({ control, name: 'justification' })

  if (!authenticated) return <Navigate to="/login" replace state={{ de: '/perfil/verificacao' }} />
  if (me && me.role !== 'citizen') return <Navigate to="/perfil" replace />

  const send = handleSubmit((form) =>
    request.mutate(
      { affiliationType: form.affiliationType, justification: form.justification },
      { onSuccess: () => navigate('/perfil', { replace: true }) },
    ),
  )
  const rejection = me?.verification?.status === 'rejected' ? me.verification : null
  const pending = me?.verification?.status === 'pending'

  return (
    <div className="mx-auto h-full w-full lg:max-w-3xl">
      <ScreenWithBack title="Solicitar verificação" onBack={() => navigate('/perfil')}>
        {isPending ? (
          <Skeleton className="h-60 rounded-2xl bg-muted" />
        ) : (
          <form onSubmit={send} noValidate className="flex flex-1 flex-col">
            {rejection && (
              <div
                role="status"
                className="mb-4 flex gap-3 rounded-2xl bg-destructive/15 p-4 text-destructive"
              >
                <Icon name="cancel" filled className="text-[22px] text-destructive" />
                <div className="text-sm">
                  <p className="text-xs">Último pedido</p>
                  <p className="text-base font-medium">Recusada</p>
                  {rejection.rejectionReason && <p>Motivo: {rejection.rejectionReason}</p>}
                  <p>Você pode enviar um novo pedido.</p>
                </div>
              </div>
            )}
            <p className="mb-6 text-sm text-muted-foreground">
              Verificamos pessoas com vínculo comprovado com a região ou com serviços urbanos. O
              pedido é analisado pela equipe de moderação.
            </p>

            {pending ? (
              <p className="rounded-2xl bg-card p-4 text-sm shadow-1">
                Você já tem um pedido em análise. Assim que a moderação responder, o resultado
                aparece no seu perfil.
              </p>
            ) : (
              <>
                <div className="space-y-6">
                  <SelectField label="Tipo de vínculo" {...register('affiliationType')}>
                    {affiliationTypes.map((type) => (
                      <option key={type} value={type}>
                        {affiliationLabel[type]}
                      </option>
                    ))}
                  </SelectField>
                  <TextAreaField
                    label="Justificativa *"
                    placeholder="Ex.: moro na Rua São Clemente há 8 anos e passo pelo trecho todos os dias."
                    maximum={LIMIT}
                    currentValue={justification}
                    error={formState.errors.justification?.message}
                    help="Conte seu vínculo com a região (mínimo de 30 caracteres)."
                    {...register('justification')}
                  />
                </div>
                {request.error && (
                  <p role="alert" className="mt-4 text-sm text-destructive">
                    {verificationErrorMessage(request.error)}
                  </p>
                )}
                <Button type="submit" className="mt-auto w-full" loading={request.isPending}>
                  {request.isPending ? 'Enviando…' : 'Enviar pedido'}
                </Button>
              </>
            )}
          </form>
        )}
      </ScreenWithBack>
    </div>
  )
}
