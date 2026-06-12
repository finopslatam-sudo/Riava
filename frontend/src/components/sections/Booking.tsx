'use client'

import { motion } from 'framer-motion'

const SLOTS_PREVIEW = [
  { day: 'Lun', times: ['09:00', '09:30', '10:00'] },
  { day: 'Mar', times: ['10:00', '10:30'] },
  { day: 'Mié', times: ['09:00', '14:00', '15:00'] },
  { day: 'Jue', times: ['09:30', '11:00'] },
  { day: 'Vie', times: ['09:00', '09:30', '15:30'] },
]

export function Booking() {
  return (
    <section id="agendar" className="py-24 px-4 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-widest uppercase font-semibold mb-4" style={{ color: 'rgba(0,229,255,0.5)' }}>
            Reuniones · Google Meet
          </p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ color: '#e0f7ff' }}>
            Agenda una <span style={{ color: '#00e5ff' }}>reunión</span> con nosotros
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(224,247,255,0.5)', lineHeight: 1.7 }}>
            Elige el horario que más te acomode. Recibirás un correo de confirmación con el enlace de Google Meet automáticamente.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Calendar preview */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 w-full max-w-lg"
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(0,10,15,0.9)',
                border: '1px solid rgba(0,229,255,0.14)',
                boxShadow: '0 0 60px rgba(0,229,255,0.06)',
              }}
            >
              {/* Week header */}
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-xs font-semibold" style={{ color: 'rgba(0,229,255,0.7)' }}>Horarios disponibles</span>
                </div>
                <span className="text-xs" style={{ color: 'rgba(224,247,255,0.3)' }}>Esta semana</span>
              </div>

              {/* Slots preview grid */}
              <div className="grid grid-cols-5 gap-px p-4" style={{ gap: '8px' }}>
                {SLOTS_PREVIEW.map((col, i) => (
                  <motion.div
                    key={col.day}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 + i * 0.07 }}
                    className="flex flex-col gap-2"
                  >
                    <p className="text-center text-xs font-semibold mb-1" style={{ color: 'rgba(0,229,255,0.4)' }}>{col.day}</p>
                    {col.times.map((t, j) => (
                      <div
                        key={j}
                        className="rounded-lg px-1 py-1.5 text-center text-xs font-medium"
                        style={{
                          background: j === 0 && i === 2 ? 'rgba(0,229,255,0.18)' : 'rgba(0,229,255,0.06)',
                          border: `1px solid ${j === 0 && i === 2 ? 'rgba(0,229,255,0.45)' : 'rgba(0,229,255,0.14)'}`,
                          color: j === 0 && i === 2 ? '#00e5ff' : 'rgba(0,229,255,0.65)',
                        }}
                      >
                        {t}
                      </div>
                    ))}
                  </motion.div>
                ))}
              </div>

              <div className="px-4 pb-4 pt-1">
                <div
                  className="rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
                  </svg>
                  <p className="text-xs" style={{ color: 'rgba(224,247,255,0.5)' }}>
                    Google Meet incluido · Confirmación por correo
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA side */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 flex flex-col gap-6 max-w-md"
          >
            {[
              { icon: '📅', title: 'Elige tu horario', desc: 'Navega por el calendario semanal y selecciona el horario que más te acomode.' },
              { icon: '✍️', title: 'Completa tus datos', desc: 'Nombre, correo y el servicio de tu interés. Solo toma un minuto.' },
              { icon: '📩', title: 'Recibe confirmación', desc: 'Te enviamos un correo con todos los detalles y el enlace de Google Meet.' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'rgba(0,229,255,0.07)', border: '1px solid rgba(0,229,255,0.15)' }}
                >
                  {step.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: '#e0f7ff' }}>{step.title}</p>
                  <p className="text-sm" style={{ color: 'rgba(224,247,255,0.45)', lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="mt-2"
            >
              <a
                href="/agendar"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: '#00e5ff',
                  color: '#000a0f',
                  boxShadow: '0 0 32px rgba(0,229,255,0.25)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 48px rgba(0,229,255,0.4)'
                  ;(e.currentTarget as HTMLAnchorElement).style.background = '#33ecff'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 32px rgba(0,229,255,0.25)'
                  ;(e.currentTarget as HTMLAnchorElement).style.background = '#00e5ff'
                }}
              >
                Ver horarios disponibles
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <p className="text-xs mt-3" style={{ color: 'rgba(224,247,255,0.3)' }}>
                Sin costo · Sin tarjeta de crédito
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
