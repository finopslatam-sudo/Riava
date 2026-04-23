import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { CrearPaginasWebClient } from "./_client"

export const metadata: Metadata = {
  title: "Crear Páginas Web | RIAVA — Diseño y desarrollo web profesional",
  description:
    "Diseñamos páginas web modernas, rápidas y enfocadas en conversión. Transforma tu presencia digital con RIAVA.",
}

export default function CrearPaginasWebPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <CrearPaginasWebClient />
      <Footer />
    </main>
  )
}
