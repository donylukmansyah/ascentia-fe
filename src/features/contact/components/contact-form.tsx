import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { EnquirySubmitButton } from '#/components/ui/enquiry-submit-button'
import { cn } from '#/lib/utils'
import { useLanguage } from '#/lib/i18n'

import { sendContactEnquiry } from '../api/contact-api'
import { contactFormSchema } from '../forms/contact-schema'
import type { ContactFormData } from '../forms/contact-schema'
import { useIdempotentSubmission } from '../hooks/use-idempotent-submission'
import { HoneypotField } from './honeypot-field'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const { t } = useLanguage()
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)
  const submittingRef = useRef(false)
  const { keyFor, reset } = useIdempotentSubmission()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const validateField = (field: keyof ContactFormData, value: string) => {
    const payload = {
      name,
      email,
      message,
      [field]: value.trim(),
    }
    const res = contactFormSchema.safeParse(payload)
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

    const result = contactFormSchema.safeParse({ name, email, message })
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormData, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ContactFormData | undefined
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)

      if (fieldErrors.name) nameInputRef.current?.focus()
      else if (fieldErrors.email) emailInputRef.current?.focus()
      else if (fieldErrors.message) messageInputRef.current?.focus()
      return
    }

    if (submittingRef.current) return

    const submissionId = keyFor({
      name: result.data.name,
      email: result.data.email,
      message: result.data.message,
      type: 'contact',
    })

    setErrors({})
    submittingRef.current = true
    setIsSubmitting(true)

    try {
      await sendContactEnquiry({
        data: {
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
          type: 'contact',
          submission_id: submissionId,
          _hp_field: honeypot || undefined,
        },
      })
      reset()
      setIsSuccess(true)
      setIsSubmitted(false)
      setName('')
      setEmail('')
      setMessage('')
      setHoneypot('')
    } catch (error) {
      const errText =
        error instanceof Error
          ? error.message
          : t('contact.form.error', 'Unable to send message right now.')
      setErrorMessage(errText)
    } finally {
      submittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <form
      noValidate
      className={cn('relative grid content-start gap-4', className)}
      onSubmit={handleSubmit}
    >
      <HoneypotField value={honeypot} onChange={setHoneypot} />
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        <span>
          {t('contact.form.name', 'Name')}{' '}
          <span className="text-destructive">*</span>
        </span>
        <input
          ref={nameInputRef}
          name="name"
          type="text"
          value={name}
          placeholder={t('contact.form.namePlaceholder', 'Your full name')}
          onChange={(e) => {
            setName(e.target.value)
            if (isSuccess) setIsSuccess(false)
            if (isSubmitted) validateField('name', e.target.value)
          }}
          autoComplete="name"
          disabled={isSubmitting}
          className={cn(
            'h-10 border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:opacity-50',
            errors.name
              ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
          )}
        />
        {errors.name && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium normal-case tracking-normal text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            <span>{errors.name}</span>
          </p>
        )}
      </label>
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        <span>
          {t('contact.form.email', 'Work email')}{' '}
          <span className="text-destructive">*</span>
        </span>
        <input
          ref={emailInputRef}
          name="email"
          type="email"
          value={email}
          placeholder={t('contact.form.emailPlaceholder', 'you@company.com')}
          onChange={(e) => {
            setEmail(e.target.value)
            if (isSuccess) setIsSuccess(false)
            if (isSubmitted) validateField('email', e.target.value)
          }}
          autoComplete="email"
          disabled={isSubmitting}
          className={cn(
            'h-10 border bg-background px-3 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:opacity-50',
            errors.email
              ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
          )}
        />
        {errors.email && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium normal-case tracking-normal text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            <span>{errors.email}</span>
          </p>
        )}
      </label>
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        <span>
          {t('contact.form.message', 'Message')}{' '}
          <span className="text-destructive">*</span>
        </span>
        <textarea
          ref={messageInputRef}
          name="message"
          rows={5}
          value={message}
          placeholder={t(
            'contact.form.messagePlaceholder',
            'Tell us about your sample preparation or analysis requirements...',
          )}
          onChange={(e) => {
            setMessage(e.target.value)
            if (isSuccess) setIsSuccess(false)
            if (isSubmitted) validateField('message', e.target.value)
          }}
          disabled={isSubmitting}
          className={cn(
            'min-h-28 resize-y border bg-background px-3 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:opacity-50',
            errors.message
              ? 'border-destructive ring-1 ring-destructive/20 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
              : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
          )}
        />
        {errors.message && (
          <p className="mt-0.5 flex items-center gap-1 text-[11px] font-medium normal-case tracking-normal text-destructive">
            <AlertCircle className="size-3 shrink-0" aria-hidden="true" />
            <span>{errors.message}</span>
          </p>
        )}
      </label>
      <EnquirySubmitButton
        label={t('contact.form.submit', 'Send enquiry')}
        submittingLabel={t('contact.form.submitting', 'Sending...')}
        isSubmitting={isSubmitting}
        className="w-full"
      />

      {isSuccess ? (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2
            className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            {t(
              'contact.form.success',
              'Thank you! Your enquiry has been received. Our team will review your request and contact you shortly.',
            )}
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm leading-relaxed text-destructive"
        >
          {errorMessage}.{' '}
          {t('contact.form.errorHelp', 'Please email us directly at')}{' '}
          <a
            href="mailto:sales@ascentia.co.id"
            className="cursor-pointer font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            sales@ascentia.co.id
          </a>
          .
        </div>
      ) : null}
    </form>
  )
}
