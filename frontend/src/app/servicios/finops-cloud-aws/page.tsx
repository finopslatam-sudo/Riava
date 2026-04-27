import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "FinOps Cloud AWS | RIAVA",
  description: "Optimiza y controla tus costos en AWS con estrategias FinOps de nivel enterprise.",
}

const data: ServiceLandingProps = {
  badge: "FinOps · Cloud Cost Optimization",
  titleBefore: "Controla y reduce tus",
  titleHighlight: "costos en la nube",
  subtitle:
    "Obtén visibilidad total de tu gasto en AWS, elimina desperdicios y toma decisiones basadas en datos. Metodología FinOps de nivel enterprise adaptada al tamaño de tu empresa.",
  heroImage: "/services/finops.png",
  accentColor: "#00e5ff",
  stats: [
    { value: "40%", label: "Ahorro promedio", position: "topLeft" },
    { value: "AWS", label: "Certificados", position: "bottomRight" },
  ],
  features: [
    { icon: "📊", title: "Visibilidad total", desc: "Dashboards en tiempo real de todo tu gasto cloud: por servicio, equipo, proyecto o región." },
    { icon: "🔍", title: "Detección de desperdicio", desc: "Identificamos recursos ociosos, instancias sobredimensionadas y compromisos mal aprovechados." },
    { icon: "⚡", title: "Reservas y Savings Plans", desc: "Diseñamos estrategias de Reserved Instances y Savings Plans para reducir hasta un 72% el costo base." },
    { icon: "🤖", title: "Automatización de políticas", desc: "Implementamos alertas, presupuestos y apagados automáticos para evitar sorpresas en la factura." },
    { icon: "📈", title: "FinOps como cultura", desc: "Capacitamos a tus equipos de ingeniería y finanzas para mantener la disciplina de costos a largo plazo." },
    { icon: "🛡️", title: "Gobernanza cloud", desc: "Políticas de tagging, guardrails y control de acceso para un entorno cloud ordenado y auditado." },
  ],
  steps: [
    { num: "01", title: "Diagnóstico inicial", desc: "Analizamos tu cuenta AWS actual, identificamos el gasto, los mayores costos y las oportunidades de ahorro inmediatas." },
    { num: "02", title: "Estrategia de optimización", desc: "Diseñamos un plan de acción priorizado: quick wins primero, luego optimizaciones estructurales." },
    { num: "03", title: "Implementación", desc: "Ejecutamos los cambios técnicos, configuramos dashboards, alertas y reportes automáticos." },
    { num: "04", title: "Seguimiento continuo", desc: "Revisión mensual de métricas, ajuste de estrategias y soporte continuo para mantener el ahorro." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop",
      caption: "Infraestructura global cloud",
    },
    {
      img: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop",
      caption: "Dashboards financieros",
    },
    {
      img: "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=800&auto=format&fit=crop",
      caption: "Trazabilidad de costos",
    },
  ],
  ctaTitle: "Deja de pagar de más por",
  ctaHighlight: "tu infraestructura cloud",
  ctaDesc: "Agenda una sesión de diagnóstico gratuita y descubre cuánto puedes ahorrar en los próximos 30 días.",
  ctaHref: "https://www.finopslatam.com/",
}

export default function FinopsCloudAwsPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
