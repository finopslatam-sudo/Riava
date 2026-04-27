import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ComingSoon } from "@/components/ui/ComingSoon"

export const metadata: Metadata = {
  title: "Imágenes y Videos con IA | RIAVA",
  description: "Creamos imágenes y videos publicitarios animados con inteligencia artificial para tu empresa. Próximamente.",
}

export default function ContenidoIaPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ComingSoon service="Imágenes y Videos con IA" icon="🎬" />
      <Footer />
    </main>
  )
}
