import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { CampoSenha, CampoTexto } from '@/common/components/campo-texto'
import { TelaComVoltar } from '@/common/components/tela-com-voltar'
import { Button } from '@/common/ui/button'

import { useEntrar } from '../api/use-entrar'
import { AvisoDialog } from '../components/aviso-dialog'
import { AvisoExpirou } from '../components/aviso-expirou'
import { aplicarErroAuth } from '../errors'
import { useAposEntrar } from '../hooks/use-apos-entrar'
import { useGuardaStore } from '../stores/guarda-store'
import { entrarSchema, type EntrarForm } from '../validators/auth'

export function EntrarPage() {
  const navigate = useNavigate()
  const aposEntrar = useAposEntrar()
  const entrar = useEntrar()
  const expirou = useGuardaStore((s) => s.expirou)
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const { register, handleSubmit, setError, formState } = useForm<EntrarForm>({
    resolver: zodResolver(entrarSchema),
    defaultValues: { email: '', password: '' },
  })

  const enviar = handleSubmit((form) => {
    setErroGeral(null)
    entrar.mutate(form, {
      onSuccess: aposEntrar,
      onError: (erro) => setErroGeral(aplicarErroAuth(erro, setError, ['email', 'password'])),
    })
  })

  function voltar() {
    useGuardaStore.getState().descartar()
    navigate(-1)
  }

  return (
    <TelaComVoltar titulo="Entrar" aoVoltar={voltar}>
      <form onSubmit={enviar} noValidate className="flex flex-1 flex-col">
        <h2 className="mt-4 text-[28px] leading-9">Bem-vindo de volta</h2>
        <p className="mb-6 text-sm text-muted-foreground">Entre com o e-mail da sua conta.</p>
        {expirou && <AvisoExpirou />}

        <div className="space-y-6">
          <CampoTexto
            label="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            erro={formState.errors.email?.message}
            {...register('email')}
          />
          <CampoSenha
            label="Senha"
            autoComplete="current-password"
            erro={formState.errors.password?.message}
            {...register('password')}
          />
        </div>
        <div className="mt-2 flex justify-end">
          <AvisoDialog
            titulo="Esqueci minha senha"
            gatilho={
              <Button type="button" variant="link">
                Esqueci minha senha
              </Button>
            }
          >
            <p>A recuperação de senha não faz parte desta versão do sistema.</p>
            <p>Se precisar, fale com a equipe do projeto.</p>
          </AvisoDialog>
        </div>

        {erroGeral && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {erroGeral}
          </p>
        )}
        <Button type="submit" className="mt-6" carregando={entrar.isPending}>
          {entrar.isPending ? 'Entrando…' : 'Entrar'}
        </Button>

        <p className="mt-auto flex items-center justify-center gap-1 pt-10 text-sm text-muted-foreground">
          Ainda não tem conta?
          <Link
            to="/cadastro"
            replace
            className="inline-flex min-h-11 items-center font-medium text-primario hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </form>
    </TelaComVoltar>
  )
}
