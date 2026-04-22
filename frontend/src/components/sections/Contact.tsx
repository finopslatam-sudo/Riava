"use client"

import { useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/animations/FadeIn"

type Status = "idle" | "sending" | "success" | "error"

export function Contact() {
  const [status, setStatus] = useState<Status>("idle")
  const [form, setForm] = useState({ name: "", email: "", message: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setForm({ name: "", email: "", message: "" })
    } catch {
      setStatus("error")
    }
  }

  return (
    <section id="contact" className="relative py-28 bg-[#07091a] overflow-hidden">
      {/* Glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.07) 0%, transparent 70%)" }}
      />
      <div className="divider-tron absolute top-0 left-0 right-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <FadeIn direction="left">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-tron text-xs font-mono tracking-widest uppercase mb-8">
                Contacto
              </span>
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6">
                Inicia tu proyecto{" "}
                <span className="text-white">con nosotros</span>
              </h2>
              <p className="text-[#64748b] text-lg leading-relaxed mb-10 font-light">
                Cuéntanos tu desafío. Respondemos en menos de 24 horas con una propuesta a medida.
              </p>

              <div className="divider-tron mb-8" />

              <div className="space-y-5">
                {[
                  { label: "EMAIL", value: "contacto@riava.cl" },
                  { label: "WEB", value: "riava.cl" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-[#475569] w-12">{item.label}</span>
                    <span className="text-[#e2e8f0] font-mono text-sm">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {["Listo para empresas", "NDA disponible", "Respuesta en 24h", "Consultoría inicial"].map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 text-xs font-mono rounded-md border border-white/8 text-[#64748b] bg-white/3"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Right — Form */}
          <FadeIn direction="right" delay={0.1}>
            <div
              className="relative rounded-2xl border border-white/8 bg-[#0c0e24] p-8 overflow-hidden"
              style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-px tron-line" />

              {status === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 btn-tron"
                    style={{ boxShadow: "0 0 40px rgba(0,229,255,0.35)" }}
                  >
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-tron text-2xl font-black mb-2">¡Mensaje enviado!</h3>
                  <p className="text-[#64748b] font-mono text-sm">Te responderemos dentro de 24 horas.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-8 text-sm font-mono text-[#475569] hover:text-[#00e5ff] transition-colors"
                  >
                    Enviar otro mensaje →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {[
                    { id: "name", label: "Nombre completo", type: "text", placeholder: "Juan Pérez" },
                    { id: "email", label: "Correo electrónico", type: "email", placeholder: "juan@empresa.com" },
                  ].map((field) => (
                    <div key={field.id}>
                      <label
                        htmlFor={field.id}
                        className="block text-xs font-mono text-[#475569] mb-2 tracking-[0.12em] uppercase"
                      >
                        {field.label}
                      </label>
                      <input
                        id={field.id}
                        name={field.id}
                        type={field.type}
                        required
                        value={form[field.id as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        className="w-full px-4 py-3 rounded-lg bg-[#060612] border border-white/8 text-white placeholder-[#1e2a3a] focus:outline-none focus:border-[#00e5ff]/40 transition-all duration-200 text-sm"
                      />
                    </div>
                  ))}

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-xs font-mono text-[#475569] mb-2 tracking-[0.12em] uppercase"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe tu proyecto..."
                      className="w-full px-4 py-3 rounded-lg bg-[#060612] border border-white/8 text-white placeholder-[#1e2a3a] focus:outline-none focus:border-[#00e5ff]/40 transition-all duration-200 text-sm resize-none"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-400 text-xs font-mono text-center">
                      Error al enviar. Intenta nuevamente o escríbenos a contacto@riava.cl
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn-tron w-full py-4 font-semibold text-sm text-white rounded-xl disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      "Enviar mensaje →"
                    )}
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
