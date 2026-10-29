import { useState } from 'react'

import { Segmentado } from '@/common/components/segmentado'

import { GuardaAdmin } from '../components/guarda-admin'
import { ListaCategorias } from '../components/lista-categorias'
import { ListaGrupos } from '../components/lista-grupos'

type Secao = 'categorias' | 'grupos'

const secoes: { value: Secao; label: string }[] = [
  { value: 'categorias', label: 'Categorias' },
  { value: 'grupos', label: 'Grupos' },
]

export function CategoriasAdminPage() {
  const [secao, setSecao] = useState<Secao>('categorias')

  return (
    <GuardaAdmin titulo="Categorias" caminho="/admin/categorias">
      <Segmentado<Secao>
        label="Seção"
        opcoes={secoes}
        value={secao}
        aoMudar={setSecao}
        className="mb-4"
      />
      {secao === 'categorias' ? <ListaCategorias /> : <ListaGrupos />}
    </GuardaAdmin>
  )
}
