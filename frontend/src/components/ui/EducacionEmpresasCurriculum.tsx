"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const ACCENT = "#a855f7"

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

const LEVELS = [
  {
    id: "fundamentos",
    num: "01",
    title: "Fundamentos",
    subtitle: "Entender la IA",
    hours: "4–8 hrs",
    color: "#00e5ff",
    desc: "Conceptos base, modelos disponibles y primeros prompts. Sin código, sin experiencia previa.",
  },
  {
    id: "productividad",
    num: "02",
    title: "Productividad",
    subtitle: "Aplicar en el trabajo",
    hours: "8–16 hrs",
    color: "#a855f7",
    desc: "Casos de uso reales por herramienta para acelerar el trabajo diario del equipo.",
  },
  {
    id: "especializacion",
    num: "03",
    title: "Especialización",
    subtitle: "Dominar por área",
    hours: "16–32 hrs",
    color: "#f000ff",
    desc: "Aplicaciones avanzadas por rol: marketing, ventas, RRHH, operaciones y más.",
  },
  {
    id: "avanzado",
    num: "04",
    title: "IA Avanzada",
    subtitle: "Construir con IA",
    hours: "32+ hrs",
    color: "#00ff88",
    desc: "Agentes, automatizaciones, APIs e integraciones empresariales de IA a escala.",
  },
]

const TRACKS = [
  {
    id: "texto",
    icon: "💬",
    title: "Texto y Productividad",
    tools: [
      {
        name: "ChatGPT",
        company: "OpenAI",
        badge: "🟢",
        levels: {
          fundamentos: ["Interfaz y modelos GPT-4o / o1", "Primeros prompts efectivos", "Contexto y memoria de conversación"],
          productividad: ["Redacción y edición de documentos", "Análisis de archivos PDF adjuntos", "Creación de plantillas y SOPs"],
          especializacion: ["Custom Instructions por rol empresarial", "GPTs personalizados para la empresa", "Análisis de datos con Code Interpreter"],
          avanzado: ["Integración vía API con sistemas internos", "Automatización con GPT Actions", "Agentes multi-herramienta"],
        },
      },
      {
        name: "Claude",
        company: "Anthropic",
        badge: "🟤",
        levels: {
          fundamentos: ["Diferencias clave vs ChatGPT", "Razonamiento extendido (thinking mode)", "Manejo de documentos muy largos"],
          productividad: ["Análisis legal y contractual", "Escritura técnica y creativa avanzada", "Resumen de reuniones y notas"],
          especializacion: ["Claude Projects para equipos", "Artefactos y código ejecutable en vivo", "Casos de uso por industria"],
          avanzado: ["API Claude para developers", "Agentes con Claude 3.7", "Workflows multi-agente"],
        },
      },
      {
        name: "Gemini",
        company: "Google",
        badge: "🔵",
        levels: {
          fundamentos: ["Gemini integrado en Google Workspace", "Gmail y Docs con asistencia IA", "Búsqueda augmentada con IA"],
          productividad: ["Gemini en Google Meet (notas y resúmenes)", "Sheets con fórmulas generadas por IA", "Generación de presentaciones Slides"],
          especializacion: ["Gemini Advanced para análisis profundo", "NotebookLM para investigación interna", "Deep Research automático"],
          avanzado: ["Gemini API y Vertex AI", "Multimodalidad avanzada (texto, imagen, video)", "Agentes con Gemini 2.0 Flash"],
        },
      },
    ],
  },
  {
    id: "visual",
    icon: "🎨",
    title: "IA Visual y Creativa",
    tools: [
      {
        name: "Midjourney",
        company: "Midjourney Inc.",
        badge: "🎭",
        levels: {
          fundamentos: ["Discord y comando /imagine", "Parámetros de aspecto y calidad", "Estilos y referencias visuales"],
          productividad: ["Consistencia de marca con --sref", "Variaciones e iteraciones rápidas", "Upscaling y edición de imágenes"],
          especializacion: ["Fotografía de producto con IA", "Piezas publicitarias para campañas", "Personajes consistentes entre imágenes"],
          avanzado: ["Midjourney API (beta)", "Pipelines de producción masiva de assets", "Style transfer y prompting avanzado"],
        },
      },
      {
        name: "DALL-E 3",
        company: "OpenAI",
        badge: "🔶",
        levels: {
          fundamentos: ["Generación de imágenes desde ChatGPT", "Prompts descriptivos efectivos", "Formatos, tamaños y resoluciones"],
          productividad: ["Imágenes para marketing digital y RRSS", "Ilustraciones para presentaciones", "Iconografía y assets de marca"],
          especializacion: ["Integración API para productos digitales", "Inpainting y edición selectiva", "Generación en batch para campañas"],
          avanzado: ["Combinación con GPT-4 Vision", "Flujos automatizados de contenido visual", "Control avanzado de consistencia"],
        },
      },
      {
        name: "Runway ML",
        company: "Runway",
        badge: "🎬",
        levels: {
          fundamentos: ["Gen-3 Alpha: video desde texto", "Video a video con IA", "Herramientas de edición asistida"],
          productividad: ["Spots publicitarios de 15–30 segundos", "Transiciones y efectos generados con IA", "Remove background y objetos automático"],
          especializacion: ["Personajes consistentes en video", "Storyboarding con IA generativa", "Post-producción semi-automatizada"],
          avanzado: ["API Runway para pipelines de producción", "Integración con After Effects y Premiere", "Contenido de video a escala"],
        },
      },
    ],
  },
  {
    id: "codigo",
    icon: "💻",
    title: "IA para Código",
    tools: [
      {
        name: "GitHub Copilot",
        company: "Microsoft",
        badge: "⚫",
        levels: {
          fundamentos: ["Instalación y configuración en VSCode", "Autocompletado inteligente de código", "Generación desde comentarios en lenguaje natural"],
          productividad: ["Copilot Chat para debugging rápido", "Refactoring guiado por IA", "Generación automática de tests"],
          especializacion: ["Copilot para no-desarrolladores (scripts, Excel)", "Automatización de tareas internas con código", "Documentación automática de funciones"],
          avanzado: ["Copilot Workspace para proyectos completos", "Custom models para bases de código privadas", "Code review automatizado en PRs"],
        },
      },
      {
        name: "Cursor",
        company: "Anysphere",
        badge: "🟡",
        levels: {
          fundamentos: ["Setup e interfaz de Cursor", "Cmd+K: editar código con lenguaje natural", "Chat con el codebase completo"],
          productividad: ["Refactoring masivo de múltiples archivos", "Documentación generada automáticamente", "Migración de tecnologías asistida"],
          especializacion: ["Cursor para equipos no técnicos", "Construcción de dashboards internos", "Automatización de reportes con código"],
          avanzado: ["Multi-file context avanzado", "Custom rules y .cursorrules", "Integración con pipelines CI/CD"],
        },
      },
    ],
  },
  {
    id: "automatizacion",
    icon: "⚡",
    title: "Automatización con IA",
    tools: [
      {
        name: "n8n + IA",
        company: "n8n.io",
        badge: "🔴",
        levels: {
          fundamentos: ["Conceptos de workflows y nodos", "Nodos de OpenAI y Anthropic en n8n", "Triggers y acciones básicas"],
          productividad: ["Automatizar respuestas de email inteligentes", "Clasificación automática de leads", "Reportes auto-generados con IA"],
          especializacion: ["Agentes de IA dentro de n8n", "RAG con base de conocimiento interna", "Workflows de aprobación asistidos por IA"],
          avanzado: ["Sistemas multi-agente con n8n", "Self-hosted con modelos propios (Ollama)", "Integración con ERP y CRM empresarial"],
        },
      },
      {
        name: "Make + IA",
        company: "Make (ex-Integromat)",
        badge: "🟣",
        levels: {
          fundamentos: ["Escenarios, módulos y conexiones base", "Módulo OpenAI / Anthropic en Make", "Webhooks y triggers de eventos"],
          productividad: ["Pipeline de producción de contenido IA", "Sincronización de datos con IA", "Notificaciones y alertas inteligentes"],
          especializacion: ["Procesamiento masivo de documentos", "Chatbots internos construidos en Make", "Flujos de aprobación con contexto IA"],
          avanzado: ["Arquitecturas complejas multi-escenario", "Make + bases vectoriales (Pinecone, Supabase)", "Integraciones enterprise a medida"],
        },
      },
    ],
  },
  {
    id: "datos",
    icon: "📊",
    title: "IA para Datos e Investigación",
    tools: [
      {
        name: "NotebookLM",
        company: "Google",
        badge: "📓",
        levels: {
          fundamentos: ["Crear notebooks desde PDFs y documentos", "Preguntas sobre múltiples documentos", "Audio overviews automáticos (podcast IA)"],
          productividad: ["Base de conocimiento empresarial centralizada", "Análisis de investigaciones y reportes", "Resúmenes ejecutivos automáticos"],
          especializacion: ["NotebookLM para onboarding de nuevos empleados", "Gestión del conocimiento organizacional", "Análisis competitivo con fuentes internas"],
          avanzado: ["Integración con Google Drive empresarial", "Workflows de investigación automatizados", "Sistemas de KM (Knowledge Management) con IA"],
        },
      },
      {
        name: "Perplexity AI",
        company: "Perplexity",
        badge: "🔍",
        levels: {
          fundamentos: ["Búsqueda con fuentes verificadas y citadas", "Diferencias con Google y ChatGPT", "Espacios y colecciones de investigación"],
          productividad: ["Research de mercado en minutos", "Monitoreo de competencia en tiempo real", "Due diligence acelerado con IA"],
          especializacion: ["Perplexity Pro para equipos", "Búsqueda en bases de conocimiento internas", "Fact-checking automatizado de informes"],
          avanzado: ["API Perplexity para productos propios", "Integraciones empresariales", "Pipelines de research continuo"],
        },
      },
    ],
  },
]

const SPECIALIZATIONS = [
  {
    icon: "📣",
    area: "Marketing",
    color: "#f000ff",
    tools: ["ChatGPT", "Midjourney", "Runway ML"],
    outcomes: ["Copy 10x más rápido", "Creatividades sin agencia externa", "A/B testing de contenido IA"],
  },
  {
    icon: "💼",
    area: "Ventas",
    color: "#00e5ff",
    tools: ["Claude", "ChatGPT", "Perplexity AI"],
    outcomes: ["Propuestas personalizadas en segundos", "Research de cuentas objetivo", "Follow-ups automatizados"],
  },
  {
    icon: "👥",
    area: "RRHH",
    color: "#a855f7",
    tools: ["ChatGPT", "NotebookLM", "Claude"],
    outcomes: ["JDs optimizadas con IA", "Onboarding automatizado", "Cribado de CVs masivo"],
  },
  {
    icon: "⚙️",
    area: "Operaciones",
    color: "#00ff88",
    tools: ["n8n + IA", "Make + IA", "Claude"],
    outcomes: ["SOPs generados por IA", "Workflows sin intervención humana", "Reportes automáticos diarios"],
  },
  {
    icon: "💰",
    area: "Finanzas",
    color: "#f59e0b",
    tools: ["ChatGPT", "Perplexity AI", "Claude"],
    outcomes: ["Análisis financiero asistido", "Reportes narrativos automáticos", "Research de inversión acelerado"],
  },
  {
    icon: "🔧",
    area: "TI y Desarrollo",
    color: "#00e5ff",
    tools: ["Cursor", "GitHub Copilot", "Claude"],
    outcomes: ["Velocidad de desarrollo 3×", "Documentación automática", "Code review con IA"],
  },
]

const FORMATS = [
  {
    icon: "🏢",
    title: "Workshop presencial",
    desc: "Jornada intensiva de 4–8 horas en las instalaciones de la empresa. Hasta 20 personas.",
    tag: "In-company",
    color: "#00e5ff",
  },
  {
    icon: "🖥️",
    title: "Programa online en vivo",
    desc: "Sesiones semanales de 2 horas por Zoom con práctica guiada y Q&A en tiempo real.",
    tag: "8 semanas",
    color: "#a855f7",
  },
  {
    icon: "🎓",
    title: "Certificación por tracks",
    desc: "Cada track de herramienta tiene su propio módulo con evaluación y certificado al finalizar.",
    tag: "A tu ritmo",
    color: "#f000ff",
  },
  {
    icon: "🛠️",
    title: "Programa a medida",
    desc: "Diseñamos el curriculum completo según el stack tecnológico y los roles específicos de tu empresa.",
    tag: "Personalizado",
    color: "#00ff88",
  },
]

export function EducacionEmpresasCurriculum() {
  const [activeTrack, setActiveTrack] = useState(TRACKS[0].id)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [activeLevel, setActiveLevel] = useState<string>("productividad")

  const currentTrack = TRACKS.find(t => t.id === activeTrack)!

  return (
    <div style={{ background: "#020813" }}>

      {/* ── LEARNING PATH ─────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              De cero a{" "}
              <span style={{ color: "#fff" }}>
                experto en IA
              </span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              4 niveles progresivos diseñados para que cualquier profesional de tu empresa adopte la IA generativa en su trabajo diario.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEVELS.map((level, i) => (
              <motion.div
                key={level.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative rounded-2xl p-6 cursor-pointer group"
                style={{
                  background: "rgba(0,14,23,0.8)",
                  border: `1px solid ${level.color}25`,
                  boxShadow: `0 0 32px ${level.color}08`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${level.color}10 0%, transparent 70%)` }}
                />
                <div
                  className="text-xs font-mono mb-3"
                  style={{ color: level.color }}
                >
                  NIVEL {level.num}
                </div>
                <div
                  className="w-10 h-0.5 mb-4 rounded-full"
                  style={{ background: level.color }}
                />
                <h3 className="text-white font-bold text-xl mb-1">{level.title}</h3>
                <p className="text-white/40 text-xs font-mono mb-3">{level.subtitle}</p>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{level.desc}</p>
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono"
                  style={{ background: `${level.color}15`, color: level.color, border: `1px solid ${level.color}30` }}
                >
                  ⏱ {level.hours}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOOL TRACKS ──────────────────────── */}
      <section className="py-16 px-4" style={{ background: "rgba(0,10,18,0.6)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Curriculum por{" "}
              <span style={{ color: "#fff" }}>
                herramienta de IA
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Cada herramienta tiene su propio track de aprendizaje con contenido específico para cada nivel.
            </p>
          </motion.div>

          {/* Track tabs */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {TRACKS.map(track => (
              <button
                key={track.id}
                onClick={() => { setActiveTrack(track.id); setActiveTool(null) }}
                className="flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs tracking-widest uppercase transition-all duration-300"
                style={activeTrack === track.id ? {
                  background: ACCENT,
                  color: "#000",
                  boxShadow: `0 0 20px ${ACCENT}40`,
                } : {
                  background: "rgba(168,85,247,0.08)",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(168,85,247,0.2)",
                }}
              >
                <span>{track.icon}</span>
                <span className="hidden sm:inline">{track.title}</span>
              </button>
            ))}
          </div>

          {/* Level selector */}
          <div className="flex gap-1 justify-center mb-8 p-1 rounded-full w-fit mx-auto"
            style={{ background: "rgba(0,10,18,0.8)", border: "1px solid rgba(168,85,247,0.15)" }}
          >
            {LEVELS.map(level => (
              <button
                key={level.id}
                onClick={() => setActiveLevel(level.id)}
                className="px-4 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all duration-300"
                style={activeLevel === level.id ? {
                  background: level.color,
                  color: "#000",
                } : {
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {level.title}
              </button>
            ))}
          </div>

          {/* Tools grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTrack + activeLevel}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {currentTrack.tools.map(tool => {
                const modules = tool.levels[activeLevel as keyof typeof tool.levels]
                const isOpen = activeTool === tool.name
                const levelColor = LEVELS.find(l => l.id === activeLevel)!.color

                return (
                  <motion.div
                    key={tool.name}
                    className="rounded-2xl overflow-hidden cursor-pointer group"
                    style={{
                      background: "rgba(0,14,23,0.9)",
                      border: `1px solid ${isOpen ? levelColor + "50" : "rgba(168,85,247,0.12)"}`,
                      boxShadow: isOpen ? `0 0 30px ${levelColor}15` : "none",
                    }}
                    onClick={() => setActiveTool(isOpen ? null : tool.name)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{tool.badge}</span>
                          <div>
                            <h3 className="text-white font-bold">{tool.name}</h3>
                            <p className="text-white/30 text-xs font-mono">{tool.company}</p>
                          </div>
                        </div>
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform duration-300"
                          style={{
                            background: `${levelColor}15`,
                            color: levelColor,
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          ▾
                        </div>
                      </div>

                      <div
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono mb-3"
                        style={{ background: `${levelColor}15`, color: levelColor, border: `1px solid ${levelColor}30` }}
                      >
                        {LEVELS.find(l => l.id === activeLevel)!.title} · {LEVELS.find(l => l.id === activeLevel)!.hours}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 space-y-2">
                            {modules.map((mod, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-3 p-3 rounded-xl"
                                style={{ background: `${levelColor}08`, border: `1px solid ${levelColor}15` }}
                              >
                                <span
                                  className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-[10px] font-mono font-bold mt-0.5"
                                  style={{ background: `${levelColor}25`, color: levelColor }}
                                >
                                  {i + 1}
                                </span>
                                <span className="text-white/70 text-sm">{mod}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!isOpen && (
                      <div className="px-5 pb-5">
                        <div className="space-y-1">
                          {modules.slice(0, 2).map((mod, i) => (
                            <p key={i} className="text-white/40 text-xs truncate">
                              · {mod}
                            </p>
                          ))}
                          <p className="text-white/25 text-xs">+ {modules.length - 2} módulos más →</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── SPECIALIZATION BY ROLE ─────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Especialización{" "}
              <span style={{ color: "#fff" }}>
                por área y rol
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Cada departamento tiene un camino de aprendizaje con las herramientas que más impactan su trabajo.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECIALIZATIONS.map((spec, i) => (
              <motion.div
                key={spec.area}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl p-6 group relative overflow-hidden"
                style={{
                  background: "rgba(0,14,23,0.8)",
                  border: `1px solid ${spec.color}20`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 0% 0%, ${spec.color}10 0%, transparent 60%)` }}
                />
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{spec.icon}</span>
                  <div>
                    <h3 className="text-white font-bold text-lg">{spec.area}</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-2">Herramientas</p>
                  <div className="flex flex-wrap gap-1.5">
                    {spec.tools.map(tool => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 rounded-full text-[10px] font-mono"
                        style={{ background: `${spec.color}15`, color: spec.color, border: `1px solid ${spec.color}25` }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-white/30 text-[10px] font-mono uppercase tracking-widest mb-2">Resultados esperados</p>
                  <ul className="space-y-1.5">
                    {spec.outcomes.map((outcome, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-white/60">
                        <span style={{ color: spec.color }} className="mt-0.5 text-xs">✓</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORMATS ──────────────────────────── */}
      <section className="py-16 px-4" style={{ background: "rgba(0,10,18,0.5)", borderTop: "1px solid rgba(168,85,247,0.1)" }}>
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Formatos de{" "}
              <span style={{ color: "#fff" }}>
                capacitación
              </span>
            </h2>
            <p className="text-white/50">Adaptamos el programa al formato que mejor funcione para tu equipo.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FORMATS.map((fmt, i) => (
              <motion.div
                key={fmt.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl p-5 relative overflow-hidden group"
                style={{ background: "rgba(0,14,23,0.9)", border: `1px solid ${fmt.color}20` }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at 50% 100%, ${fmt.color}12 0%, transparent 70%)` }}
                />
                <div className="text-3xl mb-3">{fmt.icon}</div>
                <div
                  className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono mb-3"
                  style={{ background: `${fmt.color}15`, color: fmt.color, border: `1px solid ${fmt.color}25` }}
                >
                  {fmt.tag}
                </div>
                <h3 className="text-white font-bold mb-2">{fmt.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{fmt.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
