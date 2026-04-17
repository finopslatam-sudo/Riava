import { Navbar } from "@/components/ui/Navbar"
import { Hero } from "@/components/sections/Hero"
import { Testimonials } from "@/components/sections/Testimonials"
import { Services } from "@/components/sections/Services"
import { Impact } from "@/components/sections/Impact"
import { Contact } from "@/components/sections/Contact"
import { Footer } from "@/components/ui/Footer"

export default function Home() {
  return (
    <main className="bg-[#000a0f] min-h-screen">
      <Navbar />
      <Hero />
      <Testimonials />
      <Services />
      <Impact />
      <Contact />
      <Footer />
    </main>
  )
}
