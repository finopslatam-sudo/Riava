"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SERVICES } from "@/lib/constants"
import { cn } from "@/lib/utils"

const AUTO_PLAY_INTERVAL = 3500
const ITEM_HEIGHT = 68

const ACCENT = [
  "#00e5ff",
  "#f000ff",
  "#00ff88",
  "#00e5ff",
  "#f000ff",
  "#00ff88",
]

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min
}

export function Services() {
  const [step, setStep] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const total = SERVICES.length
  const currentIndex = ((step % total) + total) % total

  const nextStep = useCallback(() => setStep(p => p + 1), [])

  const handleChipClick = (index: number) => {
    const diff = (index - currentIndex + total) % total
    if (diff > 0) setStep(s => s + diff)
  }

  useEffect(() => {
    if (isPaused) return
    const t = setInterval(nextStep, AUTO_PLAY_INTERVAL)
    return () => clearInterval(t)
  }, [nextStep, isPaused])

  const getCardStatus = (index: number) => {
    const len = total
    let d = index - currentIndex
    if (d > len / 2) d -= len
    if (d < -len / 2) d += len
    if (d === 0) return "active"
    if (d === -1) return "prev"
    if (d === 1) return "next"
    return "hidden"
  }

  const accent = ACCENT[currentIndex % ACCENT.length]

  return (
    <section id="services" className="relative w-full py-12 md:py-16 bg-[#000a0f]">
      <div className="divider-tron absolute top-0 left-0 right-0" />

      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">

        {/* Section label */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase">
            Servicios
          </span>
          <div className="h-px flex-1 max-w-16" style={{ background: `linear-gradient(to right, ${accent}, transparent)` }} />
        </div>

        {/* Main card */}
        <div
          className="relative overflow-hidden rounded-4xl lg:rounded-5xl flex flex-col lg:flex-row min-h-150 lg:aspect-video"
          style={{ border: `1px solid rgba(0,229,255,0.1)` }}
        >

          {/* ── Left panel — service list ── */}
          <div
            className="w-full lg:w-[38%] min-h-80 lg:h-full relative z-30 flex flex-col items-start justify-center overflow-hidden px-8 md:px-14 lg:pl-14"
            style={{ background: `linear-gradient(135deg, #000a0f 0%, #00141e 100%)` }}
          >
            {/* Top + bottom fade */}
            <div
              className="absolute inset-x-0 top-0 h-16 z-40 pointer-events-none"
              style={{ background: "linear-gradient(to bottom, #000a0f, transparent)" }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-16 z-40 pointer-events-none"
              style={{ background: "linear-gradient(to top, #000a0f, transparent)" }}
            />

            {/* Tron glow behind list */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse at 20% 50%, rgba(0,229,255,0.06) 0%, transparent 60%)` }}
            />
            <div className="tron-scanlines absolute inset-0 pointer-events-none" />

            {/* Scrolling chips */}
            <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20">
              {SERVICES.map((service, index) => {
                const isActive = index === currentIndex
                const distance = index - currentIndex
                const wd = wrap(-(total / 2), total / 2, distance)
                const color = ACCENT[index % ACCENT.length]

                return (
                  <motion.div
                    key={service.id}
                    style={{ height: ITEM_HEIGHT, width: "fit-content" }}
                    animate={{
                      y: wd * ITEM_HEIGHT,
                      opacity: 1 - Math.abs(wd) * 0.28,
                    }}
                    transition={{ type: "spring", stiffness: 90, damping: 22, mass: 1 }}
                    className="absolute flex items-center justify-start"
                  >
                    <button
                      onClick={() => handleChipClick(index)}
                      onMouseEnter={() => setIsPaused(true)}
                      onMouseLeave={() => setIsPaused(false)}
                      className={cn(
                        "relative flex items-center gap-3 px-5 py-3 rounded-full transition-all duration-500 text-left border font-mono text-sm tracking-widest uppercase",
                        isActive
                          ? "text-[#000a0f]"
                          : "bg-transparent text-white/40 hover:text-white/70"
                      )}
                      style={isActive ? {
                        background: color,
                        borderColor: color,
                        boxShadow: `0 0 24px rgba(0,229,255,0.35)`,
                      } : {
                        borderColor: "rgba(0,229,255,0.12)",
                      }}
                    >
                      <span className="text-base leading-none">{service.icon}</span>
                      <span className="whitespace-nowrap text-xs">{service.title}</span>
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* ── Right panel — image cards ── */}
          <div
            className="flex-1 min-h-105 lg:h-full relative flex items-center justify-center py-12 md:py-16 lg:py-12 px-6 md:px-10 overflow-hidden"
            style={{ background: "#000e17", borderLeft: "1px solid rgba(0,229,255,0.06)" }}
          >
            {/* Background glow that follows active accent */}
            <div
              className="absolute inset-0 pointer-events-none transition-all duration-700"
              style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(0,229,255,0.04) 0%, transparent 65%)` }}
            />

            <div className="relative w-full max-w-95 aspect-4/5 flex items-center justify-center">
              {SERVICES.map((service, index) => {
                const status = getCardStatus(index)
                const isActive = status === "active"
                const isPrev = status === "prev"
                const isNext = status === "next"
                const color = ACCENT[index % ACCENT.length]

                return (
                  <motion.div
                    key={service.id}
                    initial={false}
                    animate={{
                      x: isActive ? 0 : isPrev ? -90 : isNext ? 90 : 0,
                      scale: isActive ? 1 : isPrev || isNext ? 0.86 : 0.7,
                      opacity: isActive ? 1 : isPrev || isNext ? 0.35 : 0,
                      rotate: isPrev ? -3 : isNext ? 3 : 0,
                      zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 260, damping: 25, mass: 0.8 }}
                    className="absolute inset-0 rounded-[1.8rem] overflow-hidden origin-center"
                    style={{
                      border: `2px solid ${isActive ? color : "rgba(0,229,255,0.08)"}`,
                      boxShadow: isActive ? `0 0 40px rgba(0,229,255,0.15)` : "none",
                      pointerEvents: isActive ? "auto" : "none",
                    }}
                  >
                    {/* Service image */}
                    <img
                      src={service.image}
                      alt={service.title}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-700",
                        isActive ? "grayscale-0 brightness-100" : "grayscale brightness-50"
                      )}
                    />

                    {/* Dark overlay */}
                    <div className="absolute inset-0" style={{ background: "rgba(0,10,15,0.45)" }} />

                    {/* Tron scanlines */}
                    <div className="tron-scanlines absolute inset-0 pointer-events-none" />

                    {/* Bottom info — only active */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute inset-x-0 bottom-0 p-8 pt-24 pointer-events-none"
                          style={{ background: "linear-gradient(to top, rgba(0,10,15,0.95) 0%, rgba(0,10,15,0.6) 50%, transparent 100%)" }}
                        >
                          {/* Pill label */}
                          <div
                            className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase mb-3"
                            style={{
                              background: "rgba(0,10,15,0.8)",
                              border: `1px solid ${color}`,
                              color: color,
                            }}
                          >
                            {String(index + 1).padStart(2, "0")} · {service.title}
                          </div>

                          <p className="text-white font-light text-lg md:text-xl leading-snug tracking-tight mb-4">
                            {service.description}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {service.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 text-[10px] font-mono rounded-full border"
                                style={{ borderColor: `${color}30`, color: "#3d7080" }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* CTA */}
                          {service.cta && (
                            <a
                              href={service.cta.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 mt-4 text-xs font-mono group pointer-events-auto"
                              style={{ color }}
                            >
                              {service.cta.label}
                              <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </a>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Top live indicator — active only */}
                    <div className={cn("absolute top-6 left-6 flex items-center gap-2 transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                      <span className="text-white/60 text-[9px] font-mono tracking-[0.25em] uppercase">
                        {service.highlight ? "DESTACADO" : "RIAVA"}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {SERVICES.map((_, i) => (
            <button
              key={i}
              onClick={() => handleChipClick(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? "24px" : "4px",
                height: "4px",
                background: i === currentIndex ? accent : "rgba(0,229,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="divider-tron absolute bottom-0 left-0 right-0" />
    </section>
  )
}
