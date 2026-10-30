import { m } from 'motion/react'
import { useId } from 'react'

import { Icon } from '@/common/components/icone'
import { useThemeStore, type ThemePreference, type Theme } from '@/common/hooks/use-tema'
import { SOFT_SPRING } from '@/common/lib/movimento'
import { cn } from '@/common/lib/utils'

const OPTIONS: { value: ThemePreference; label: string; description?: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Automático', description: 'Igual ao celular' },
]

const COLORS: Record<Theme, { ground: string; road: string; card: string; line: string }> = {
  light: { ground: '#efe9df', road: '#ffffff', card: '#ffffff', line: '#d5d9e0' },
  dark: { ground: '#1b2735', road: '#3a4b60', card: '#1a2431', line: '#33445a' },
}

function Screen({ theme }: { theme: Theme }) {
  const color = COLORS[theme]
  return (
    <>
      <rect width="60" height="100" fill={color.ground} />
      <path d="M-5 30 65 48M22 -5 34 105" stroke={color.road} strokeWidth="5" />
      <circle cx="40" cy="30" r="6" fill="#ff7a1a" stroke="#fff" strokeWidth="1.5" />
      <rect x="5" y="64" width="50" height="31" rx="7" fill={color.card} />
      <rect x="11" y="72" width="26" height="4" rx="2" fill={color.line} />
      <rect x="11" y="81" width="38" height="4" rx="2" fill={color.line} />
    </>
  )
}

function Thumbnail({ preference }: { preference: ThemePreference }) {
  const clip = useId()
  return (
    <svg viewBox="0 0 60 100" aria-hidden="true" className="h-24 w-[58px] rounded-xl shadow-1">
      {preference === 'system' ? (
        <>
          <Screen theme="light" />
          <clipPath id={clip}>
            <path d="M60 0V100H0Z" />
          </clipPath>
          <g clipPath={`url(#${clip})`}>
            <Screen theme="dark" />
          </g>
        </>
      ) : (
        <Screen theme={preference} />
      )}
    </svg>
  )
}

export function ThemePicker({ className }: { className?: string }) {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)
  const ringId = useId()

  return (
    <div role="radiogroup" aria-label="Aparência" className={cn('grid grid-cols-3', className)}>
      {OPTIONS.map((option) => {
        const selected = option.value === preference
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setPreference(option.value)}
            className="flex pressionavel flex-col items-center gap-2 rounded-2xl py-3 focus-visible:outline-2"
          >
            <span className="relative rounded-[14px] p-[3px]">
              {selected && (
                <m.span
                  layoutId={ringId}
                  transition={SOFT_SPRING}
                  className="absolute inset-0 rounded-[14px] ring-2 ring-primario"
                />
              )}
              <Thumbnail preference={option.value} />
            </span>
            <span className="text-sm font-medium">{option.label}</span>
            {option.description && (
              <span className="-mt-2 text-xs text-muted-foreground">{option.description}</span>
            )}
            <Icon
              name={selected ? 'check_circle' : 'radio_button_unchecked'}
              filled={selected}
              className={cn('text-[22px]', selected ? 'text-primario' : 'text-muted-foreground')}
            />
          </button>
        )
      })}
    </div>
  )
}
