import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import { ContenidoIaExamples } from "@/components/ui/ContenidoIaExamples"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Contenido IA | RIAVA",
  description: "Imágenes y videos publicitarios impactantes generados con IA para redes sociales. Contenido que vende.",
}

const data: ServiceLandingProps = {
  badge: "Contenido Publicitario · IA Generativa · Redes Sociales",
  titleBefore: "Imágenes y videos publicitarios que",
  titleHighlight: "venden de verdad",
  subtitle:
    "Creamos contenido visual de alto impacto para tus redes sociales con inteligencia artificial. Imágenes llamativas, videos publicitarios animados y creatividades que capturan la atención y convierten, a una fracción del costo de una producción tradicional.",
  heroImage: "/services/media_ia.png",
  heroVideo: "/videos/paginas-web/principal.mp4",
  accentColor: "#f000ff",
  stats: [
    { value: "4K", label: "Resolución", position: "topLeft" },
    { value: "48h", label: "Entrega", position: "bottomRight" },
  ],
  features: [
    { icon: "🎬", title: "Videos publicitarios animados", desc: "Spots de 15 a 60 segundos con movimiento, música y texto optimizados para Instagram Reels, TikTok y Facebook Ads." },
    { icon: "🖼️", title: "Imágenes que detienen el scroll", desc: "Fotografías de producto, ambientes y escenas fotorrealistas diseñadas para impactar en el feed de tus clientes." },
    { icon: "📱", title: "Formatos para cada red social", desc: "Stories, Reels, posts cuadrados, banners y carruseles en todos los tamaños que necesita tu estrategia digital." },
    { icon: "🎯", title: "Enfocado en conversión", desc: "Cada pieza se diseña con el objetivo de vender: CTA claro, jerarquía visual correcta y mensaje que conecta." },
    { icon: "🔄", title: "Variaciones para A/B testing", desc: "Múltiples versiones del mismo concepto para probar cuál convierte mejor en tus campañas de pauta." },
    { icon: "⚡", title: "Entrega en 48 horas", desc: "Primeras propuestas en 48 horas. Sin semanas de espera, sin reuniones interminables, sin presupuestos de agencia." },
  ],
  steps: [
    { num: "01", title: "Briefing de tu marca", desc: "Nos cuentas tu producto, audiencia y objetivo. Analizamos tu identidad visual para que el contenido sea 100% tuyo." },
    { num: "02", title: "Propuestas en 48 horas", desc: "Generamos 3 a 5 conceptos visuales distintos para que elijas la dirección creativa que más te convence." },
    { num: "03", title: "Refinamiento hasta quedar perfecto", desc: "Ajustamos composición, colores, texto y movimiento con rondas de revisión hasta que el resultado te encante." },
    { num: "04", title: "Assets listos para publicar", desc: "Recibes los archivos en todos los formatos y resoluciones requeridos, listos para subir directamente a tus plataformas." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      caption: "Publicidad de producto",
    },
    {
      img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop",
      caption: "Contenido de belleza",
    },
    {
      img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
      caption: "Video gastronómico",
    },
  ],
  ctaTitle: "Tu competencia ya está publicando",
  ctaHighlight: "contenido con IA",
  ctaDesc: "Comparte tu briefing y en 24 horas te enviamos una propuesta de concepto creativo sin costo. Sin contratos, sin compromisos.",
}

export default function ContenidoIaPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <ContenidoIaExamples />
      <Footer />
    </main>
  )
}
