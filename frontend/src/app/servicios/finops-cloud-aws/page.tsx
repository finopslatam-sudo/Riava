import type { Metadata } from "next"
import { Navbar } from "@/components/ui/Navbar"
import { Footer } from "@/components/ui/Footer"
import { ComingSoon } from "@/components/ui/ComingSoon"

export const metadata: Metadata = {
  title: "FinOps Cloud AWS | RIAVA",
  description: "Optimiza y controla tus costos en AWS con estrategias FinOps. Próximamente.",
}

export default function FinopsCloudAwsPage() {
  return (
    <main style={{ background: "#020813", minHeight: "100vh" }}>
      <Navbar />
      <ComingSoon service="FinOps Cloud AWS" icon="💰" />
      <Footer />
    </main>
  )
}
