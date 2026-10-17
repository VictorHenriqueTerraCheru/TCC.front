import { Pagina } from '@/common/components/pagina'

/** Telas 15/16. Provisória até a Etapa 3. */
export function EntrarPage({ titulo }: { titulo: string }) {
  return (
    <Pagina titulo={titulo}>
      <p className="text-sm text-muted-foreground">Login e cadastro chegam na Etapa 3.</p>
    </Pagina>
  )
}
