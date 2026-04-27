import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Desarrollo SaaS | RIAVA",
  description: "Desarrollamos tu producto SaaS desde cero con arquitectura moderna y enfoque en crecimiento.",
}

const data: ServiceLandingProps = {
  badge: "Desarrollo SaaS · Producto Digital",
  titleBefore: "Construimos tu",
  titleHighlight: "producto SaaS",
  titleAfter: "desde cero",
  subtitle:
    "De la idea al producto en producción. Arquitectura multi-tenant, billing, onboarding y todo lo que necesita un SaaS moderno para lanzar, crecer y escalar con confianza.",
  heroImage: "/services/desarrollo_saas.png",
  accentColor: "#8b5cf6",
  stats: [
    { value: "MVP", label: "En 8 semanas", position: "topLeft" },
    { value: "10x", label: "Escalabilidad", position: "bottomRight" },
  ],
  features: [
    { icon: "🏢", title: "Multi-tenancy", desc: "Arquitectura nativa para múltiples clientes con aislamiento de datos, configuración por cuenta y planes diferenciados." },
    { icon: "💳", title: "Billing integrado", desc: "Suscripciones, planes freemium, períodos de prueba y facturación automática con Stripe desde el día uno." },
    { icon: "🚀", title: "Onboarding optimizado", desc: "Flujo de registro, activación y primeros pasos diseñado para maximizar la conversión de trials a pagos." },
    { icon: "📊", title: "Analítica de producto", desc: "Dashboards de MRR, churn, activación y uso para tomar decisiones de producto basadas en datos reales." },
    { icon: "🔧", title: "Panel de administración", desc: "Backoffice completo para gestionar clientes, planes, soporte y configuraciones desde un solo lugar." },
    { icon: "⚡", title: "Performance a escala", desc: "Infraestructura serverless con auto-scaling, CDN global y base de datos optimizada para miles de usuarios." },
  ],
  steps: [
    { num: "01", title: "Definición del producto", desc: "Product discovery: validamos el modelo de negocio, definimos el MVP y priorizamos las features del backlog inicial." },
    { num: "02", title: "Diseño y prototipo", desc: "UI/UX del producto completo con prototipo interactivo para validar el flujo con usuarios reales antes de desarrollar." },
    { num: "03", title: "Desarrollo del MVP", desc: "Construcción del núcleo del SaaS con autenticación, multi-tenancy, billing y las features clave en 8 semanas." },
    { num: "04", title: "Lanzamiento y growth", desc: "Deploy en producción, instrumentación de métricas, iteración rápida basada en feedback y soporte al crecimiento." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
      caption: "Dashboard SaaS moderno",
    },
    {
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      caption: "Analytics de producto",
    },
    {
      img: "https://images.unsplash.com/photo-1618761714954-0b8cd0026356?q=80&w=800&auto=format&fit=crop",
      caption: "Interfaz de usuario",
    },
  ],
  ctaTitle: "Tu idea merece convertirse en",
  ctaHighlight: "un producto real",
  ctaDesc: "Agenda una sesión de product discovery gratuita. En 1 hora definimos juntos el MVP y el camino al lanzamiento.",
}

export default function DesarrolloSaasPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
