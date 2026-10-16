import type { ContactInput, ContactSubmissionResult } from '../types/contact'

// Submit enquiry to WordPress REST endpoint
export async function submitContact(
  input: ContactInput,
  signal?: AbortSignal,
): Promise<ContactSubmissionResult> {
  const base =
    process.env.WORDPRESS_URL ||
    (import.meta.env.DEV ? 'http://ascentia-local.local' : '')
  if (!base) throw new Error('WORDPRESS_URL is not configured')
  const origin = new URL(base)
  const url = new URL('/wp-json/ascentia/v1/contact', origin)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(input),
    signal,
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      message?: string
    }
    throw new Error(errorData.message || 'Failed to submit contact enquiry')
  }

  return (await response.json()) as ContactSubmissionResult
}
