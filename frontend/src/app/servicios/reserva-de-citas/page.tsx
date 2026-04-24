import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ComingSoon } from "@/components/ui/ComingSoon"

export const metadata: Metadata = {
  title: "Reserva de Citas | RIAVA",
  description: "Sistema de reserva de citas online para tu negocio. Próximamente.",
}

export default function ReservaDeCitasPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ComingSoon service="Reserva de Citas" icon="📅" />
      <Footer />
    </main>
  )
}
