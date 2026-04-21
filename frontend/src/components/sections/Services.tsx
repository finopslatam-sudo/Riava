"use client"

import { useEffect, useRef, useState } from "react"
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

const SNAP_MS = 500
const LERP_F = 0.05

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function applyParallax(
  img: HTMLImageElement | null,
  scroll: number,
  index: number,
  height: number
) {
  if (!img) return
  if (!img.dataset.pCur) img.dataset.pCur = "0"
  let cur = parseFloat(img.dataset.pCur)
  const target = (-scroll - index * height) * 0.2
  cur = lerp(cur, target, 0.1)
  img.style.transform = `translateY(${cur}px) scale(1.5)`
  img.dataset.pCur = String(cur)
}

export function Services() {
  const [active, setActive] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  const bgRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const bgImgRef = useRef<Map<number, HTMLImageElement>>(new Map())
  const cardImgRef = useRef<Map<number, HTMLImageElement>>(new Map())

  const rafRef = useRef<number | null>(null)
  const activeRef = useRef(0)

  const st = useRef({
    cur: 0,
    tgt: 0,
    snapping: false,
    snapFrom: 0,
    snapTo: 0,
    snapT: 0,
    dragging: false,
    dragY: 0,
    dragScrollY: 0,
    lastScroll: 0,
    sectionH: 0,
  })

  const maxScroll = () => -(SERVICES.length - 1) * st.current.sectionH

  function snapTo(idx: number) {
    const s = st.current
    s.snapping = true
    s.snapFrom = s.tgt
    s.snapTo = -idx * s.sectionH
    s.snapT = Date.now()
  }

  function tick() {
    const s = st.current
    const now = Date.now()

    if (!s.snapping && !s.dragging && now - s.lastScroll > 100) {
      const idx = Math.max(0, Math.min(SERVICES.length - 1, Math.round(-s.tgt / s.sectionH)))
      if (Math.abs(s.tgt - (-idx * s.sectionH)) > 1) snapTo(idx)
    }

    if (s.snapping) {
      const p = Math.min((now - s.snapT) / SNAP_MS, 1)
      s.tgt = lerp(s.snapFrom, s.snapTo, 1 - Math.pow(1 - p, 3))
      if (p >= 1) s.snapping = false
    }

    if (!s.dragging) s.cur = lerp(s.cur, s.tgt, LERP_F)

    bgRef.current.forEach((el, i) => {
      el.style.transform = `translateY(${i * s.sectionH + s.cur}px)`
      applyParallax(bgImgRef.current.get(i) ?? null, s.cur, i, s.sectionH)
      applyParallax(cardImgRef.current.get(i) ?? null, s.cur, i, s.sectionH)
    })

    const newActive = Math.max(0, Math.min(SERVICES.length - 1, Math.round(-s.cur / s.sectionH)))
    if (newActive !== activeRef.current) {
      activeRef.current = newActive
      setActive(newActive)
    }

    rafRef.current = requestAnimationFrame(tick)
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const resize = () => { st.current.sectionH = section.clientHeight }
    resize()

    const wheel = (e: WheelEvent) => {
      if (!section.contains(e.target as Node)) return
      const s = st.current
      if (e.deltaY < 0 && s.tgt >= 0) return
      if (e.deltaY > 0 && s.tgt <= maxScroll()) return
      e.preventDefault()
      s.snapping = false
      s.lastScroll = Date.now()
      const d = Math.max(Math.min(e.deltaY * 0.75, 150), -150)
      s.tgt = Math.max(maxScroll(), Math.min(0, s.tgt - d))
    }

    const touchstart = (e: TouchEvent) => {
      if (!section.contains(e.target as Node)) return
      const s = st.current
      s.dragging = true
      s.snapping = false
      s.dragY = e.touches[0].clientY
      s.dragScrollY = s.tgt
      s.lastScroll = Date.now()
    }

    const touchmove = (e: TouchEvent) => {
      const s = st.current
      if (!s.dragging) return
      s.tgt = Math.max(maxScroll(), Math.min(0, s.dragScrollY + (e.touches[0].clientY - s.dragY) * 1.5))
      s.lastScroll = Date.now()
    }

    const touchend = () => { st.current.dragging = false }

    section.addEventListener("wheel", wheel, { passive: false })
    window.addEventListener("touchstart", touchstart)
    window.addEventListener("touchmove", touchmove)
    window.addEventListener("touchend", touchend)
    window.addEventListener("resize", resize)

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      section.removeEventListener("wheel", wheel)
      window.removeEventListener("touchstart", touchstart)
      window.removeEventListener("touchmove", touchmove)
      window.removeEventListener("touchend", touchend)
      window.removeEventListener("resize", resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-[#000a0f]"
    >
      <div className="divider-tron absolute top-0 left-0 right-0 z-30" />

      {/* ── Full-screen slides ── */}
      <div className="absolute inset-0 overflow-hidden">
        {SERVICES.map((service, i) => {
          const a = ACCENT[i % ACCENT.length]
          return (
            <div
              key={service.id}
              className="absolute top-0 left-0 w-full h-full"
              ref={(el) => {
                if (el) bgRef.current.set(i, el)
                else bgRef.current.delete(i)
              }}
            >
              {/* Background parallax image */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transformOrigin: "center center" }}
                  ref={(el) => {
                    if (el) bgImgRef.current.set(i, el)
                    else bgImgRef.current.delete(i)
                  }}
                />
              </div>

              {/* Dark overlay */}
              <div className="absolute inset-0" style={{ background: "rgba(0,10,15,0.78)" }} />

              {/* Tron radial glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(${a.rgb},0.09) 0%, transparent 65%)` }}
              />

              {/* Scanlines */}
              <div className="tron-scanlines absolute inset-0 pointer-events-none" />

              {/* ── Centered card ── */}
              <div className="absolute inset-0 flex items-center justify-center z-10 px-6 sm:px-12">
                <div
                  className="w-full max-w-5xl"
                  style={{
                    border: `1px solid rgba(${a.rgb},0.14)`,
                    background: "rgba(0,10,15,0.52)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {/* Top bar */}
                  <div
                    className="flex items-center justify-between px-6 py-3"
                    style={{ borderBottom: `1px solid rgba(${a.rgb},0.08)` }}
                  >
                    <span className="font-mono text-xs" style={{ color: a.color }}>
                      {String(i + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
                    </span>

                    {service.highlight && (
                      <span
                        className="text-[10px] font-mono px-2 py-0.5 rounded border tracking-widest"
                        style={{
                          borderColor: `rgba(${a.rgb},0.35)`,
                          color: a.color,
                          background: `rgba(${a.rgb},0.07)`,
                        }}
                      >
                        DESTACADO
                      </span>
                    )}

                    <span className="text-[#1a3040] font-mono text-[10px] tracking-widest hidden sm:block">
                      RIAVA SYSTEM SPA
                    </span>
                  </div>

                  {/* Main body: left | image | right */}
                  <div className="flex items-stretch" style={{ minHeight: "300px" }}>

                    {/* Left — title & description */}
                    <div
                      className="flex-1 flex flex-col justify-between p-6"
                      style={{ borderRight: `1px solid rgba(${a.rgb},0.08)` }}
                    >
                      <div className="text-3xl mb-4">{service.icon}</div>
                      <div>
                        <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-3">
                          {service.title}
                        </h3>
                        <p className="text-[#3d7080] text-xs leading-relaxed hidden sm:block max-w-xs">
                          {service.description}
                        </p>
                      </div>
                    </div>

                    {/* Center — image */}
                    <div
                      className="w-48 sm:w-72 shrink-0 overflow-hidden relative"
                      style={{ borderRight: `1px solid rgba(${a.rgb},0.08)` }}
                    >
                      <img
                        src={service.image}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ transformOrigin: "center center" }}
                        ref={(el) => {
                          if (el) cardImgRef.current.set(i, el)
                          else cardImgRef.current.delete(i)
                        }}
                      />
                      {/* Bottom accent gradient */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `linear-gradient(to top, rgba(${a.rgb},0.25) 0%, transparent 55%)`,
                        }}
                      />
                    </div>

                    {/* Right — tags & CTA */}
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div className="flex flex-wrap gap-1.5">
                        {service.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-[10px] font-mono rounded-full border"
                            style={{
                              borderColor: `rgba(${a.rgb},0.15)`,
                              color: "#3d7080",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div>
                        {service.cta ? (
                          <a
                            href={service.cta.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-mono group"
                            style={{ color: a.color }}
                          >
                            {service.cta.label}
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </a>
                        ) : (
                          <a
                            href="#contact"
                            className="inline-flex items-center gap-2 text-sm font-mono text-[#3d7080] hover:text-[#00e5ff] transition-colors group"
                          >
                            Solicitar información
                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Header badge ── */}
      <div className="absolute top-8 left-8 sm:left-16 z-20 flex items-center gap-4">
        <FadeIn>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase">
            Servicios
          </span>
        </FadeIn>
      </div>

      {/* ── Navigation dots ── */}
      <div className="absolute bottom-10 right-8 flex flex-col gap-2 z-10">
        {SERVICES.map((_, i) => (
          <button
            key={i}
            onClick={() => snapTo(i)}
            className="rounded-full"
            style={{
              width: "4px",
              height: active === i ? "20px" : "4px",
              background: active === i
                ? ACCENT[i % ACCENT.length].color
                : "rgba(0,229,255,0.15)",
              transition: "height 0.3s, background 0.3s",
            }}
          />
        ))}
      </div>

      {/* ── Scroll label ── */}
      <div className="absolute bottom-8 left-8 sm:left-16 z-10 flex items-center gap-3">
        <div
          className="h-6 w-px"
          style={{ background: `linear-gradient(to bottom, ${ACCENT[active % ACCENT.length].color}, transparent)` }}
        />
        <span className="text-[#1a3040] font-mono text-xs tracking-widest">SCROLL</span>
      </div>

      <div className="divider-tron absolute bottom-0 left-0 right-0 z-30" />
    </section>
  )
}
