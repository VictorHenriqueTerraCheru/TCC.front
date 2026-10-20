import { zodResolver } from '@hookform/resolvers/zod'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'

import { CampoSenha, CampoTexto } from '@/common/components/campo-texto'
import { TelaComVoltar } from '@/common/components/tela-com-voltar'
import { Button } from '@/common/ui/button'

import { useCadastrar } from '../api/use-entrar'
import { AvisoDialog } from '../components/aviso-dialog'
import { aplicarErroAuth } from '../errors'
import { useAposEntrar } from '../hooks/use-apos-entrar'
import { useGuardaStore } from '../stores/guarda-store'
import { cadastrarSchema, type CadastrarForm } from '../validators/auth'

function LinkDocumento({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <AvisoDialog
      titulo={titulo}
      gatilho={
        <button type="button" className="text-primario underline underline-offset-2">
          {titulo}
        </button>
      }
    >
      {children}
    </AvisoDialog>
  )
}

/** Tela 15. */
export function CadastroPage() {
  const navigate = useNavigate()
  const aposEntrar = useAposEntrar()
  const cadastrar = useCadastrar()
  const [erroGeral, setErroGeral] = useState<string | null>(null)
  const { register, handleSubmit, setError, formState } = useForm<CadastrarForm>({
    resolver: zodResolver(cadastrarSchema),
    defaultValues: { nome: '', email: '', senha: '', aceitouTermos: false },
  })

  const enviar = handleSubmit((form) => {
    setErroGeral(null)
    cadastrar.mutate(form, {
      onSuccess: aposEntrar,
      onError: (erro) =>
        setErroGeral(aplicarErroAuth(erro, setError, ['nome', 'email', 'senha', 'aceitouTermos'])),
    })
  })

  function voltar() {
    useGuardaStore.getState().descartar()
    navigate(-1)
  }

  const erroTermos = formState.errors.aceitouTermos?.message

  return (
    <TelaComVoltar titulo="Criar conta" aoVoltar={voltar}>
      <form onSubmit={enviar} noValidate className="flex flex-1 flex-col">
        <h2 className="mt-4 text-[28px] leading-9">Crie sua conta</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Com uma conta você registra ocorrências e avalia as que já estão no mapa.
        </p>

        <div className="space-y-6">
          <CampoTexto
            rotulo="Nome"
            autoComplete="name"
            erro={formState.errors.nome?.message}
            {...register('nome')}
          />
          <CampoTexto
            rotulo="E-mail"
            type="email"
            autoComplete="email"
            inputMode="email"
            erro={formState.errors.email?.message}
            {...register('email')}
          />
          <CampoSenha
            rotulo="Senha"
            autoComplete="new-password"
            ajuda="Mínimo de 8 caracteres"
            erro={formState.errors.senha?.message}
            {...register('senha')}
          />
        </div>

        <div className="mt-6 flex items-start gap-3 text-sm">
          <input
            id="aceitou-termos"
            type="checkbox"
            aria-invalid={erroTermos ? true : undefined}
            aria-describedby={erroTermos ? 'aceitou-termos-erro' : undefined}
            className="mt-0.5 size-5 shrink-0 accent-primario"
            {...register('aceitouTermos')}
          />
          <div>
            <label htmlFor="aceitou-termos">Li e aceito os </label>
            <LinkDocumento titulo="Termos de uso">
              <p>
                O sistema é um protótipo acadêmico (TCC). Registre apenas ocorrências reais e evite
                dados pessoais nas descrições.
              </p>
              <p>Registros e votos podem ser usados de forma agregada na pesquisa.</p>
            </LinkDocumento>{' '}
            e a{' '}
            <LinkDocumento titulo="Política de privacidade">
              <p>
                Guardamos seu nome, e-mail e seus registros e votos. Sua localização serve só para
                calcular a distância do voto e é descartada; incidentes são anônimos e agregados.
              </p>
            </LinkDocumento>
            {erroTermos && (
              <p id="aceitou-termos-erro" className="mt-1 text-xs text-destructive">
                {erroTermos}
              </p>
            )}
          </div>
        </div>

        {erroGeral && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {erroGeral}
          </p>
        )}

        <div className="mt-auto pt-10">
          <Button type="submit" className="w-full" disabled={cadastrar.isPending}>
            {cadastrar.isPending ? 'Criando conta…' : 'Criar conta'}
          </Button>
          <p className="mt-2 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            Já tem conta?
            <Link
              to="/login"
              replace
              className="inline-flex min-h-11 items-center font-medium text-primario hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </form>
    </TelaComVoltar>
  )
}
