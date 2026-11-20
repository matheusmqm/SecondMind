import { useId } from 'react'
import { cn } from '@/lib/utils'

// Two interlocking loops: your mind and the second mind; the intersection is the highlight.
// Colors come from the HeroUI tokens, so the logo follows the theme.
export function LogoMark({ size = 32, className }) {
  const clip = useId()
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="12.5" cy="16" r="8.4" />
        </clipPath>
      </defs>
      <circle cx="19.5" cy="16" r="8.4" fill="var(--warning)" fillOpacity="0.6" clipPath={`url(#${clip})`} />
      <path
        d="M13.4 7.5C8.7 7 4.6 10.5 4.3 15.2 4 19.9 7.7 24 12.4 24.4 17 24.8 21 21.3 21.4 16.7 21.7 13.2 19.8 10 16.8 8.6"
        stroke="var(--foreground)"
        strokeWidth="1.9"
      />
      <path
        d="M19 7.4C23.8 7.1 27.9 10.7 28.1 15.4 28.3 20.1 24.6 24 20 24.2 15.6 24.4 11.8 21 11.4 16.6 11.1 13.4 12.7 10.4 15.5 8.9"
        stroke="var(--accent)"
        strokeWidth="1.9"
      />
    </svg>
  )
}

/** Full logo, with the uppercase `database` subtitle in the app header. */
export function Logo({ withNote = true, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-semibold tracking-tight">SecondMind</span>
        {withNote && <span className="mt-1 text-[10.5px] font-medium uppercase tracking-[0.14em] text-accent">database</span>}
      </span>
    </span>
  )
}
