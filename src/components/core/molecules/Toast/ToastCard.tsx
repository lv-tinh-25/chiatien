'use client'

import { Button } from '@/components/core/atoms/Button'
import { cn } from '@/lib/utils'
import type { ToastAction, ToastVariant } from '@/stores/useToastStore'
import * as ToastPrimitive from '@radix-ui/react-toast'
import {
  Check,
  CircleAlert,
  Info,
  TriangleAlert,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Everything a variant decides, in one table: the glyph, the three colours the
 * card wears, and whether it leaves on its own.
 *
 * The lifetime belongs here rather than at each call site because the dangerous
 * combination is the one nobody would type on purpose — an error that vanishes
 * after four seconds takes the message with it, and the call site that forgets
 * to say so looks exactly like the one that meant it.
 */
const VARIANTS = {
  neutral: {
    Icon: Info,
    mark: 'bg-muted text-muted-foreground',
    edge: 'border-border',
    glow: '[--toast-glow:var(--foreground)]',
    bar: 'bg-muted-foreground',
    transient: true,
  },
  success: {
    Icon: Check,
    mark: 'bg-credit-subtle text-credit',
    edge: 'border-credit-border',
    glow: '[--toast-glow:var(--credit)]',
    bar: 'bg-credit',
    transient: true,
  },
  warning: {
    Icon: TriangleAlert,
    mark: 'bg-warning-subtle text-warning',
    edge: 'border-warning-border',
    glow: '[--toast-glow:var(--warning)]',
    bar: '',
    transient: false,
  },
  error: {
    Icon: CircleAlert,
    mark: 'bg-destructive-subtle text-destructive',
    edge: 'border-destructive-border',
    glow: '[--toast-glow:var(--destructive)]',
    bar: '',
    transient: false,
  },
} as const

/**
 * The countdown bar has to run for exactly as long as the toast lives, and
 * Tailwind only sees class names it can read in the source — so the two values
 * are written once, together, rather than passed through a style prop.
 */
const LIFETIME = {
  plain: { ms: 4_000, bar: 'animate-[toast-countdown_4s_linear_both]' },
  // Long enough to notice the toast, read it, and reach the button.
  withAction: { ms: 8_000, bar: 'animate-[toast-countdown_8s_linear_both]' },
} as const

export type ToastCardProps = {
  title: string
  description?: string
  action?: ToastAction
  icon?: LucideIcon
  variant?: ToastVariant
  onDismiss?: () => void
}

export function ToastCard({
  title,
  description,
  action,
  icon,
  variant = 'neutral',
  onDismiss,
}: ToastCardProps) {
  const t = useTranslations('Toast')
  const { Icon, mark, edge, glow, bar, transient } = VARIANTS[variant]
  const Glyph = icon ?? Icon

  const lifetime = !transient
    ? null
    : action !== undefined
      ? LIFETIME.withAction
      : LIFETIME.plain

  // An error's own button is the point of the toast, so it goes under the
  // sentence that explains it rather than competing with it for the same line.
  const stacked = variant === 'error' && action !== undefined

  const actionButton = action !== undefined && (
    <ToastPrimitive.Action
      altText={action.altLabel}
      onClick={action.onAction}
      asChild
    >
      <Button
        variant={variant === 'error' ? 'destructive' : 'outline'}
        size="sm"
        // 32px, not the 48px a thumb target needs: the web's own target rule is
        // 24px, and a button that tall turns a one-line toast into a block.
        className="h-8 min-h-0 shrink-0 px-3 text-body-sm"
      >
        {action.label}
      </Button>
    </ToastPrimitive.Action>
  )

  return (
    <ToastPrimitive.Root
      open
      duration={lifetime?.ms ?? Infinity}
      // A failure has to interrupt; a confirmation must not.
      type={variant === 'error' ? 'foreground' : 'background'}
      onOpenChange={(open) => {
        if (!open) onDismiss?.()
      }}
      className={cn(
        // Each corner's card arrives from the edge it will rest against.
        'solid-toast drop-in lg:rise-in relative flex w-full gap-3 overflow-hidden rounded-card p-3 pr-2',
        // Radix ranks every dismissable layer and writes `pointer-events: none`
        // inline on the ones a modal covers — which is the toast, always. For
        // anything else that is right; for the layer whose whole job is to
        // outrank the page it reports on, it leaves an error nobody can close.
        'pointer-events-auto!',
        'transition-[opacity,transform] duration-200 ease-out-soft',
        'data-[state=closed]:opacity-0',
        'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        'data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=cancel]:translate-x-0',
        stacked ? 'items-start' : 'items-center',
        edge,
        glow,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-full',
          mark,
        )}
      >
        <Glyph className="size-4.5" />
      </span>

      <div className="min-w-0 flex-1">
        <ToastPrimitive.Title className="text-body-lg font-bold text-foreground">
          {title}
        </ToastPrimitive.Title>
        {description !== undefined && (
          <ToastPrimitive.Description className="mt-0.5 text-body-sm text-muted-foreground">
            {description}
          </ToastPrimitive.Description>
        )}
        {stacked && <div className="mt-2.5 flex">{actionButton}</div>}
      </div>

      {!stacked && actionButton}

      <ToastPrimitive.Close asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('dismiss')}
          className="size-7 min-h-0 shrink-0 rounded-control px-0 text-muted-foreground-subtle hover:text-foreground [&_svg]:size-3.5"
        >
          <X aria-hidden />
        </Button>
      </ToastPrimitive.Close>

      {lifetime !== null && (
        <span
          aria-hidden
          className={cn(
            'absolute inset-x-0 bottom-0 h-[3px] origin-left opacity-35',
            bar,
            lifetime.bar,
          )}
        />
      )}
    </ToastPrimitive.Root>
  )
}
