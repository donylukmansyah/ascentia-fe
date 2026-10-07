import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Link } from '@tanstack/react-router'

import { productBrowseItems } from './navigation-data'
import { cn } from '#/lib/utils'

type ProductMenuProps = {
  className?: string
}

export function ProductMenu({ className }: ProductMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group inline-flex cursor-pointer items-center gap-1 py-2 text-[11px] font-medium tracking-[-0.01em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
          className,
        )}
        aria-label="Browse products"
      >
        Products
        <ChevronDown
          className="size-3 transition-transform duration-200 group-data-popup-open:rotate-180"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        sideOffset={12}
        className="w-[27rem] rounded-xl border border-border/70 bg-popover p-2.5 shadow-[0_3px_10px_-5px_rgb(0_0_0/0.16)]"
      >
        <p className="px-2 pt-1 pb-2.5 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Browse products by
        </p>
        <ul className="grid grid-cols-2 gap-1">
          {productBrowseItems.map(({ label, description, href, icon: Icon }) => (
            <li key={href} className={label === 'Applications' ? 'col-span-2' : ''}>
              <DropdownMenuItem
                render={<Link to={href} />}
                className="group flex cursor-pointer items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-muted focus:bg-muted"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-primary transition-colors group-hover:border-primary/25 group-focus:border-primary/25">
                  <Icon className="size-4.5" aria-hidden="true" />
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className="block text-[13px] font-semibold leading-none text-foreground">
                    {label}
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
                    {description}
                  </span>
                </span>
              </DropdownMenuItem>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
