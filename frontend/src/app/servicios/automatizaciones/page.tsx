import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Automatizaciones | RIAVA",
  description: "Automatiza procesos repetitivos y mejora la eficiencia operativa de tu negocio con IA.",
}

const data: ServiceLandingProps = {
  badge: "Automatización · IA · RPA",
  titleBefore: "Elimina el trabajo repetitivo con",
  titleHighlight: "automatización inteligente",
  subtitle:
    "Conectamos tus sistemas, digitalizamos flujos de trabajo y desplegamos agentes de IA que trabajan 24/7 sin errores. Tu equipo se enfoca en lo que importa; la tecnología hace el resto.",
  heroImage: "/services/automatizacion.png",
  accentColor: "#00ff88",
  stats: [
    { value: "200h", label: "Ahorradas/mes", position: "topLeft" },
    { value: "99%", label: "Sin errores", position: "bottomRight" },
  ],
  features: [
    { icon: "🤖", title: "Agentes de IA", desc: "Bots inteligentes que procesan emails, atienden consultas y ejecutan tareas complejas de forma autónoma." },
    { icon: "🔗", title: "Integración de sistemas", desc: "Conectamos tu CRM, ERP, WhatsApp, email y cualquier aplicación para que trabajen en sincronía." },
    { icon: "📋", title: "Automatización de documentos", desc: "Extracción, clasificación y procesamiento automático de datos de formularios, PDFs y documentos." },
    { icon: "⚡", title: "Flujos sin código", desc: "Diseñamos flujos visuales con Make, n8n o Zapier según la complejidad del proceso." },
    { icon: "📊", title: "Reportes automáticos", desc: "Generación y envío automático de reportes personalizados a la frecuencia y formato que necesites." },
    { icon: "🛡️", title: "Monitoreo y alertas", desc: "Vigilancia continua de los flujos con notificaciones instantáneas ante cualquier falla o anomalía." },
  ],
  steps: [
    { num: "01", title: "Mapeo de procesos", desc: "Levantamos todos tus flujos actuales, identificamos los que más tiempo consumen y los de mayor impacto al automatizar." },
    { num: "02", title: "Diseño de la solución", desc: "Definimos la arquitectura técnica: qué herramientas, integraciones y lógica de negocio usará cada automatización." },
    { num: "03", title: "Desarrollo e integración", desc: "Construimos y conectamos todos los componentes, probamos con datos reales y ajustamos hasta que funcione perfecto." },
    { num: "04", title: "Monitoreo continuo", desc: "Panel de control con el estado de todos tus flujos, métricas de desempeño y soporte ante cualquier imprevisto." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop",
      caption: "Robótica e inteligencia artificial",
    },
    {
      img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=800&auto=format&fit=crop",
      caption: "Modelos de IA generativa",
    },
    {
      img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      caption: "Arquitectura de sistemas",
    },
  ],
  ctaTitle: "Tu competencia ya está",
  ctaHighlight: "automatizando",
  ctaDesc: "Cada hora que tu equipo pasa en tareas repetitivas es una oportunidad perdida. Empecemos a cambiar eso hoy.",
}

export default function AutomatizacionesPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
