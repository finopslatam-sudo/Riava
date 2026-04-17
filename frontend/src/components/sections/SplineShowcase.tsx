"use client"

import { motion } from "framer-motion"

import { FadeIn } from "@/components/animations/FadeIn"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import { SplineScene } from "@/components/ui/splite"

const PLATFORM_POINTS = [
  "SaaS dashboards that feel premium from first click",
  "Automations mapped as real operating systems, not hacked scripts",
  "Cloud architecture designed for speed, resilience, and control",
]

const PLATFORM_STATS = [
  { label: "Launches accelerated", value: "3x faster" },
  { label: "Manual work removed", value: "80% fewer tasks" },
  { label: "Cloud savings visibility", value: "Real-time insight" },
]

export function SplineShowcase() {
  return (
    <section className="relative overflow-hidden bg-[#000a0f] py-28">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,255,0.55), rgba(240,0,255,0.25), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-12 h-[420px] w-[900px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0,229,255,0.09) 0%, rgba(240,0,255,0.05) 35%, transparent 72%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <span className="badge-tron mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-widest uppercase">
              Interactive Product Layer
            </span>
            <h2 className="mb-5 text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
              Make the website feel as advanced as the{" "}
              <span className="text-tron">systems you build</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-[#7ab8c8]">
              This section turns RIAVA&apos;s positioning into something tangible:
              motion, depth, and a cleaner product narrative without losing the
              current cyber-tech identity.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.12}>
          <Card
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#02070d] shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
          >
            <Spotlight
              className="-top-36 left-0 md:left-56 md:-top-24"
              fill="#8bf7ff"
            />

            <div className="relative z-10 grid min-h-[720px] lg:min-h-[620px] lg:grid-cols-[1.05fr_0.95fr]">
              <div className="flex flex-col justify-between p-8 sm:p-10 lg:p-12">
                <div>
                  <div className="mb-6 flex flex-wrap gap-2">
                    {["Cloud-native", "Automation-led", "Enterprise UX"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#00e5ff]/15 bg-[#00e5ff]/6 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-[#9aefff]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>

                  <motion.h3
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl"
                  >
                    From pitch to platform, your digital presence should signal
                    speed, precision, and operational maturity.
                  </motion.h3>

                  <p className="mt-5 max-w-xl text-base font-light leading-8 text-[#8ab8c6] sm:text-lg">
                    The original component works, but adapted to RIAVA it becomes
                    a stronger trust section: clearer value proposition on the
                    left, interactive depth on the right, and a much richer visual
                    break between hero and proof sections.
                  </p>

                  <div className="mt-8 space-y-3">
                    {PLATFORM_POINTS.map((point, index) => (
                      <motion.div
                        key={point}
                        initial={{ opacity: 0, x: -18 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{
                          duration: 0.45,
                          delay: index * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="flex items-start gap-3 rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-3"
                      >
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#00e5ff] shadow-[0_0_18px_rgba(0,229,255,0.9)]" />
                        <span className="text-sm leading-7 text-[#c1e8f2] sm:text-[15px]">
                          {point}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 grid gap-3 sm:grid-cols-3">
                  {PLATFORM_STATS.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{
                        duration: 0.45,
                        delay: 0.08 + index * 0.07,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="rounded-2xl border border-white/8 bg-[#07111a]/90 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{stat.value}</p>
                      <p className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-[#5ea5b6]">
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden border-t border-white/6 lg:min-h-full lg:border-l lg:border-t-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,229,255,0.16),transparent_32%),radial-gradient(circle_at_75%_18%,rgba(240,0,255,0.14),transparent_28%),linear-gradient(180deg,rgba(2,7,13,0.2),rgba(2,7,13,0.9))]" />
                <div className="absolute inset-x-6 top-6 z-10 flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-4 py-3 backdrop-blur-md">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-[#90f3ff]">
                      RIAVA Control Layer
                    </p>
                    <p className="mt-1 text-sm text-[#c2ecf5]">
                      Interactive product storytelling with Spline
                    </p>
                  </div>
                  <span className="rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/8 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-[#a4f7ff]">
                    live scene
                  </span>
                </div>
                <SplineScene
                  scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                  className="h-full w-full"
                />
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </section>
  )
}
