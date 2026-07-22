'use client'

import { useState, useEffect } from 'react'

export type ChipItem = { id: string; name: string }

export function ChipSearch({
  label,
  placeholder,
  selected,
  onAdd,
  onRemove,
  searchFn,
  minChars = 2,
  debounceMs = 400,
  disabled = false,
  disabledHint,
}: {
  label: string
  placeholder: string
  selected: ChipItem[]
  onAdd: (item: ChipItem) => void
  onRemove: (id: string) => void
  searchFn: (query: string) => Promise<ChipItem[]>
  minChars?: number
  debounceMs?: number
  disabled?: boolean
  disabledHint?: string
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ChipItem[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (query.trim().length < minChars) {
      setResults([])
      return
    }
    setSearching(true)
    const timeout = setTimeout(() => {
      searchFn(query).then(setResults).finally(() => setSearching(false))
    }, debounceMs)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const inputClass = 'w-full px-3 py-2 rounded-lg text-sm bg-transparent border focus:outline-none'
  const inputStyle = { borderColor: 'rgba(0,229,255,0.15)', color: '#e0f7ff' }
  const labelClass = 'text-xs font-mono mb-1.5 block'
  const labelStyle = { color: 'rgba(0,229,255,0.5)' }

  const handleAdd = (item: ChipItem) => {
    if (!selected.some(s => s.id === item.id)) onAdd(item)
    setQuery('')
    setResults([])
  }

  return (
    <div>
      <label className={labelClass} style={labelStyle}>{label}</label>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(i => (
            <span key={i.id} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full"
              style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}>
              {i.name}
              <button type="button" onClick={() => onRemove(i.id)} style={{ color: 'rgba(0,229,255,0.5)' }}>✕</button>
            </span>
          ))}
        </div>
      )}
      <div className="relative">
        <input
          className={inputClass}
          style={inputStyle}
          value={query}
          disabled={disabled}
          onChange={e => setQuery(e.target.value)}
          placeholder={disabled && disabledHint ? disabledHint : placeholder}
        />
        {!disabled && query.trim().length >= minChars && (
          <div className="absolute z-10 w-full mt-1 rounded-lg overflow-hidden max-h-40 overflow-y-auto"
            style={{ background: '#0a0e18', border: '1px solid rgba(0,229,255,0.2)' }}>
            {searching ? (
              <p className="text-xs px-3 py-2" style={{ color: 'rgba(224,247,255,0.35)' }}>Buscando...</p>
            ) : results.length === 0 ? (
              <p className="text-xs px-3 py-2" style={{ color: 'rgba(224,247,255,0.35)' }}>Sin resultados.</p>
            ) : (
              results.map(i => (
                <button type="button" key={i.id} onClick={() => handleAdd(i)}
                  className="w-full text-left text-xs px-3 py-2 hover:bg-white/5" style={{ color: '#e0f7ff' }}>
                  {i.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
