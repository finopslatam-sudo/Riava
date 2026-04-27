"use client"

import { motion } from "framer-motion"

const EXAMPLES = [
  {
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    label: "Producto · Imagen",
    category: "Zapatillas",
    type: "image",
  },
  {
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop",
    label: "Gastronomía · Video",
    category: "Restaurante",
    type: "video",
  },
  {
    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
    label: "Belleza · Imagen",
    category: "Cosmética",
    type: "image",
  },
  {
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    label: "Lujo · Video",
    category: "Relojes",
    type: "video",
  },
  {
    img: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
    label: "Moda · Imagen",
    category: "Retail",
    type: "image",
  },
  {
    img: "https://images.unsplash.com/photo-1526045612212-70caf35c14df?q=80&w=1200&auto=format&fit=crop",
    label: "Alimentos · Video",
    category: "Food styling",
    type: "video",
  },
  {
    img: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1200&auto=format&fit=crop",
    label: "Lifestyle · Imagen",
    category: "Calzado",
    type: "image",
  },
  {
    img: "https://images.unsplash.com/photo-1611162617263-4ec3d744e816?q=80&w=1200&auto=format&fit=crop",
    label: "Digital · Video",
    category: "Redes sociales",
    type: "video",
  },
]

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

export function ContenidoIaExamples() {
  return (
    <section style={{ background: "#000a0f", padding: "80px 0 96px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", marginBottom: 48 }}
        >
          <span style={{
            display: "inline-block",
            padding: "6px 16px",
            borderRadius: 999,
            border: "1px solid rgba(240,0,255,0.35)",
            color: "#f000ff",
            background: "rgba(240,0,255,0.08)",
            fontSize: 11,
            fontFamily: "monospace",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}>
            Ejemplos de contenido generado con IA
          </span>
          <h2 style={{
            color: "#fff",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 700,
            margin: "0 0 16px",
            letterSpacing: "-0.02em",
          }}>
            Imágenes y videos que{" "}
            <span style={{
              background: "linear-gradient(90deg, #f000ff, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              detienen el scroll
            </span>
          </h2>
          <p style={{ color: "#64748b", fontSize: "1rem", maxWidth: 520, margin: "0 auto" }}>
            Contenido publicitario de alto impacto creado con IA, listo para Instagram, TikTok, Facebook Ads y más.
          </p>
        </motion.div>

        {/* Grid de ejemplos */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 16,
        }}>
          {EXAMPLES.map((ex, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              style={{
                position: "relative",
                borderRadius: 16,
                overflow: "hidden",
                aspectRatio: i % 3 === 0 ? "4/5" : "1/1",
                border: "1px solid rgba(240,0,255,0.12)",
                cursor: "pointer",
              }}
              whileHover={{ scale: 1.02, borderColor: "rgba(240,0,255,0.45)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ex.img}
                alt={ex.category}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.4s ease",
                }}
              />

              {/* Overlay gradient */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,5,12,0.92) 0%, rgba(0,5,12,0.3) 45%, transparent 100%)",
              }} />

              {/* Icono video/imagen arriba derecha */}
              <div style={{
                position: "absolute",
                top: 12,
                right: 12,
                padding: "4px 10px",
                borderRadius: 999,
                background: ex.type === "video" ? "rgba(240,0,255,0.2)" : "rgba(0,229,255,0.15)",
                border: `1px solid ${ex.type === "video" ? "rgba(240,0,255,0.5)" : "rgba(0,229,255,0.4)"}`,
                fontSize: 10,
                fontFamily: "monospace",
                color: ex.type === "video" ? "#f000ff" : "#00e5ff",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}>
                {ex.type === "video" ? (
                  <>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                      <path d="M3 2l7 4-7 4V2z" />
                    </svg>
                    Video
                  </>
                ) : (
                  <>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="1" y="1" width="10" height="10" rx="1.5" />
                      <circle cx="4" cy="4" r="1" />
                      <path d="M1 8l3-3 2 2 2-2.5 3 3.5" />
                    </svg>
                    Imagen
                  </>
                )}
              </div>

              {/* Play button para videos */}
              {ex.type === "video" && (
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "rgba(240,0,255,0.25)",
                  border: "2px solid rgba(240,0,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backdropFilter: "blur(6px)",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#f000ff">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}

              {/* Info abajo */}
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "16px 16px 14px" }}>
                <div style={{
                  fontSize: 10,
                  fontFamily: "monospace",
                  color: "#f000ff",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}>
                  {ex.label}
                </div>
                <div style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600 }}>
                  {ex.category}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA debajo de los ejemplos */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            textAlign: "center",
            color: "#475569",
            fontSize: "0.85rem",
            marginTop: 32,
            fontFamily: "monospace",
            letterSpacing: "0.05em",
          }}
        >
          ✦ Los ejemplos son referenciales — tu contenido se crea 100% personalizado para tu marca ✦
        </motion.p>
      </div>
    </section>
  )
}
