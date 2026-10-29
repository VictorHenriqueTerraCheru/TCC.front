import type { Tema } from '@/common/hooks/use-tema'

/** Icaraí (Niterói): centro quando não há localização. */
export const CENTRO_PADRAO: [number, number] = [-22.905, -43.109]
// Níveis do MapLibre (tiles de 512 px): um a menos que no Leaflet (256 px) para a mesma escala.
export const ZOOM_PADRAO = 15

/** Tracejados desenhados sobre o mapa (raio da área, ligação da conferência): contrastam com o chão. */
export const COR_TRACEJADO: Record<Tema, string> = { claro: '#36414f', escuro: '#eef3fa' }
