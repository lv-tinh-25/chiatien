/**
 * The wash every glass surface refracts. Without it `backdrop-filter` has
 * nothing to pick up and every card reads as flat white.
 *
 * On a phone the blobs are clipped to the same 480px column the app itself
 * occupies, so a wide viewport running the mobile layout does not show a lit
 * background either side of an unlit app.
 */
export function Aurora() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div className="absolute top-0 left-1/2 h-full w-full max-w-[480px] -translate-x-1/2 overflow-hidden lg:max-w-none lg:translate-x-0 lg:left-0">
        <span className="aurora-blob -top-30 -left-25 size-85 bg-[radial-gradient(circle,hsl(var(--aurora-1)/0.32),transparent_70%)] lg:-top-40 lg:-left-30 lg:size-140" />
        <span className="aurora-blob top-22 -right-32 size-80 bg-[radial-gradient(circle,hsl(var(--aurora-2)/0.28),transparent_70%)] lg:top-30 lg:-right-45 lg:size-140" />
        <span className="aurora-blob -bottom-20 left-[30%] h-75 w-90 bg-[radial-gradient(circle,hsl(var(--aurora-3)/0.2),transparent_70%)] lg:-bottom-40 lg:left-[35%] lg:h-115 lg:w-150" />
      </div>
    </div>
  )
}
