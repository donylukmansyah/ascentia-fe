import { ChevronDown } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { cn } from '#/lib/utils'

const languages = [
  { code: 'en', label: 'English', flag: '/icons/flags/gb.svg' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '/icons/flags/id.svg' },
] as const

type LanguageCode = (typeof languages)[number]['code']

type LanguagePickerProps = {
  language: LanguageCode
  onLanguageChange: (language: LanguageCode) => void
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function LanguagePicker({
  language,
  onLanguageChange,
  onOpenChange,
  className,
}: LanguagePickerProps) {
  const activeLanguage = languages.find((item) => item.code === language)

  if (!activeLanguage) {
    return null
  }

  return (
    // Non-modal: no scroll lock.
    <DropdownMenu modal={false} onOpenChange={(open) => onOpenChange?.(open)}>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
          className,
        )}
        aria-label={`Select language, current ${activeLanguage.label}`}
      >
        <img
          src={activeLanguage.flag}
          alt=""
          aria-hidden="true"
          className="size-5 shrink-0 rounded-full border border-foreground/10 object-cover"
        />
        <span className="text-[11px] font-medium tracking-[-0.01em]">
          {activeLanguage.code.toUpperCase()}
        </span>
        <ChevronDown
          className="size-3 transition-transform duration-200"
          aria-hidden="true"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 rounded-xl border border-border/60 bg-popover p-1 shadow-[0_3px_10px_-5px_rgb(0_0_0/0.16)]"
      >
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => {
            if (value === 'en' || value === 'id') {
              onLanguageChange(value)
            }
          }}
        >
          {languages.map((item) => (
            <DropdownMenuRadioItem
              key={item.code}
              value={item.code}
              closeOnClick
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted focus:bg-muted focus:text-foreground data-checked:bg-muted data-checked:text-foreground"
            >
              <img
                src={item.flag}
                alt=""
                aria-hidden="true"
                className="h-3.5 w-5 shrink-0 rounded-[3px] border border-foreground/10 object-cover"
              />
              <span className="flex-1">{item.label}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export type { LanguageCode }
