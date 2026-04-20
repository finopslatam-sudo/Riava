"use client"

import { useEffect, useRef, useState } from "react"
import { animate, motion, useMotionValue } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { SERVICES } from "@/lib/constants"
import { FadeIn } from "@/components/animations/FadeIn"

const ACCENT_COLORS = [
  { color: "#00e5ff", rgb: "0,229,255" },
  { color: "#f000ff", rgb: "240,0,255" },
  { color: "#00ff88", rgb: "0,255,136" },
  { color: "#00e5ff", rgb: "0,229,255" },
  { color: "#f000ff", rgb: "240,0,255" },
  { color: "#00ff88", rgb: "0,255,136" },
]

export function Services() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dragWidth, setDragWidth] = useState(0)
  const x = useMotionValue(0)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        setDragWidth(
          containerRef.current.scrollWidth - containerRef.current.offsetWidth
        )
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const scrollTo = (direction: "left" | "right") => {
    const containerWidth = containerRef.current?.offsetWidth ?? 0
    const scrollAmount = containerWidth * 0.75
    const newX = Math.max(
      Math.min(x.get() + (direction === "left" ? scrollAmount : -scrollAmount), 0),
      -dragWidth
    )
    animate(x, newX, { type: "spring", stiffness: 300, damping: 30, mass: 1 })
  }

  return (
    <section id="services" className="relative py-28 bg-[#000a0f] overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase mb-6">
              Servicios
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-5">
              Soluciones pensadas para{" "}
              <span className="text-white">vender, optimizar y escalar</span>
            </h2>
            <p className="text-[#3d7080] max-w-xl mx-auto text-lg font-light">
              Servicios claros, orientados a resultados y diseñados para generar impacto desde el primer mes.
            </p>
          </div>
        </FadeIn>
      </div>

      {/* Slider */}
      <div className="relative group/slider">
        {/* Left arrow */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scrollTo("left")}
            className="h-11 w-11 rounded-full bg-[#000a0f]/80 backdrop-blur-md border border-[#00e5ff]/20 flex items-center justify-center hover:border-[#00e5ff]/50 hover:scale-110 transition-all active:scale-95"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-[#00e5ff]" />
          </button>
        </div>

        {/* Right arrow */}
        <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => scrollTo("right")}
            className="h-11 w-11 rounded-full bg-[#000a0f]/80 backdrop-blur-md border border-[#00e5ff]/20 flex items-center justify-center hover:border-[#00e5ff]/50 hover:scale-110 transition-all active:scale-95"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-5 h-5 text-[#00e5ff]" />
          </button>
        </div>

        {/* Track */}
        <motion.div
          ref={containerRef}
          className="cursor-grab active:cursor-grabbing overflow-hidden px-4 sm:px-8 lg:px-16 py-8 -my-8"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -dragWidth }}
            dragElastic={0.08}
            style={{ x }}
            className="flex gap-5"
          >
            {SERVICES.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[0]
  index: number
}) {
  const accent = ACCENT_COLORS[index % ACCENT_COLORS.length]

  return (
    <motion.div
      className="min-w-[300px] max-w-[300px] sm:min-w-[320px] sm:max-w-[320px]"
      whileHover={{ y: -8, transition: { duration: 0.25 } }}
    >
      <div
        className="relative h-full flex flex-col p-6 rounded-2xl border border-[#00e5ff]/8 bg-[#00141e] group overflow-hidden"
        style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.6)" }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = `rgba(${accent.rgb}, 0.35)`
          el.style.boxShadow = `0 8px 40px rgba(0,0,0,0.7), 0 0 50px rgba(${accent.rgb}, 0.1)`
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.borderColor = "rgba(0,229,255,0.08)"
          el.style.boxShadow = "0 4px 32px rgba(0,0,0,0.6)"
        }}
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-0 right-0 h-px opacity-60"
          style={{ background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)` }}
        />

        {service.highlight && (
          <div className="absolute top-4 right-4">
            <span
              className="px-2 py-0.5 text-xs font-mono rounded border tracking-widest"
              style={{
                borderColor: `rgba(${accent.rgb},0.4)`,
                color: accent.color,
                background: `rgba(${accent.rgb},0.08)`,
              }}
            >
              DESTACADO
            </span>
          </div>
        )}

        <div className="text-2xl mb-4">{service.icon}</div>
        <h3 className="text-white font-bold text-base mb-3 leading-snug">{service.title}</h3>
        <p className="text-[#3d7080] text-sm leading-relaxed flex-1 mb-5 font-light">
          {service.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-5">
          {service.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs font-mono text-[#3d7080] border border-[#00e5ff]/8 rounded bg-[#00e5ff]/3"
            >
              {tag}
            </span>
          ))}
        </div>

        {service.cta ? (
          <a
            href={service.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-mono transition-colors duration-200 group/link"
            style={{ color: accent.color }}
          >
            {service.cta.label}
            <svg
              className="w-3 h-3 group-hover/link:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        ) : (
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-sm font-mono text-[#3d7080] hover:text-[#00e5ff] transition-colors duration-200 group/link"
          >
            Solicitar información
            <svg
              className="w-3 h-3 group-hover/link:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  )
}
