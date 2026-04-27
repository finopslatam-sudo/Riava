import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Reserva de Citas | RIAVA",
  description: "Automatiza reservas, recordatorios y fidelización de clientes con soluciones inteligentes.",
}

const data: ServiceLandingProps = {
  badge: "Reservas Inteligentes · Fidelización",
  titleBefore: "Automatiza tus reservas y",
  titleHighlight: "fideliza clientes",
  subtitle:
    "Sistema completo de reservas online, recordatorios automáticos y seguimiento post-servicio. Reduce ausencias, aumenta retención y libera a tu equipo de tareas manuales.",
  heroImage: "/services/reserva_inteligente.png",
  accentColor: "#f000ff",
  stats: [
    { value: "80%", label: "Menos ausencias", position: "topLeft" },
    { value: "24/7", label: "Disponible", position: "bottomRight" },
  ],
  features: [
    { icon: "📅", title: "Reservas online", desc: "Tus clientes agendan desde cualquier dispositivo, en cualquier momento, sin llamadas ni mensajes." },
    { icon: "🔔", title: "Recordatorios automáticos", desc: "Notificaciones por WhatsApp, SMS y email que reducen las ausencias en hasta un 80%." },
    { icon: "💼", title: "Gestión de agenda", desc: "Panel centralizado para ver, modificar y gestionar todas las reservas de tu equipo en tiempo real." },
    { icon: "⭐", title: "Encuestas post-servicio", desc: "Recopilación automática de reseñas y feedback para mejorar tu reputación y tu servicio." },
    { icon: "🎁", title: "Programa de fidelización", desc: "Puntos, descuentos y beneficios automáticos para que tus clientes vuelvan una y otra vez." },
    { icon: "📊", title: "Analítica de clientes", desc: "Reportes de retención, frecuencia de visita y valor de vida del cliente para tomar mejores decisiones." },
  ],
  steps: [
    { num: "01", title: "Configuración del sistema", desc: "Montamos tu agenda digital, servicios, precios, disponibilidad y métodos de pago en 48 horas." },
    { num: "02", title: "Integración multicanal", desc: "Conectamos tu sistema con WhatsApp, Instagram, Google y tu página web para recibir reservas de todos lados." },
    { num: "03", title: "Automatización de comunicaciones", desc: "Activamos los flujos de recordatorios, confirmaciones y seguimiento post-cita para cada tipo de servicio." },
    { num: "04", title: "Operación y mejora continua", desc: "Monitoreo de métricas clave y ajustes periódicos para maximizar la ocupación y la retención." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=1200&auto=format&fit=crop",
      caption: "Reservas desde móvil",
    },
    {
      img: "https://images.unsplash.com/photo-1553877522-43269d4ea984?q=80&w=800&auto=format&fit=crop",
      caption: "Gestión de equipos",
    },
    {
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
      caption: "Experiencia del cliente",
    },
  ],
  ctaTitle: "Tu agenda vacía es",
  ctaHighlight: "dinero perdido",
  ctaDesc: "Implementamos tu sistema de reservas en 48 horas. Sin contratos anuales, sin complicaciones técnicas.",
  ctaHref: "https://clientefiel.riava.cl/",
}

export default function ReservaDeCitasPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
