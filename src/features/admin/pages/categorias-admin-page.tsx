import { useState } from 'react'

import { Segmentado } from '@/common/components/segmentado'

import { GuardaAdmin } from '../components/guarda-admin'
import { ListaCategorias } from '../components/lista-categorias'
import { ListaGrupos } from '../components/lista-grupos'

type Secao = 'categorias' | 'grupos'

const secoes: { valor: Secao; rotulo: string }[] = [
  { valor: 'categorias', rotulo: 'Categorias' },
  { valor: 'grupos', rotulo: 'Grupos' },
]

export function CategoriasAdminPage() {
  const [secao, setSecao] = useState<Secao>('categorias')

  return (
    <GuardaAdmin titulo="Categorias" caminho="/admin/categorias">
      <Segmentado<Secao>
        rotulo="Seção"
        opcoes={secoes}
        valor={secao}
        aoMudar={setSecao}
        className="mb-4"
      />
      {secao === 'categorias' ? <ListaCategorias /> : <ListaGrupos />}
    </GuardaAdmin>
  )
}
