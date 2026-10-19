import { AlertCircle, ArrowUpRight, CheckCircle2, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { cn } from '#/lib/utils'

import { sendContactEnquiry } from '../api/contact-api'
import { contactFormSchema } from '../forms/contact-schema'
import type { ContactFormData } from '../forms/contact-schema'

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null)
  const emailInputRef = useRef<HTMLInputElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
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

    setErrors({})
    setIsSubmitting(true)

    try {
      await sendContactEnquiry({
        data: {
          name: result.data.name,
          email: result.data.email,
          message: result.data.message,
          type: 'contact',
        },
      })
      setIsSuccess(true)
      setIsSubmitted(false)
      setName('')
      setEmail('')
      setMessage('')
    } catch (error) {
      const errText =
        error instanceof Error
          ? error.message
          : 'Unable to send message right now.'
      setErrorMessage(errText)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      noValidate
      className={cn('grid content-start gap-4', className)}
      onSubmit={handleSubmit}
    >
      <label className="grid gap-1.5 text-[10px] font-bold tracking-[0.08em] text-foreground/75 uppercase">
        <span>
          Name <span className="text-destructive">*</span>
        </span>
        <input
          ref={nameInputRef}
          name="name"
          type="text"
          value={name}
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
          Work email <span className="text-destructive">*</span>
        </span>
        <input
          ref={emailInputRef}
          name="email"
          type="email"
          value={email}
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
          Message <span className="text-destructive">*</span>
        </span>
        <textarea
          ref={messageInputRef}
          name="message"
          rows={5}
          value={message}
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="group/cta relative inline-flex min-h-11 w-full cursor-pointer items-center justify-center overflow-hidden rounded-full bg-accent px-4 text-[13px] font-medium text-white transition-[background-color,color,translate] duration-200 ease hover:-translate-y-0.5 hover:bg-[var(--brand-dark)] hover:text-white focus-visible:bg-[var(--brand-dark)] focus-visible:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-70 motion-reduce:transition-none"
      >
        <span className="relative z-10 pr-9 transition-[color,translate] duration-300 ease-out group-hover/cta:translate-x-9 group-focus-visible/cta:translate-x-9 motion-reduce:transition-none">
          {isSubmitting ? 'Sending enquiry...' : 'Send enquiry'}
        </span>
        <span className="absolute left-full top-1/2 z-0 grid size-9 -translate-x-[115%] -translate-y-1/2 place-items-center rounded-full bg-white text-foreground transition-[left,translate] duration-400 ease-out group-hover/cta:left-0 group-hover/cta:translate-x-[15%] group-focus-visible/cta:left-0 group-focus-visible/cta:translate-x-[15%] motion-reduce:transition-none">
          {isSubmitting ? (
            <Loader2
              className="size-4 animate-spin text-accent"
              aria-hidden="true"
            />
          ) : (
            <ArrowUpRight
              className="size-4 transition-transform duration-300 ease-out group-hover/cta:rotate-45 group-focus-visible/cta:rotate-45 motion-reduce:transition-none"
              aria-hidden="true"
            />
          )}
        </span>
      </button>

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
            Thank you! Your enquiry has been received. Our team will review your
            request and contact you shortly.
          </p>
        </div>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm leading-relaxed text-destructive"
        >
          {errorMessage}. Please email us directly at{' '}
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
