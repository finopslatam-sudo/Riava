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

const MM_H = 250     // minimap item height (matches reference)
const SNAP_MS = 500
const LERP_F = 0.05  // matches reference LERP_FACTOR

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

  // Main slides
  const bgRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const bgImgRef = useRef<Map<number, HTMLImageElement>>(new Map())

  // Minimap thumbnail images
  const mmImgRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const mmImgElRef = useRef<Map<number, HTMLImageElement>>(new Map())

  // Minimap info text
  const mmInfoRef = useRef<Map<number, HTMLDivElement>>(new Map())

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

    // Auto-snap after idle
    if (!s.snapping && !s.dragging && now - s.lastScroll > 100) {
      const idx = Math.max(0, Math.min(SERVICES.length - 1, Math.round(-s.tgt / s.sectionH)))
      if (Math.abs(s.tgt - (-idx * s.sectionH)) > 1) snapTo(idx)
    }

    // Snap easing (cubic out)
    if (s.snapping) {
      const p = Math.min((now - s.snapT) / SNAP_MS, 1)
      s.tgt = lerp(s.snapFrom, s.snapTo, 1 - Math.pow(1 - p, 3))
      if (p >= 1) s.snapping = false
    }

    if (!s.dragging) s.cur = lerp(s.cur, s.tgt, LERP_F)

    const mmOffset = s.sectionH / 2 - MM_H / 2
    const mmY = (s.cur * MM_H) / s.sectionH

    // Main slides + parallax
    bgRef.current.forEach((el, i) => {
      el.style.transform = `translateY(${i * s.sectionH + s.cur}px)`
      applyParallax(bgImgRef.current.get(i) ?? null, s.cur, i, s.sectionH)
    })

    // Minimap thumbnail items + parallax
    mmImgRef.current.forEach((el, i) => {
      el.style.transform = `translateY(${mmOffset + i * MM_H + mmY}px)`
      applyParallax(mmImgElRef.current.get(i) ?? null, mmY, i, MM_H)
    })

    // Minimap info items
    mmInfoRef.current.forEach((el, i) => {
      el.style.transform = `translateY(${mmOffset + i * MM_H + mmY}px)`
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
      // Passthrough at boundaries
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
              {/* Parallax image */}
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
              <div className="absolute inset-0" style={{ background: "rgba(0,10,15,0.76)" }} />

              {/* Tron color glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at 28% 55%, rgba(${a.rgb},0.13) 0%, transparent 55%)` }}
              />

              {/* Scanlines */}
              <div className="tron-scanlines absolute inset-0 pointer-events-none" />

              {/* Text content */}
              <div className="absolute inset-0 flex items-center px-8 sm:px-16 lg:pr-[290px] z-10">
                <div className="max-w-xl w-full">
                  <div className="w-10 h-px mb-8" style={{ background: a.color }} />

                  <div className="text-5xl mb-5">{service.icon}</div>

                  {service.highlight && (
                    <span
                      className="inline-block px-2 py-0.5 text-xs font-mono rounded border tracking-widest mb-4"
                      style={{
                        borderColor: `rgba(${a.rgb},0.4)`,
                        color: a.color,
                        background: `rgba(${a.rgb},0.08)`,
                      }}
                    >
                      DESTACADO
                    </span>
                  )}

                  <h3 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-5 leading-tight">
                    {service.title}
                  </h3>

                  <p className="text-[#7ab8c8] text-lg leading-relaxed font-light mb-8 max-w-lg">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-mono text-[#3d7080] border border-[#00e5ff]/10 rounded-full bg-[#000a0f]/50"
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
          )
        })}
      </div>

      {/* ── Header ── */}
      <div className="absolute top-8 left-8 sm:left-16 z-20 flex items-center gap-4">
        <FadeIn>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase">
            Servicios
          </span>
        </FadeIn>
        <span className="text-[#1a3040] font-mono text-xs tracking-widest">
          {String(active + 1).padStart(2, "0")} / {String(SERVICES.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── Right minimap ── */}
      <div
        className="absolute right-0 top-0 bottom-0 w-[280px] hidden lg:flex border-l border-[#00e5ff]/6 overflow-hidden z-20"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)",
        }}
      >
        {/* Thumbnail column */}
        <div className="relative w-[120px] flex-shrink-0 overflow-hidden border-r border-[#00e5ff]/6">
          {SERVICES.map((service, i) => {
            const a = ACCENT[i % ACCENT.length]
            return (
              <div
                key={service.id}
                className="absolute top-0 left-0 w-full overflow-hidden cursor-pointer"
                style={{ height: `${MM_H}px` }}
                ref={(el) => {
                  if (el) mmImgRef.current.set(i, el)
                  else mmImgRef.current.delete(i)
                }}
                onClick={() => snapTo(i)}
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transformOrigin: "center center" }}
                  ref={(el) => {
                    if (el) mmImgElRef.current.set(i, el)
                    else mmImgElRef.current.delete(i)
                  }}
                />
                {/* Dimming overlay — less dim when active */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "rgba(0,10,15,0.55)",
                    opacity: active === i ? 0 : 1,
                    transition: "opacity 0.4s ease",
                  }}
                />
                {/* Accent highlight */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: `rgba(${a.rgb},0.18)`,
                    opacity: active === i ? 1 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                />
                {/* Left border accent */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-0.5"
                  style={{
                    background: a.color,
                    opacity: active === i ? 0.9 : 0,
                    transition: "opacity 0.4s ease",
                  }}
                />
              </div>
            )
          })}
        </div>

        {/* Info column */}
        <div className="relative flex-1 overflow-hidden">
          {SERVICES.map((service, i) => {
            const a = ACCENT[i % ACCENT.length]
            return (
              <div
                key={service.id}
                className="absolute top-0 left-0 w-full flex flex-col justify-center px-5 cursor-pointer select-none"
                style={{ height: `${MM_H}px` }}
                ref={(el) => {
                  if (el) mmInfoRef.current.set(i, el)
                  else mmInfoRef.current.delete(i)
                }}
                onClick={() => snapTo(i)}
              >
                <p
                  className="text-[10px] font-mono mb-1.5"
                  style={{ color: active === i ? a.color : "#1a3040", transition: "color 0.3s" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p
                  className="text-xs font-semibold leading-snug mb-2"
                  style={{ color: active === i ? "#e0f7ff" : "#3d7080", transition: "color 0.3s" }}
                >
                  {service.title}
                </p>
                <p
                  className="text-[10px] font-mono leading-relaxed"
                  style={{ color: active === i ? "#3d7080" : "#1a3040", transition: "color 0.3s" }}
                >
                  {service.tags.join(" · ")}
                </p>
                <div
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-px"
                  style={{
                    height: active === i ? "50px" : "0px",
                    background: a.color,
                    opacity: 0.5,
                    transition: "height 0.4s ease",
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Mobile dots ── */}
      <div className="absolute bottom-10 right-6 flex flex-col gap-2 lg:hidden z-10">
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
