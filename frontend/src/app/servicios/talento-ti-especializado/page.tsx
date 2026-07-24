import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ServiceLanding } from "@/components/ui/ServiceLanding"
import type { ServiceLandingProps } from "@/components/ui/ServiceLanding"

export const metadata: Metadata = {
  title: "Talento TI Especializado | RIAVA",
  description: "Encuentra desarrolladores, QA, DevOps y perfiles fullstack seleccionados y listos para integrarse a tu equipo.",
}

const data: ServiceLandingProps = {
  badge: "Talento TI · Staffing Especializado",
  titleBefore: "El talento técnico que",
  titleHighlight: "tu equipo necesita",
  subtitle:
    "Conectamos a tu empresa con desarrolladores, QA, DevOps y perfiles fullstack evaluados técnicamente, listos para integrarse a tu equipo y aportar desde el primer día.",
  heroImage: "/services/software_medida.png",
  accentColor: "#00e5ff",
  stats: [
    { value: "100%", label: "Evaluado técnicamente", position: "topLeft" },
    { value: "-70%", label: "Tiempo de contratación", position: "bottomRight" },
  ],
  features: [
    { icon: "💻", title: "Desarrollo", desc: "Frontend, backend y fullstack en los stacks que tu proyecto necesita." },
    { icon: "🧪", title: "QA", desc: "Testers manuales y automatizados para asegurar la calidad de tu producto." },
    { icon: "☁️", title: "DevOps", desc: "Especialistas en infraestructura, CI/CD y despliegues en la nube." },
    { icon: "🧩", title: "Fullstack", desc: "Perfiles versátiles capaces de moverse entre frontend, backend e integraciones." },
    { icon: "🎯", title: "Selección técnica", desc: "Cada candidato pasa por una evaluación técnica antes de ser presentado a tu empresa." },
    { icon: "⚡", title: "Integración rápida", desc: "Perfiles disponibles para incorporarse a tu equipo en cortos plazos." },
  ],
  steps: [
    { num: "01", title: "Levantamiento de perfil", desc: "Definimos contigo el rol, stack técnico y seniority que tu equipo necesita." },
    { num: "02", title: "Búsqueda y evaluación", desc: "Filtramos y evaluamos técnicamente a los candidatos más adecuados para el rol." },
    { num: "03", title: "Presentación de candidatos", desc: "Te presentamos una selección de perfiles listos para entrevistar." },
    { num: "04", title: "Incorporación", desc: "Acompañamos la integración del talento seleccionado a tu equipo y procesos." },
  ],
  showcase: [
    {
      img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop",
      caption: "Equipos de desarrollo",
    },
    {
      img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop",
      caption: "QA y automatización",
    },
    {
      img: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=800&auto=format&fit=crop",
      caption: "DevOps e infraestructura",
    },
  ],
  ctaTitle: "Arma tu equipo con",
  ctaHighlight: "talento TI especializado",
  ctaDesc: "Cuéntanos qué perfil necesitas. En 48 horas te presentamos candidatos evaluados y listos para entrevistar.",
}

export default function TalentoTIEspecializadoPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ServiceLanding {...data} />
      <Footer />
    </main>
  )
}
