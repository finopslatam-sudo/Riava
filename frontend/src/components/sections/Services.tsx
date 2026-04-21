"use client"

import { useState, useEffect, useRef } from "react"
import { SERVICES } from "@/lib/constants"
import { FadeIn } from "@/components/animations/FadeIn"

const ACCENT = [
  { color: "#00e5ff", rgb: "0,229,255" },
  { color: "#f000ff", rgb: "240,0,255" },
  { color: "#00ff88", rgb: "0,255,136" },
  { color: "#00e5ff", rgb: "0,229,255" },
  { color: "#f000ff", rgb: "240,0,255" },
  { color: "#00ff88", rgb: "0,255,136" },
]

// Logical connections between services
const RELATED: Record<string, string[]> = {
  finops:     ["saas", "automation"],
  booking:    ["websites", "automation"],
  websites:   ["saas", "custom"],
  saas:       ["finops", "custom"],
  automation: ["finops", "booking"],
  custom:     ["saas", "websites"],
}

export function Services() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [angle, setAngle] = useState(0)
  const [autoRotate, setAutoRotate] = useState(true)
  const [pulseIds, setPulseIds] = useState<Set<string>>(new Set())
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoRotate) return
    const t = setInterval(() => {
      setAngle(p => Number(((p + 0.3) % 360).toFixed(3)))
    }, 50)
    return () => clearInterval(t)
  }, [autoRotate])

  function calcPos(index: number, total: number) {
    const deg = ((index / total) * 360 + angle) % 360
    const rad = (deg * Math.PI) / 180
    const r = 200
    return {
      x: r * Math.cos(rad),
      y: r * Math.sin(rad),
      zIndex: Math.round(100 + 50 * Math.cos(rad)),
      opacity: Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(rad)) / 2))),
    }
  }

  function toggle(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setAutoRotate(true)
      setPulseIds(new Set())
    } else {
      setExpandedId(id)
      setAutoRotate(false)
      setPulseIds(new Set(RELATED[id] ?? []))
    }
  }

  function handleBgClick(e: React.MouseEvent) {
    if (e.target === containerRef.current) {
      setExpandedId(null)
      setAutoRotate(true)
      setPulseIds(new Set())
    }
  }

  return (
    <section
      id="services"
      className="relative h-screen overflow-hidden bg-[#000a0f]"
    >
      <div className="divider-tron absolute top-0 left-0 right-0 z-30" />

      {/* Background glow + scanlines */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.05) 0%, transparent 65%)" }}
        />
        <div className="tron-scanlines absolute inset-0" />
      </div>

      {/* Header */}
      <div className="absolute top-8 left-8 sm:left-16 z-20 flex items-center gap-4">
        <FadeIn>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase">
            Servicios
          </span>
        </FadeIn>
        <span className="text-[#1a3040] font-mono text-xs tracking-widest hidden sm:block">
          {expandedId
            ? SERVICES.find(s => s.id === expandedId)?.title
            : "Selecciona un servicio"}
        </span>
      </div>

      {/* Orbital stage */}
      <div
        ref={containerRef}
        className="absolute inset-0 flex items-center justify-center"
        onClick={handleBgClick}
      >
        {/* Orbit rings */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-[#00e5ff]/8 pointer-events-none" />
        <div className="absolute w-[430px] h-[430px] rounded-full border border-[#00e5ff]/4 pointer-events-none" />

        {/* Center orb */}
        <div
          className="absolute w-16 h-16 rounded-full z-10 flex items-center justify-center pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(0,229,255,0.18) 0%, rgba(0,10,15,0.95) 70%)",
            border: "1px solid rgba(0,229,255,0.28)",
            boxShadow: "0 0 32px rgba(0,229,255,0.15)",
          }}
        >
          <div className="absolute w-20 h-20 rounded-full border border-[#00e5ff]/12 animate-ping opacity-50" />
          <div className="absolute w-26 h-26 rounded-full border border-[#00e5ff]/6 animate-ping opacity-25" style={{ animationDelay: "0.6s" }} />
          <span className="text-[#00e5ff] font-mono text-[9px] tracking-[0.2em]">RIAVA</span>
        </div>

        {/* Service nodes */}
        {SERVICES.map((service, i) => {
          const pos = calcPos(i, SERVICES.length)
          const a = ACCENT[i % ACCENT.length]
          const isExpanded = expandedId === service.id
          const isPulsing = pulseIds.has(service.id)
          const isRelated = !!(expandedId && RELATED[expandedId]?.includes(service.id))

          return (
            <div
              key={service.id}
              className="absolute transition-all duration-700 cursor-pointer select-none"
              style={{
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                zIndex: isExpanded ? 200 : pos.zIndex,
                opacity: isExpanded ? 1 : pos.opacity,
              }}
              onClick={e => { e.stopPropagation(); toggle(service.id) }}
            >
              {/* Aura glow */}
              <div
                className={`absolute rounded-full ${isPulsing ? "animate-pulse" : ""}`}
                style={{
                  background: `radial-gradient(circle, rgba(${a.rgb},0.18) 0%, transparent 70%)`,
                  width: "64px",
                  height: "64px",
                  left: "-12px",
                  top: "-12px",
                  pointerEvents: "none",
                }}
              />

              {/* Node */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300"
                style={{
                  transform: isExpanded ? "scale(1.5)" : "scale(1)",
                  background: isExpanded
                    ? `rgba(${a.rgb},0.12)`
                    : "rgba(0,10,15,0.85)",
                  border: `2px solid ${isExpanded || isRelated ? a.color : "rgba(0,229,255,0.18)"}`,
                  boxShadow: isExpanded
                    ? `0 0 24px rgba(${a.rgb},0.45), inset 0 0 12px rgba(${a.rgb},0.08)`
                    : isRelated
                    ? `0 0 12px rgba(${a.rgb},0.3)`
                    : "none",
                }}
              >
                {service.icon}
              </div>

              {/* Label */}
              <div
                className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-mono tracking-wider transition-all duration-300"
                style={{
                  color: isExpanded ? a.color : isRelated ? `rgba(${a.rgb},0.7)` : "rgba(255,255,255,0.4)",
                  transform: isExpanded ? "translateX(-50%) scale(1.1)" : "translateX(-50%)",
                }}
              >
                {service.title.split(" ").slice(0, 2).join(" ")}
              </div>

              {/* Expanded card */}
              {isExpanded && (
                <div
                  className="absolute top-[4.5rem] left-1/2 -translate-x-1/2 w-64"
                  style={{
                    background: "rgba(0,8,14,0.94)",
                    border: `1px solid rgba(${a.rgb},0.22)`,
                    backdropFilter: "blur(14px)",
                    boxShadow: `0 0 48px rgba(${a.rgb},0.1), 0 24px 48px rgba(0,0,0,0.6)`,
                  }}
                >
                  {/* Top accent */}
                  <div className="absolute -top-px left-0 right-0 h-px" style={{ background: a.color }} />
                  {/* Connector */}
                  <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 w-px h-[18px]" style={{ background: `rgba(${a.rgb},0.35)` }} />

                  <div className="p-4">
                    {/* Card header */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-[10px]" style={{ color: a.color }}>
                        {String(i + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
                      </span>
                      {service.highlight && (
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded border tracking-widest"
                          style={{
                            borderColor: `rgba(${a.rgb},0.3)`,
                            color: a.color,
                            background: `rgba(${a.rgb},0.07)`,
                          }}
                        >
                          DESTACADO
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-[11px] text-[#3d7080] leading-relaxed mb-3">
                      {service.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {service.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 text-[9px] font-mono rounded border"
                          style={{ borderColor: `rgba(${a.rgb},0.14)`, color: "#3d7080" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    {service.cta ? (
                      <a
                        href={service.cta.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono group"
                        style={{ color: a.color }}
                        onClick={e => e.stopPropagation()}
                      >
                        {service.cta.label}
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    ) : (
                      <a
                        href="#contact"
                        className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#3d7080] hover:text-[#00e5ff] transition-colors group"
                        onClick={e => e.stopPropagation()}
                      >
                        Solicitar información
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </a>
                    )}

                    {/* Related services */}
                    {(RELATED[service.id]?.length ?? 0) > 0 && (
                      <div
                        className="mt-3 pt-3"
                        style={{ borderTop: `1px solid rgba(${a.rgb},0.1)` }}
                      >
                        <p className="text-[9px] font-mono text-[#1a3040] mb-2 tracking-widest uppercase">
                          Relacionados
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {RELATED[service.id].map(relId => {
                            const rel = SERVICES.find(s => s.id === relId)
                            if (!rel) return null
                            return (
                              <button
                                key={relId}
                                className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-mono border rounded transition-colors hover:border-[#00e5ff]/30 hover:text-[#7ab8c8]"
                                style={{ borderColor: "rgba(0,229,255,0.12)", color: "#3d7080" }}
                                onClick={e => { e.stopPropagation(); toggle(relId) }}
                              >
                                {rel.icon} {rel.title.split(" ")[0]}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Hint text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#00e5ff]/30" />
        <span className="text-[#1a3040] font-mono text-[10px] tracking-widest">
          {expandedId ? "CLICK FUERA PARA CERRAR" : "CLICK EN UN NODO PARA VER DETALLE"}
        </span>
        <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#00e5ff]/30" />
      </div>

      <div className="divider-tron absolute bottom-0 left-0 right-0 z-30" />
    </section>
  )
}
