"use client"

import { motion } from "framer-motion"

const PLATFORMS = [
  { name: "Instagram", icon: "📸" },
  { name: "TikTok", icon: "🎵" },
  { name: "Facebook Ads", icon: "📢" },
  { name: "YouTube", icon: "▶️" },
  { name: "Pinterest", icon: "📌" },
  { name: "LinkedIn", icon: "💼" },
]

const EXAMPLES = [
  {
    img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop",
    concept: "Zapatillas levitando en la Luna",
    desc: "El producto flota sobre la superficie lunar con la Tierra de fondo — imposible de fotografiar, posible con IA.",
    category: "Calzado · Producto",
    type: "image",
    accent: "#f000ff",
    wide: true,
  },
  {
    img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=1200&auto=format&fit=crop",
    concept: "Luna y espacio de fondo",
    desc: "Ambientes espaciales fotorrealistas como escenario publicitario.",
    category: "Escenografía · IA",
    type: "image",
    accent: "#8b5cf6",
    wide: false,
  },
  {
    img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop",
    concept: "Perro con moño corriendo entre las nubes",
    desc: "Mascota con accesorios corriendo en un cielo de ensueño — ternura con impacto visual garantizado.",
    category: "Mascotas · Lifestyle",
    type: "video",
    accent: "#00e5ff",
    wide: false,
  },
  {
    img: "https://images.unsplash.com/photo-1503236823255-94609f598e71?q=80&w=1200&auto=format&fit=crop",
    concept: "Maquillaje explosivo con frutas y algodones",
    desc: "Una explosión de color, texturas y elementos visuales que hace que el scroll se detenga al instante.",
    category: "Belleza · Cosmética",
    type: "video",
    accent: "#f000ff",
    wide: true,
  },
  {
    img: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?q=80&w=1200&auto=format&fit=crop",
    concept: "Frutas y colores saturados",
    desc: "Paletas de color ultra vivas que potencian el mensaje de tu marca en cualquier plataforma.",
    category: "Alimentos · Lifestyle",
    type: "image",
    accent: "#00ff88",
    wide: false,
  },
  {
    img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
    concept: "Arte generativo de marca",
    desc: "Identidad visual AI-first: cada pieza es única, coherente con tu marca y diseñada para convertir.",
    category: "Branding · Digital",
    type: "image",
    accent: "#8b5cf6",
    wide: false,
  },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

export function ContenidoIaExamples() {
  return (
    <section style={{ background: "#000a0f", padding: "80px 0 100px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Mensaje principal de plataformas ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: "center",
            marginBottom: 64,
            padding: "48px 32px",
            borderRadius: 24,
            border: "1px solid rgba(240,0,255,0.18)",
            background: "linear-gradient(135deg, rgba(240,0,255,0.05) 0%, rgba(139,92,246,0.06) 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* glow blob */}
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(240,0,255,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <span style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 999,
            border: "1px solid rgba(240,0,255,0.4)",
            color: "#f000ff",
            background: "rgba(240,0,255,0.1)",
            fontSize: 11,
            fontFamily: "monospace",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 24,
          }}>
            Publicidad digital con IA
          </span>

          <h2 style={{
            color: "#fff",
            fontSize: "clamp(1.7rem, 3.5vw, 2.6rem)",
            fontWeight: 800,
            margin: "0 0 20px",
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}>
            Creamos imágenes y videos comerciales{" "}
            <span style={{
              background: "linear-gradient(90deg, #f000ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              que venden
            </span>
          </h2>

          <p style={{
            color: "#94a3b8",
            fontSize: "1.1rem",
            maxWidth: 600,
            margin: "0 auto 36px",
            lineHeight: 1.65,
          }}>
            Contenido publicitario de alto impacto generado con inteligencia artificial —
            escenas imposibles de fotografiar, creatividades llamativas y videos animados
            diseñados para convertir en redes sociales.
          </p>

          {/* Plataformas */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}>
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#cbd5e1",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 15 }}>{p.icon}</span>
                {p.name}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Título sección ejemplos ── */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          <h3 style={{
            color: "#fff",
            fontSize: "clamp(1.3rem, 2.5vw, 1.9rem)",
            fontWeight: 700,
            margin: "0 0 10px",
            letterSpacing: "-0.02em",
          }}>
            Ejemplos del tipo de contenido que creamos
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
            Cada imagen y video es único, personalizado y diseñado para tu marca y audiencia
          </p>
        </motion.div>

        {/* ── Grid de ejemplos ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "280px",
          gap: 14,
        }}>
          {EXAMPLES.map((ex, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              style={{
                position: "relative",
                borderRadius: 18,
                overflow: "hidden",
                border: `1px solid ${ex.accent}25`,
                gridColumn: ex.wide ? "span 2" : "span 1",
                cursor: "pointer",
              }}
              whileHover={{ scale: 1.015 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ex.img}
                alt={ex.concept}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />

              {/* Overlay */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,5,12,0.95) 0%, rgba(0,5,12,0.4) 50%, rgba(0,5,12,0.15) 100%)",
              }} />

              {/* Badge tipo arriba derecha */}
              <div style={{
                position: "absolute",
                top: 14,
                right: 14,
                display: "flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 12px",
                borderRadius: 999,
                background: `${ex.accent}22`,
                border: `1px solid ${ex.accent}55`,
                fontSize: 10,
                fontFamily: "monospace",
                color: ex.accent,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}>
                {ex.type === "video" ? (
                  <>
                    <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 2l7 4-7 4V2z" />
                    </svg>
                    Video
                  </>
                ) : (
                  <>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="1" y="1" width="10" height="10" rx="1.5" />
                      <circle cx="4" cy="4" r="1" fill="currentColor" stroke="none" />
                      <path d="M1 8l3-3 2 2 2-2.5 3 3.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Imagen
                  </>
                )}
              </div>

              {/* Play button en videos */}
              {ex.type === "video" && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: `${ex.accent}28`,
                  border: `2px solid ${ex.accent}80`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(8px)",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={ex.accent}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}

              {/* Info abajo */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px 20px 18px" }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  color: ex.accent,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}>
                  {ex.category}
                </div>
                <div style={{
                  color: "#f1f5f9",
                  fontSize: ex.wide ? 17 : 15,
                  fontWeight: 700,
                  marginBottom: 6,
                  letterSpacing: "-0.01em",
                }}>
                  {ex.concept}
                </div>
                <div style={{
                  color: "#94a3b8",
                  fontSize: 12.5,
                  lineHeight: 1.5,
                  display: ex.wide ? "block" : "none",
                }}>
                  {ex.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Nota al pie ── */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            textAlign: "center",
            color: "#334155",
            fontSize: "0.82rem",
            marginTop: 28,
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          ✦ Las imágenes de referencia son de Unsplash — tu contenido se genera 100% personalizado con IA para tu marca ✦
        </motion.p>

      </div>
    </section>
  )
}
