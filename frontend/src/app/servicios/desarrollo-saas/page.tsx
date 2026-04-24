import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ComingSoon } from "@/components/ui/ComingSoon"

export const metadata: Metadata = {
  title: "Desarrollo SaaS | RIAVA",
  description: "Desarrollamos tu producto SaaS desde cero. Próximamente.",
}

export default function DesarrolloSaasPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ComingSoon service="Desarrollo SaaS" icon="🚀" />
      <Footer />
    </main>
  )
}
