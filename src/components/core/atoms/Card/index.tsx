import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

const cardVariants = cva('rounded-card text-card-foreground', {
  variants: {
    tier: {
      flush: 'glass-flush',
      raised: 'glass-raised',
      float: 'glass-float',
    },
    interactive: {
      true: 'transition-[transform,box-shadow] duration-200 ease-out-soft hover:-translate-y-0.5 hover:shadow-raised active:translate-y-0 active:duration-75',
      false: '',
    },
  },
  defaultVariants: { tier: 'raised', interactive: false },
})

export type CardProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants>

export function Card({ className, tier, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(cardVariants({ tier, interactive }), className)}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1 p-5', className)} {...props} />
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('text-headline-md', className)} {...props} />
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-body-md text-muted-foreground', className)}
      {...props}
    />
  )
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-5 pt-0', className)} {...props} />
}

export function CardFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center gap-2 p-5 pt-0', className)}
      {...props}
    />
  )
}

export { cardVariants }
