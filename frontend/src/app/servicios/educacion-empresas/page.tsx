import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import { EducacionEmpresasCurriculum } from "@/components/ui/EducacionEmpresasCurriculum"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Educación Empresas | RIAVA",
  description: "Programa de capacitación en IA Generativa para equipos. Desde fundamentos hasta agentes avanzados: ChatGPT, Claude, Midjourney, GitHub Copilot, n8n y más.",
}

const data: ServiceLandingProps = {
  badge: "Capacitación Corporativa · IA Generativa · Equipos",
  titleBefore: "Tu equipo dominando la",
  titleHighlight: "inteligencia artificial generativa",
  subtitle:
    "Programa de formación intensivo y práctico para empresas. Llevamos a tu equipo desde cero hasta el dominio real de las principales herramientas de IA: ChatGPT, Claude, Gemini, Midjourney, GitHub Copilot, n8n y más. Aprenden aplicando, no solo viendo.",
  heroImage: "/services/automatizacion.png",
  accentColor: "#a855f7",
  stats: [
    { value: "15+", label: "Herramientas IA", position: "topLeft" },
    { value: "4", label: "Niveles de aprendizaje", position: "bottomRight" },
  ],
  features: [
    { icon: "🎯", title: "100% aplicado a tu industria", desc: "Cada módulo usa casos de uso reales de tu sector. No teoría genérica, sino prompts y flujos que funcionan en tu negocio." },
    { icon: "🧑‍💼", title: "Para todos los roles", desc: "Marketing, ventas, RRHH, operaciones, finanzas y TI. Cada área aprende las herramientas que más impactan su trabajo diario." },
    { icon: "📈", title: "4 niveles progresivos", desc: "Desde fundamentos hasta agentes de IA avanzados. Ruta clara de crecimiento con evaluaciones por nivel." },
    { icon: "🛠️", title: "Práctica hands-on", desc: "El 70% del tiempo es práctica guiada. Los participantes terminan cada sesión con entregables reales que pueden usar de inmediato." },
    { icon: "📜", title: "Certificación por herramienta", desc: "Cada track de herramienta tiene su propio certificado. Tu equipo acumula credenciales verificables en IA generativa." },
    { icon: "🔄", title: "Actualización continua", desc: "La IA evoluciona semana a semana. El programa se actualiza constantemente para incluir los últimos modelos y herramientas del mercado." },
  ],
  steps: [
    { num: "01", title: "Diagnóstico del equipo", desc: "Evaluamos el nivel actual de adopción de IA, los roles involucrados y los procesos con mayor potencial de mejora." },
    { num: "02", title: "Diseño del programa", desc: "Construimos el curriculum personalizado: qué herramientas, en qué orden y con qué casos de uso para tu industria específica." },
    { num: "03", title: "Formación intensiva", desc: "Sesiones en vivo, workshops presenciales o e-learning según el formato elegido. Aprenden haciendo, con feedback inmediato." },
    { num: "04", title: "Certificación y seguimiento", desc: "Evaluación final, emisión de certificados y sesión de seguimiento 30 días después para reforzar la adopción." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop",
      caption: "Workshop corporativo de IA",
    },
    {
      img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=800&auto=format&fit=crop",
      caption: "Modelos de IA generativa",
    },
    {
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop",
      caption: "Formación en equipos",
    },
  ],
  ctaTitle: "Tu equipo necesita",
  ctaHighlight: "hablar el idioma de la IA",
  ctaDesc: "Las empresas que forman a sus equipos en IA hoy tendrán una ventaja competitiva que durará años. Empieza con un diagnóstico gratuito de tu organización.",
}

export default function EducacionEmpresasPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <EducacionEmpresasCurriculum />
      <Footer />
    </main>
  )
}
