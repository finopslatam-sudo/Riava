import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Imágenes y Videos con IA | RIAVA",
  description: "Creamos imágenes y videos publicitarios animados con inteligencia artificial para tu empresa.",
}

const data: ServiceLandingProps = {
  badge: "IA Generativa · Contenido Visual · Publicidad",
  titleBefore: "Contenido visual",
  titleHighlight: "generado con IA",
  titleAfter: "para tu marca",
  subtitle:
    "Imágenes fotorrealistas, videos publicitarios animados y creatividades para redes sociales producidas con inteligencia artificial. Calidad de agencia, velocidad de startup, precio accesible.",
  heroImage: "/services/media_ia.png",
  accentColor: "#f000ff",
  stats: [
    { value: "4K", label: "Resolución", position: "topLeft" },
    { value: "48h", label: "Entrega", position: "bottomRight" },
  ],
  features: [
    { icon: "🎬", title: "Videos publicitarios", desc: "Spots animados de 15 a 60 segundos con narración, música y motion graphics generados con IA." },
    { icon: "🖼️", title: "Imágenes fotorrealistas", desc: "Renders de productos, ambientes, personajes y escenas imposibles de fotografiar a una fracción del costo." },
    { icon: "📱", title: "Contenido para redes", desc: "Creatividades optimizadas para Instagram, TikTok, Facebook Ads y YouTube en todos los formatos requeridos." },
    { icon: "🎨", title: "Identidad visual AI-first", desc: "Logos, paletas, fondos y elementos de marca generados con IA y cohesionados con tu identidad existente." },
    { icon: "🔄", title: "Variaciones ilimitadas", desc: "Múltiples versiones del mismo concepto para A/B testing en campañas digitales sin costo adicional." },
    { icon: "⚡", title: "Entrega rápida", desc: "Primeras propuestas en 48 horas. Ciclos de revisión ágiles para llegar a producción sin demoras." },
  ],
  steps: [
    { num: "01", title: "Briefing creativo", desc: "Entendemos tu marca, producto, audiencia y objetivo de comunicación. Definimos el concepto visual y el tono del contenido." },
    { num: "02", title: "Generación de propuestas", desc: "Producimos 3 a 5 propuestas visuales distintas en 48 horas para que elijas la dirección creativa que más te convence." },
    { num: "03", title: "Refinamiento", desc: "Iteramos sobre la propuesta elegida: ajustamos composición, colores, texto y movimiento hasta que quede perfecto." },
    { num: "04", title: "Entrega de assets", desc: "Archivos en todos los formatos y resoluciones necesarios, listos para subir directamente a tus plataformas." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=1200&auto=format&fit=crop",
      caption: "Arte generado con IA",
    },
    {
      img: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=800&auto=format&fit=crop",
      caption: "Visualización de modelos IA",
    },
    {
      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop",
      caption: "Producción digital",
    },
  ],
  ctaTitle: "Tu marca merece contenido",
  ctaHighlight: "que detenga el scroll",
  ctaDesc: "Comparte tu briefing y en 24 horas te enviamos una propuesta de concepto creativo sin costo.",
}

export default function ContenidoIaPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
