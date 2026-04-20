"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "framer-motion"
import { IMPACT_METRICS } from "@/lib/constants"
import { FadeIn } from "@/components/animations/FadeIn"

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })

  useEffect(() => {
    if (!isInView) return
    const duration = 2000
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * value))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, value])

  return <span ref={ref}>{count}{suffix}</span>
}

const METRIC_COLORS = [
  { color: "#00e5ff", rgb: "0,229,255" },
  { color: "#f000ff", rgb: "240,0,255" },
  { color: "#00ff88", rgb: "0,255,136" },
  { color: "#00e5ff", rgb: "0,229,255" },
]

export function Impact() {
  return (
    <section id="impact" className="relative py-28 bg-[#001018] overflow-hidden">
      {/* Center glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase mb-6">
              Impacto
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-4">
              Resultados reales para{" "}
              <span className="text-white">negocios reales</span>
            </h2>
            <p className="text-[#3d7080] max-w-xl mx-auto text-lg font-light">
              Impacto medible desde el primer día.
            </p>
          </div>
        </FadeIn>

        {/* Counter grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {IMPACT_METRICS.map((metric, i) => {
            const accent = METRIC_COLORS[i]
            return (
              <FadeIn key={metric.label} delay={i * 0.1}>
                <div
                  className="relative group text-center p-8 rounded-xl border border-[#00e5ff]/8 bg-[#00141e] transition-all duration-300 overflow-hidden"
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = `rgba(${accent.rgb}, 0.35)`
                    el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.6), 0 0 50px rgba(${accent.rgb}, 0.1)`
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.borderColor = "rgba(0,229,255,0.08)"
                    el.style.boxShadow = "none"
                  }}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
                  />
                  <div
                    className="text-4xl sm:text-5xl font-black mb-2"
                    style={{ color: accent.color, filter: `drop-shadow(0 0 16px rgba(${accent.rgb}, 0.55))` }}
                  >
                    <AnimatedCounter value={metric.value} suffix={metric.suffix} />
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">{metric.label}</div>
                  <div className="text-[#3d7080] text-xs font-mono leading-relaxed">{metric.description}</div>
                </div>
              </FadeIn>
            )
          })}
        </div>

        {/* Value props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              color: "#00e5ff", rgb: "0,229,255", num: "01",
              title: "Reduce costos cloud hasta un 40%",
              body: "Nuestra práctica FinOps identifica desperdicios en AWS, GCP y Azure para convertir ahorros en inversión estratégica.",
            },
            {
              color: "#f000ff", rgb: "240,0,255", num: "02",
              title: "Automatiza hasta el 80% de tus procesos",
              body: "Mapeamos flujos y eliminamos cuellos de botella manuales con automatización inteligente para liberar a tu equipo.",
            },
            {
              color: "#00ff88", rgb: "0,255,136", num: "03",
              title: "Escala con arquitectura empresarial",
              body: "Cada sistema se diseña para crecer contigo mediante microservicios, multi-tenancy y patrones cloud-native.",
            },
          ].map((item) => (
            <FadeIn key={item.title} delay={0.1}>
              <div className="p-6 rounded-xl border border-[#00e5ff]/8 bg-[#00141e] hover:border-[#00e5ff]/15 transition-all duration-300 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-px opacity-70"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
                />
                <div
                  className="text-xs font-mono mb-4 tracking-widest"
                  style={{ color: item.color, opacity: 0.8 }}
                >
                  [{item.num}]
                </div>
                <h3 className="text-white font-bold mb-2 text-sm">{item.title}</h3>
                <p className="text-[#3d7080] text-sm leading-relaxed font-light">{item.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
