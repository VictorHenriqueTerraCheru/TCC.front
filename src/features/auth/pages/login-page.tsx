import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { PasswordField, TextField } from '@/common/components/text-field'
import { ScreenWithBack } from '@/common/components/screen-with-back'
import { Button } from '@/common/ui/button'

import { useLogin } from '../api/use-login'
import { NoticeDialog } from '../components/notice-dialog'
import { ExpiredNotice } from '../components/expired-notice'
import { applyAuthError } from '../errors'
import { useAfterLogin } from '../hooks/use-after-login'
import { useGuardStore } from '../stores/guard-store'
import { loginSchema, type LoginFormValues } from '../validators/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const afterLogin = useAfterLogin()
  const login = useLogin()
  const expired = useGuardStore((s) => s.expired)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const { register, handleSubmit, setError, formState } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const send = handleSubmit((form) => {
    setGeneralError(null)
    login.mutate(form, {
      onSuccess: afterLogin,
      onError: (error) => setGeneralError(applyAuthError(error, setError, ['email', 'password'])),
    })
  })

  function goBack() {
    useGuardStore.getState().discard()
    navigate(-1)
  }

  return (
    <ScreenWithBack title="Entrar" onBack={goBack}>
      <form onSubmit={send} noValidate className="flex flex-1 flex-col">
        <h2 className="mt-4 text-[28px] leading-9">Bem-vindo de volta</h2>
        <p className="mb-6 text-sm text-muted-foreground">Entre com o e-mail da sua conta.</p>
        {expired && <ExpiredNotice />}

        <div className="space-y-6">
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
            autoComplete="current-password"
            error={formState.errors.password?.message}
            {...register('password')}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <NoticeDialog
            title="Esqueci minha senha"
            trigger={
              <Button type="button" variant="link">
                Esqueci minha senha
              </Button>
            }
          >
            <p>A recuperação de senha não faz parte desta versão do sistema.</p>
            <p>Se precisar, fale com a equipe do projeto.</p>
          </NoticeDialog>
        </div>

        {generalError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {generalError}
          </p>
        )}
        <Button type="submit" className="mt-6" loading={login.isPending}>
          {login.isPending ? 'Entrando…' : 'Entrar'}
        </Button>

        <p className="mt-auto flex items-center justify-center gap-1 pt-10 text-sm text-muted-foreground">
          Ainda não tem conta?
          <Link
            to="/register"
            replace
            className="inline-flex min-h-11 items-center font-medium text-brand hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </form>
    </ScreenWithBack>
  )
}
