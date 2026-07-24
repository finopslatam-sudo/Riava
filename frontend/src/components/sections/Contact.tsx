"use client"

import { useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { FadeIn } from "@/components/animations/FadeIn"
import { SERVICES } from "@/lib/constants"

type Status = "idle" | "sending" | "success" | "error"

const WHATSAPP_NUMBER = "56965090121"

type ContactFormData = {
  firstName: string
  lastName: string
  email: string
  phone: string
  service: string
  message: string
}

const EMPTY_FORM: ContactFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  service: "",
  message: "",
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle")
  const [form, setForm] = useState<ContactFormData>(EMPTY_FORM)
  const [showValidation, setShowValidation] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const isValid =
    form.firstName.trim() !== "" &&
    form.lastName.trim() !== "" &&
    form.email.trim() !== "" &&
    form.phone.trim() !== "" &&
    form.service !== "" &&
    form.message.trim() !== ""

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValid) {
      setShowValidation(true)
      return
    }
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus("success")
      setForm(EMPTY_FORM)
      setShowValidation(false)
    } catch {
      setStatus("error")
    }
  }

  const handleWhatsAppSubmit = () => {
    if (!isValid) {
      setShowValidation(true)
      return
    }
    const text = [
      `Hola, soy ${form.firstName} ${form.lastName}.`,
      `Quiero cotizar: ${form.service}`,
      `Correo: ${form.email}`,
      `Teléfono: ${form.phone}`,
      "",
      form.message,
    ].join("\n")
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const inputClass =
    "w-full px-4 py-3 rounded-lg bg-[#060612] border border-white/8 text-white placeholder-[#1e2a3a] focus:outline-none focus:border-[#00e5ff]/40 transition-all duration-200 text-sm"
  const labelClass =
    "block text-xs font-mono text-[#475569] mb-2 tracking-[0.12em] uppercase"

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
                  <h3 className="text-white text-2xl font-black mb-2">¡Mensaje enviado!</h3>
                  <p className="text-[#64748b] font-mono text-sm">Te responderemos dentro de 24 horas.</p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="mt-8 text-sm font-mono text-[#475569] hover:text-[#00e5ff] transition-colors"
                  >
                    Enviar otro mensaje →
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-6" noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className={labelClass}>Nombre</label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Juan"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className={labelClass}>Apellido</label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Pérez"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>Correo electrónico</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="juan@empresa.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className={labelClass}>Teléfono / WhatsApp</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+56 9 1234 5678"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="service" className={labelClass}>Servicio que deseas cotizar</label>
                    <select
                      id="service"
                      name="service"
                      value={form.service}
                      onChange={handleChange}
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="" disabled className="bg-[#060612]">Selecciona un servicio</option>
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title} className="bg-[#060612]">
                          {s.title}
                        </option>
                      ))}
                      <option value="Otro" className="bg-[#060612]">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className={labelClass}>Mensaje</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe tu proyecto..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  {showValidation && !isValid && (
                    <p className="text-red-400 text-xs font-mono text-center">
                      Completa todos los campos antes de enviar.
                    </p>
                  )}

                  {status === "error" && (
                    <p className="text-red-400 text-xs font-mono text-center">
                      Error al enviar. Intenta nuevamente o escríbenos a contacto@riava.cl
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        "Enviar por correo →"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleWhatsAppSubmit}
                      className="w-full py-4 font-semibold text-sm text-white rounded-xl border border-[#25D366]/40 bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12.004 2C6.477 2 2 6.477 2 12c0 1.85.505 3.58 1.383 5.06L2 22l5.06-1.332A9.94 9.94 0 0012.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.16a8.13 8.13 0 01-4.15-1.14l-.297-.176-3.098.813.827-3.02-.193-.31A8.14 8.14 0 013.84 12c0-4.507 3.657-8.164 8.164-8.164S20.168 7.493 20.168 12 16.511 20.16 12.004 20.16z" />
                      </svg>
                      Enviar por WhatsApp
                    </button>
                  </div>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
