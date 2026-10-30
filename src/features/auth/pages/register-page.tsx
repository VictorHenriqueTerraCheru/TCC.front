import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'

import { PasswordField, TextField } from '@/common/components/text-field'
import { ScreenWithBack } from '@/common/components/screen-with-back'
import { Button } from '@/common/ui/button'
import { Checkbox } from '@/common/ui/checkbox'

import { useRegister } from '../api/use-login'
import { NoticeDialog } from '../components/notice-dialog'
import { applyAuthError } from '../errors'
import { useAfterLogin } from '../hooks/use-after-login'
import { useGuardStore } from '../stores/guard-store'
import { registerSchema, type RegisterFormValues } from '../validators/auth'

function DocumentLink({ title, children }: { title: string; children: ReactNode }) {
  return (
    <NoticeDialog
      title={title}
      trigger={
        <button type="button" className="text-brand underline underline-offset-2">
          {title}
        </button>
      }
    >
      {children}
    </NoticeDialog>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const afterLogin = useAfterLogin()
  const registration = useRegister()
  const [generalError, setGeneralError] = useState<string | null>(null)
  const { register, control, handleSubmit, setError, formState } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', acceptedTerms: false },
  })

  const send = handleSubmit((form) => {
    setGeneralError(null)
    registration.mutate(form, {
      onSuccess: afterLogin,
      onError: (error) =>
        setGeneralError(
          applyAuthError(error, setError, ['name', 'email', 'password', 'acceptedTerms']),
        ),
    })
  })

  function goBack() {
    useGuardStore.getState().discard()
    navigate(-1)
  }

  const termsError = formState.errors.acceptedTerms?.message

  return (
    <ScreenWithBack title="Criar conta" onBack={goBack}>
      <form onSubmit={send} noValidate className="flex flex-1 flex-col">
        <h2 className="mt-4 text-[28px] leading-9">Crie sua conta</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Com uma conta você registra ocorrências e avalia as que já estão no mapa.
        </p>

        <div className="space-y-6">
          <TextField
            label="Nome"
            autoComplete="name"
            error={formState.errors.name?.message}
            {...register('name')}
          />
          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            error={formState.errors.email?.message}
            {...register('email')}
          />
          <PasswordField
            label="Senha"
            autoComplete="new-password"
            help="Mínimo de 8 caracteres"
            error={formState.errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className="mt-6 flex items-start gap-3 text-sm">
          <Controller
            control={control}
            name="acceptedTerms"
            render={({ field }) => (
              <Checkbox
                id="accepted-terms"
                ref={field.ref}
                name={field.name}
                checked={field.value}
                onCheckedChange={(value) => field.onChange(value === true)}
                onBlur={field.onBlur}
                aria-invalid={termsError ? true : undefined}
                aria-describedby={termsError ? 'accepted-terms-error' : undefined}
                className="mt-0.5"
              />
            )}
          />
          <div>
            <label htmlFor="accepted-terms">Li e aceito os </label>
            <DocumentLink title="Termos de uso">
              <p>
                O sistema é um protótipo acadêmico (TCC). Registre apenas ocorrências reais e evite
                dados pessoais nas descrições.
              </p>
              <p>Registros e votos podem ser usados de forma agregada na pesquisa.</p>
            </DocumentLink>{' '}
            e a{' '}
            <DocumentLink title="Política de privacidade">
              <p>
                Guardamos seu nome, e-mail e seus registros e votos. Sua localização serve só para
                calcular a distância do voto e é descartada; incidentes são anônimos e agregados.
              </p>
            </DocumentLink>
            {termsError && (
              <p id="accepted-terms-error" className="mt-1 text-xs text-destructive">
                {termsError}
              </p>
            )}
          </div>
        </div>

        {generalError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {generalError}
          </p>
        )}

        <div className="mt-auto pt-10">
          <Button type="submit" className="w-full" loading={registration.isPending}>
            {registration.isPending ? 'Criando conta…' : 'Criar conta'}
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            Já tem conta?
            <Link
              to="/login"
              state={location.state}
              replace
              className="inline-flex min-h-11 items-center font-medium text-brand hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </ScreenWithBack>
  )
}
