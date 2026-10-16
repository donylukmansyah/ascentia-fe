import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'

import type { ContactInput } from '../types/contact'

function validateContactInput(data: unknown): ContactInput {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid submission payload')
  }
  const { name, email, message } = data as Record<string, unknown>
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('Name is required')
  }
  if (typeof email !== 'string' || !email.trim() || !email.includes('@')) {
    throw new Error('Valid email is required')
  }
  if (typeof message !== 'string' || !message.trim()) {
    throw new Error('Message is required')
  }
  return {
    name: name.trim().slice(0, 100),
    email: email.trim().slice(0, 150),
    message: message.trim().slice(0, 5000),
  }
}

// Server function for public contact submission
export const sendContactEnquiry = createServerFn({ method: 'POST' })
  .validator(validateContactInput)
  .handler(async ({ data }) => {
    const { submitContact } = await import('./contact-source.server')
    return submitContact(data, getRequest().signal)
  })
