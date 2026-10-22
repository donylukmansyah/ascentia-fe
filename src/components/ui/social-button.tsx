import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import { useLanguage } from '#/lib/i18n'
import { cn } from '#/lib/utils'

function useClickOutside(
  ref: RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) handler()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [ref, handler])
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

export interface SocialButtonProps {
  className?: string
  shareUrl?: string
  shareTitle?: string
}

export default function SocialButton({
  className,
  shareUrl,
  shareTitle = '',
}: SocialButtonProps) {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useClickOutside(wrapperRef, () => setIsExpanded(false))

  const currentUrl =
    shareUrl ||
    (typeof window !== 'undefined'
      ? window.location.href
      : 'https://ascentia.co.id')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
    } catch {
      // Ignore clipboard write rejection
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareTargets = [
    {
      icon: LinkedInIcon,
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: 'hover:text-[#0A66C2] hover:bg-[#0A66C2]/10',
    },
    {
      icon: TwitterIcon,
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}`,
      color: 'hover:text-foreground hover:bg-foreground/10',
    },
    {
      icon: FacebookIcon,
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      color: 'hover:text-[#1877F2] hover:bg-[#1877F2]/10',
    },
  ]

  return (
    <div ref={wrapperRef} className={cn('relative inline-flex', className)}>
      <motion.div
        animate={{ width: isExpanded ? 'auto' : '108px', height: '40px' }}
        className={cn(
          'relative flex items-center overflow-hidden',
          'border border-border bg-background',
          'shadow-xs hover:shadow-sm',
          'cursor-pointer rounded-full transition-shadow',
        )}
        initial={false}
        onClick={() => !isExpanded && setIsExpanded(true)}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      >
        <AnimatePresence mode="sync">
          {!isExpanded ? (
            <motion.div
              className="absolute inset-0 flex items-center justify-center gap-1.5 px-3 text-foreground"
              exit={{ opacity: 0, y: -16 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              key="share-text"
              transition={{ duration: 0.18 }}
            >
              <Share2 className="size-3.5" aria-hidden="true" />
              <span className="text-xs font-semibold">
                {t('ui.share', 'Share')}
              </span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center px-1"
              exit={{ opacity: 0, scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              key="actions"
              transition={{ delay: 0.08, duration: 0.18 }}
            >
              {shareTargets.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${t('ui.shareOn', 'Share on')} ${item.label}`}
                  title={`${t('ui.shareOn', 'Share on')} ${item.label}`}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full text-foreground/75 transition-colors',
                    item.color,
                  )}
                >
                  <item.icon className="size-4" />
                </a>
              ))}
              <div className="mx-1 h-5 w-px bg-border" />
              <button
                type="button"
                title={
                  copied
                    ? t('ui.copied', 'Copied!')
                    : t('ui.copyLink', 'Copy link')
                }
                aria-label={t('ui.copyLink', 'Copy link')}
                onClick={(e) => {
                  e.stopPropagation()
                  void handleCopy()
                }}
                className={cn(
                  'flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground/75 transition-colors hover:bg-muted',
                  copied && 'bg-emerald-50 text-emerald-600',
                )}
              >
                {copied ? (
                  <Check
                    className="size-4 text-emerald-600"
                    aria-hidden="true"
                  />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
