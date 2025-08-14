
import type { AppData, Student, ReadingSession, DLSResult } from './types'

const KEY = 'lasutveckling_app_v1'

function defaultData(): AppData {
  return { version: 1, students: [], sessions: [], dls: [] }
}

export function load(): AppData {
  const raw = localStorage.getItem(KEY)
  if (!raw) return defaultData()
  try {
    const parsed = JSON.parse(raw) as AppData
    if (!parsed.version) return { ...defaultData(), ...parsed }
    return parsed
  } catch {
    return defaultData()
  }
}

export function save(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export function exportData(data: AppData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  const url = URL.createObjectURL(blob)
  a.href = url
  const stamp = new Date().toISOString().slice(0,19).replace(/[:T]/g, '-')
  a.download = `lasutveckling-export-${stamp}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function importDataFromFile(): Promise<AppData | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return resolve(null)
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(String(reader.result)) as AppData
          resolve(parsed)
        } catch {
          alert('Kunde inte läsa filen (ogiltig JSON).')
          resolve(null)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  })
}

export function addStudent(data: AppData, student: Omit<Student, 'id'|'createdAt'>): AppData {
  const s: Student = { ...student, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
  const next = { ...data, students: [...data.students, s] }
  save(next); return next
}
export function removeStudent(data: AppData, studentId: string): AppData {
  const next = { 
    ...data, 
    students: data.students.filter(s => s.id !== studentId),
    sessions: data.sessions.filter(x => x.studentId !== studentId),
    dls: data.dls.filter(x => x.studentId !== studentId),
  }
  save(next); return next
}
export function upsertStudent(data: AppData, student: Student): AppData {
  const exists = data.students.some(s => s.id === student.id)
  const students = exists ? data.students.map(s => s.id === student.id ? student : s) : [...data.students, student]
  const next = { ...data, students }
  save(next); return next
}

export function addSession(data: AppData, sess: Omit<ReadingSession, 'id'>): AppData {
  const s: ReadingSession = { ...sess, id: crypto.randomUUID() }
  const next = { ...data, sessions: [...data.sessions, s] }
  save(next); return next
}
export function removeSession(data: AppData, id: string): AppData {
  const next = { ...data, sessions: data.sessions.filter(s => s.id !== id) }
  save(next); return next
}

export function addDLS(data: AppData, dls: Omit<DLSResult, 'id'>): AppData {
  const d: DLSResult = { ...dls, id: crypto.randomUUID() }
  const next = { ...data, dls: [...data.dls, d] }
  save(next); return next
}
export function removeDLS(data: AppData, id: string): AppData {
  const next = { ...data, dls: data.dls.filter(x => x.id !== id) }
  save(next); return next
}
