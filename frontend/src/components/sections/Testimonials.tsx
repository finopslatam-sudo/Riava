"use client"

import { TESTIMONIALS } from "@/lib/constants"
import { FadeIn } from "@/components/animations/FadeIn"

const AVATAR_GRADIENTS = [
  { from: "#00e5ff", to: "#f000ff" },
  { from: "#f000ff", to: "#00ff88" },
  { from: "#00ff88", to: "#00e5ff" },
  { from: "#00e5ff", to: "#f000ff" },
]

const ACCENT_COLORS = ["0,229,255", "240,0,255", "0,255,136", "0,229,255"]

// Triple to ensure seamless loop even on wide screens
const looped = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-28 bg-[#001018] overflow-hidden">
      {/* Glow accents */}
      <div
        className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(240,0,255,0.05) 0%, transparent 70%)" }}
      />
      <div className="divider-tron absolute top-0 left-0 right-0" />
      <div className="divider-tron absolute bottom-0 left-0 right-0" />

      {/* Header */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <FadeIn>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase mb-6">
              Testimonios
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              Equipos que confían en{" "}
              <span className="text-white">resultados reales</span>
            </h2>
          </div>
        </FadeIn>
      </div>

      {/* Infinite scroll */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="testimonials-scroll flex gap-5 w-max py-4">
          {looped.map((t, i) => {
            const idx = i % TESTIMONIALS.length
            const accent = ACCENT_COLORS[idx]
            const grad = AVATAR_GRADIENTS[idx]
            return (
              <div
                key={i}
                className="flex-shrink-0 w-[320px] sm:w-[360px] flex flex-col p-6 rounded-2xl border border-[#00e5ff]/10 bg-[#00141e] overflow-hidden relative"
                style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.5)" }}
              >
                {/* Top accent line */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: `linear-gradient(90deg, transparent, rgba(${accent},0.7), transparent)` }}
                />

                {/* Quote mark */}
                <div className="text-4xl font-black leading-none select-none mb-3" style={{ color: `rgba(${accent},0.15)` }}>
                  &ldquo;
                </div>

                {/* Text */}
                <p className="text-[#b0d8e8] text-sm leading-relaxed font-light flex-1 mb-6">
                  {t.text}
                </p>

                <div className="border-t border-[#00e5ff]/8 pt-4 flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                      boxShadow: `0 0 14px rgba(${accent},0.25)`,
                    }}
                  >
                    {t.avatar}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{t.name}</p>
                    <p className="text-[#4a7a8a] text-xs font-mono truncate">
                      {t.role} · {t.company}
                    </p>
                  </div>

                  <span className="text-[#00e5ff] text-xs shrink-0">★★★★★</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
