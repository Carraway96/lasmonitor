
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import type { ReadingSession } from '@/types'

export function formatDate(d: string) {
  return new Date(d).toLocaleDateString('sv-SE')
}

type ByScale = { [scale: string]: { date: string; value: number }[] }

export function splitByScale(sessions: ReadingSession[]): ByScale {
  return sessions.reduce((acc, s) => {
    acc[s.scale] ??= []
    acc[s.scale].push({ date: s.date, value: s.value })
    return acc
  }, {} as ByScale)
}

function normalizeSeries(series: {date: string, value: number}[], invert=false) {
  if (!series.length) return []
  const base = series[0].value || 1
  return series.map(pt => ({
    date: pt.date,
    index: Math.round(((invert ? (base / (pt.value || 1)) : (pt.value / base)) * 100) * 10) / 10
  }))
}

export function ReadingLevelChart({ sessions }: { sessions: ReadingSession[] }) {
  const data = sessions
    .sort((a,b)=> a.date.localeCompare(b.date))
    .map(s => ({ date: s.date, value: s.value, scale: s.scale }))

  const scales = Array.from(new Set(data.map(d => d.scale)))
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis />
          <Tooltip labelFormatter={(v)=>formatDate(String(v))} />
          <Legend />
          {scales.map((scale, idx) => (
            <Line key={scale} type="monotone" dataKey="value" data={data.filter(d=>d.scale===scale)} name={scale} dot />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function NormalizedProgressChart({ sessions }: { sessions: ReadingSession[] }) {
  const by = splitByScale(sessions.sort((a,b)=>a.date.localeCompare(b.date)))
  const series = Object.entries(by).map(([scale, arr]) => ({
    scale,
    data: normalizeSeries(arr, scale === 'LIX')
  }))

  // Merge series by date for stacked chart-like legend (but we draw multiple lines separately).
  const allDates = Array.from(new Set(series.flatMap(s => s.data.map(p => p.date)))).sort()
  const merged = allDates.map(date => {
    const row: any = { date }
    series.forEach(s => {
      const pt = s.data.find(p => p.date === date)
      row[s.scale] = pt ? pt.index : null
    })
    return row
  })

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tickFormatter={formatDate} />
          <YAxis domain={[0, 'dataMax + 20']} />
          <Tooltip labelFormatter={(v)=>formatDate(String(v))} />
          <Legend />
          {series.map(s => (
            <Line key={s.scale} type="monotone" dataKey={s.scale} name={`${s.scale} (index, 100=bas)`} dot />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
