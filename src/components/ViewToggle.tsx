import { Grip, Rows3 } from 'lucide-react'

type ViewMode = 'list' | 'tier'

type ViewToggleProps = {
  view: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  const base = 'flex items-center gap-2 rounded-none px-4 py-2.5 text-sm font-semibold transition'

  return (
    <div className="inline-flex bg-[rgb(var(--theme-panel-strong)/0.42)] p-1 shadow-[0_12px_28px_rgba(0,0,0,0.2)]">
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`${base} ${view === 'list' ? 'bg-frost text-obsidian shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'text-ice hover:text-frost'}`}
      >
        <Grip size={16} /> List
      </button>
      <button
        type="button"
        onClick={() => onChange('tier')}
        className={`${base} ${view === 'tier' ? 'bg-frost text-obsidian shadow-[0_0_18px_rgba(255,255,255,0.12)]' : 'text-ice hover:text-frost'}`}
      >
        <Rows3 size={16} /> Tier
      </button>
    </div>
  )
}
