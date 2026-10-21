import { useRef } from 'react'

import { createSubmissionId } from '../lib/submission-id'

export function useIdempotentSubmission() {
  const submissionId = useRef<string | null>(null)
  const fingerprint = useRef<string | null>(null)

  const keyFor = (payload: unknown) => {
    const nextFingerprint = JSON.stringify(payload)
    if (!submissionId.current || fingerprint.current !== nextFingerprint) {
      submissionId.current = createSubmissionId()
      fingerprint.current = nextFingerprint
    }
    return submissionId.current
  }

  const reset = () => {
    submissionId.current = null
    fingerprint.current = null
  }

  return { keyFor, reset }
}
