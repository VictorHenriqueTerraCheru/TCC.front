import type { GroupType } from '@/features/categories'

export const typeLabel: Record<GroupType, string> = {
  issue: 'Estado',
  incident: 'Evento',
}

export const typeHelp: Record<GroupType, string> = {
  issue: 'Continua lá até alguém confirmar que foi resolvido. Vira ponto no mapa.',
  incident: 'Aconteceu e passou. Entra de forma anônima no mapa de calor.',
}

export const typeOptions: { value: GroupType; label: string }[] = [
  { value: 'issue', label: typeLabel.issue },
  { value: 'incident', label: typeLabel.incident },
]

export const typeClass: Record<GroupType, string> = {
  issue: 'bg-brand-soft text-brand',
  incident: 'bg-group-purple-light text-group-purple',
}
