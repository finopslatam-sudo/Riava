'use client'

import { useState, useCallback, useRef } from 'react'

type Item = {
  id: string
  description: string
  qty: number
  unitPrice: number
}

type Template = {
  id: string
  name: string
  items: Item[]
  discountPct: number
  discountAmt: number
  applyIva: boolean
  notes: string
  validDays: number
}

let itemCounter = 1

function newItem(): Item {
  return { id: `item-${itemCounter++}`, description: '', qty: 1, unitPrice: 0 }
}

function formatCLP(n: number) {
  return n.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
}

function nextQuoteNumber() {
  const year = new Date().getFullYear()
  const stored = localStorage.getItem('riava_quote_counter')
  const parsed = stored ? JSON.parse(stored) : { year, seq: 0 }
  const seq = parsed.year === year ? parsed.seq + 1 : 1
  localStorage.setItem('riava_quote_counter', JSON.stringify({ year, seq }))
  return `COT-${year}-${String(seq).padStart(4, '0')}`
}

const today = () => new Date().toISOString().split('T')[0]

export default function CotizacionesPage() {
  const [quoteNum, setQuoteNum] = useState(nextQuoteNumber)
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

  // Templates modal
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [savedTemplates, setSavedTemplates] = useState<Template[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('riava_quote_templates') || '[]') } catch { return [] }
  })

  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [attachAlcances, setAttachAlcances] = useState(false)
  const [attachTerminos, setAttachTerminos] = useState(true)

  // Use-templates modal + template editing
  const [showUseTemplatesModal, setShowUseTemplatesModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)
  const [editTplName, setEditTplName] = useState('')
  const [editTplItems, setEditTplItems] = useState<Item[]>([])
  const [editTplDiscountPct, setEditTplDiscountPct] = useState(0)
  const [editTplApplyIva, setEditTplApplyIva] = useState(false)
  const [editTplNotes, setEditTplNotes] = useState('')
  const [editTplValidDays, setEditTplValidDays] = useState(30)

  const printRef = useRef<HTMLDivElement>(null)

  const addItem = () => setItems(prev => [...prev, newItem()])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))
  const updateItem = (id: string, field: keyof Omit<Item, 'id'>, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }

  const dragIndex = useRef<number>(-1)
  const handleDragStart = (idx: number) => { dragIndex.current = idx }
  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault()
    if (dragIndex.current === -1 || dragIndex.current === idx) return
    setItems(prev => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex.current, 1)
      next.splice(idx, 0, moved)
      dragIndex.current = idx
      return next
    })
  }
  const handleDragEnd = () => { dragIndex.current = -1 }

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
    const clientLabel = clientName.trim() || clientCompany.trim() || 'Cliente'
    const prevTitle = document.title
    document.title = `${quoteNum} - ${clientLabel}`
    window.print()
    document.title = prevTitle
  }, [quoteNum, clientName, clientCompany])

  // --- Templates ---
  const saveTemplate = () => {
    if (!templateName.trim()) return
    const t: Template = {
      id: Date.now().toString(),
      name: templateName.trim(),
      items,
      discountPct,
      discountAmt,
      applyIva,
      notes,
      validDays,
    }
    const updated = [...savedTemplates, t]
    setSavedTemplates(updated)
    localStorage.setItem('riava_quote_templates', JSON.stringify(updated))
    setTemplateName('')
    setShowTemplateModal(false)
  }

  const loadTemplate = (t: Template) => {
    setItems(t.items.map(i => ({ ...i, id: `item-${itemCounter++}` })))
    setDiscountPct(t.discountPct)
    setDiscountAmt(t.discountAmt)
    setApplyIva(t.applyIva)
    setNotes(t.notes)
    setValidDays(t.validDays)
    setShowTemplateModal(false)
  }

  const deleteTemplate = (id: string) => {
    const updated = savedTemplates.filter(t => t.id !== id)
    setSavedTemplates(updated)
    localStorage.setItem('riava_quote_templates', JSON.stringify(updated))
  }

  // --- Email ---
  const openEmailModal = () => {
    setEmailTo(clientEmail)
    setEmailSubject(`Cotización ${quoteNum} - RIAVA System SpA`)
    const greeting = clientName ? `Estimado/a ${clientName},` : 'Estimado/a,'
    const bodyLines = [
      greeting,
      '',
      'Junto con saludar, le hago envío de la cotización solicitada, la cual encontrará adjunta a este correo para su revisión. Asimismo, se adjunta un documento con los alcances técnicos del proyecto para su referencia.',
      '',
      'Quedo atento a sus comentarios, dudas o a la posibilidad de revisarla en conjunto si lo estima conveniente.',
      '',
      'Espero que esta propuesta sea de su interés y que podamos avanzar en trabajar juntos próximamente.',
      '',
      'Agradezco desde ya su tiempo y consideración.',
      '',
      'Saludos cordiales,',
      'RIAVA System SpA',
      'contacto@riava.cl | www.riava.cl',
    ]
    setEmailBody(bodyLines.join('\n'))
    setShowEmailModal(true)
  }

  const sendEmail = async () => {
    setEmailSending(true)
    setEmailStatus('idle')
    try {
      const res = await fetch('/api/cotizacion/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailTo,
          subject: emailSubject,
          body: emailBody,
          attachAlcances,
          attachTerminos,
          quoteData: {
            quoteNum, date, clientName, clientCompany, clientEmail, clientPhone,
            items, subtotal, discountAmount, discountPct,
            afterDiscount,
            ivaAmount: afterDiscount * 0.19,
            total: afterDiscount * 1.19,
            notes, validDays,
          },
        }),
      })
      if (res.ok) {
        setEmailStatus('success')
        setTimeout(() => { setShowEmailModal(false); setEmailStatus('idle'); setAttachAlcances(false) }, 2500)
      } else {
        setEmailStatus('error')
      }
    } catch {
      setEmailStatus('error')
    } finally {
      setEmailSending(false)
    }
  }

  // ── Template editing helpers ──
  const addEditItem = () => setEditTplItems(prev => [...prev, newItem()])
  const removeEditItem = (id: string) => setEditTplItems(prev => prev.filter(i => i.id !== id))
  const updateEditItem = (id: string, field: keyof Omit<Item, 'id'>, value: string | number) =>
    setEditTplItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))

  const startEditTemplate = (t: Template) => {
    setEditingTemplate(t)
    setEditTplName(t.name)
    setEditTplItems(t.items.map(i => ({ ...i, id: `item-${itemCounter++}` })))
    setEditTplDiscountPct(t.discountPct)
    setEditTplApplyIva(t.applyIva)
    setEditTplNotes(t.notes)
    setEditTplValidDays(t.validDays)
  }

  const saveEditedTemplate = () => {
    if (!editingTemplate) return
    const tplSubtotal = editTplItems.reduce((a, i) => a + i.qty * i.unitPrice, 0)
    const updated = savedTemplates.map(t =>
      t.id === editingTemplate.id
        ? {
          ...t,
          name: editTplName.trim() || t.name,
          items: editTplItems,
          discountPct: editTplDiscountPct,
          discountAmt: Math.round(tplSubtotal * editTplDiscountPct / 100),
          applyIva: editTplApplyIva,
          notes: editTplNotes,
          validDays: editTplValidDays,
        }
        : t
    )
    setSavedTemplates(updated)
    localStorage.setItem('riava_quote_templates', JSON.stringify(updated))
    setEditingTemplate(null)
  }

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
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @page {
          size: A4 portrait;
          margin: 8mm 6mm;
        }
        @media print {
          html, body {
            width: 100% !important;
            height: auto !important;
            background: #fff !important;
            color: #000 !important;
            font-size: 10px !important;
            padding: 0 !important;
            margin: 0 !important;
            box-sizing: border-box !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
          /* Description: single line, no clip */
          .print-desc { white-space: nowrap !important; overflow: visible !important; display: block !important; }
          /* Fix grid columns in print (drag handle + delete col hidden) */
          .items-grid { grid-template-columns: 1fr 50px 130px 130px !important; }
          .print-area .print-section { padding: 6mm 0 !important; border-bottom: 1px solid #ddd !important; }
          .print-area .print-section:last-child { border-bottom: none !important; }
          .print-total-box { background: #f5f5f5 !important; border: 1px solid #ccc !important; }
          /* Prevent page breaks inside items */
          .print-row { page-break-inside: avoid; }
          /* Push totals to the right */
          .print-totals-right { margin-left: auto !important; }
          /* Stamp & signature in print */
          .stamp-seal circle { stroke: #0a2030 !important; fill: none !important; }
          .stamp-seal line { stroke: #0a2030 !important; }
          .stamp-seal text { fill: #0a2030 !important; }
          .stamp-seal { opacity: 1 !important; }
        }
      `}</style>

      <div className="no-print-wrapper p-4 lg:p-8 min-h-full">
        {/* Header */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>
              Cotizaciones
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Genera cotizaciones profesionales
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setQuoteNum(nextQuoteNumber())
                setDate(today())
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
              onClick={() => { setEditingTemplate(null); setShowUseTemplatesModal(true) }}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              style={{
                background: 'rgba(124,58,237,0.06)',
                border: '1px solid rgba(124,58,237,0.2)',
                color: 'rgba(167,139,250,0.85)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; e.currentTarget.style.color = '#a78bfa' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; e.currentTarget.style.color = 'rgba(167,139,250,0.85)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Usar plantillas
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              style={{
                background: 'rgba(240,0,255,0.06)',
                border: '1px solid rgba(240,0,255,0.2)',
                color: 'rgba(240,0,255,0.8)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(240,0,255,0.12)'; e.currentTarget.style.color = '#f000ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(240,0,255,0.06)'; e.currentTarget.style.color = 'rgba(240,0,255,0.8)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Guardar plantilla
            </button>
            <button
              onClick={openEmailModal}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              style={{
                background: 'rgba(0,229,255,0.06)',
                border: '1px solid rgba(0,229,255,0.2)',
                color: 'rgba(0,229,255,0.8)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.12)'; e.currentTarget.style.color = '#00e5ff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.06)'; e.currentTarget.style.color = 'rgba(0,229,255,0.8)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              Enviar por correo
            </button>
            <button
              onClick={handlePrint}
              className="btn-tron px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
              style={{ color: '#000a0f' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Table — scrollable on mobile */}
            <div className="overflow-x-auto -mx-2 px-2">
              <div style={{ minWidth: 480 }}>

                {/* Table header */}
                <div
                  className="items-grid grid text-xs font-semibold tracking-wide uppercase mb-2 px-3 py-2 rounded-lg"
                  style={{
                    gridTemplateColumns: '24px 1fr 80px 130px 130px 40px',
                    background: 'rgba(0,229,255,0.06)',
                    color: 'rgba(0,229,255,0.6)',
                  }}
                >
                  <span className="no-print" />
                  <span>Descripción</span>
                  <span className="text-center">Cant.</span>
                  <span className="text-right">Precio unit.</span>
                  <span className="text-right">Subtotal</span>
                  <span className="no-print" />
                </div>

                {/* Items */}
                <div className="flex flex-col gap-2">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDragEnd={handleDragEnd}
                      className="items-grid grid items-center gap-2 px-3 py-2 rounded-lg"
                      style={{
                        gridTemplateColumns: '24px 1fr 80px 130px 130px 40px',
                        background: idx % 2 === 0 ? 'rgba(0,20,30,0.4)' : 'transparent',
                        border: '1px solid rgba(0,229,255,0.06)',
                        cursor: 'default',
                      }}
                    >
                      {/* Drag handle */}
                      <div
                        className="no-print flex items-center justify-center"
                        style={{ cursor: 'grab', color: 'rgba(0,229,255,0.25)', flexShrink: 0 }}
                        title="Arrastrar para reordenar"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                          <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                        </svg>
                      </div>

                      {/* Description */}
                      <input
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Descripción del servicio o producto..."
                        className="no-print w-full bg-transparent text-sm outline-none"
                        style={{ color: '#e0f7ff', caretColor: '#00e5ff' }}
                      />
                      <span className="hidden print:block print-desc text-sm" style={{ color: '#e0f7ff' }}>{item.description || '—'}</span>

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
                      <span className="no-print" />
                    </div>
                  ))}
                </div>

              </div>{/* /minWidth */}
            </div>{/* /overflow-x-auto */}

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
                      className="w-10 h-5 rounded-full relative transition-all shrink-0"
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
              <div className="w-full sm:min-w-64 sm:w-auto print-totals-right">
                <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'rgba(0,229,255,0.5)' }}>
                  Resumen
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'rgba(224,247,255,0.6)' }}>Subtotal</span>
                    <span style={{ color: '#e0f7ff' }}>{formatCLP(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'rgba(240,0,255,0.7)' }}>Descuento ({discountPct}%)</span>
                      <span style={{ color: '#f000ff' }}>− {formatCLP(discountAmount)}</span>
                    </div>
                  )}

                  {/* Separador */}
                  <div style={{ height: 1, background: 'rgba(0,229,255,0.08)', margin: '4px 0' }} />

                  {/* Total sin IVA */}
                  <div
                    className="flex justify-between items-center px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(0,20,30,0.6)', border: '1px solid rgba(0,229,255,0.1)' }}
                  >
                    <div>
                      <p className="font-semibold text-xs" style={{ color: 'rgba(224,247,255,0.5)' }}>TOTAL SIN IVA</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.35)' }}>Neto</p>
                    </div>
                    <span className="font-bold text-lg" style={{ color: '#e0f7ff' }}>{formatCLP(afterDiscount)}</span>
                  </div>

                  {/* IVA line */}
                  <div className="flex justify-between text-sm px-1">
                    <span style={{ color: 'rgba(0,229,255,0.5)' }}>IVA (19%)</span>
                    <span style={{ color: 'rgba(0,229,255,0.7)' }}>+ {formatCLP(afterDiscount * 0.19)}</span>
                  </div>

                  {/* Total con IVA */}
                  <div
                    className="flex justify-between items-center px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)' }}
                  >
                    <div>
                      <p className="font-bold text-sm" style={{ color: '#00e5ff' }}>TOTAL CON IVA</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.4)' }}>Incluye 19%</p>
                    </div>
                    <span className="font-bold text-xl" style={{ color: '#00e5ff' }}>{formatCLP(afterDiscount * 1.19)}</span>
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
            <div className="mt-8 pt-6 flex flex-col sm:flex-row justify-between items-end gap-6" style={{ borderTop: '1px solid rgba(0,229,255,0.08)' }}>
              {/* Disclaimer */}
              <div>
                <p className="text-xs" style={{ color: 'rgba(0,229,255,0.35)' }}>
                  Esta cotización es válida por {validDays} días desde su emisión.
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,229,255,0.35)' }}>
                  Los precios expresados están en Pesos Chilenos (CLP).
                </p>
                <p className="text-xs mt-1" style={{ color: 'rgba(0,229,255,0.2)' }}>
                  Documento generado por RIAVA System SpA.
                </p>
              </div>

              {/* Timbre */}
              <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0 }}>

                {/* Timbre (Sello) */}
                <svg
                  viewBox="0 0 140 140"
                  style={{ width: 100, height: 100, flexShrink: 0, transform: 'rotate(-8deg)', marginBottom: 10 }}
                  className="stamp-seal"
                >
                  <defs>
                    <path id="topArcSeal" d="M 14,70 A 56,56 0 0,1 126,70" />
                  </defs>

                  {/* Rings */}
                  <circle cx="70" cy="70" r="66" fill="none" stroke="rgba(0,229,255,0.75)" strokeWidth="2.5" />
                  <circle cx="70" cy="70" r="59" fill="none" stroke="rgba(0,229,255,0.35)" strokeWidth="0.7" strokeDasharray="2.5,2.5" />
                  <circle cx="70" cy="70" r="56" fill="none" stroke="rgba(0,229,255,0.75)" strokeWidth="1.5" />

                  {/* Top arc text */}
                  <text fontSize="8.5" fontWeight="700" letterSpacing="2.5" fill="rgba(0,229,255,0.9)">
                    <textPath href="#topArcSeal" startOffset="50%" textAnchor="middle">
                      RIAVA SYSTEM SpA
                    </textPath>
                  </text>

                  {/* Center decorators */}
                  <text x="70" y="52" textAnchor="middle" fontSize="8" fill="rgba(0,229,255,0.55)" letterSpacing="5">✦✦✦</text>

                  {/* RIAVA */}
                  <text x="70" y="71" textAnchor="middle" fontSize="19" fontWeight="900" fill="rgba(0,229,255,0.9)" letterSpacing="2">RIAVA</text>

                  {/* Separator */}
                  <line x1="47" y1="77" x2="93" y2="77" stroke="rgba(0,229,255,0.4)" strokeWidth="0.8" />

                  {/* System SpA */}
                  <text x="70" y="87" textAnchor="middle" fontSize="6.5" fontWeight="600" fill="rgba(0,229,255,0.7)" letterSpacing="2">SYSTEM SpA</text>

                  {/* Bottom decorators */}
                  <text x="70" y="100" textAnchor="middle" fontSize="8" fill="rgba(0,229,255,0.4)" letterSpacing="5">✦✦✦</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Template Modal ── */}
      {showTemplateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowTemplateModal(false) }}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0,10,18,0.98)',
              border: '1px solid rgba(240,0,255,0.2)',
              boxShadow: '0 0 60px rgba(240,0,255,0.15)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(240,0,255,0.12)' }}>
              <h2 className="text-base font-semibold" style={{ color: '#f000ff' }}>Plantillas de cotización</h2>
              <button onClick={() => setShowTemplateModal(false)} style={{ color: 'rgba(224,247,255,0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Save current as template */}
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'rgba(240,0,255,0.5)' }}>Guardar cotización actual como plantilla</p>
                <div className="flex gap-2">
                  <input
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveTemplate() }}
                    placeholder="Nombre de la plantilla..."
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(240,0,255,0.2)', color: '#e0f7ff', caretColor: '#f000ff' }}
                  />
                  <button
                    onClick={saveTemplate}
                    disabled={!templateName.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: templateName.trim() ? 'rgba(240,0,255,0.15)' : 'rgba(240,0,255,0.04)',
                      border: '1px solid rgba(240,0,255,0.3)',
                      color: templateName.trim() ? '#f000ff' : 'rgba(240,0,255,0.3)',
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>

              <p className="text-xs mt-1" style={{ color: 'rgba(224,247,255,0.3)' }}>
                Guarda los ítems, descuentos y notas actuales para reutilizarlos luego desde <strong style={{ color: 'rgba(167,139,250,0.7)' }}>Usar plantillas</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Usar Plantillas Modal ── */}
      {showUseTemplatesModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={e => { if (e.target === e.currentTarget) { setShowUseTemplatesModal(false); setEditingTemplate(null) } }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0,8,16,0.98)',
              border: '1px solid rgba(124,58,237,0.25)',
              boxShadow: '0 0 60px rgba(124,58,237,0.15)',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
              <div className="flex items-center gap-3">
                {editingTemplate && (
                  <button
                    onClick={() => setEditingTemplate(null)}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all"
                    style={{ color: 'rgba(167,139,250,0.6)', border: '1px solid rgba(124,58,237,0.2)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#a78bfa' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(167,139,250,0.6)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    Volver
                  </button>
                )}
                <h2 className="text-base font-semibold" style={{ color: '#a78bfa' }}>
                  {editingTemplate ? `Editar: ${editingTemplate.name}` : 'Mis plantillas'}
                </h2>
              </div>
              <button onClick={() => { setShowUseTemplatesModal(false); setEditingTemplate(null) }} style={{ color: 'rgba(224,247,255,0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* ── LIST VIEW ── */}
              {!editingTemplate && (
                <div className="p-6 flex flex-col gap-3">
                  {savedTemplates.length === 0 && (
                    <div className="text-center py-12">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(124,58,237,0.3)" strokeWidth="1.5" className="mx-auto mb-3">
                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      </svg>
                      <p className="text-sm" style={{ color: 'rgba(224,247,255,0.25)' }}>Aún no tienes plantillas guardadas</p>
                      <p className="text-xs mt-1" style={{ color: 'rgba(224,247,255,0.15)' }}>Crea una desde el botón Guardar plantilla</p>
                    </div>
                  )}
                  {savedTemplates.map(t => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'rgba(0,20,30,0.6)', border: '1px solid rgba(124,58,237,0.12)' }}
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="text-sm font-semibold truncate" style={{ color: '#e0f7ff' }}>{t.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(167,139,250,0.5)' }}>
                          {t.items.filter(i => i.description).length} ítem{t.items.filter(i => i.description).length !== 1 ? 's' : ''}
                          {' · '}IVA {t.applyIva ? 'incluido' : 'no incluido'}
                          {t.discountPct > 0 ? ` · ${t.discountPct}% descuento` : ''}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => { loadTemplate(t); setShowUseTemplatesModal(false) }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', color: '#00e5ff' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.14)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,229,255,0.08)' }}
                        >
                          Cargar
                        </button>
                        <button
                          onClick={() => startEditTemplate(t)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: '#a78bfa' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.08)' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="px-2 py-1.5 rounded-lg text-xs transition-all"
                          style={{ color: 'rgba(240,0,255,0.5)', border: '1px solid rgba(240,0,255,0.1)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#f000ff'; e.currentTarget.style.background = 'rgba(240,0,255,0.08)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(240,0,255,0.5)'; e.currentTarget.style.background = 'transparent' }}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── EDIT VIEW ── */}
              {editingTemplate && (
                <div className="p-6 flex flex-col gap-5">
                  {/* Template name */}
                  <div>
                    <label className="text-xs mb-1.5 block font-semibold tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.6)' }}>Nombre de la plantilla</label>
                    <input
                      value={editTplName}
                      onChange={e => setEditTplName(e.target.value)}
                      placeholder="Nombre de la plantilla..."
                      className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(124,58,237,0.25)', color: '#e0f7ff', caretColor: '#a78bfa' }}
                    />
                  </div>

                  {/* Items */}
                  <div>
                    <label className="text-xs mb-2 block font-semibold tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.6)' }}>Ítems</label>
                    {/* Table — scrollable on mobile */}
                    <div className="overflow-x-auto -mx-1 px-1">
                      <div style={{ minWidth: 320 }}>
                        {/* Table header */}
                        <div
                          className="grid text-xs font-semibold tracking-wide uppercase mb-1.5 px-3 py-2 rounded-lg"
                          style={{ gridTemplateColumns: '1fr 64px 110px 36px', background: 'rgba(124,58,237,0.08)', color: 'rgba(167,139,250,0.6)' }}
                        >
                          <span>Descripción</span>
                          <span className="text-center">Cant.</span>
                          <span className="text-right">Precio unit.</span>
                          <span />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {editTplItems.map((item, idx) => (
                            <div
                              key={item.id}
                              className="grid items-center gap-2 px-3 py-2 rounded-lg"
                              style={{ gridTemplateColumns: '1fr 64px 110px 36px', background: idx % 2 === 0 ? 'rgba(0,20,30,0.4)' : 'transparent', border: '1px solid rgba(124,58,237,0.08)' }}
                            >
                              <input
                                value={item.description}
                                onChange={e => updateEditItem(item.id, 'description', e.target.value)}
                                placeholder="Descripción..."
                                className="w-full bg-transparent text-sm outline-none"
                                style={{ color: '#e0f7ff', caretColor: '#a78bfa' }}
                              />
                              <input
                                type="number" min={1} value={item.qty}
                                onChange={e => updateEditItem(item.id, 'qty', Number(e.target.value))}
                                className="w-full bg-transparent text-sm outline-none text-center"
                                style={{ color: '#e0f7ff', caretColor: '#a78bfa' }}
                              />
                              <input
                                type="number" min={0} value={item.unitPrice}
                                onChange={e => updateEditItem(item.id, 'unitPrice', Number(e.target.value))}
                                className="w-full bg-transparent text-sm outline-none text-right"
                                style={{ color: '#e0f7ff', caretColor: '#a78bfa' }}
                              />
                              <button
                                onClick={() => removeEditItem(item.id)}
                                disabled={editTplItems.length === 1}
                                className="flex items-center justify-center w-7 h-7 rounded-lg transition-all"
                                style={{ color: editTplItems.length === 1 ? 'rgba(240,0,255,0.2)' : 'rgba(240,0,255,0.5)' }}
                                onMouseEnter={e => { if (editTplItems.length > 1) e.currentTarget.style.color = '#f000ff' }}
                                onMouseLeave={e => { e.currentTarget.style.color = editTplItems.length === 1 ? 'rgba(240,0,255,0.2)' : 'rgba(240,0,255,0.5)' }}
                              >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>{/* /minWidth */}
                    </div>{/* /overflow-x-auto */}
                    <button
                      onClick={addEditItem}
                      className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                      style={{ background: 'rgba(124,58,237,0.05)', border: '1px dashed rgba(124,58,237,0.2)', color: 'rgba(167,139,250,0.6)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#a78bfa' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; e.currentTarget.style.color = 'rgba(167,139,250,0.6)' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      Agregar ítem
                    </button>
                  </div>

                  {/* Discount + IVA + ValidDays */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs mb-1.5 block font-semibold tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.6)' }}>Descuento (%)</label>
                      <input
                        type="number" min={0} max={100} step={0.01} value={editTplDiscountPct}
                        onChange={e => setEditTplDiscountPct(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none text-right"
                        style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(124,58,237,0.2)', color: '#e0f7ff', caretColor: '#a78bfa' }}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1.5 block font-semibold tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.6)' }}>Validez (días)</label>
                      <input
                        type="number" min={1} value={editTplValidDays}
                        onChange={e => setEditTplValidDays(Number(e.target.value))}
                        className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                        style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(124,58,237,0.2)', color: '#e0f7ff', caretColor: '#a78bfa' }}
                      />
                    </div>
                  </div>

                  {/* IVA */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditTplApplyIva(v => !v)}
                      className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all"
                      style={{
                        background: editTplApplyIva ? 'rgba(124,58,237,0.1)' : 'rgba(0,20,30,0.7)',
                        border: `1px solid ${editTplApplyIva ? 'rgba(124,58,237,0.4)' : 'rgba(124,58,237,0.15)'}`,
                      }}
                    >
                      <div className="w-10 h-5 rounded-full relative shrink-0" style={{ background: editTplApplyIva ? 'rgba(124,58,237,0.8)' : 'rgba(124,58,237,0.2)' }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: '#fff', left: editTplApplyIva ? 22 : 2 }} />
                      </div>
                      <span className="text-sm" style={{ color: editTplApplyIva ? '#a78bfa' : 'rgba(224,247,255,0.4)' }}>
                        IVA {editTplApplyIva ? 'incluido' : 'no incluido'}
                      </span>
                    </button>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-xs mb-1.5 block font-semibold tracking-widest uppercase" style={{ color: 'rgba(167,139,250,0.6)' }}>Notas y condiciones</label>
                    <textarea
                      value={editTplNotes}
                      onChange={e => setEditTplNotes(e.target.value)}
                      placeholder="Condiciones de pago, entrega, garantías..."
                      rows={3}
                      className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none"
                      style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(124,58,237,0.2)', color: '#e0f7ff', caretColor: '#a78bfa' }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-end pt-1 border-t" style={{ borderColor: 'rgba(124,58,237,0.12)' }}>
                    <button
                      onClick={() => setEditingTemplate(null)}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: 'rgba(0,20,30,0.7)', border: '1px solid rgba(124,58,237,0.12)', color: 'rgba(224,247,255,0.5)' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveEditedTemplate}
                      className="px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all"
                      style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', color: '#a78bfa' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.25)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                      </svg>
                      Guardar cambios
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Email Modal ── */}
      {showEmailModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={e => { if (e.target === e.currentTarget) setShowEmailModal(false) }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{
              background: 'rgba(0,10,18,0.98)',
              border: '1px solid rgba(0,229,255,0.2)',
              boxShadow: '0 0 60px rgba(0,229,255,0.1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(0,229,255,0.1)' }}>
              <h2 className="text-base font-semibold" style={{ color: '#00e5ff' }}>Enviar cotización por correo</h2>
              <button onClick={() => setShowEmailModal(false)} style={{ color: 'rgba(224,247,255,0.4)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto">
              {/* To */}
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'rgba(0,229,255,0.5)' }}>Para</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  placeholder="correo@cliente.cl"
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(0,229,255,0.15)', color: '#e0f7ff', caretColor: '#00e5ff' }}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'rgba(0,229,255,0.5)' }}>Asunto</label>
                <input
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(0,229,255,0.15)', color: '#e0f7ff', caretColor: '#00e5ff' }}
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs mb-1.5 block font-medium" style={{ color: 'rgba(0,229,255,0.5)' }}>Mensaje (editable)</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={14}
                  className="w-full rounded-lg px-3 py-2.5 text-sm outline-none resize-none font-mono"
                  style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(0,229,255,0.15)', color: '#e0f7ff', caretColor: '#00e5ff', lineHeight: 1.6 }}
                />
              </div>

              {/* Adjunto PDF */}
              <button
                type="button"
                onClick={() => setAttachAlcances(v => !v)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full"
                style={{
                  background: attachAlcances ? 'rgba(0,229,255,0.07)' : 'rgba(0,20,30,0.5)',
                  border: `1px solid ${attachAlcances ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.1)'}`,
                }}
              >
                <span
                  className="flex items-center justify-center w-4 h-4 rounded shrink-0"
                  style={{
                    background: attachAlcances ? '#00e5ff' : 'transparent',
                    border: `1.5px solid ${attachAlcances ? '#00e5ff' : 'rgba(0,229,255,0.3)'}`,
                  }}
                >
                  {attachAlcances && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000a0f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: attachAlcances ? '#00e5ff' : 'rgba(224,247,255,0.6)' }}>
                    Adjuntar Alcances técnicos E-commerce
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.35)' }}>
                    Incluye el PDF con los alcances técnicos del proyecto E-commerce
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="ml-auto shrink-0" style={{ color: 'rgba(0,229,255,0.35)' }}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              {/* Adjunto Términos y Condiciones */}
              <button
                type="button"
                onClick={() => setAttachTerminos(v => !v)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left w-full"
                style={{
                  background: attachTerminos ? 'rgba(0,229,255,0.07)' : 'rgba(0,20,30,0.5)',
                  border: `1px solid ${attachTerminos ? 'rgba(0,229,255,0.3)' : 'rgba(0,229,255,0.1)'}`,
                }}
              >
                <span
                  className="flex items-center justify-center w-4 h-4 rounded shrink-0"
                  style={{
                    background: attachTerminos ? '#00e5ff' : 'transparent',
                    border: `1.5px solid ${attachTerminos ? '#00e5ff' : 'rgba(0,229,255,0.3)'}`,
                  }}
                >
                  {attachTerminos && (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#000a0f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium" style={{ color: attachTerminos ? '#00e5ff' : 'rgba(224,247,255,0.6)' }}>
                    Adjuntar Términos y Condiciones
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.35)' }}>
                    Incluye el PDF con los T&C de desarrollo web de RIAVA System
                  </p>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  className="ml-auto shrink-0" style={{ color: 'rgba(0,229,255,0.35)' }}>
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              <p className="text-xs" style={{ color: 'rgba(0,229,255,0.35)' }}>
                El correo se enviará desde <span style={{ color: '#00e5ff' }}>contacto@riava.cl</span> directamente al destinatario.
              </p>

              {/* Status feedback */}
              {emailStatus === 'success' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(0,229,100,0.08)', border: '1px solid rgba(0,229,100,0.25)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00e564" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: '#00e564' }}>¡Cotización enviada correctamente!</span>
                </div>
              )}
              {emailStatus === 'error' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(240,0,80,0.08)', border: '1px solid rgba(240,0,80,0.25)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f00050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-sm font-medium" style={{ color: '#f00050' }}>Error al enviar. Verifica la dirección e intenta de nuevo.</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-1">
                <button
                  onClick={() => { setShowEmailModal(false); setEmailStatus('idle') }}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(0,20,30,0.7)', border: '1px solid rgba(0,229,255,0.12)', color: 'rgba(224,247,255,0.5)' }}
                  disabled={emailSending}
                >
                  Cancelar
                </button>
                <button
                  onClick={sendEmail}
                  disabled={emailSending || !emailTo || emailStatus === 'success'}
                  className="btn-tron px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
                  style={{ color: '#000a0f', opacity: emailSending || !emailTo ? 0.6 : 1 }}
                >
                  {emailSending ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Enviar correo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
