"use client"

import { useRef, useState } from "react"
import { motion } from "framer-motion"
import s from "./page.module.css"

const BENEFITS = [
  { icon: "⚡", title: "Rápidas", desc: "Tiempos de carga mínimos para no perder ninguna conversión." },
  { icon: "📱", title: "Responsivas", desc: "Experiencia perfecta en cualquier dispositivo, de móvil a desktop." },
  { icon: "🎯", title: "Enfocadas en ventas", desc: "UI/UX diseñada estratégicamente para maximizar el ROI." },
  { icon: "🚀", title: "Alto rendimiento", desc: "Arquitectura moderna usando las últimas tecnologías web." },
  { icon: "🛡️", title: "Seguras", desc: "Protección robusta y estándares de seguridad integrados." },
]

const COLLAGE_ITEMS: { src: string; rot: number; top?: string; bottom?: string; left?: string; right?: string; width: string; zIndex: number; hasUi: boolean }[] = [
  { src: "/videos/paginas-web/video1.mp4", rot: -8, top: "10%", left: "5%",  width: "24vw", zIndex: 12, hasUi: true  },
  { src: "/videos/paginas-web/video2.mp4", rot:  4, top: "5%",  left: "32%", width: "22vw", zIndex: 10, hasUi: true  },
  { src: "/videos/paginas-web/video3.mp4", rot: 10, top: "15%", right: "5%", width: "24vw", zIndex: 13, hasUi: false },
  { src: "/videos/paginas-web/video4.mp4", rot: -5, top: "40%", left: "8%",  width: "20vw", zIndex: 11, hasUi: false },
  { src: "/videos/paginas-web/video5.mp4", rot:  0, top: "35%", left: "35%", width: "30vw", zIndex: 20, hasUi: true  },
  { src: "/videos/paginas-web/video6.mp4", rot:  7, top: "8%",  left: "56%", width: "20vw", zIndex: 12, hasUi: true  },
  { src: "/videos/paginas-web/video7.mp4", rot:  3, bottom: "10%", left: "15%",  width: "24vw", zIndex: 14, hasUi: false },
  { src: "/videos/paginas-web/video8.mp4", rot: -6, bottom: "5%",  left: "38%",  width: "22vw", zIndex: 15, hasUi: true  },
  { src: "/videos/paginas-web/video9.mp4", rot: -8, bottom: "15%", right: "15%", width: "24vw", zIndex: 16, hasUi: true  },
]

const PORTFOLIO = [
  { img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600&auto=format&fit=crop", title: "Fintech Dashboard", type: "App Web" },
  { img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop", title: "E-commerce Premium", type: "Desarrollo Web" },
  { img: "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=600&auto=format&fit=crop", title: "SaaS Analytics", type: "Software a medida" },
  { img: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=600&auto=format&fit=crop", title: "Agencia Creativa", type: "Landing Page" },
]

const TESTIMONIALS = [
  {
    stars: 5,
    review: "El equipo transformó por completo nuestra presencia digital. Las conversiones aumentaron un 150% en el primer mes.",
    name: "David Torres", role: "CEO, StartupTech",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    stars: 5,
    review: "Desarrollaron nuestra plataforma a medida de forma impecable. Rápidos, comunicativos y código de primer nivel.",
    name: "Laura Méndez", role: "Founder, DataFlow",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
]

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

export function CrearPaginasWebClient() {
  const heroVisualRef = useRef<HTMLDivElement>(null)
  const screenFrameRef = useRef<HTMLDivElement>(null)
  const [hoveredCollage, setHoveredCollage] = useState<number | null>(null)

  function handleFrameMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = heroVisualRef.current?.getBoundingClientRect()
    const frame = screenFrameRef.current
    if (!rect || !frame) return
    const rx = (((e.clientY - rect.top) / rect.height) - 0.5) * -15
    const ry = (((e.clientX - rect.left) / rect.width) - 0.5) * 15
    frame.style.transition = "transform 0.1s ease-out"
    frame.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`
  }

  function handleFrameLeave() {
    if (!screenFrameRef.current) return
    screenFrameRef.current.style.transition = "transform 0.5s ease"
    screenFrameRef.current.style.transform = ""
  }

  function handleCollageEnter(e: React.MouseEvent<HTMLDivElement>, i: number) {
    setHoveredCollage(i)
    const video = e.currentTarget.querySelector("video")
    video?.play().catch(() => {})
  }

  function handleCollageLeave(e: React.MouseEvent<HTMLDivElement>) {
    setHoveredCollage(null)
    const video = e.currentTarget.querySelector("video")
    if (video) video.pause()
  }

  return (
    <>
      {/* ── HERO ─────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroContainer}>
          <motion.div
            className={s.heroText}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.8 }}
          >
            <span className={s.badge}>Agencia de Desarrollo Web Premium</span>
            <h1 className={s.mainTitle}>
              Creamos páginas web que{" "}
              <br />
              <span className={s.textGradient}>generan clientes</span>
            </h1>
            <p className={s.subtitle}>
              Diseño moderno, alto rendimiento y enfoque en resultados. Transforma tu presencia digital hoy.
            </p>
            <div className={s.heroActions}>
              <a href="#contacto" className={s.btnPrimary}>Cotizar ahora</a>
              <a href="#portafolio" className={s.btnSecondary}>Ver proyectos</a>
            </div>
          </motion.div>

          <motion.div
            ref={heroVisualRef}
            className={s.heroVisual}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            onMouseMove={handleFrameMove}
            onMouseLeave={handleFrameLeave}
          >
            <div ref={screenFrameRef} className={s.screenFrame}>
              <div className={s.screenTopBar}>
                <div className={s.dots}>
                  <span /><span /><span />
                </div>
                <div className={s.urlBar}>riava.cl</div>
              </div>
              <div className={s.screenContent}>
                <video className={s.mockupVideo} muted loop autoPlay playsInline preload="auto">
                  <source src="/videos/paginas-web/video.mp4" type="video/mp4" />
                </video>
                <div className={s.screenOverlay} />
                <div className={s.mockupUi}>
                  <div className={s.mockupHeader}>
                    <span className={s.mockupLogo}>
                      <span className={s.mockupLogoAccent}>RIAVA</span>
                    </span>
                    <div className={s.mockupNav}>
                      <span className={s.mockupLink}>Servicios</span>
                      <span className={s.mockupLink}>Nosotros</span>
                      <span className={s.mockupLink}>Contacto</span>
                    </div>
                  </div>
                  <div className={s.mockupFooter}>
                    <span className={s.mockupBtnPrimary}>Cotizar ahora</span>
                    <span className={s.mockupBtnSecondary}>Proyectos</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── BENEFITS ─────────────────────────── */}
      <section className={s.section}>
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <h2>¿Por qué elegirnos?</h2>
            <p>Construimos plataformas preparadas para escalar</p>
          </motion.div>

          <div className={s.benefitsGrid}>
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                className={s.benefitCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className={s.iconWrapper}>{b.icon}</div>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO COLLAGE ─────────────────────── */}
      <section className={s.collageSection}>
        <div className={s.collageHeader}>
          <span className={s.collageGalleryTag}>Galería de proyectos</span>
        </div>
        <div className={s.collageWrapper}>
          {COLLAGE_ITEMS.map((item, i) => (
            <div
              key={i}
              className={`${s.collageItem} ${hoveredCollage === i ? s.collageItemHovered : ""}`}
              style={{
                top: item.top,
                bottom: item.bottom,
                left: item.left,
                right: item.right,
                width: item.width,
                zIndex: hoveredCollage === i ? 50 : item.zIndex,
                transform: hoveredCollage === i
                  ? `scale(1.15) rotate(${item.rot}deg)`
                  : `rotate(${item.rot}deg)`,
              }}
              onMouseEnter={(e) => handleCollageEnter(e, i)}
              onMouseLeave={handleCollageLeave}
            >
              <div className={s.collageBrowserFrame}>
                <div className={s.collageBrowserBar}>
                  <div className={s.dots}>
                    <span /><span /><span />
                  </div>
                  <div className={s.collageUrlBar}>riava.cl</div>
                </div>
                <div className={s.collageVideoContainer}>
                  <video muted loop playsInline autoPlay preload="auto">
                    <source src={item.src} type="video/mp4" />
                  </video>
                  {item.hasUi && (
                    <div className={s.collagePageUi}>
                      <div className={s.collagePageHeader}>
                        <span className={s.collagePageLogo}>
                          <span className={s.collagePageLogoAccent}>RIAVA</span>
                        </span>
                        <div className={s.collagePageNav}>
                          <span>Servicios</span>
                          <span>Nosotros</span>
                          <span>Contacto</span>
                        </div>
                      </div>
                      <div className={s.collagePageFooter}>
                        <span className={s.collagePageBtnPrimary}>Cotizar ahora</span>
                        <span className={s.collagePageBtnSecondary}>Proyectos</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PORTFOLIO ─────────────────────────── */}
      <section className={s.portfolio} id="portafolio">
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <h2>Proyectos Destacados</h2>
            <p>Trabajos recientes con nuestros clientes</p>
          </motion.div>
        </div>
        <div className={s.portfolioCarousel}>
          <div className={s.portfolioTrack}>
            {PORTFOLIO.map((p) => (
              <div key={p.title} className={s.portfolioItem}>
                <div className={s.mockup3d}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.img} alt={p.title} />
                </div>
                <div className={s.portfolioInfo}>
                  <h4>{p.title}</h4>
                  <span>{p.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────── */}
      <section className={s.section}>
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.6 }}
          >
            <h2>Lo que dicen nuestros clientes</h2>
          </motion.div>
          <div className={s.testimonialsGrid}>
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className={s.testimonialCard}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ duration: 0.6, delay: i * 0.15 }}
              >
                <div className={s.stars}>{"★".repeat(t.stars)}</div>
                <p className={s.review}>"{t.review}"</p>
                <div className={s.clientInfo}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={t.avatar} alt={t.name} className={s.avatarImg} />
                  <div>
                    <h4>{t.name}</h4>
                    <span>{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────── */}
      <section className={s.finalCta} id="contacto">
        <div className={s.container}>
          <motion.div
            className={s.ctaBox}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.7 }}
          >
            <div className={s.ctaBlob} />
            <h2>
              Tu negocio necesita una web que{" "}
              <span className={s.textGradient}>convierta</span>
            </h2>
            <p>
              No pierdas más clientes por una página lenta o desactualizada. Hablemos hoy mismo.
            </p>
            <a href="mailto:contacto@riava.cl" className={s.btnPrimary}>
              Empieza hoy ✉️
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
