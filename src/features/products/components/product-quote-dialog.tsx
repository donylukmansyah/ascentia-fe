import { useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '#/components/ui/dialog'
import { CtaButton } from '#/components/ui/cta-link'
import { sendContactEnquiry } from '#/features/contact/api/contact-api'
import {
  quoteFormSchema,
  sanitizePhoneInput,
} from '#/features/contact/forms/contact-schema'
import type { QuoteFormData } from '#/features/contact/forms/contact-schema'
import { cn } from '#/lib/utils'

import type { ProductDetailData } from '../types/product'

interface ProductQuoteDialogProps {
  product: ProductDetailData
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductQuoteDialog({
  product,
  open,
  onOpenChange,
}: ProductQuoteDialogProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<
    Partial<Record<keyof QuoteFormData, string>>
  >({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const validateField = (field: keyof QuoteFormData, value: string) => {
    const payload = {
      name,
      email,
      company: company || undefined,
      phone: phone || undefined,
      message,
      [field]: value.trim() || undefined,
    }
    const res = quoteFormSchema.safeParse(payload)
    if (res.success) {
      setErrors((prev) => {
        if (!prev[field]) return prev
        const next = { ...prev }
        delete next[field]
        return next
      })
    } else {
      const fieldIssue = res.error.issues.find(
        (issue) => issue.path[0] === field,
      )
      setErrors((prev) => {
        if (!fieldIssue) {
          if (!prev[field]) return prev
          const next = { ...prev }
          delete next[field]
          return next
        }
        return { ...prev, [field]: fieldIssue.message }
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitted(true)
    setErrorMessage(null)

    const result = quoteFormSchema.safeParse({
      name,
      email,
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      message: message.trim() || undefined,
    })

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof QuoteFormData, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof QuoteFormData | undefined
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)

      if (fieldErrors.name) nameInputRef.current?.focus()
      else if (fieldErrors.email) emailInputRef.current?.focus()
      else if (fieldErrors.phone) phoneInputRef.current?.focus()
      else if (fieldErrors.message) messageInputRef.current?.focus()
      return
    }

    setErrors({})
    setIsSubmitting(true)

    const finalMessage =
      result.data.message?.trim() ||
      `Official quotation request (RFQ) and technical specifications for ${product.name} (${product.brand}).`

    try {
      await sendContactEnquiry({
        data: {
          name: result.data.name,
          email: result.data.email,
          company: result.data.company,
          phone: result.data.phone,
          product: `${product.name} (${product.brand})`,
          message: finalMessage,
          type: 'quote',
        },
      })
      setIsSuccess(true)
    } catch (error) {
      const errText =
        error instanceof Error
          ? error.message
          : 'Failed to submit quote request.'
      setErrorMessage(errText)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    if (isSuccess) {
      setIsSuccess(false)
      setIsSubmitted(false)
      setErrors({})
      setName('')
      setEmail('')
      setCompany('')
      setPhone('')
      setMessage('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent initialFocus={nameInputRef} className="max-w-lg p-0">
        <div className="flex items-start justify-between border-b border-border/70 px-6 py-5">
          <div className="pr-4">
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              Request a Quote
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              Our sales engineering team will prepare official pricing and
              technical specifications for this unit.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close quote request"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <X className="size-4" aria-hidden="true" />
          </DialogClose>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-2.5">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="size-12 shrink-0 rounded-lg border border-border/60 bg-white object-contain p-1"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                {product.brand}
              </span>
              <p className="truncate text-xs font-semibold text-foreground">
                {product.name}
              </p>
            </div>
          </div>

          {isSuccess ? (
            <div
              role="status"
              className="my-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center"
            >
              <CheckCircle2
                className="mx-auto size-10 text-emerald-600 dark:text-emerald-400"
                aria-hidden="true"
              />
              <h3 className="mt-3 text-base font-bold text-emerald-950 dark:text-emerald-200">
                Request Submitted Successfully
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                Thank you, <strong>{name}</strong>! Ascentia's sales engineering
                team will prepare an official quotation for{' '}
                <strong>{product.name}</strong> and reach out to{' '}
                <strong>{email}</strong> shortly.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-5 inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-emerald-600 px-6 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="grid gap-3.5">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  <span>
                    Full name <span className="text-destructive">*</span>
                  </span>
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="name"
                    autoComplete="name"
                    disabled={isSubmitting}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (isSubmitted) validateField('name', e.target.value)
                    }}
                    placeholder="e.g. John Doe"
                    className={cn(
                      'h-10 rounded-md border bg-background px-3 text-xs font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                      errors.name
                        ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                  />
                  {errors.name && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-destructive">
                      <AlertCircle
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  <span>
                    Work email <span className="text-destructive">*</span>
                  </span>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (isSubmitted) validateField('email', e.target.value)
                    }}
                    placeholder="name@company.com"
                    className={cn(
                      'h-10 rounded-md border bg-background px-3 text-xs font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                      errors.email
                        ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                  />
                  {errors.email && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-destructive">
                      <AlertCircle
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </label>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  <span>
                    Company / Institution{' '}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <input
                    type="text"
                    name="company"
                    autoComplete="organization"
                    disabled={isSubmitting}
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value)
                      if (isSubmitted) validateField('company', e.target.value)
                    }}
                    placeholder="Company, university, or lab name"
                    className={cn(
                      'h-10 rounded-md border bg-background px-3 text-xs font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                      errors.company
                        ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                  />
                  {errors.company && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-destructive">
                      <AlertCircle
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{errors.company}</span>
                    </p>
                  )}
                </label>
                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  <span>
                    Phone / WhatsApp{' '}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </span>
                  <input
                    ref={phoneInputRef}
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    value={phone}
                    onChange={(e) => {
                      const sanitized = sanitizePhoneInput(e.target.value)
                      setPhone(sanitized)
                      if (isSubmitted) validateField('phone', sanitized)
                    }}
                    placeholder="+62 812-xxxx-xxxx"
                    className={cn(
                      'h-10 rounded-md border bg-background px-3 text-xs font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                      errors.phone
                        ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-destructive">
                      <AlertCircle
                        className="size-3 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{errors.phone}</span>
                    </p>
                  )}
                </label>
              </div>

              <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                <span>
                  Notes / Specifications{' '}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    (optional)
                  </span>
                </span>
                <textarea
                  ref={messageInputRef}
                  rows={3}
                  name="message"
                  disabled={isSubmitting}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (isSubmitted) validateField('message', e.target.value)
                  }}
                  placeholder="e.g. 2 units required, delivery to site, specific configuration..."
                  className={cn(
                    'min-h-20 resize-y rounded-md border bg-background p-3 text-xs leading-relaxed font-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground',
                    errors.message
                      ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                  )}
                />
                {errors.message && (
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-destructive">
                    <AlertCircle
                      className="size-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{errors.message}</span>
                  </p>
                )}
              </label>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {errorMessage}
                </div>
              )}

              <div className="mt-2 flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="min-h-10 cursor-pointer rounded-full px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <CtaButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Request'}
                </CtaButton>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
