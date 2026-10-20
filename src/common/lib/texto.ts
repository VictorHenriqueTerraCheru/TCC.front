/** Minúsculas e sem acento, para comparar texto de busca ("calcada" acha "Calçada"). */
export function semAcento(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
