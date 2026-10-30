import type { MaterialSymbol } from 'material-symbols'
import { useEffect, useState, type CSSProperties } from 'react'

import { cn } from '@/common/lib/utils'
import { loadIcon, type RemoteIconData } from '@/common/lib/iconify'
import bundledIcons from '@/assets/material-symbols/icones.json'

import { Icon } from './icon'

const BUNDLED_ICONS = new Set<string>(bundledIcons)

interface DynamicIconProps {
  name: string
  alternative?: MaterialSymbol
  filled?: boolean
  className?: string
  style?: CSSProperties
}

export function DynamicIcon({
  name,
  alternative = 'category',
  filled,
  className,
  style,
}: DynamicIconProps) {
  if (BUNDLED_ICONS.has(name)) {
    return (
      <Icon name={name as MaterialSymbol} filled={filled} className={className} style={style} />
    )
  }
  return (
    <RemoteIcon
      key={name}
      name={name}
      alternative={alternative}
      filled={filled}
      className={className}
      style={style}
    />
  )
}

function RemoteIcon({
  name,
  alternative,
  filled,
  className,
  style,
}: {
  name: string
  alternative: MaterialSymbol
  filled?: boolean
  className?: string
  style?: CSSProperties
}) {
  const [unwrapData, setDados] = useState<RemoteIconData | null>(null)

  useEffect(() => {
    let active = true
    void loadIcon(name).then((result) => {
      if (active) setDados(result)
    })
    return () => {
      active = false
    }
  }, [name])

  if (!unwrapData) {
    return <Icon name={alternative} filled={filled} className={className} style={style} />
  }
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${unwrapData.pageSize} ${unwrapData.pageSize}`}
      fill="currentColor"
      width="1em"
      height="1em"
      className={cn('shrink-0 select-none', className)}
      style={{ fontSize: undefined, ...style }}
    >
      {unwrapData.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  )
}
