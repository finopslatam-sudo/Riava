"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TESTIMONIALS } from "@/lib/constants"
import { FadeIn } from "@/components/animations/FadeIn"

export function Testimonials() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }

  const next = () => {
    setDirection(1)
    setCurrent((c) => (c + 1) % TESTIMONIALS.length)
  }

  useEffect(() => {
    intervalRef.current = setInterval(next, 5000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const variants = {
    enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
  }

  const AVATAR_GRADIENTS = [
    "from-[#00e5ff] to-[#f000ff]",
    "from-[#f000ff] to-[#00ff88]",
    "from-[#00ff88] to-[#00e5ff]",
    "from-[#00e5ff] to-[#f000ff]",
    "from-[#f000ff] to-[#00ff88]",
  ]

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase mb-6">
              Testimonios
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
              Equipos que confían en{" "}
              <span className="text-white">resultados reales</span>
            </h2>
          </div>
        </FadeIn>

        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                className="relative p-8 md:p-10 rounded-2xl border border-[#00e5ff]/10 bg-[#00141e] overflow-hidden"
                style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.6)" }}
              >
                {/* Animated tron top shimmer */}
                <div className="absolute top-0 left-0 right-0 h-px tron-line opacity-70" />

                <div className="text-6xl font-black text-white/6 leading-none select-none mb-1">&ldquo;</div>
                <p className="text-lg md:text-xl text-[#b0e0f0] leading-relaxed mb-8 -mt-2 font-light">
                  {TESTIMONIALS[current].text}
                </p>

                <div className="divider-tron mb-6" />

                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 bg-gradient-to-br ${AVATAR_GRADIENTS[current]}`}
                    style={{ boxShadow: "0 0 20px rgba(0,229,255,0.2)" }}
                  >
                    {TESTIMONIALS[current].avatar}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{TESTIMONIALS[current].name}</p>
                    <p className="text-[#4a7a8a] text-sm font-mono">
                      {TESTIMONIALS[current].role} · {TESTIMONIALS[current].company}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className="text-[#00e5ff] text-sm">★★★★★</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation dots */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Ir al testimonio ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? "w-6 h-1.5 btn-tron"
                    : "w-1.5 h-1.5 bg-white/15 hover:bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Mini cards */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.button
              key={t.id}
              onClick={() => go(i)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative text-left p-4 rounded-xl border transition-all duration-300 ${
                i === current
                  ? "border-[#00e5ff]/25 bg-[#00e5ff]/4"
                  : "border-[#00e5ff]/8 bg-[#00141e] hover:border-[#00e5ff]/18"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 bg-gradient-to-br ${AVATAR_GRADIENTS[i]}`}
                >
                  {t.avatar}
                </div>
                <span className="text-white text-xs font-medium truncate">{t.name}</span>
              </div>
              <p className="text-[#4a7a8a] text-xs font-mono">{t.company}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
