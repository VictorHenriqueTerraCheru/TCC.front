import { useState } from 'react'

import { SegmentedControl } from '@/common/components/segmentado'

import { AdminGuard } from '../components/guarda-admin'
import { CategoryList } from '../components/lista-categorias'
import { GroupList } from '../components/lista-grupos'

type Section = 'categories' | 'groups'

const sections: { value: Section; label: string }[] = [
  { value: 'categories', label: 'Categorias' },
  { value: 'groups', label: 'Grupos' },
]

export function AdminCategoriesPage() {
  const [section, setSection] = useState<Section>('categories')

  return (
    <AdminGuard title="Categorias" path="/admin/categorias">
      <SegmentedControl<Section>
        label="Seção"
        options={sections}
        value={section}
        onChange={setSection}
        className="mb-4"
      />
      {section === 'categories' ? <CategoryList /> : <GroupList />}
    </AdminGuard>
  )
}
