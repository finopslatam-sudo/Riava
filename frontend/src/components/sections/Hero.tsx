"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import {
  motion,
  useReducedMotion,
} from "framer-motion"
import type { Application, SPEObject } from "@splinetool/runtime"

import { RiavaLogo } from "@/components/ui/RiavaLogo"
import { SplineScene } from "@/components/ui/splite"
import { TronGridBackground } from "@/components/ui/TronGridBackground"

const ROBOT_SCENE =
  "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"

type FollowTarget = {
  object: SPEObject
  baseRotation: { x: number; y: number; z: number }
  xFactor: number
  yFactor: number
  zFactor: number
}

export function Hero() {
  const prefersReducedMotion = useReducedMotion()
  const pointerRef = useRef({ x: 0, y: 0 })
  const targetsRef = useRef<FollowTarget[]>([])

  const rotationTargets = useMemo(
    () => [
      {
        patterns: [/^neck$/i, /neck/i],
        xFactor: 0.12,
        yFactor: 0.38,
        zFactor: 0.05,
      },
      {
        patterns: [/^head$/i, /^head 1$/i, /head/i],
        xFactor: 0.2,
        yFactor: 0.72,
        zFactor: 0.1,
      },
      {
        patterns: [/^head 2$/i, /eye/i, /pupil/i, /iris/i, /lookat/i],
        xFactor: 0.24,
        yFactor: 1.05,
        zFactor: 0.13,
      },
    ],
    [],
  )

  const setupRobotTargets = useCallback((app: Application) => {
    const objects = app.getAllObjects()
    const used = new Set<string>()

    targetsRef.current = rotationTargets.flatMap((config) => {
      const match = objects.find((object) => {
        if (used.has(object.uuid)) return false
        return config.patterns.some((pattern) => pattern.test(object.name))
      })

      if (!match) return []

      used.add(match.uuid)

      return [
        {
          object: match,
          baseRotation: {
            x: match.rotation.x,
            y: match.rotation.y,
            z: match.rotation.z,
          },
          xFactor: config.xFactor,
          yFactor: config.yFactor,
          zFactor: config.zFactor,
        },
      ]
    })
  }, [rotationTargets])

  const handleSplineLoad = useCallback((app: Application) => {
    app.setBackgroundColor("rgba(0, 0, 0, 0)")
    app.canvas.style.background = "transparent"
    setupRobotTargets(app)
  }, [setupRobotTargets])

  useEffect(() => {
    if (prefersReducedMotion) return

    const handleMouseMove = (event: MouseEvent) => {
      pointerRef.current = {
        x: Math.max(-1, Math.min(1, (event.clientX / window.innerWidth - 0.5) * 2)),
        y: Math.max(-1, Math.min(1, (event.clientY / window.innerHeight - 0.5) * 2)),
      }
    }

    const reset = () => {
      pointerRef.current = { x: 0, y: 0 }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", reset)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", reset)
    }
  }, [prefersReducedMotion])

  useEffect(() => {
    if (prefersReducedMotion) return

    let frame = 0

    const animate = () => {
      const { x, y } = pointerRef.current

      for (const target of targetsRef.current) {
        const desiredX = target.baseRotation.x + y * target.xFactor
        const desiredY = target.baseRotation.y + x * target.yFactor
        const desiredZ = target.baseRotation.z + x * target.zFactor

        target.object.rotation.x += (desiredX - target.object.rotation.x) * 0.22
        target.object.rotation.y += (desiredY - target.object.rotation.y) * 0.22
        target.object.rotation.z += (desiredZ - target.object.rotation.z) * 0.16
      }

      frame = window.requestAnimationFrame(animate)
    }

    frame = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(frame)
  }, [prefersReducedMotion])

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#000a0f]">
      <TronGridBackground />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,10,15,0.42) 0%, rgba(0,10,15,0.12) 40%, rgba(0,10,15,0.78) 100%)",
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(0,229,255,0.18),transparent_22%),radial-gradient(circle_at_78%_22%,rgba(240,0,255,0.12),transparent_18%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-4">
          <div className="order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8 inline-flex items-center gap-2.5 rounded-full badge-tron px-4 py-1.5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#00e5ff] animate-pulse" />
              <span className="text-xs font-mono tracking-widest uppercase">
                Soluciones SaaS, cloud y automatización
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 text-5xl leading-[1.02] font-black tracking-tight text-white sm:text-6xl md:text-7xl xl:text-[5.4rem]"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.8)" }}
            >
              Reduce costos, automatiza y
              <br />
              <span className="text-white">haz crecer tu negocio</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.38 }}
              className="mb-10 max-w-2xl text-lg leading-relaxed font-light text-[#7ab8c8] sm:text-xl"
            >
              En RIAVA creamos soluciones digitales que mejoran tu operación,
              optimizan tus costos y convierten más oportunidades en resultados.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.46 }}
              className="mb-8 flex flex-wrap gap-3"
            >
              {[
                "FinOps enterprise",
                "Automatización inteligente",
                "Web y SaaS orientado a conversión",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#00e5ff]/15 bg-[#00e5ff]/6 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.22em] text-[#9aefff]"
                >
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.52 }}
              className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-center"
            >
              <a
                href="#contact"
                className="btn-tron rounded-lg px-8 py-4 text-sm font-semibold tracking-wide text-white"
              >
                Solicitar información →
              </a>
              <a
                href="#services"
                className="rounded-lg border border-[#00e5ff]/15 px-8 py-4 text-sm font-semibold text-[#7ab8c8] transition-all duration-300 hover:border-[#00e5ff]/40 hover:bg-[#00e5ff]/5 hover:text-white"
              >
                Ver soluciones
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.72 }}
              className="flex flex-col gap-6 text-sm sm:flex-row sm:items-center"
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[
                    { initials: "CM", from: "#00e5ff", to: "#f000ff" },
                    { initials: "AR", from: "#f000ff", to: "#00ff88" },
                    { initials: "DF", from: "#00ff88", to: "#00e5ff" },
                    { initials: "MG", from: "#00e5ff", to: "#f000ff" },
                  ].map(({ initials, from, to }, i) => (
                    <div
                      key={initials}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#000a0f] text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${from}, ${to})`,
                        zIndex: 4 - i,
                      }}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-[#3d7080]">Más de 50 empresas confían en RIAVA</span>
              </div>
              <div className="hidden h-4 w-px bg-[#00e5ff]/15 sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-[#00e5ff]">★★★★★</span>
                <span className="text-[#3d7080]">Valoración promedio de 4.9</span>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-[760px]">
              <div className="pointer-events-none absolute inset-x-[18%] top-[14%] h-[42%] rounded-full bg-[#00e5ff]/20 blur-3xl" />
              <div className="pointer-events-none absolute inset-x-[22%] bottom-[14%] h-10 rounded-full bg-[#00e5ff]/20 blur-2xl" />

              <motion.div
                animate={
                  prefersReducedMotion
                    ? undefined
                    : { y: [0, -14, 0], scale: [1, 1.02, 1] }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: 5.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }
                }
                className="relative h-[380px] sm:h-[500px] lg:h-[640px]"
              >
                <div className="pointer-events-none absolute left-1/2 top-[58%] z-10 w-14 -translate-x-1/2 -translate-y-1/2 opacity-95 drop-shadow-[0_0_22px_rgba(0,229,255,0.4)] sm:w-16 lg:top-[57%] lg:w-20">
                  <RiavaLogo variant="mark" className="w-full" alt="Logo RIAVA en el pecho del robot" />
                </div>
                <SplineScene
                  scene={ROBOT_SCENE}
                  onLoad={handleSplineLoad}
                  className="h-full w-full scale-[1.16] bg-transparent lg:scale-[1.24]"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-10 w-px bg-gradient-to-b from-[#00e5ff]/60 to-transparent"
        />
        <span className="font-mono text-xs tracking-widest text-[#1a3040]">DESLIZA</span>
      </motion.div>
    </section>
  )
}
