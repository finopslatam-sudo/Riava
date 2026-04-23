"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { NAV_LINKS } from "@/lib/constants"
import { RiavaLogo } from "@/components/ui/RiavaLogo"

const SERVICE_LINKS = [
  { label: "Crear páginas web", href: "/servicios/crear-paginas-web", icon: "🌐" },
  { label: "Automatizaciones", href: "/servicios/automatizaciones", icon: "🤖" },
  { label: "Reserva de citas", href: "/servicios/reserva-de-citas", icon: "📅" },
  { label: "Desarrollo SaaS", href: "/servicios/desarrollo-saas", icon: "🚀" },
  { label: "Software a medida", href: "/servicios/software-a-medida", icon: "⚙️" },
  { label: "FinOps Cloud AWS", href: "/servicios/finops-cloud-aws", icon: "💰" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  function openDropdown() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setDropdownOpen(true)
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setDropdownOpen(false), 150)
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-tron border-b border-[#00e5ff]/8"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <a href="/" className="group">
            <RiavaLogo className="h-10 sm:h-12 w-auto" />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) =>
              link.label === "Servicios" ? (
                <div
                  key={link.href}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={openDropdown}
                  onMouseLeave={scheduleClose}
                >
                  <button
                    className="flex items-center gap-1 px-4 py-2 text-sm text-[#64748b] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                  >
                    {link.label}
                    <svg
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.18 }}
                        onMouseEnter={openDropdown}
                        onMouseLeave={scheduleClose}
                        className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-[#00e5ff]/15 glass-tron py-2 shadow-xl shadow-black/40"
                      >
                        {SERVICE_LINKS.map((service) => (
                          <a
                            key={service.href}
                            href={service.href}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#94a3b8] hover:text-white hover:bg-white/5 transition-all duration-150"
                          >
                            <span className="text-base">{service.icon}</span>
                            {service.label}
                          </a>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm text-[#64748b] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center">
            <a
              href="#contact"
              className="btn-tron px-5 py-2.5 text-sm font-semibold text-white rounded-lg"
            >
              Solicitar información
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-[#00e5ff]"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
          >
            <div className="w-5 space-y-1.5">
              <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2.5" : ""}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2.5" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden glass-tron border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) =>
                link.label === "Servicios" ? (
                  <div key={link.href}>
                    <button
                      onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                      className="flex items-center justify-between w-full px-4 py-3 text-sm text-[#64748b] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      {link.label}
                      <svg
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${mobileServicesOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>

                    <AnimatePresence>
                      {mobileServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4"
                        >
                          {SERVICE_LINKS.map((service) => (
                            <a
                              key={service.href}
                              href={service.href}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#64748b] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                            >
                              <span className="text-base">{service.icon}</span>
                              {service.label}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-[#64748b] hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {link.label}
                  </a>
                )
              )}
              <a
                href="#contact"
                onClick={() => setMenuOpen(false)}
                className="block mt-2 px-4 py-3 text-sm font-semibold text-center text-white btn-tron rounded-lg"
              >
                Solicitar información
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
