
import { useState } from 'react'
import type { Grade, Student } from '@/types'

export default function StudentForm({ initial, onSave, onCancel }: {
  initial?: Partial<Student>,
  onSave: (student: Omit<Student,'id'|'createdAt'>) => void,
  onCancel: ()=>void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [grade, setGrade] = useState<Grade>((initial?.grade as Grade) ?? 7)
  const [notes, setNotes] = useState(initial?.notes ?? '')

  return (
    <div className="card">
      <div className="card-header">Ny elev</div>
      <div className="card-body space-y-3">
        <div>
          <label className="label">Namn</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="För- och efternamn" />
        </div>
        <div>
          <label className="label">Årskurs</label>
          <select className="input" value={grade} onChange={e=>setGrade(Number(e.target.value) as Grade)}>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
          </select>
        </div>
        <div>
          <label className="label">Anteckningar (valfritt)</label>
          <textarea className="input" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>

        <div className="flex gap-2">
          <button className="btn-primary" onClick={()=> onSave({ name, grade, notes })} disabled={!name.trim()}>Spara elev</button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  )
}
