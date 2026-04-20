export const SITE_NAME = "RIAVA"

export const NAV_LINKS = [
  { label: "Servicios", href: "#services" },
  { label: "Impacto", href: "#impact" },
  { label: "Testimonios", href: "#testimonials" },
  { label: "Contacto", href: "#contact" },
]

export const SERVICES = [
  {
    id: "finops",
    title: "FinOps y optimización de costos cloud",
    description:
      "Optimiza, controla y reduce tus costos en la nube con prácticas FinOps de nivel enterprise. Obtén visibilidad total, elimina desperdicios y toma decisiones basadas en datos.",
    icon: "💰",
    cta: { label: "Ir a FinOpsLatam", href: "https://www.finopslatam.com/" },
    highlight: true,
    tags: ["AWS", "GCP", "Azure", "Control de costos"],
    image: "/services/finops.png",
  },
  {
    id: "booking",
    title: "Reservas inteligentes y fidelización",
    description:
      "Automatiza reservas, recordatorios y fidelización de clientes con soluciones inteligentes que aumentan la retención y mejoran la experiencia del usuario.",
    icon: "📅",
    cta: { label: "Ir a ClienteFiel", href: "https://clientefiel.riava.cl/" },
    highlight: false,
    tags: ["Automatización", "CRM", "Retención"],
    image: "/services/reserva_inteligente.png",
  },
  {
    id: "websites",
    title: "Creación de páginas web",
    description:
      "Diseñamos páginas web modernas, rápidas y optimizadas para convertir visitantes en clientes.",
    icon: "🌐",
    cta: null,
    highlight: false,
    tags: ["Sitios web", "Conversión", "SEO"],
    image: "/services/pagina_web.png",
  },
  {
    id: "saas",
    title: "Desarrollo SaaS",
    description:
      "Creamos plataformas SaaS escalables con arquitectura moderna y enfoque en crecimiento.",
    icon: "🚀",
    cta: null,
    highlight: false,
    tags: ["Next.js", "Node.js", "Microservicios"],
    image: "/services/desarrollo_saas.png",
  },
  {
    id: "automation",
    title: "Automatización de procesos",
    description:
      "Automatiza procesos repetitivos y mejora la eficiencia operativa de tu negocio.",
    icon: "🤖",
    cta: null,
    highlight: false,
    tags: ["RPA", "Flujos", "IA"],
    image: "/services/automatizacion.png",
  },
  {
    id: "custom",
    title: "Software a medida",
    description:
      "Desarrollamos soluciones personalizadas adaptadas a las necesidades específicas de tu empresa.",
    icon: "⚙️",
    cta: null,
    highlight: false,
    tags: ["A medida", "Integración", "API"],
    image: "/services/software_medida.png",
  },
]

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Carlos Méndez",
    company: "TechCorp Latam",
    role: "CTO",
    text: "Gracias a RIAVA logramos reducir significativamente nuestros costos en la nube.",
    avatar: "CM",
  },
  {
    id: 2,
    name: "Ana Rodríguez",
    company: "RetailPlus",
    role: "Directora de Operaciones",
    text: "La automatización nos permitió ahorrar tiempo y mejorar nuestra operación.",
    avatar: "AR",
  },
  {
    id: 3,
    name: "Diego Fernández",
    company: "StartupHub",
    role: "CEO",
    text: "El equipo entendió perfectamente nuestras necesidades y entregó una solución de alto nivel.",
    avatar: "DF",
  },
  {
    id: 4,
    name: "María González",
    company: "HealthNet",
    role: "Gerenta de Producto",
    text: "Profesionales, confiables y con un enfoque total en resultados.",
    avatar: "MG",
  },
]

export const IMPACT_METRICS = [
  { value: 40, suffix: "%", label: "Reducción de costos cloud", description: "Ahorro promedio logrado por nuestros clientes FinOps" },
  { value: 80, suffix: "%", label: "Automatización de procesos", description: "De tareas repetitivas eliminadas" },
  { value: 10, suffix: "x", label: "Factor de escalabilidad", description: "Infraestructura diseñada para crecer contigo" },
  { value: 200, suffix: "+", label: "Horas ahorradas al mes", description: "Por cliente con nuestras soluciones de automatización" },
]

export const FOOTER_LINKS = [
  { label: "Servicios", href: "#services" },
  { label: "Contacto", href: "#contact" },
  { label: "FinOpsLatam", href: "https://www.finopslatam.com" },
  { label: "ClienteFiel", href: "https://clientefiel.riava.cl/" },
]
