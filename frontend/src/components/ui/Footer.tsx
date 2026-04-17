import { FOOTER_LINKS, SITE_NAME } from "@/lib/constants"
import { RiavaLogo } from "@/components/ui/RiavaLogo"

export function Footer() {
  return (
    <footer className="bg-[#060612] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <RiavaLogo className="h-10 sm:h-11" />
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-sm text-[#475569] hover:text-[#00e5ff] transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#contact"
            className="btn-tron px-5 py-2.5 text-sm font-semibold text-white rounded-lg shrink-0"
          >
            Solicitar información
          </a>
        </div>

        <div className="divider-tron my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#334155] text-xs font-mono">
            © {new Date().getFullYear()} {SITE_NAME} — Todos los derechos reservados
          </p>
          <p className="text-[#1e293b] text-xs font-mono">
            FinOps · Automatización · Páginas web · Desarrollo SaaS
          </p>
        </div>
      </div>
    </footer>
  )
}
