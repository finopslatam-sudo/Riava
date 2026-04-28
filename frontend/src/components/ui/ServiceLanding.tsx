"use client"

import { motion } from "framer-motion"
import s from "./service-landing.module.css"

export interface FloatingStat {
  value: string
  label: string
  position: "topLeft" | "topRight" | "bottomLeft" | "bottomRight"
}

export interface Feature {
  icon: string
  title: string
  desc: string
}

export interface Step {
  num: string
  title: string
  desc: string
}

export interface ShowcaseItem {
  img: string
  caption: string
}

export interface ServiceLandingProps {
  badge: string
  titleBefore: string
  titleHighlight: string
  titleAfter?: string
  subtitle: string
  heroImage: string
  heroVideo?: string
  accentColor: string
  stats: FloatingStat[]
  features: Feature[]
  steps: Step[]
  showcase: ShowcaseItem[]
  ctaTitle: string
  ctaHighlight: string
  ctaDesc: string
  ctaHref?: string
}

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }

const gradientText: React.CSSProperties = {
  background: "linear-gradient(90deg, #00E5FF, #8b5cf6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

export function ServiceLanding({
  badge, titleBefore, titleHighlight, titleAfter,
  subtitle, heroImage, heroVideo, accentColor,
  stats, features, steps, showcase,
  ctaTitle, ctaHighlight, ctaDesc,
  ctaHref = "mailto:contacto@riava.cl",
}: ServiceLandingProps) {
  return (
    <>
      {/* ── HERO ─────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroContainer}>
          <motion.div
            className={s.heroText}
            initial="hidden" animate="visible" variants={fadeUp}
            transition={{ duration: 0.8 }}
          >
            <span
              className={s.badge}
              style={{ borderColor: `${accentColor}50`, color: accentColor, background: `${accentColor}14` }}
            >
              {badge}
            </span>
            <h1 className={s.mainTitle}>
              {titleBefore}{" "}
              <span style={gradientText}>{titleHighlight}</span>
              {titleAfter ? ` ${titleAfter}` : ""}
            </h1>
            <p className={s.subtitle}>{subtitle}</p>
            <div className={s.heroActions}>
              <a href="#contacto" className={s.btnPrimary}>Cotizar ahora</a>
              <a href="#como-funciona" className={s.btnSecondary}>Cómo funciona</a>
            </div>
          </motion.div>

          <motion.div
            className={s.heroVisual}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
          >
            <div className={s.imageFrame} style={{ borderColor: `${accentColor}35` }}>
              {heroVideo ? (
                <video
                  src={heroVideo}
                  className={s.heroImg}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt={badge} className={s.heroImg} />
              )}
              <div className={s.imageOverlay} />
              <div className={s.scanlines} />
              <div
                className={s.imageGlow}
                style={{ background: `radial-gradient(ellipse at 50% 50%, ${accentColor}22 0%, transparent 70%)` }}
              />
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className={`${s.floatingStat} ${s[stat.position]}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.15 }}
                  style={{ borderColor: `${accentColor}35`, background: "rgba(2,8,19,0.88)" }}
                >
                  <span className={s.statValue} style={{ color: accentColor }}>{stat.value}</span>
                  <span className={s.statLabel}>{stat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────── */}
      <section className={s.section}>
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2>¿Por qué elegirnos?</h2>
            <p>Soluciones diseñadas para generar resultados reales</p>
          </motion.div>
          <div className={s.featuresGrid}>
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                className={s.featureCard}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ borderColor: `${accentColor}18` }}
              >
                <div className={s.featureIcon} style={{ background: `${accentColor}14`, color: accentColor }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────── */}
      <section className={s.stepsSection} id="como-funciona">
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2>Cómo funciona</h2>
            <p>Un proceso claro de principio a fin</p>
          </motion.div>
          <div className={s.stepsGrid}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className={s.stepCard}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.6, delay: i * 0.12 }}
              >
                <span
                  className={s.stepNum}
                  style={{ color: accentColor, borderColor: `${accentColor}35` }}
                >
                  {step.num}
                </span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ─────────────────────────── */}
      <section className={s.showcase}>
        <div className={s.container}>
          <motion.div
            className={s.sectionHeader}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2>Tecnología en acción</h2>
            <p>Herramientas de vanguardia aplicadas a casos reales</p>
          </motion.div>
          <div className={s.showcaseGrid}>
            {showcase.map((item, i) => (
              <motion.div
                key={i}
                className={s.showcaseItem}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.6, delay: i * 0.1 }}
                style={{ borderColor: `${accentColor}22` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.img} alt={item.caption} className={s.showcaseImg} />
                <div
                  className={s.showcaseOverlay}
                  style={{ background: "linear-gradient(to top, rgba(2,8,19,0.9) 0%, rgba(2,8,19,0.25) 50%, transparent 100%)" }}
                />
                <span className={s.showcaseCaption} style={{ color: accentColor }}>
                  {item.caption}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section className={s.finalCta} id="contacto">
        <div className={s.container}>
          <motion.div
            className={s.ctaBox}
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.7 }}
            style={{ borderColor: `${accentColor}25` }}
          >
            <div
              className={s.ctaBlob}
              style={{ background: `radial-gradient(ellipse at 50% 100%, ${accentColor}18 0%, transparent 70%)` }}
            />
            <h2>
              {ctaTitle}{" "}
              <span style={gradientText}>{ctaHighlight}</span>
            </h2>
            <p>{ctaDesc}</p>
            <div className={s.ctaBtnWrapper}>
              <a
                href={ctaHref}
                className={s.ctaBtn}
                style={{ background: accentColor }}
              >
                Empieza hoy ✉️
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
