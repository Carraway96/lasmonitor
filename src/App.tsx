
import { useEffect, useMemo, useState } from 'react'
import './styles.css'
import type { AppData, Student } from './types'
import { exportData, importDataFromFile, load, save } from './store'
import Header from './components/Header'
import StudentList from './components/StudentList'
import StudentDetail from './components/StudentDetail'
import { sampleData } from './data/sample'

export default function App() {
  const [data, setData] = useState<AppData>(() => {
    const exists = load()
    if (exists.students.length === 0) {
      // Seed with sample only on first run
      save(sampleData)
      return sampleData
    }
    return exists
  })
  const [open, setOpen] = useState<Student | null>(null)

  useEffect(()=> { save(data) }, [data])

  const handleImport = async () => {
    const parsed = await importDataFromFile()
    if (parsed) setData(parsed)
  }

  return (
    <div className="min-h-screen">
      <Header onImport={handleImport} onExport={()=>exportData(data)} />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            {open ? (
              <StudentDetail data={data} setData={setData} student={open} onBack={()=>setOpen(null)} />
            ) : (
              <StudentList data={data} setData={setData} onOpen={setOpen} />
            )}
          </div>
          <aside className="space-y-4">
            <div className="card">
              <div className="card-header">Lagring</div>
              <div className="card-body space-y-2 text-sm">
                <p>Data lagras i din webbläsare (lokalt). Använd <b>Exportera</b> för att spara en säkerhetskopia eller för att lägga filen i din OneDrive.</p>
                <p>Du kan även <b>Importera</b> en tidigare fil (t.ex. från OneDrive) för att ladda tillbaka data.</p>
                <p className="text-xs text-slate-500">Direktkoppling till OneDrive (Microsoft Graph) kan läggas till senare om du vill – kräver en Azure-app. Jag skickar med instruktioner i README.</p>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Vyidéer & funktioner</div>
              <div className="card-body text-sm space-y-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Översiktsvy per klass med färgkodat status (grönt = förbättring, rött = nedgång).</li>
                  <li>Kohortgrafer: median/kvartiler för årskurs 7–9.</li>
                  <li>Alert-regler: flagga om progression stannar eller om förståelse ≤ 50% upprepade gånger.</li>
                  <li>Export till CSV/Excel för skolans uppföljning.</li>
                  <li>Anpassningsbar normalisering mellan skalor (tabeller eller egna brytpunkter).</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
