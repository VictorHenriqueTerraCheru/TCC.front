import type { ColorAppearance } from '../models/category'

export function GroupDot({ color }: { color: Pick<ColorAppearance, 'strongColor'> }) {
  return (
    <span aria-hidden="true" className="flex size-[18px] shrink-0 items-center justify-center">
      <span className="size-3 rounded-full" style={{ background: color.strongColor }} />
    </span>
  )
}
