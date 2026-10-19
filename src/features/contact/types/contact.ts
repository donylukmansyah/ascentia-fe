export type InquiryType = 'contact' | 'quote'

export interface ContactInput {
  name: string
  email: string
  message: string
  type?: InquiryType
  company?: string
  phone?: string
  product?: string
}

export interface ContactSubmissionResult {
  success: boolean
  message: string
  id?: number
}
