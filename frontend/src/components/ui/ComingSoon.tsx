"use client"

import { motion } from "framer-motion"

type ComingSoonProps = {
  service: string
  icon: string
}

export function ComingSoon({ service, icon }: ComingSoonProps) {
  return (
    <section
      style={{
        minHeight: "100vh",
        background: "#020813",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 2rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.07) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 75%)",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 75%)",
          pointerEvents: "none",
        }}
      />

      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: "center", position: "relative", zIndex: 1, maxWidth: "600px" }}
      >
        {/* Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: "5rem", marginBottom: "2rem", display: "block" }}
        >
          🚧
        </motion.div>

        {/* Service icon + name */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.4rem 1.2rem",
            borderRadius: "50px",
            background: "rgba(0,229,255,0.08)",
            border: "1px solid rgba(0,229,255,0.25)",
            color: "#00E5FF",
            fontSize: "0.8rem",
            fontWeight: 600,
            letterSpacing: "1.5px",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          <span>{icon}</span>
          <span>{service}</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.15,
            marginBottom: "1.2rem",
          }}
        >
          Página en{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #00E5FF, #8b5cf6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            construcción
          </span>
        </h1>

        <p
          style={{
            fontSize: "1.05rem",
            color: "#8892b0",
            lineHeight: 1.7,
            marginBottom: "2.5rem",
          }}
        >
          Estamos preparando algo increíble para este servicio.
          <br />
          Mientras tanto, puedes contactarnos directamente.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="mailto:contacto@riava.cl"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2rem",
              borderRadius: "50px",
              fontWeight: 700,
              fontSize: "0.95rem",
              background: "#fff",
              color: "#000",
              textDecoration: "none",
            }}
          >
            Contactar ahora ✉️
          </a>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.9rem 2rem",
              borderRadius: "50px",
              fontWeight: 600,
              fontSize: "0.95rem",
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              border: "1px solid rgba(0,229,255,0.2)",
              textDecoration: "none",
            }}
          >
            ← Volver al inicio
          </a>
        </div>
      </motion.div>
    </section>
  )
}
