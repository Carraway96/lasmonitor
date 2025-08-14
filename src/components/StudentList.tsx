
import { useMemo, useState } from 'react'
import type { AppData, Grade, Student } from '@/types'
import { addStudent, removeStudent } from '@/store'

export default function StudentList({ data, setData, onOpen }: {
  data: AppData,
  setData: (d: AppData)=>void,
  onOpen: (s: Student)=>void
}) {
  const [adding, setAdding] = useState(false)
  const [query, setQuery] = useState('')
  const [grade, setGrade] = useState<Grade | 'Alla'>('Alla')
  const [name, setName] = useState('')
  const [gNew, setGNew] = useState<Grade>(7)

  const students = useMemo(()=> {
    return data.students
      .filter(s => (grade==='Alla' || s.grade===grade) && s.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a,b)=> a.name.localeCompare(b.name))
  }, [data.students, query, grade])

  const countPerGrade = useMemo(()=> {
    return [7,8,9].map(g => ({ g, n: data.students.filter(s => s.grade === g).length }))
  }, [data.students])

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">Elever</div>
        <div className="card-body space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <input className="input max-w-xs" placeholder="Sök elev..." value={query} onChange={e=>setQuery(e.target.value)} />
            <select className="input w-32" value={grade} onChange={e=>setGrade(e.target.value==='Alla' ? 'Alla' : Number(e.target.value) as Grade)}>
              <option>Alla</option>
              <option value={7}>Åk 7</option>
              <option value={8}>Åk 8</option>
              <option value={9}>Åk 9</option>
            </select>
            <div className="ml-auto flex gap-2">
              <button className="btn-primary" onClick={()=>setAdding(a=>!a)}>{adding ? 'Stäng' : '+ Ny elev'}</button>
            </div>
          </div>

          {adding && (
            <div className="grid sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="label">Namn</label>
                <input className="input" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div>
                <label className="label">Årskurs</label>
                <select className="input" value={gNew} onChange={e=>setGNew(Number(e.target.value) as Grade)}>
                  <option value={7}>7</option>
                  <option value={8}>8</option>
                  <option value={9}>9</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" disabled={!name.trim()} onClick={()=>{
                  setData(addStudent(data, { name: name.trim(), grade: gNew }))
                  setName('')
                  setGNew(7)
                  setAdding(false)
                }}>Spara</button>
                <button className="btn-ghost" onClick={()=>setAdding(false)}>Avbryt</button>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            {students.map(s => (
              <div key={s.id} className="border rounded-xl p-3 flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{s.name}</div>
                  <div className="text-slate-500">Åk {s.grade}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={()=>onOpen(s)}>Öppna</button>
                  <button className="btn-ghost" onClick={()=> setData(removeStudent(data, s.id))}>Ta bort</button>
                </div>
              </div>
            ))}
            {students.length===0 && <div className="text-slate-500 text-sm">Inga elever matchar filtren.</div>}
          </div>

          <div className="text-xs text-slate-500">
            {countPerGrade.map(x => <span key={x.g} className="mr-3">Åk {x.g}: {x.n}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}
