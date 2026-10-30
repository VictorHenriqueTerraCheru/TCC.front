import { DynamicIcon } from '@/common/components/icone-remoto'
import { cn } from '@/common/lib/utils'

import { useAppearance } from '../hooks/use-aparencia'
import { iconOf, type CategorySummary } from '../models/categoria'

interface CategoryIconProps {
  category: Pick<CategorySummary, 'icon' | 'group'>
  pageSize?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'size-8 text-[18px]',
  md: 'size-10 text-[22px]',
  lg: 'size-12 text-[26px]',
}

export function CategoryIcon({ category, pageSize: size = 'md', className }: CategoryIconProps) {
  const { appearanceOf } = useAppearance()
  const appearance = appearanceOf(category)
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        appearance.light,
        appearance.strong,
        sizes[size],
        className,
      )}
    >
      <DynamicIcon name={iconOf(category)} className="text-[length:inherit]" />
    </span>
  )
}
