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
import { EnquirySubmitButton } from '#/components/ui/enquiry-submit-button'
import { sendContactEnquiry } from '#/features/contact/api/contact-api'
import { HoneypotField } from '#/features/contact/components/honeypot-field'
import {
  quoteFormSchema,
  sanitizePhoneInput,
} from '#/features/contact/forms/contact-schema'
import type { QuoteFormData } from '#/features/contact/forms/contact-schema'
import { useIdempotentSubmission } from '#/features/contact/hooks/use-idempotent-submission'
import { useLanguage } from '#/lib/i18n'
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
  const { pick, t } = useLanguage()
  const displayName = pick(
    { id: product.name, en: product.nameEn },
    product.name,
  )

  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const submittingRef = useRef(false)
  const { keyFor, reset } = useIdempotentSubmission()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
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

    if (submittingRef.current) return

    const finalMessage =
      result.data.message?.trim() ||
      `Official quotation request and technical specifications for ${product.name} (${product.brand}).`
    const productLabel = `${product.name} (${product.brand})`
    const submissionId = keyFor({
      name: result.data.name,
      email: result.data.email,
      company: result.data.company,
      phone: result.data.phone,
      product: productLabel,
      message: finalMessage,
      type: 'quote',
    })

    setErrors({})
    submittingRef.current = true
    setIsSubmitting(true)

    try {
      await sendContactEnquiry({
        data: {
          name: result.data.name,
          email: result.data.email,
          company: result.data.company,
          phone: result.data.phone,
          product: productLabel,
          message: finalMessage,
          type: 'quote',
          submission_id: submissionId,
          _hp_field: honeypot || undefined,
        },
      })
      reset()
      setIsSuccess(true)
    } catch (error) {
      const errText =
        error instanceof Error
          ? error.message
          : t('quote.error', 'Failed to submit quote request.')
      setErrorMessage(errText)
    } finally {
      submittingRef.current = false
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
      setHoneypot('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent initialFocus={nameInputRef} className="max-w-lg p-0">
        <div className="flex items-start justify-between border-b border-border/70 px-6 py-4">
          <div className="pr-4">
            <DialogTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              {t('quote.title', 'Request a Quote')}
            </DialogTitle>
            <DialogDescription className="mt-1 text-xs text-muted-foreground">
              {t(
                'quote.subtitle',
                'Our sales engineering team will prepare official pricing and technical specifications for this unit.',
              )}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label={t('quote.closeAria', 'Close quote request')}
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
                alt={displayName}
                className="size-12 shrink-0 rounded-lg border border-border/60 bg-white object-contain p-1"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold tracking-wider text-primary uppercase">
                {product.brand}
              </span>
              <p className="truncate text-xs font-semibold text-foreground">
                {displayName}
              </p>
            </div>
          </div>

          {isSuccess ? (
            <div
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center"
            >
              <CheckCircle2
                className="mx-auto mb-2 size-7 text-emerald-600"
                aria-hidden="true"
              />
              <h3 className="text-sm font-bold text-foreground">
                {t('quote.successTitle', 'Quote Request Sent')}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t(
                  'quote.successMessage',
                  'Thank you for your request. Our team will get back to you shortly.',
                )}
              </p>
              <div className="mt-4 flex justify-center">
                <CtaButton size="compact" onClick={handleClose}>
                  {t('common.done', 'Done')}
                </CtaButton>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="relative grid gap-3.5"
            >
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-semibold text-foreground">
                  <span>
                    {t('quote.name', 'Full Name')}{' '}
                    <span className="text-destructive">*</span>
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
                    placeholder={t('quote.namePlaceholder', 'e.g. John Doe')}
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
                    {t('quote.email', 'Email Address')}{' '}
                    <span className="text-destructive">*</span>
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
                    placeholder={t(
                      'quote.emailPlaceholder',
                      'name@company.com',
                    )}
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
                    {t('quote.company', 'Company / Organization')}{' '}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({t('quote.optional', 'optional')})
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
                    placeholder={t(
                      'quote.companyPlaceholder',
                      'Company, university, or lab name',
                    )}
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
                    {t('quote.phone', 'Phone / WhatsApp Number')}{' '}
                    <span className="text-[11px] font-normal text-muted-foreground">
                      ({t('quote.optional', 'optional')})
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
                    placeholder={t(
                      'quote.phonePlaceholder',
                      '+62 812-xxxx-xxxx',
                    )}
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
                  {t('quote.notesLabel', 'Notes / Specifications')}{' '}
                  <span className="text-[11px] font-normal text-muted-foreground">
                    ({t('quote.optional', 'optional')})
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
                  placeholder={t(
                    'quote.notesPlaceholder',
                    'e.g. 2 units required, delivery to site, specific configuration...',
                  )}
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

              <div className="mt-2 flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="min-h-10 cursor-pointer rounded-full px-4 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {t('common.close', 'Cancel')}
                </button>
                <EnquirySubmitButton
                  label={t('quote.submit', 'Submit Request')}
                  submittingLabel={t('quote.sending', 'Sending...')}
                  isSubmitting={isSubmitting}
                  className="w-full sm:w-auto sm:min-w-44"
                />
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
