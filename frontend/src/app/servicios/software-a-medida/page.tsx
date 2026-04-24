import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ComingSoon } from "@/components/ui/ComingSoon"

export const metadata: Metadata = {
  title: "Software a Medida | RIAVA",
  description: "Soluciones de software personalizadas para tu empresa. Próximamente.",
}

export default function SoftwareAMedidaPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ComingSoon service="Software a Medida" icon="⚙️" />
      <Footer />
    </main>
  )
}
