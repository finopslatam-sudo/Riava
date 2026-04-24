import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ComingSoon } from "@/components/ui/ComingSoon"

export const metadata: Metadata = {
  title: "Automatizaciones | RIAVA",
  description: "Automatiza procesos de tu negocio con soluciones inteligentes. Próximamente.",
}

export default function AutomatizacionesPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ComingSoon service="Automatizaciones" icon="🤖" />
      <Footer />
    </main>
  )
}
