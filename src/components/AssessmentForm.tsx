
import { useState } from 'react'
import type { ReadingSession, Scale } from '@/types'

const scales: Scale[] = ['Lexile','LIX','LEX','Custom']

export default function AssessmentForm({ studentName, onSave, onCancel }: {
  studentName: string,
  onSave: (sess: Omit<ReadingSession,'id'>) => void,
  onCancel: ()=>void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [scale, setScale] = useState<Scale>('Lexile')
  const [value, setValue] = useState<number>(0)
  const [comp, setComp] = useState<number | ''>('')
  const [wpm, setWpm] = useState<number | ''>('')
  const [comments, setComments] = useState('')

  return (
    <div className="card">
      <div className="card-header">Ny läsning/bedömning – {studentName}</div>
      <div className="card-body grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Datum</label>
          <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Skala</label>
          <select className="input" value={scale} onChange={e=>setScale(e.target.value as Scale)}>
            {scales.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Värde ({'{'}skala{'}'})</label>
          <input className="input" type="number" value={value} onChange={e=>setValue(Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Läsförståelse (%)</label>
          <input className="input" type="number" min={0} max={100} value={comp} onChange={e=>setComp(e.target.value===''? '' : Number(e.target.value))} />
        </div>
        <div>
          <label className="label">Hastighet (ord/min)</label>
          <input className="input" type="number" value={wpm} onChange={e=>setWpm(e.target.value===''? '' : Number(e.target.value))} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Kommentar</label>
          <textarea className="input" rows={3} value={comments} onChange={e=>setComments(e.target.value)} />
        </div>
        <div className="sm:col-span-2 flex gap-2">
          <button className="btn-primary" onClick={()=> onSave({
            studentId: 'TEMP', // replaced by parent
            date: new Date(date).toISOString(),
            scale,
            value,
            comprehension: comp === '' ? undefined : comp,
            wpm: wpm === '' ? undefined : wpm,
            comments: comments || undefined
          })} disabled={!date || !scale || !Number.isFinite(value)}>Spara</button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  )
}
