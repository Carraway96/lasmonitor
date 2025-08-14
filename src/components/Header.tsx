
export default function Header({ onImport, onExport }: { onImport: ()=>void; onExport: ()=>void }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">📚 Läsutveckling</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={onImport}>Importera</button>
          <button className="btn-primary" onClick={onExport}>Exportera</button>
        </div>
      </div>
    </header>
  )
}
