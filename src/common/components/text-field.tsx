import { AnimatePresence, m } from 'motion/react'
import { useId, useState, type ComponentProps, type ReactNode } from 'react'

import { Icon } from '@/common/components/icon'
import { APPEAR } from '@/common/lib/motion'
import { cn } from '@/common/lib/utils'

const box = cn(
  'peer w-full rounded-2xl border border-input bg-superficie-2 text-base outline-none',
  'transition-[border-color,box-shadow,background-color] duration-200 ease-out',
  'hover:border-muted-foreground/40 focus:border-ring focus:bg-card focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--ring)_18%,transparent)]',
  'aria-invalid:border-destructive aria-invalid:focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--destructive)_18%,transparent)]',
)

const floatingLabel = cn(
  'pointer-events-none absolute left-4 origin-left text-[11px] font-medium text-muted-foreground',
  'transition-[top,font-size,color] duration-200 ease-out',
  'peer-focus:text-primario peer-aria-invalid:text-destructive',
)

function Description({
  id,
  error,
  children,
}: {
  id: string
  error?: string
  children?: ReactNode
}) {
  return (
    <p
      id={id}
      className={cn(
        'mt-1.5 flex items-start gap-1 px-4 text-xs',
        error ? 'text-destructive' : 'text-muted-foreground',
      )}
    >
      {error && <Icon name="error" filled className="mt-px text-[14px]" />}
      {children}
    </p>
  )
}

interface TextFieldProps extends ComponentProps<'input'> {
  label: string
  error?: string
  help?: string
}

export function TextField({
  label,
  error,
  help,
  className,
  id,
  placeholder,
  ...props
}: TextFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = `${fieldId}-descricao`
  const description = error ?? help

  return (
    <div className={className}>
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={description ? descriptionId : undefined}
          placeholder={placeholder ?? ' '}
          className={cn(box, 'h-14 px-4 pt-5 pb-1')}
          {...props}
        />
        <label
          htmlFor={fieldId}
          className={cn(
            floatingLabel,
            'top-2',
            !placeholder &&
              'peer-[:placeholder-shown:not(:focus)]:top-[17px] peer-[:placeholder-shown:not(:focus)]:text-base peer-[:placeholder-shown:not(:focus)]:font-normal',
          )}
        >
          {label}
        </label>
      </div>
      {description && (
        <Description id={descriptionId} error={error}>
          {description}
        </Description>
      )}
    </div>
  )
}

export function PasswordField(props: Omit<TextFieldProps, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <TextField
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('[&_input]:pr-12', props.className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
        className="absolute top-2 right-2 flex size-10 pressionavel items-center justify-center rounded-full hover:bg-foreground/5 focus-visible:outline-2"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={visible ? 'visible' : 'hidden'}
            initial={{ opacity: 0, scale: 0.7, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.7, rotate: 20 }}
            transition={APPEAR}
            className="flex"
          >
            <Icon
              name={visible ? 'visibility' : 'visibility_off'}
              className="text-muted-foreground"
            />
          </m.span>
        </AnimatePresence>
      </button>
    </div>
  )
}

interface TextAreaFieldProps extends ComponentProps<'textarea'> {
  label: string
  error?: string
  help?: string
  maximum?: number
  currentValue?: string
}

export function TextAreaField({
  label,
  error,
  help,
  maximum,
  currentValue = '',
  className,
  id,
  placeholder,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = `${fieldId}-descricao`
  const nearLimit = maximum !== undefined && currentValue.length >= maximum * 0.9
  return (
    <div className={className}>
      <div className="relative">
        <textarea
          id={fieldId}
          rows={4}
          maxLength={maximum}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
          placeholder={placeholder ?? ' '}
          className={cn(box, 'resize-none px-4 pt-7 pb-3')}
          {...props}
        />
        <label
          htmlFor={fieldId}
          className={cn(
            floatingLabel,
            'top-2',
            !placeholder &&
              'peer-[:placeholder-shown:not(:focus)]:top-4 peer-[:placeholder-shown:not(:focus)]:text-base peer-[:placeholder-shown:not(:focus)]:font-normal',
          )}
        >
          {label}
        </label>
      </div>
      <Description id={descriptionId} error={error}>
        <span className="flex-1">{error ?? help}</span>
        {maximum !== undefined && (
          <span
            className={cn(
              'shrink-0 tabular-nums transition-colors',
              nearLimit ? 'font-semibold text-foreground' : 'text-muted-foreground',
            )}
          >
            {currentValue.length}/{maximum}
          </span>
        )}
      </Description>
    </div>
  )
}

interface SelectFieldProps extends ComponentProps<'select'> {
  label: string
  error?: string
}

export function SelectField({ label, error, className, id, children, ...props }: SelectFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const descriptionId = `${fieldId}-descricao`
  return (
    <div className={className}>
      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? descriptionId : undefined}
          className={cn(box, 'h-14 appearance-none pt-5 pr-12 pb-1 pl-4')}
          {...props}
        >
          {children}
        </select>
        <label htmlFor={fieldId} className={cn(floatingLabel, 'top-2')}>
          {label}
        </label>
        <Icon
          name="keyboard_arrow_down"
          className="pointer-events-none absolute top-4 right-4 text-muted-foreground transition-transform peer-focus:rotate-180"
        />
      </div>
      {error && (
        <Description id={descriptionId} error={error}>
          {error}
        </Description>
      )}
    </div>
  )
}
