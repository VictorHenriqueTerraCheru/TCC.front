import type { TipoGrupo } from '@/features/categorias'

/**
 * Nomes do tipo na administração. Estado e Evento valem também para o cidadão (tela de nova ocorrência); aqui o
 * vocabulário é o do domínio: Estado (problema, fica no mapa até ser resolvido) e Evento
 * (incidente, aconteceu e passou).
 */
export const rotuloDoTipo: Record<TipoGrupo, string> = {
  problema: 'Estado',
  incidente: 'Evento',
}

export const ajudaDoTipo: Record<TipoGrupo, string> = {
  problema: 'Continua lá até alguém confirmar que foi resolvido. Vira ponto no mapa.',
  incidente: 'Aconteceu e passou. Entra de forma anônima no mapa de calor.',
}

export const opcoesDeTipo: { valor: TipoGrupo; rotulo: string }[] = [
  { valor: 'problema', rotulo: rotuloDoTipo.problema },
  { valor: 'incidente', rotulo: rotuloDoTipo.incidente },
]

/** Classes da etiqueta de cada tipo: azul para Estado, roxo para Evento (cores que nenhum grupo usa por padrão). */
export const classeDoTipo: Record<TipoGrupo, string> = {
  problema: 'bg-primario-suave text-primario',
  incidente: 'bg-cat-roxo-claro text-cat-roxo',
}
