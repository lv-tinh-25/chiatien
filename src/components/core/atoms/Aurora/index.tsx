/**
 * The wash every glass surface refracts. Without it `backdrop-filter` has
 * nothing to pick up and every card reads as flat white.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <span className="aurora-blob -top-30 -left-25 size-85 bg-[radial-gradient(circle,hsl(var(--aurora-1)/0.32),transparent_70%)] md:-top-40 md:-left-30 md:size-140" />
      <span className="aurora-blob top-22 -right-32 size-80 bg-[radial-gradient(circle,hsl(var(--aurora-2)/0.28),transparent_70%)] md:top-30 md:-right-45 md:size-140" />
      <span className="aurora-blob -bottom-20 left-[30%] h-75 w-90 bg-[radial-gradient(circle,hsl(var(--aurora-3)/0.2),transparent_70%)] md:-bottom-40 md:left-[35%] md:h-115 md:w-150" />
    </div>
  )
}
