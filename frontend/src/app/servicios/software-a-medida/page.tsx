import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Software a Medida | RIAVA",
  description: "Desarrollamos soluciones de software personalizadas para las necesidades específicas de tu empresa.",
}

const data: ServiceLandingProps = {
  badge: "Software a Medida · Desarrollo Custom",
  titleBefore: "Software diseñado exactamente",
  titleHighlight: "para tu negocio",
  subtitle:
    "Cuando las soluciones genéricas no alcanzan, construimos la tuya. Aplicaciones web, APIs, integraciones y sistemas internos que encajan perfectamente con tus procesos y escalan contigo.",
  heroImage: "/services/software_medida.png",
  accentColor: "#00e5ff",
  stats: [
    { value: "100%", label: "Personalizado", position: "topLeft" },
    { value: "0→∞", label: "Escalable", position: "bottomRight" },
  ],
  features: [
    { icon: "🎯", title: "Análisis de requerimientos", desc: "Entendemos a fondo tus procesos, usuarios y objetivos antes de escribir una sola línea de código." },
    { icon: "🏗️", title: "Arquitectura sólida", desc: "Sistemas diseñados para durar: modulares, testeados, documentados y fáciles de mantener." },
    { icon: "🔌", title: "Integraciones API", desc: "Conectamos tu software con cualquier sistema externo: ERPs, CRMs, pasarelas de pago, servicios cloud." },
    { icon: "🚀", title: "Entrega iterativa", desc: "Metodología ágil con entregas cada 2 semanas para que veas avances desde el primer sprint." },
    { icon: "🔒", title: "Seguridad por diseño", desc: "OWASP Top 10, autenticación robusta, encriptación y auditorías de seguridad en cada entrega." },
    { icon: "📖", title: "Transferencia de conocimiento", desc: "Documentación completa y capacitación para que tu equipo pueda gestionar y evolucionar el sistema." },
  ],
  steps: [
    { num: "01", title: "Descubrimiento", desc: "Talleres con tu equipo para mapear procesos, definir requerimientos y alinear expectativas técnicas y de negocio." },
    { num: "02", title: "Diseño y arquitectura", desc: "Prototipo interactivo, arquitectura técnica y plan de proyecto detallado antes de empezar el desarrollo." },
    { num: "03", title: "Desarrollo ágil", desc: "Sprints de 2 semanas con demos continuas. Tú validas cada módulo antes de avanzar al siguiente." },
    { num: "04", title: "Lanzamiento y soporte", desc: "Deploy en producción, monitoreo post-lanzamiento y plan de soporte para los primeros meses de operación." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=1200&auto=format&fit=crop",
      caption: "Desarrollo de software",
    },
    {
      img: "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=800&auto=format&fit=crop",
      caption: "Arquitectura de sistemas",
    },
    {
      img: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=800&auto=format&fit=crop",
      caption: "APIs e integraciones",
    },
  ],
  ctaTitle: "Tu proceso único merece un",
  ctaHighlight: "software único",
  ctaDesc: "Cuéntanos tu desafío. En 48 horas te presentamos un enfoque técnico sin compromiso.",
}

export default function SoftwareAMedidaPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
