import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import { contactSubmissionSchema } from '../forms/contact-schema'
import type { ContactInput } from '../types/contact'

function validateContactInput(data: unknown): ContactInput {
  const parsed = contactSubmissionSchema.safeParse(data)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    throw new Error(firstIssue.message)
  }
  return {
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
    type: parsed.data.type,
    company: parsed.data.company || undefined,
    phone: parsed.data.phone || undefined,
    product: parsed.data.product || undefined,
    submission_id: parsed.data.submission_id || undefined,
    _hp_field: parsed.data._hp_field || undefined,
  }
}

// Server function for public contact submission
export const sendContactEnquiry = createServerFn({ method: 'POST' })
  .validator(validateContactInput)
  .handler(async ({ data }) => {
    const { submitContact } = await import('./contact-source.server')
    return submitContact(data, getRequest().signal)
  })
