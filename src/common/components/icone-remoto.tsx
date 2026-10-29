import type { MaterialSymbol } from 'material-symbols'
import { useEffect, useState, type CSSProperties } from 'react'

import { cn } from '@/common/lib/utils'
import { carregarIcone, type IconeRemotoDados } from '@/common/lib/iconify'
import iconesDoPacote from '@/assets/material-symbols/icones.json'

import { Icone } from './icone'

const NO_PACOTE = new Set<string>(iconesDoPacote)

interface IconeDinamicoProps {
  nome: string
  alternativo?: MaterialSymbol
  preenchido?: boolean
  className?: string
  style?: CSSProperties
}

export function IconeDinamico({
  nome,
  alternativo = 'category',
  preenchido,
  className,
  style,
}: IconeDinamicoProps) {
  if (NO_PACOTE.has(nome)) {
    return (
      <Icone
        nome={nome as MaterialSymbol}
        preenchido={preenchido}
        className={className}
        style={style}
      />
    )
  }
  return (
    <IconeRemoto
      key={nome}
      nome={nome}
      alternativo={alternativo}
      preenchido={preenchido}
      className={className}
      style={style}
    />
  )
}

function IconeRemoto({
  nome,
  alternativo,
  preenchido,
  className,
  style,
}: {
  nome: string
  alternativo: MaterialSymbol
  preenchido?: boolean
  className?: string
  style?: CSSProperties
}) {
  const [dados, setDados] = useState<IconeRemotoDados | null>(null)

  useEffect(() => {
    let ativo = true
    void carregarIcone(nome).then((resultado) => {
      if (ativo) setDados(resultado)
    })
    return () => {
      ativo = false
    }
  }, [nome])

  if (!dados) {
    return <Icone nome={alternativo} preenchido={preenchido} className={className} style={style} />
  }
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${dados.tamanho} ${dados.tamanho}`}
      fill="currentColor"
      width="1em"
      height="1em"
      className={cn('shrink-0 select-none', className)}
      style={{ fontSize: undefined, ...style }}
    >
      {dados.caminhos.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
