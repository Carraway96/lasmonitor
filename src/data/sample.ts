
import type { AppData } from '@/types'

export const sampleData: AppData = {
  version: 1,
  students: [
    { id: 's1', name: 'Ali', grade: 7, createdAt: new Date().toISOString() },
    { id: 's2', name: 'Bella', grade: 8, createdAt: new Date().toISOString() },
    { id: 's3', name: 'Cesar', grade: 9, createdAt: new Date().toISOString() },
  ],
  sessions: [
    { id: 'rs1', studentId: 's1', date: new Date(Date.now()-1000*60*60*24*60).toISOString(), scale: 'Lexile', value: 600, comprehension: 70, wpm: 120 },
    { id: 'rs2', studentId: 's1', date: new Date(Date.now()-1000*60*60*24*30).toISOString(), scale: 'Lexile', value: 650, comprehension: 75, wpm: 130 },
    { id: 'rs3', studentId: 's1', date: new Date().toISOString(), scale: 'Lexile', value: 700, comprehension: 82, wpm: 140 },

    { id: 'rs4', studentId: 's2', date: new Date(Date.now()-1000*60*60*24*60).toISOString(), scale: 'LIX', value: 45, comprehension: 60, wpm: 110 },
    { id: 'rs5', studentId: 's2', date: new Date(Date.now()-1000*60*60*24*30).toISOString(), scale: 'LIX', value: 42, comprehension: 68, wpm: 120 },
    { id: 'rs6', studentId: 's2', date: new Date().toISOString(), scale: 'LIX', value: 39, comprehension: 78, wpm: 130 },
  ],
  dls: [
    { id: 'd1', studentId: 's1', date: new Date(Date.now()-1000*60*60*24*10).toISOString(), subtests: [
      { name: 'Läsförståelse', stanine: 5 }, { name: 'Läshastighet', stanine: 4 }
    ]},
  ]
}
