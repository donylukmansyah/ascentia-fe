export interface ContactInput {
  name: string
  email: string
  message: string
}

export interface ContactSubmissionResult {
  success: boolean
  message: string
  id?: number
}
