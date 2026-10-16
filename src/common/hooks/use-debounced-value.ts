import { useEffect, useState } from 'react'

/** `valor` só depois de `atrasoMs` sem mudanças. */
export function useDebouncedValue<T>(valor: T, atrasoMs: number): T {
  const [atrasado, setAtrasado] = useState(valor)
  useEffect(() => {
    const timer = setTimeout(() => setAtrasado(valor), atrasoMs)
    return () => clearTimeout(timer)
  }, [valor, atrasoMs])
  return atrasado
}
