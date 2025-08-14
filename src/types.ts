
export type Grade = 7 | 8 | 9

export interface Student {
  id: string
  name: string
  grade: Grade
  notes?: string
  createdAt: string
}

export type Scale = 'Lexile' | 'LIX' | 'LEX' | 'Custom'

export interface ReadingSession {
  id: string
  studentId: string
  date: string // ISO
  scale: Scale
  value: number // level value for chosen scale
  comprehension?: number // 0-100
  wpm?: number // words per minute
  comments?: string
}

export interface DLSSubtest {
  name: string // e.g., "Läsförståelse"
  raw?: number
  stanine?: number
  percentile?: number
  comments?: string
}

export interface DLSResult {
  id: string
  studentId: string
  date: string // ISO
  subtests: DLSSubtest[]
  comments?: string
}

export interface AppData {
  version: number
  students: Student[]
  sessions: ReadingSession[]
  dls: DLSResult[]
}
