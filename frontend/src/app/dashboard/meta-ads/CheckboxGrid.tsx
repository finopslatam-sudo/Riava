'use client'

export type GridItem = { key: string; name: string }

export function CheckboxGrid({
  label,
  items,
  selected,
  onToggle,
  loading,
  emptyHint,
}: {
  label: string
  items: GridItem[]
  selected: string[]
  onToggle: (key: string) => void
  loading: boolean
  emptyHint?: string
}) {
  return (
    <div>
      <label className="text-xs font-mono mb-1.5 block" style={{ color: 'rgba(0,229,255,0.5)' }}>{label}</label>
      {loading ? (
        <p className="text-xs" style={{ color: 'rgba(224,247,255,0.35)' }}>Cargando...</p>
      ) : items.length === 0 ? (
        <p className="text-xs" style={{ color: 'rgba(224,247,255,0.35)' }}>{emptyHint ?? 'Sin opciones disponibles.'}</p>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-lg" style={{ border: '1px solid rgba(0,229,255,0.15)' }}>
          {items.map(item => (
            <label key={item.key} className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: 'rgba(224,247,255,0.7)' }}>
              <input type="checkbox" checked={selected.includes(item.key)} onChange={() => onToggle(item.key)} />
              {item.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
