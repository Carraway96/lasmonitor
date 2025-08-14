
import { useMemo, useState } from 'react'
import type { AppData, Student } from '@/types'
import AssessmentForm from './AssessmentForm'
import DLSForm from './DLSForm'
import { addSession, addDLS, removeSession, removeDLS, upsertStudent } from '@/store'
import { ReadingLevelChart, NormalizedProgressChart, formatDate } from './Charts'

export default function StudentDetail({ data, setData, student, onBack }: {
  data: AppData,
  setData: (d: AppData)=>void,
  student: Student,
  onBack: ()=>void
}) {
  const [adding, setAdding] = useState<'none'|'reading'|'dls'>('none')
  const sessions = useMemo(()=> data.sessions.filter(s => s.studentId === student.id).sort((a,b)=> a.date.localeCompare(b.date)), [data, student.id])
  const dls = useMemo(()=> data.dls.filter(x => x.studentId === student.id).sort((a,b)=> a.date.localeCompare(b.date)), [data, student.id])

  const recommended = useMemo(()=> {
    // Toy recommendation: if last three comp >= 85 -> +10% level; if <= 60 -> -10%.
    const recent = sessions.slice(-3)
    if (recent.length < 2) return null
    const avgComp = recent.reduce((a,b)=>a+(b.comprehension ?? 0),0) / recent.length
    const last = recent[recent.length-1]
    if (avgComp >= 85) return { scale: last.scale, suggested: Math.round(last.value * 1.1) }
    if (avgComp <= 60) return { scale: last.scale, suggested: Math.round(last.value * 0.9) }
    return null
  }, [sessions])

  const updateName = (name: string) => setData(upsertStudent(data, { ...student, name }))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button className="btn-ghost" onClick={onBack}>← Tillbaka</button>
        <h2 className="text-2xl font-semibold">{student.name} <span className="chip">Åk {student.grade}</span></h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">Nivåer över tid</div>
          <div className="card-body">
            <ReadingLevelChart sessions={sessions} />
            <p className="text-xs text-slate-500 mt-2">Observera: LIX normaliseras separat i indexdiagrammet nedan p.g.a. omvänd riktning (lägre är enklare text).</p>
          </div>
        </div>
        <div className="card">
          <div className="card-header">Normaliserad utveckling (100 = första mätningen)</div>
          <div className="card-body">
            <NormalizedProgressChart sessions={sessions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">Data</div>
        <div className="card-body">
          <div className="flex flex-wrap gap-2 mb-3">
            <button className="btn-primary" onClick={()=>setAdding('reading')}>+ Lägg till läsning</button>
            <button className="btn-ghost" onClick={()=>setAdding('dls')}>+ Lägg till DLS</button>
          </div>

          {adding === 'reading' && (
            <AssessmentForm
              studentName={student.name}
              onCancel={()=>setAdding('none')}
              onSave={(sess)=>{ setAdding('none'); setData(addSession(data, { ...sess, studentId: student.id })) }}
            />
          )}
          {adding === 'dls' && (
            <DLSForm
              studentName={student.name}
              onCancel={()=>setAdding('none')}
              onSave={(dls)=>{ setAdding('none'); setData(addDLS(data, { ...dls, studentId: student.id })) }}
            />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Läsningar</h3>
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s.id} className="border rounded-xl p-3 flex items-center justify-between">
                    <div className="text-sm">
                      <div className="font-medium">{s.scale} {s.value}</div>
                      <div className="text-slate-500">{formatDate(s.date)} • {s.comprehension!=null ? `Förståelse ${s.comprehension}%` : '—'} {s.wpm!=null ? `• ${s.wpm} wpm` : ''}</div>
                      {s.comments && <div className="text-slate-600 mt-1">{s.comments}</div>}
                    </div>
                    <button className="btn-ghost" onClick={()=>setData(removeSession(data, s.id))}>Ta bort</button>
                  </div>
                ))}
                {sessions.length===0 && <div className="text-slate-500 text-sm">Ingen data ännu.</div>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">DLS</h3>
              <div className="space-y-2">
                {dls.map(d => (
                  <div key={d.id} className="border rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-500">{formatDate(d.date)}</div>
                      <button className="btn-ghost" onClick={()=>setData(removeDLS(data, d.id))}>Ta bort</button>
                    </div>
                    <ul className="mt-2 text-sm">
                      {d.subtests.map((s,i)=> (
                        <li key={i}>
                          <span className="font-medium">{s.name}:</span> 
                          {s.stanine!=null ? ` Stanine ${s.stanine}` : ''}
                          {s.percentile!=null ? ` • Percentil ${s.percentile}` : ''}
                          {s.raw!=null ? ` • Rå ${s.raw}` : ''}
                        </li>
                      ))}
                    </ul>
                    {d.comments && <div className="text-slate-600 mt-1">{d.comments}</div>}
                  </div>
                ))}
                {dls.length===0 && <div className="text-slate-500 text-sm">Ingen DLS-data ännu.</div>}
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-slate-50 rounded-xl border">
            <div className="font-medium mb-1">Rekommenderad nivå</div>
            <div className="text-sm text-slate-700">
              {recommended ? (
                <>Baserat på de senaste tillfällena föreslås {recommended.scale} ≈ <span className="font-semibold">{recommended.suggested}</span> (heuristik).</>
              ) : <>Behöver mer data för rekommendation.</>}
            </div>
            <p className="text-xs text-slate-500 mt-1">OBS: Detta är en enkel heuristik som du kan justera senare.</p>
          </div>

          <div className="mt-6">
            <label className="label">Byt namn</label>
            <input className="input max-w-sm" defaultValue={student.name} onBlur={e=>updateName(e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  )
}
