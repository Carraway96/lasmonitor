
import { useState } from 'react'
import type { DLSResult, DLSSubtest } from '@/types'

export default function DLSForm({ studentName, onSave, onCancel }: {
  studentName: string,
  onSave: (dls: Omit<DLSResult,'id'>) => void,
  onCancel: ()=>void
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))
  const [rows, setRows] = useState<DLSSubtest[]>([
    { name: 'Läsförståelse' },
    { name: 'Läshastighet' },
    { name: 'Ordförståelse' },
  ])
  const [comments, setComments] = useState('')

  const update = (i: number, key: keyof DLSSubtest, val: any) => {
    setRows(r => r.map((row, idx)=> idx===i ? { ...row, [key]: val } : row))
  }

  const addRow = () => setRows(r => [...r, { name: '' }])

  return (
    <div className="card">
      <div className="card-header">DLS-resultat – {studentName}</div>
      <div className="card-body space-y-3">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Datum</label>
            <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-2">Deltest</th>
                <th className="py-2 pr-2">Råpoäng</th>
                <th className="py-2 pr-2">Stanine</th>
                <th className="py-2 pr-2">Percentil</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="py-1 pr-2"><input className="input" value={row.name} onChange={e=>update(i,'name',e.target.value)} /></td>
                  <td className="py-1 pr-2"><input className="input" type="number" value={row.raw ?? ''} onChange={e=>update(i,'raw', e.target.value===''? undefined : Number(e.target.value))} /></td>
                  <td className="py-1 pr-2"><input className="input" type="number" value={row.stanine ?? ''} onChange={e=>update(i,'stanine', e.target.value===''? undefined : Number(e.target.value))} /></td>
                  <td className="py-1 pr-2"><input className="input" type="number" value={row.percentile ?? ''} onChange={e=>update(i,'percentile', e.target.value===''? undefined : Number(e.target.value))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2">
            <button className="btn-ghost" onClick={addRow}>+ Lägg till deltest</button>
          </div>
        </div>
        <div>
          <label className="label">Kommentar</label>
          <textarea className="input" rows={3} value={comments} onChange={e=>setComments(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={()=> onSave({
            studentId: 'TEMP', // replaced by parent
            date: new Date(date).toISOString(),
            subtests: rows,
            comments: comments || undefined
          })}>Spara</button>
          <button className="btn-ghost" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  )
}
