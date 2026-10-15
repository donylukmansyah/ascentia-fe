import type { ComponentProps, CSSProperties } from 'react'

import { cn } from '#/lib/utils'

type LogoLoaderProps = ComponentProps<'div'> & {
  src: string
  size?: number
  label?: string
}

export function LogoLoader({
  src,
  size = 48,
  label = 'Loading…',
  className,
  ...props
}: LogoLoaderProps) {
  return (
    <div
      {...props}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="relative block shrink-0"
        style={{ width: size, height: size }}
      >
        <img
          src={src}
          alt=""
          width={size}
          height={size}
          className="size-full object-contain"
        />
        <span
          className="logo-loader-highlight pointer-events-none absolute inset-0"
          style={
            {
              '--logo-loader-image': `url(${JSON.stringify(src)})`,
            } as CSSProperties
          }
        />
      </span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </div>
  )
}
