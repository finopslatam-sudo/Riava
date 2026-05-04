'use client'

import { useState, useCallback, useRef } from 'react'

type Item = {
  id: string
  description: string
  qty: number
  unitPrice: number
}

let itemCounter = 1

function newItem(): Item {
  return { id: `item-${itemCounter++}`, description: '', qty: 1, unitPrice: 0 }
}

function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function quoteNumber() {
  const now = new Date()
  const year = now.getFullYear()
  const seq = String(Math.floor(Math.random() * 900) + 100)
  return `COT-${year}-${seq}`
}

const today = () => new Date().toISOString().split('T')[0]

export default function CotizacionesPage() {
  const [quoteNum] = useState(quoteNumber)
  const [date, setDate] = useState(today)
  const [validDays, setValidDays] = useState(30)

  // Client info
  const [clientName, setClientName] = useState('')
  const [clientCompany, setClientCompany] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  // Items
  const [items, setItems] = useState<Item[]>([newItem()])

  // Discounts & taxes
  const [discountPct, setDiscountPct] = useState(0)
  const [discountAmt, setDiscountAmt] = useState(0)
  const [applyIva, setApplyIva] = useState(false)

  // Notes
  const [notes, setNotes] = useState('')

  const printRef = useRef<HTMLDivElement>(null)

  const addItem = () => setItems(prev => [...prev, newItem()])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof Omit<Item, 'id'>, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const subtotal = items.reduce((acc, i) => acc + i.qty * i.unitPrice, 0)

  const handleDiscountPct = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val))
    setDiscountPct(clamped)
    setDiscountAmt(Math.round(subtotal * clamped / 100))
  }

  const handleDiscountAmt = (val: number) => {
    const clamped = Math.max(0, val)
    setDiscountAmt(clamped)
    setDiscountPct(subtotal > 0 ? Math.min(100, parseFloat(((clamped / subtotal) * 100).toFixed(2))) : 0)
  }

  const discountAmount = discountAmt
  const afterDiscount = subtotal - discountAmount
  const ivaAmount = applyIva ? afterDiscount * 0.19 : 0
  const total = afterDiscount + ivaAmount

  const handlePrint = useCallback(() => {
    window.print()
  }, [])

  const inputCls = `w-full rounded-lg px-3 py-2 text-sm outline-none transition-all`
  const inputStyle = {
    background: 'rgba(0,20,30,0.7)',
    border: '1px solid rgba(0,229,255,0.15)',
    color: '#e0f7ff',
    caretColor: '#00e5ff',
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 12mm 14mm;
        }
        @media print {
          html, body {
            width: 210mm;
            height: auto !important;
            background: #fff !important;
            color: #000 !important;
            font-size: 11px !important;
          }
          /* Hide all layout chrome */
          aside, header, nav { display: none !important; }
          .no-print { display: none !important; }
          /* Main wrapping divs */
          body > div, .flex.min-h-screen, .flex-1.flex.flex-col, .no-print-wrapper { display: block !important; background: transparent !important; padding: 0 !important; margin: 0 !important; }
          /* Print area */
          .print-area {
            box-shadow: none !important;
            border: none !important;
            background: #fff !important;
            color: #000 !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-area * { color: #000 !important; border-color: #ccc !important; background: transparent !important; }
          .print-area .print-section { padding: 6mm 0 !important; border-bottom: 1px solid #ddd !important; }
          .print-area .print-section:last-child { border-bottom: none !important; }
          .print-total-box { background: #f5f5f5 !important; border: 1px solid #ccc !important; }
          /* Prevent page breaks inside items */
          .print-row { page-break-inside: avoid; }
        }
      `}</style>

      <div className="no-print-wrapper p-4 lg:p-8 min-h-full">
        {/* Header */}
        <div className="no-print flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>
              Cotizaciones
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Genera cotizaciones profesionales
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setItems([newItem()])
                setClientName(''); setClientCompany(''); setClientEmail(''); setClientPhone('')
                setDiscountPct(0); setDiscountAmt(0); setApplyIva(false); setNotes('')
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'rgba(0,20,30,0.7)',
                border: '1px solid rgba(0,229,255,0.15)',
                color: 'rgba(224,247,255,0.6)',
              }}
            >
              Nueva cotización
            </button>
            <button
              onClick={handlePrint}
              className="btn-tron px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ color: '#000a0f' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Document */}
        <div
          ref={printRef}
          className="print-area max-w-4xl mx-auto rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(0,10,15,0.85)',
            border: '1px solid rgba(0,229,255,0.15)',
            boxShadow: '0 0 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Document header */}
          <div
            className="p-8 pb-6"
            style={{
              borderBottom: '1px solid rgba(0,229,255,0.1)',
              background: 'linear-gradient(135deg, rgba(0,20,30,0.9) 0%, rgba(0,10,15,0.9) 100%)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
              {/* Logo & company */}
              <div>
                <img
                  src="/logocolor.png"
                  alt="RIAVA System SPA"
                  style={{ height: 44, width: 'auto', display: 'block', marginBottom: 10 }}
                />
                <p className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>RIAVA System SpA</p>
                <p className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>contacto@riava.cl</p>
                <p className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>www.riava.cl</p>
              </div>

              {/* Quote info */}
              <div className="text-right">
                <h2 className="text-3xl font-bold text-tron mb-1">COTIZACIÓN</h2>
                <p className="text-sm font-mono" style={{ color: '#00e5ff' }}>{quoteNum}</p>
                <div className="mt-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>Fecha:</span>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="no-print text-xs px-2 py-1 rounded-md outline-none"
                      style={{ ...inputStyle, width: 130 }}
                    />
                    <span className="hidden print:inline text-xs" style={{ color: '#e0f7ff' }}>{date}</span>
                  </div>
                  <div className="flex items-center gap-3 justify-end">
                    <span className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>Válida por:</span>
                    <div className="no-print flex items-center gap-1">
                      <input
                        type="number"
                        value={validDays}
                        onChange={e => setValidDays(Number(e.target.value))}
                        min={1}
                        className="text-xs px-2 py-1 rounded-md outline-none text-right"
                        style={{ ...inputStyle, width: 60 }}
                      />
                      <span className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>días</span>
                    </div>
                    <span className="text-xs" style={{ color: '#e0f7ff' }}>{validDays} días</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="p-8 pb-6" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Datos del cliente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Nombre</label>
                <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Nombre del cliente" className={`no-print ${inputCls}`} style={inputStyle} />
                <span className="hidden print:block text-sm" style={{ color: '#e0f7ff' }}>{clientName || '—'}</span>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Empresa</label>
                <input value={clientCompany} onChange={e => setClientCompany(e.target.value)} placeholder="Nombre de la empresa" className={`no-print ${inputCls}`} style={inputStyle} />
                <span className="hidden print:block text-sm" style={{ color: '#e0f7ff' }}>{clientCompany || '—'}</span>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Correo electrónico</label>
                <input type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="correo@empresa.cl" className={`no-print ${inputCls}`} style={inputStyle} />
                <span className="hidden print:block text-sm" style={{ color: '#e0f7ff' }}>{clientEmail || '—'}</span>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(0,229,255,0.4)' }}>Teléfono</label>
                <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="+56 9 XXXX XXXX" className={`no-print ${inputCls}`} style={inputStyle} />
                <span className="hidden print:block text-sm" style={{ color: '#e0f7ff' }}>{clientPhone || '—'}</span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="p-8 pb-6" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Ítems
            </h3>

            {/* Table header */}
            <div
              className="grid text-xs font-semibold tracking-wide uppercase mb-2 px-3 py-2 rounded-lg"
              style={{
                gridTemplateColumns: '1fr 80px 130px 130px 40px',
                background: 'rgba(0,229,255,0.06)',
                color: 'rgba(0,229,255,0.6)',
              }}
            >
              <span>Descripción</span>
              <span className="text-center">Cant.</span>
              <span className="text-right">Precio unit.</span>
              <span className="text-right">Subtotal</span>
              <span />
            </div>

            {/* Items */}
            <div className="flex flex-col gap-2">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="grid items-center gap-2 px-3 py-2 rounded-lg"
                  style={{
                    gridTemplateColumns: '1fr 80px 130px 130px 40px',
                    background: idx % 2 === 0 ? 'rgba(0,20,30,0.4)' : 'transparent',
                    border: '1px solid rgba(0,229,255,0.06)',
                  }}
                >
                  {/* Description */}
                  <input
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Descripción del servicio o producto..."
                    className="no-print w-full bg-transparent text-sm outline-none"
                    style={{ color: '#e0f7ff', caretColor: '#00e5ff' }}
                  />
                  <span className="hidden print:block text-sm truncate" style={{ color: '#e0f7ff' }}>{item.description || '—'}</span>

                  {/* Qty */}
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                    className="no-print w-full bg-transparent text-sm outline-none text-center"
                    style={{ color: '#e0f7ff', caretColor: '#00e5ff' }}
                  />
                  <span className="hidden print:block text-sm text-center" style={{ color: '#e0f7ff' }}>{item.qty}</span>

                  {/* Unit price */}
                  <input
                    type="number"
                    min={0}
                    value={item.unitPrice}
                    onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                    className="no-print w-full bg-transparent text-sm outline-none text-right"
                    style={{ color: '#e0f7ff', caretColor: '#00e5ff' }}
                  />
                  <span className="hidden print:block text-sm text-right" style={{ color: '#e0f7ff' }}>{formatCLP(item.unitPrice)}</span>

                  {/* Subtotal */}
                  <span className="text-sm text-right font-medium" style={{ color: '#00e5ff' }}>
                    {formatCLP(item.qty * item.unitPrice)}
                  </span>

                  {/* Delete */}
                  <button
                    className="no-print flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                    style={{ color: 'rgba(240,0,255,0.5)' }}
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    title="Eliminar ítem"
                    onMouseEnter={e => { if (items.length > 1) e.currentTarget.style.color = '#f000ff' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,0,255,0.5)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                  <span className="hidden print:block" />
                </div>
              ))}
            </div>

            {/* Add item button */}
            <button
              onClick={addItem}
              className="no-print mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: 'rgba(0,229,255,0.05)',
                border: '1px dashed rgba(0,229,255,0.25)',
                color: 'rgba(0,229,255,0.7)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.1)'; e.currentTarget.style.color = '#00e5ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.05)'; e.currentTarget.style.color = 'rgba(0,229,255,0.7)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Agregar ítem
            </button>
          </div>

          {/* Discounts, IVA & Totals */}
          <div className="p-8 pb-6" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
            <div className="flex flex-col sm:flex-row gap-8 justify-between">
              {/* Controls */}
              <div className="flex flex-col gap-4 no-print">
                <h3 className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(0,229,255,0.5)' }}>
                  Ajustes
                </h3>
                {/* Discount */}
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'rgba(0,229,255,0.4)' }}>
                    Descuento
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={discountPct}
                      onChange={e => handleDiscountPct(Number(e.target.value))}
                      className={`${inputCls} text-right`}
                      style={{ ...inputStyle, width: 90 }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'rgba(0,229,255,0.6)' }}>%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={discountAmt}
                      onChange={e => handleDiscountAmt(Number(e.target.value))}
                      className={`${inputCls} text-right`}
                      style={{ ...inputStyle, width: 90 }}
                    />
                    <span className="text-sm font-medium" style={{ color: 'rgba(0,229,255,0.6)' }}>CLP</span>
                  </div>
                </div>

                {/* IVA toggle */}
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'rgba(0,229,255,0.4)' }}>
                    IVA (19%)
                  </label>
                  <button
                    onClick={() => setApplyIva(v => !v)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all"
                    style={{
                      background: applyIva ? 'rgba(0,229,255,0.1)' : 'rgba(0,20,30,0.7)',
                      border: `1px solid ${applyIva ? 'rgba(0,229,255,0.4)' : 'rgba(0,229,255,0.15)'}`,
                    }}
                  >
                    <div
                      className="w-10 h-5 rounded-full relative transition-all flex-shrink-0"
                      style={{ background: applyIva ? 'rgba(0,229,255,0.8)' : 'rgba(0,229,255,0.15)' }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
                        style={{
                          background: '#fff',
                          left: applyIva ? 22 : 2,
                          boxShadow: applyIva ? '0 0 6px rgba(0,229,255,0.8)' : 'none',
                        }}
                      />
                    </div>
                    <span className="text-sm" style={{ color: applyIva ? '#00e5ff' : 'rgba(224,247,255,0.5)' }}>
                      {applyIva ? 'Incluido' : 'No incluido'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="min-w-64">
                <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,229,255,0.5)' }}>
                  Resumen
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(224,247,255,0.6)' }}>Subtotal</span>
                    <span style={{ color: '#e0f7ff' }}>{formatCLP(subtotal)}</span>
                  </div>
                  {discountPct > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(240,0,255,0.7)' }}>Descuento ({discountPct}%)</span>
                      <span style={{ color: '#f000ff' }}>− {formatCLP(discountAmount)}</span>
                    </div>
                  )}
                  {applyIva && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(0,229,255,0.6)' }}>IVA (19%)</span>
                      <span style={{ color: '#00e5ff' }}>+ {formatCLP(ivaAmount)}</span>
                    </div>
                  )}
                  <div
                    className="flex justify-between items-center mt-2 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}
                  >
                    <span className="font-bold text-sm" style={{ color: '#00e5ff' }}>TOTAL</span>
                    <span className="font-bold text-xl" style={{ color: '#00e5ff' }}>{formatCLP(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="p-8">
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Notas y condiciones
            </h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Forma de pago, condiciones de entrega, garantías, información adicional..."
              rows={3}
              className="no-print w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all resize-none"
              style={inputStyle}
            />
            {notes && <p className="hidden print:block text-sm" style={{ color: '#000' }}>{notes}</p>}

            {/* Footer */}
            <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-start gap-4" style={{ borderTop: '1px solid rgba(0,229,255,0.08)' }}>
              <div>
                <p className="text-xs" style={{ color: 'rgba(0,229,255,0.35)' }}>
                  Esta cotización es válida por {validDays} días desde su emisión.
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,229,255,0.35)' }}>
                  Los precios expresados están en Pesos Chilenos (CLP).
                </p>
              </div>
              <div className="text-right">
                <div className="w-40 h-px mb-2" style={{ background: 'rgba(0,229,255,0.3)' }} />
                <p className="text-xs" style={{ color: 'rgba(0,229,255,0.5)' }}>Firma y timbre</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>RIAVA System SpA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
