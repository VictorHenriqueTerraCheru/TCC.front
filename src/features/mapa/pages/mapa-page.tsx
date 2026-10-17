import { Link } from 'react-router'

import { Icone } from '@/common/components/icone'
import { Pagina } from '@/common/components/pagina'
import { useDesktop } from '@/common/hooks/use-media-query'
import { ConexaoApi } from '@/features/categorias'

/** Tela 1. Provisória até a Etapa 1 (react-leaflet): por ora mostra o teste de integração. */
export function MapaPage() {
  const desktop = useDesktop()
  return (
    <>
      <Pagina titulo="Mapa">
        <p className="mb-4 text-sm text-muted-foreground">O mapa chega na Etapa 1.</p>
        <ConexaoApi />
      </Pagina>
      {!desktop && (
        <Link
          to="/registrar"
          className="fixed right-4 bottom-24 flex h-14 items-center gap-2 rounded-2xl bg-mint px-4 font-medium text-mint-foreground shadow-md hover:shadow-lg focus-visible:outline-2"
        >
          <Icone nome="add_location_alt" />
          Registrar
        </Link>
      )}
    </>
  )
}
