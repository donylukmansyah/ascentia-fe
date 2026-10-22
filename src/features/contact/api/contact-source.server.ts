import type { ContactInput, ContactSubmissionResult } from '../types/contact'

const DEFAULT_CONTACT_TIMEOUT_MS = 30_000
const MIN_CONTACT_TIMEOUT_MS = 5_000
const MAX_CONTACT_TIMEOUT_MS = 120_000

function resolveContactTimeoutMs(): number {
  const configured = Number(process.env.CONTACT_TIMEOUT_MS)
  if (!Number.isFinite(configured) || configured <= 0) {
    return DEFAULT_CONTACT_TIMEOUT_MS
  }
  return Math.min(
    MAX_CONTACT_TIMEOUT_MS,
    Math.max(MIN_CONTACT_TIMEOUT_MS, configured),
  )
}

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
  const timeoutSignal = AbortSignal.timeout(resolveContactTimeoutMs())
  const requestSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(input),
      signal: requestSignal,
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string
      }
      throw new Error(errorData.message || 'Failed to submit contact enquiry')
    }

    const result: unknown = await response.json()
    if (
      !result ||
      typeof result !== 'object' ||
      !('success' in result) ||
      result.success !== true ||
      !('message' in result) ||
      typeof result.message !== 'string' ||
      !result.message.trim() ||
      ('id' in result &&
        (!Number.isSafeInteger(result.id) || Number(result.id) <= 0))
    ) {
      throw new Error(
        'Contact service returned an invalid confirmation. Please try again',
      )
    }
    return result as ContactSubmissionResult
  } catch (error) {
    if (timeoutSignal.aborted && !signal?.aborted) {
      throw new Error('Contact service timed out. Please try again')
    }
    throw error
  }
}
