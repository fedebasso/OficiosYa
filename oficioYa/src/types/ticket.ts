// src/types/ticket.ts
import type { WorkType } from '../store/requestStore'

export interface TicketInput {
  category: string
  photo: File | null
  audioBlob: Blob | null
  text: string
}

export interface GeneratedTicket {
  title: string
  description: string
  category: string
  urgent: boolean
  work_type: WorkType
}
