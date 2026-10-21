import { z } from 'zod'

export function sanitizePhoneInput(val: string): string {
  return val.replace(/[^\d+\-\s()]/g, '')
}

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Work email is required')
    .email('Invalid email address (e.g. name@company.com)')
    .max(150, 'Email must be at most 150 characters'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
})

export type ContactFormData = z.infer<typeof contactFormSchema>

export const quoteFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Work email is required')
    .email('Invalid email address (e.g. name@company.com)')
    .max(150, 'Email must be at most 150 characters'),
  company: z
    .string()
    .trim()
    .max(150, 'Company name must be at most 150 characters')
    .optional(),
  phone: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || val.replace(/\D/g, '').length >= 8,
      'Phone number must be at least 8 digits',
    )
    .refine(
      (val) => !val || val.replace(/\D/g, '').length <= 16,
      'Phone number must be at most 16 digits',
    ),
  message: z
    .string()
    .trim()
    .max(5000, 'Notes must be at most 5000 characters')
    .optional(),
})

export type QuoteFormData = z.infer<typeof quoteFormSchema>

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  message: z.string().trim().min(1).max(5000),
  type: z.enum(['contact', 'quote']).default('contact'),
  company: z.string().trim().max(150).optional(),
  phone: z.string().trim().max(50).optional(),
  product: z.string().trim().max(255).optional(),
  submission_id: z
    .string()
    .trim()
    .min(8)
    .max(64)
    .regex(/^[A-Za-z0-9_-]+$/)
    .optional(),
  _hp_field: z.string().max(200).optional(),
})
