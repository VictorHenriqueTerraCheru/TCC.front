import { useState } from 'react'

import { SegmentedControl } from '@/common/components/segmented-control'

import { AdminGuard } from '../components/admin-guard'
import { CategoryList } from '../components/category-list'
import { GroupList } from '../components/group-list'

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
