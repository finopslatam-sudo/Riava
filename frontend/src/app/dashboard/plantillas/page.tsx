'use client'

import { useState } from 'react'

type Template = {
  id: string
  name: string
  tagline: string
  category: string
  tags: string[]
  palette: { bg: string; accent: string; text: string; glow: string }
  preview: React.ReactNode
}

const WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"

function WaDot() {
  return (
    <div style={{
      position: 'absolute', bottom: 6, right: 6,
      width: 15, height: 15, borderRadius: '50%',
      background: '#25D366',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 2px 8px rgba(37,211,102,0.6)', zIndex: 20,
    }}>
      <svg viewBox="0 0 24 24" style={{ width: 9, height: 9, fill: 'white' }}>
        <path d={WA_PATH} />
      </svg>
    </div>
  )
}

const LINKS = ['Inicio', 'Nosotros', 'Servicios', 'Testimonios', 'Contacto']

type NavProps = { logo: string; logoColor: string; linkColor: string; bg: string; border: string; ctaBg: string; ctaColor: string }
function MiniNav({ logo, logoColor, linkColor, bg, border, ctaBg, ctaColor }: NavProps) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 19,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 8px', background: bg, borderBottom: `1px solid ${border}`, zIndex: 5,
    }}>
      <span style={{ fontSize: 7.5, fontWeight: 900, color: logoColor, letterSpacing: 1 }}>{logo}</span>
      <div style={{ display: 'flex', gap: 5 }}>
        {LINKS.map(l => <span key={l} style={{ fontSize: 3.8, color: linkColor }}>{l}</span>)}
      </div>
      <div style={{ fontSize: 4.5, fontWeight: 700, color: ctaColor, background: ctaBg, padding: '2px 5px', borderRadius: 8 }}>Solicitar</div>
    </div>
  )
}

// ─── STELLAR — Tech/SaaS ───────────────────────────────────────────────────
function PreviewStellar() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: 'linear-gradient(135deg,#0a0015 0%,#150038 55%,#0a0015 100%)' }}>
      {[...Array(22)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', width: i % 4 === 0 ? 2 : 1.5, height: i % 4 === 0 ? 2 : 1.5, borderRadius: '50%', top: `${(i * 19 + 7) % 80}%`, left: `${(i * 31 + 13) % 100}%`, background: i % 2 === 0 ? 'rgba(168,85,247,0.85)' : 'rgba(99,102,241,0.65)' }} />
      ))}
      <div style={{ position: 'absolute', width: 110, height: 110, borderRadius: '50%', background: 'radial-gradient(circle,rgba(130,60,255,0.5) 0%,transparent 70%)', top: '2%', left: '50%', transform: 'translateX(-50%)', filter: 'blur(12px)' }} />
      <MiniNav logo="STELLAR" logoColor="#a855f7" linkColor="rgba(200,180,255,0.6)" bg="rgba(10,0,21,0.88)" border="rgba(168,85,247,0.15)" ctaBg="rgba(168,85,247,0.9)" ctaColor="#fff" />
      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 4, letterSpacing: 3, color: 'rgba(168,85,247,0.75)', marginBottom: 3 }}>SOLUCIONES DE SOFTWARE</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
          Impulsa tu<br />
          <span style={{ background: 'linear-gradient(90deg,#a855f7,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Negocio Digital</span>
        </div>
        <div style={{ fontSize: 4.2, color: 'rgba(200,180,255,0.5)', marginTop: 3, lineHeight: 1.5 }}>Automatización, IA y cloud para empresas modernas</div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6 }}>
          <div style={{ fontSize: 4.5, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#7c3aed,#2563eb)', padding: '3px 8px', borderRadius: 10 }}>Comenzar</div>
          <div style={{ fontSize: 4.5, color: 'rgba(200,180,255,0.8)', border: '1px solid rgba(168,85,247,0.35)', padding: '3px 8px', borderRadius: 10 }}>Ver más</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 115, left: 0, right: 0, padding: '3px 6px' }}>
        <div style={{ fontSize: 3.5, color: 'rgba(168,85,247,0.5)', textAlign: 'center', marginBottom: 3, letterSpacing: 2 }}>NUESTROS SERVICIOS</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {['Automatización', 'Inteligencia IA', 'Cloud & APIs'].map(s => (
            <div key={s} style={{ flex: 1, borderRadius: 6, padding: '4px 3px', background: 'rgba(120,60,255,0.1)', border: '1px solid rgba(120,60,255,0.22)', textAlign: 'center' }}>
              <div style={{ fontSize: 3.8, color: 'rgba(200,180,255,0.8)', fontWeight: 600 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 152, left: 0, right: 0, padding: '3px 6px', display: 'flex', gap: 3 }}>
        {['"Triplicamos ventas"', '"Soporte increíble"'].map((t, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(120,60,255,0.07)', border: '1px solid rgba(168,85,247,0.12)', borderRadius: 5, padding: '3px' }}>
            <div style={{ fontSize: 3.2, color: 'rgba(200,180,255,0.6)', lineHeight: 1.3 }}>{t}</div>
            <div style={{ fontSize: 3, color: 'rgba(168,85,247,0.5)', marginTop: 1 }}>⭐⭐⭐⭐⭐</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, background: 'rgba(120,60,255,0.07)', borderTop: '1px solid rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Inicio', 'Servicios', 'Blog', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(168,85,247,0.4)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

// ─── LUMINA — Salud ────────────────────────────────────────────────────────
function PreviewLumina() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#f0f9ff' }}>
      <MiniNav logo="LUMINA" logoColor="#0ea5e9" linkColor="#64748b" bg="rgba(255,255,255,0.97)" border="#e2e8f0" ctaBg="#0ea5e9" ctaColor="#fff" />
      <div style={{ position: 'absolute', top: 19, left: 0, right: 0, height: 85, display: 'flex' }}>
        <div style={{ flex: 1, padding: '7px 4px 4px 8px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: 3.8, color: '#0ea5e9', fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>CLÍNICA MÉDICA</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', lineHeight: 1.15 }}>Tu Salud,<br /><span style={{ color: '#0ea5e9' }}>Nuestra</span><br />Prioridad</div>
          <div style={{ fontSize: 4, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>Atención de excelencia con profesionales comprometidos.</div>
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'inline-block', fontSize: 4.2, fontWeight: 700, color: '#fff', background: '#0ea5e9', padding: '2.5px 7px', borderRadius: 10 }}>Reservar hora</div>
          </div>
          <div style={{ marginTop: 4, display: 'flex', gap: 6 }}>
            {[['98%','Satisfacción'], ['15+','Años'], ['50k+','Pacientes']].map(([v, l]) => (
              <div key={l}><div style={{ fontSize: 6.5, fontWeight: 800, color: '#0ea5e9' }}>{v}</div><div style={{ fontSize: 3, color: '#94a3b8' }}>{l}</div></div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <div style={{ width: 50, height: 72, borderRadius: 10, background: 'linear-gradient(135deg,#e0f2fe,#bae6fd)', border: '2px solid #7dd3fc', transform: 'perspective(300px) rotateY(-18deg) rotateX(4deg)', boxShadow: '6px 8px 20px rgba(14,165,233,0.2)' }}>
            <div style={{ width: 36, height: 5, borderRadius: 2, background: '#38bdf8', margin: '7px auto 3px' }} />
            <div style={{ width: 28, height: 3, borderRadius: 2, background: '#bae6fd', margin: '0 auto 4px' }} />
            {[1, 2, 3].map(i => <div key={i} style={{ width: '80%', height: 8, borderRadius: 3, background: '#e0f2fe', margin: '2px auto', border: '1px solid #bae6fd' }} />)}
          </div>
          <div style={{ position: 'absolute', top: '12%', right: '8%', padding: '2px 5px', borderRadius: 5, background: '#0ea5e9', color: '#fff', fontSize: 4, fontWeight: 700 }}>✓ Disponible</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 106, left: 0, right: 0, background: '#fff', padding: '4px 6px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 3.5, fontWeight: 700, color: '#0f172a', marginBottom: 3, textAlign: 'center', letterSpacing: 1 }}>NUESTROS SERVICIOS</div>
        <div style={{ display: 'flex', gap: 3 }}>
          {['Medicina General', 'Cardiología', 'Traumatología'].map(s => (
            <div key={s} style={{ flex: 1, borderRadius: 6, padding: 4, background: '#f0f9ff', border: '1px solid #bae6fd', textAlign: 'center' }}>
              <div style={{ fontSize: 3.5, color: '#0ea5e9', fontWeight: 600 }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 140, left: 0, right: 0, padding: '3px 6px', background: '#f0f9ff' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {['"Atención excelente."', '"Los mejores médicos."'].map((t, i) => (
            <div key={i} style={{ flex: 1, background: '#fff', borderRadius: 5, padding: 3, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 3.2, color: '#64748b', lineHeight: 1.3 }}>{t}</div>
              <div style={{ fontSize: 3, color: '#f59e0b', marginTop: 1 }}>⭐⭐⭐⭐⭐</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 15, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Inicio', 'Servicios', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(255,255,255,0.85)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

// ─── AURUM — Inmobiliaria Lujo ─────────────────────────────────────────────
function PreviewAurum() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#080c0a' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 18px,rgba(212,175,55,0.025) 18px,rgba(212,175,55,0.025) 19px)' }} />
      <MiniNav logo="AURUM" logoColor="#d4af37" linkColor="rgba(212,175,55,0.6)" bg="rgba(8,12,10,0.9)" border="rgba(212,175,55,0.15)" ctaBg="rgba(212,175,55,0.85)" ctaColor="#080c0a" />
      <div style={{ position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 3.8, letterSpacing: 4, color: 'rgba(212,175,55,0.55)', marginBottom: 3 }}>BIENES RAÍCES DE LUJO</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.15, textShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
          Encuentra tu<br /><span style={{ color: '#d4af37' }}>Hogar Ideal</span>
        </div>
        <div className="mx-4 mt-2 flex items-center gap-1 rounded-full px-3 py-1" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', display: 'flex', alignItems: 'center', gap: 4, margin: '6px 12px 0' }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(212,175,55,0.1)' }} />
          <div style={{ width: 22, height: 10, borderRadius: 10, background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 4.5, color: '#080c0a', fontWeight: 700 }}>Buscar</span>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 108, left: 4, right: 4, display: 'flex', gap: 3 }}>
        {[{ price: '$2.4M', type: 'Villa', badge: 'NUEVO' }, { price: '$890K', type: 'Apto', badge: 'OFERTA' }, { price: '$1.2M', type: 'Casa', badge: '' }].map((p, i) => (
          <div key={p.type} style={{ flex: 1, borderRadius: 8, background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.18)', padding: '5px 4px 4px', transform: i === 1 ? 'translateY(-5px) scale(1.04)' : `perspective(200px) rotateY(${i === 0 ? 8 : -8}deg)`, boxShadow: i === 1 ? '0 6px 18px rgba(212,175,55,0.15)' : 'none' }}>
            <div style={{ height: 26, borderRadius: 4, background: 'rgba(212,175,55,0.06)', marginBottom: 3, border: '1px solid rgba(212,175,55,0.1)', position: 'relative' }}>
              {p.badge && <div style={{ position: 'absolute', top: 2, left: 2, fontSize: 3.2, color: '#080c0a', background: '#d4af37', padding: '1px 3px', borderRadius: 2, fontWeight: 700 }}>{p.badge}</div>}
            </div>
            <div style={{ fontSize: 7, color: '#d4af37', fontWeight: 700 }}>{p.price}</div>
            <div style={{ fontSize: 4, color: 'rgba(212,175,55,0.5)' }}>{p.type}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 162, left: 0, right: 0, padding: '3px 6px', display: 'flex', gap: 3 }}>
        {['"La mejor agencia inmobiliaria"', '"Proceso impecable"'].map((t, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: 5, padding: 3 }}>
            <div style={{ fontSize: 3.2, color: 'rgba(212,175,55,0.6)', lineHeight: 1.3 }}>{t}</div>
            <div style={{ fontSize: 3, color: '#d4af37', marginTop: 1 }}>⭐⭐⭐⭐⭐</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, borderTop: '1px solid rgba(212,175,55,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Propiedades', 'Quiénes Somos', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(212,175,55,0.35)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

// ─── VIVACE — Restaurante ──────────────────────────────────────────────────
function PreviewVivace() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#120800' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 20%,rgba(251,146,60,0.18) 0%,transparent 60%)' }} />
      <MiniNav logo="VIVACE" logoColor="#fb923c" linkColor="rgba(251,146,60,0.6)" bg="rgba(18,8,0,0.9)" border="rgba(251,146,60,0.15)" ctaBg="rgba(251,146,60,0.9)" ctaColor="#fff" />
      <div style={{ position: 'absolute', top: 23, left: 0, right: 0, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ fontSize: 3.8, letterSpacing: 4, color: 'rgba(251,146,60,0.65)', marginBottom: 3 }}>FINE DINING</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
          Una Experiencia<br /><span style={{ color: '#fb923c' }}>Gastronómica Única</span>
        </div>
        <div style={{ fontSize: 4, color: 'rgba(251,146,60,0.5)', marginTop: 2 }}>Cocina de autor con los mejores ingredientes</div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 5 }}>
          <div style={{ fontSize: 4.5, fontWeight: 700, color: '#fff', background: '#fb923c', padding: '3px 8px', borderRadius: 10 }}>Reservar mesa</div>
          <div style={{ fontSize: 4.5, color: 'rgba(251,146,60,0.8)', border: '1px solid rgba(251,146,60,0.3)', padding: '3px 8px', borderRadius: 10 }}>Ver menú</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 98, left: 6, right: 6, display: 'flex', gap: 3 }}>
        {[{ l: 'Pasta', r: '-8deg' }, { l: 'Risotto', r: '0deg' }, { l: 'Tiramisú', r: '8deg' }].map((d, i) => (
          <div key={d.l} style={{ flex: 1, borderRadius: 10, background: 'rgba(251,146,60,0.09)', border: '1px solid rgba(251,146,60,0.22)', padding: '4px 3px', transform: i === 1 ? 'translateY(-5px) scale(1.06) perspective(200px) rotateX(8deg)' : `rotate(${d.r}) perspective(200px) rotateX(6deg)`, boxShadow: i === 1 ? '0 6px 18px rgba(251,146,60,0.25)' : '0 3px 10px rgba(0,0,0,0.4)', textAlign: 'center' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(251,146,60,0.12)', border: '2px solid rgba(251,146,60,0.3)', margin: '0 auto 2px' }} />
            <div style={{ fontSize: 4, color: 'rgba(251,146,60,0.8)', fontWeight: 600 }}>{d.l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 148, left: 4, right: 4, display: 'flex', gap: 2 }}>
        {['Entrantes', 'Principales', 'Postres', 'Vinos'].map(c => (
          <div key={c} style={{ flex: 1, textAlign: 'center', borderRadius: 6, padding: '3px 2px', background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.14)' }}>
            <div style={{ fontSize: 3.5, color: 'rgba(251,146,60,0.7)' }}>{c}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 162, left: 4, right: 4, display: 'flex', gap: 3, marginTop: 4 }}>
        {['"Mejor restaurante de la ciudad"', '"Experiencia inolvidable"'].map((t, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(251,146,60,0.04)', border: '1px solid rgba(251,146,60,0.1)', borderRadius: 5, padding: 3, marginTop: 4 }}>
            <div style={{ fontSize: 3.2, color: 'rgba(251,146,60,0.6)' }}>{t}</div>
            <div style={{ fontSize: 3, color: '#fb923c', marginTop: 1 }}>⭐⭐⭐⭐⭐</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, borderTop: '1px solid rgba(251,146,60,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Menú', 'Reservas', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(251,146,60,0.35)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

// ─── NEXUS — E-Commerce ────────────────────────────────────────────────────
function PreviewNexus() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#030712' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#030712 0%,#0c1445 40%,#1e1b4b 70%,#030712 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />
      <MiniNav logo="NEXUS" logoColor="#818cf8" linkColor="rgba(200,200,255,0.5)" bg="rgba(3,7,18,0.92)" border="rgba(99,102,241,0.15)" ctaBg="linear-gradient(90deg,#6366f1,#ec4899)" ctaColor="#fff" />
      <div style={{ position: 'absolute', top: 23, left: 0, right: 0, textAlign: 'center', padding: '0 8px' }}>
        <div style={{ display: 'inline-block', fontSize: 4.2, color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', padding: '1px 6px', borderRadius: 8, background: 'rgba(99,102,241,0.08)', marginBottom: 4 }}>🛍 Colección 2026</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
          Compra el <span style={{ background: 'linear-gradient(90deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Futuro</span>
        </div>
        <div style={{ fontSize: 4, color: 'rgba(200,200,255,0.45)', marginTop: 2 }}>Productos curados para el estilo de vida moderno</div>
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 5 }}>
          <div style={{ fontSize: 4.5, fontWeight: 700, color: '#fff', background: 'linear-gradient(90deg,#6366f1,#ec4899)', padding: '3px 8px', borderRadius: 10 }}>Ver colección</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 105, left: 4, right: 4, display: 'flex', gap: 3 }}>
        {[{ accent: '#6366f1', price: '$129', label: 'Pro X1', color: 'rgba(99,102,241,0.18)' }, { accent: '#ec4899', price: '$89', label: 'Wave S', color: 'rgba(236,72,153,0.18)' }, { accent: '#8b5cf6', price: '$219', label: 'Elite', color: 'rgba(139,92,246,0.18)' }].map((p, i) => (
          <div key={p.label} style={{ flex: 1, borderRadius: 10, background: p.color, border: `1px solid ${p.accent}40`, padding: '5px 4px 4px', transform: i === 1 ? 'translateY(-7px) scale(1.05)' : `perspective(250px) rotateY(${i === 0 ? 12 : -12}deg)`, boxShadow: i === 1 ? `0 8px 20px ${p.accent}35` : 'none' }}>
            <div style={{ height: 26, borderRadius: 6, background: `${p.accent}15`, marginBottom: 3, border: `1px solid ${p.accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, background: `${p.accent}30`, border: `1px solid ${p.accent}60` }} />
            </div>
            <div style={{ fontSize: 6.5, color: '#fff', fontWeight: 700 }}>{p.label}</div>
            <div style={{ fontSize: 6, color: p.accent, fontWeight: 700 }}>{p.price}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 157, left: 4, right: 4, display: 'flex', gap: 3 }}>
        {['"Envío rapidísimo"', '"Calidad premium"'].map((t, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 5, padding: 3 }}>
            <div style={{ fontSize: 3.2, color: 'rgba(200,200,255,0.55)' }}>{t}</div>
            <div style={{ fontSize: 3, color: '#818cf8', marginTop: 1 }}>⭐⭐⭐⭐⭐</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, borderTop: '1px solid rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Tienda', 'Categorías', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(99,102,241,0.4)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

// ─── VERTEX — Agencia 3D (NUEVO) ──────────────────────────────────────────
function PreviewVertex() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#020a0a' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 70% at 50% 30%,rgba(0,229,200,0.08) 0%,transparent 65%)' }} />
      {/* 3D floating shapes */}
      <div style={{ position: 'absolute', top: '22%', right: '8%', width: 38, height: 38, background: 'rgba(0,229,200,0.08)', border: '1px solid rgba(0,229,200,0.35)', borderRadius: 6, transform: 'perspective(200px) rotateX(25deg) rotateY(-20deg)', boxShadow: '4px 4px 16px rgba(0,229,200,0.15), inset 1px 1px 0 rgba(0,229,200,0.2)' }} />
      <div style={{ position: 'absolute', top: '30%', right: '18%', width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,229,200,0.06)', border: '1px solid rgba(0,229,200,0.25)', boxShadow: '0 0 16px rgba(0,229,200,0.2)', transform: 'perspective(200px) rotateX(15deg)' }} />
      <div style={{ position: 'absolute', top: '40%', right: '4%', width: 16, height: 16, background: 'rgba(0,180,160,0.1)', border: '1px solid rgba(0,229,200,0.2)', transform: 'perspective(200px) rotateX(20deg) rotateY(15deg) rotate(45deg)' }} />
      <div style={{ position: 'absolute', top: '25%', left: '5%', width: 24, height: 24, background: 'rgba(0,229,200,0.06)', border: '1px solid rgba(0,229,200,0.2)', borderRadius: 4, transform: 'perspective(200px) rotateX(18deg) rotateY(18deg)', boxShadow: '3px 3px 10px rgba(0,229,200,0.12)' }} />
      <MiniNav logo="VERTEX" logoColor="#00e5c8" linkColor="rgba(0,229,200,0.55)" bg="rgba(2,10,10,0.92)" border="rgba(0,229,200,0.12)" ctaBg="rgba(0,229,200,0.85)" ctaColor="#020a0a" />
      <div style={{ position: 'absolute', top: 23, left: 0, right: 0, padding: '0 8px' }}>
        <div style={{ fontSize: 3.8, letterSpacing: 4, color: 'rgba(0,229,200,0.55)', marginBottom: 3 }}>AGENCIA 3D & DISEÑO</div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>
          Diseño 3D<br /><span style={{ background: 'linear-gradient(90deg,#00e5c8,#00b4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Sin Límites</span>
        </div>
        <div style={{ fontSize: 4, color: 'rgba(0,229,200,0.45)', marginTop: 3, lineHeight: 1.5 }}>Modelado, animación y visualización 3D para marcas que destacan</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 5 }}>
          <div style={{ fontSize: 4.5, fontWeight: 700, color: '#020a0a', background: '#00e5c8', padding: '3px 8px', borderRadius: 10 }}>Ver portafolio</div>
          <div style={{ fontSize: 4.5, color: 'rgba(0,229,200,0.8)', border: '1px solid rgba(0,229,200,0.3)', padding: '3px 8px', borderRadius: 10 }}>Contactar</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 112, left: 4, right: 4, display: 'flex', gap: 3 }}>
        {[{ l: 'Modelado 3D', c: 'rgba(0,229,200,0.1)' }, { l: 'Animación', c: 'rgba(0,180,255,0.1)' }, { l: 'Web 3D', c: 'rgba(0,229,200,0.07)' }].map(s => (
          <div key={s.l} style={{ flex: 1, borderRadius: 7, padding: '4px 3px', background: s.c, border: '1px solid rgba(0,229,200,0.18)', textAlign: 'center', transform: 'perspective(200px) rotateX(8deg)', boxShadow: '0 4px 10px rgba(0,229,200,0.08)' }}>
            <div style={{ width: 16, height: 16, borderRadius: 3, background: 'rgba(0,229,200,0.12)', border: '1px solid rgba(0,229,200,0.25)', margin: '0 auto 2px', transform: 'perspective(100px) rotateY(10deg)' }} />
            <div style={{ fontSize: 3.8, color: 'rgba(0,229,200,0.8)', fontWeight: 600 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 150, left: 4, right: 4, display: 'flex', gap: 3 }}>
        {['"Modelos increíbles"', '"Superaron expectativas"'].map((t, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(0,229,200,0.04)', border: '1px solid rgba(0,229,200,0.1)', borderRadius: 5, padding: 3 }}>
            <div style={{ fontSize: 3.2, color: 'rgba(0,229,200,0.55)' }}>{t}</div>
            <div style={{ fontSize: 3, color: '#00e5c8', marginTop: 1 }}>⭐⭐⭐⭐⭐</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, borderTop: '1px solid rgba(0,229,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Portafolio', 'Servicios', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(0,229,200,0.35)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

// ─── CINEMATIC — Video/Producción (NUEVO) ─────────────────────────────────
function PreviewCinematic() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 12, background: '#050505' }}>
      {/* Scanlines overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.012) 3px,rgba(255,255,255,0.012) 4px)', zIndex: 2, pointerEvents: 'none' }} />
      {/* Video hero simulation */}
      <div style={{ position: 'absolute', top: 19, left: 0, right: 0, bottom: 50, background: '#0a0505', overflow: 'hidden' }}>
        {/* Cinematic letterbox bars */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 10, background: '#000', zIndex: 3 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: '#000', zIndex: 3 }} />
        {/* Video content simulation */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,#1a0505 0%,#050505 40%,#0d0505 100%)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 40%,rgba(220,38,38,0.12) 0%,transparent 65%)' }} />
          {/* Film grain dots */}
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: 1.5, height: 1.5, borderRadius: '50%', top: `${(i * 23 + 11) % 90}%`, left: `${(i * 37 + 17) % 100}%`, background: `rgba(255,255,255,${0.06 + (i % 4) * 0.03})` }} />
          ))}
        </div>
        {/* Play button */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(220,38,38,0.85)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(220,38,38,0.5)', zIndex: 4 }}>
          <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid white', marginLeft: 2 }} />
        </div>
        {/* Overlay text */}
        <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', zIndex: 4 }}>
          <div style={{ fontSize: 4, letterSpacing: 5, color: 'rgba(255,255,255,0.4)' }}>SHOWREEL 2026</div>
        </div>
        {/* Timecode bar */}
        <div style={{ position: 'absolute', bottom: 10, left: 6, right: 6, height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, zIndex: 4 }}>
          <div style={{ width: '35%', height: '100%', background: '#dc2626', borderRadius: 1 }} />
        </div>
      </div>
      <MiniNav logo="CINEMAX" logoColor="#dc2626" linkColor="rgba(255,255,255,0.5)" bg="rgba(5,5,5,0.97)" border="rgba(220,38,38,0.2)" ctaBg="rgba(220,38,38,0.85)" ctaColor="#fff" />
      {/* Main title overlaid */}
      <div style={{ position: 'absolute', top: 26, left: 0, right: 0, textAlign: 'center', zIndex: 5 }}>
        <div style={{ fontSize: 3.5, letterSpacing: 5, color: 'rgba(220,38,38,0.7)', marginBottom: 2 }}>PRODUCCIÓN AUDIOVISUAL</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#fff', lineHeight: 1.1, textShadow: '0 2px 20px rgba(220,38,38,0.4)' }}>
          Tu Historia,<br /><span style={{ color: '#dc2626' }}>Nuestra Visión</span>
        </div>
      </div>
      {/* Services bottom */}
      <div style={{ position: 'absolute', bottom: 14, left: 4, right: 4, display: 'flex', gap: 3 }}>
        {['Videomarketing', 'Spots TV', 'Contenido Digital'].map(s => (
          <div key={s} style={{ flex: 1, borderRadius: 6, padding: '4px 3px', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.18)', textAlign: 'center' }}>
            <div style={{ fontSize: 3.5, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>{s}</div>
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 12, borderTop: '1px solid rgba(220,38,38,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        {['Portafolio', 'Servicios', 'Contacto'].map(l => <span key={l} style={{ fontSize: 3.2, color: 'rgba(220,38,38,0.35)' }}>{l}</span>)}
      </div>
      <WaDot />
    </div>
  )
}

const TEMPLATES: Template[] = [
  {
    id: 'stellar', name: 'Stellar', tagline: 'SaaS & Tecnología IA', category: 'Tech / SaaS',
    tags: ['Oscuro', 'Moderno', 'IA', 'Purple'],
    palette: { bg: '#0a0015', accent: '#a855f7', text: '#e9d5ff', glow: 'rgba(168,85,247,0.3)' },
    preview: <PreviewStellar />,
  },
  {
    id: 'lumina', name: 'Lumina', tagline: 'Salud & Bienestar', category: 'Healthcare',
    tags: ['Claro', 'Profesional', 'Azul', 'Confianza'],
    palette: { bg: '#f8fafc', accent: '#0ea5e9', text: '#0f172a', glow: 'rgba(14,165,233,0.3)' },
    preview: <PreviewLumina />,
  },
  {
    id: 'aurum', name: 'Aurum', tagline: 'Bienes Raíces de Lujo', category: 'Real Estate',
    tags: ['Lujo', 'Dorado', 'Oscuro', 'Premium'],
    palette: { bg: '#080c0a', accent: '#d4af37', text: '#f5e6c8', glow: 'rgba(212,175,55,0.3)' },
    preview: <PreviewAurum />,
  },
  {
    id: 'vivace', name: 'Vivace', tagline: 'Restaurantes & Gastronomía', category: 'Food & Beverage',
    tags: ['Cálido', 'Naranja', 'Elegante', 'Premium'],
    palette: { bg: '#120800', accent: '#fb923c', text: '#fff', glow: 'rgba(251,146,60,0.3)' },
    preview: <PreviewVivace />,
  },
  {
    id: 'nexus', name: 'Nexus', tagline: 'E-Commerce & Retail', category: 'E-Commerce',
    tags: ['Vibrante', 'Moderno', 'Gradiente', 'Joven'],
    palette: { bg: '#030712', accent: '#6366f1', text: '#e0e7ff', glow: 'rgba(99,102,241,0.3)' },
    preview: <PreviewNexus />,
  },
  {
    id: 'vertex', name: 'Vertex', tagline: 'Agencia Creativa 3D', category: '3D / Diseño',
    tags: ['3D', 'Oscuro', 'Cyan', 'Vanguardia'],
    palette: { bg: '#020a0a', accent: '#00e5c8', text: '#ccfff9', glow: 'rgba(0,229,200,0.3)' },
    preview: <PreviewVertex />,
  },
  {
    id: 'cinematic', name: 'Cinemax', tagline: 'Producción Audiovisual', category: 'Video / Media',
    tags: ['Video', 'Oscuro', 'Rojo', 'Cinematográfico'],
    palette: { bg: '#050505', accent: '#dc2626', text: '#fff', glow: 'rgba(220,38,38,0.35)' },
    preview: <PreviewCinematic />,
  },
]

export default function PlantillasPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [previewTpl, setPreviewTpl] = useState<Template | null>(null)

  return (
    <div className="p-4 lg:p-8 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Plantillas de Páginas Web</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Landing pages profesionales con menú completo, secciones y botón WhatsApp — elige la que mejor representa tu marca
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {TEMPLATES.map(tpl => {
          const isHovered = hoveredId === tpl.id
          const isSelected = selected === tpl.id
          return (
            <div
              key={tpl.id}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all"
              style={{
                background: 'rgba(0,10,15,0.8)',
                border: isSelected ? `1px solid ${tpl.palette.accent}` : 'border: 1px solid rgba(0,229,255,0.1)',
                boxShadow: isSelected
                  ? `0 0 30px ${tpl.palette.glow}, 0 16px 40px rgba(0,0,0,0.5)`
                  : isHovered ? '0 0 20px rgba(0,229,255,0.08), 0 16px 40px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.4)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={() => setHoveredId(tpl.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Preview */}
              <div className="relative overflow-hidden" style={{ height: 200 }}>
                <div style={{
                  width: '100%', height: '100%',
                  transform: isHovered ? 'perspective(800px) rotateX(0deg) scale(1)' : 'perspective(800px) rotateX(3deg) scale(0.97)',
                  transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)',
                  transformOrigin: 'center center',
                }}>
                  {tpl.preview}
                </div>
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full" style={{ background: 'rgba(0,10,15,0.85)', border: `1px solid ${tpl.palette.accent}50`, color: tpl.palette.accent, fontSize: 10, backdropFilter: 'blur(8px)', fontWeight: 600 }}>
                  {tpl.category}
                </div>
                {isSelected && (
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: tpl.palette.accent, boxShadow: `0 0 12px ${tpl.palette.glow}` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-base" style={{ color: '#e0f7ff' }}>{tpl.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(224,247,255,0.5)' }}>{tpl.tagline}</p>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: tpl.palette.bg, border: '1px solid rgba(255,255,255,0.15)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: tpl.palette.accent }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: tpl.palette.text, border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.12)', color: 'rgba(0,229,255,0.6)', fontSize: 10 }}>{tag}</span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreviewTpl(tpl)}
                    className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.12)', color: 'rgba(0,229,255,0.6)' }}
                  >
                    👁 Vista previa
                  </button>
                  <button
                    onClick={() => setSelected(isSelected ? null : tpl.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: isSelected ? `${tpl.palette.accent}20` : 'rgba(0,229,255,0.06)', border: isSelected ? `1px solid ${tpl.palette.accent}60` : '1px solid rgba(0,229,255,0.15)', color: isSelected ? tpl.palette.accent : 'rgba(224,247,255,0.7)' }}
                  >
                    {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: `linear-gradient(135deg,${tpl.palette.accent},${tpl.palette.accent}aa)`, color: '#fff', boxShadow: `0 4px 12px ${tpl.palette.glow}` }}
                    onClick={() => alert(`Contacta a RIAVA para solicitar la plantilla "${tpl.name}"!\ncontacto@riava.cl`)}
                  >
                    Solicitar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: 'rgba(0,20,30,0.8)', border: '1px solid rgba(0,229,255,0.2)' }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>
              Plantilla seleccionada: <span style={{ color: '#00e5ff' }}>{TEMPLATES.find(t => t.id === selected)?.name}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>Contáctanos para comenzar a construir tu landing page personalizada</p>
          </div>
          <button className="btn-tron px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap" style={{ color: '#000a0f' }} onClick={() => alert('¡Nos pondremos en contacto contigo pronto!\ncontacto@riava.cl')}>
            Comenzar proyecto
          </button>
        </div>
      )}

      {/* Preview modal */}
      {previewTpl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,5,8,0.96)', backdropFilter: 'blur(6px)' }}
          onClick={() => setPreviewTpl(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: '94vw', maxWidth: 980, height: '90vh', display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 40px 80px rgba(0,0,0,0.85)' }}
          >
            {/* Browser chrome */}
            <div style={{ height: 38, background: '#1c1c1e', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#28ca41' }} />
              </div>
              <div style={{ flex: 1, height: 22, borderRadius: 11, background: '#2c2c2e', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5 }}>
                <span style={{ fontSize: 10, color: '#8e8e93' }}>🔒</span>
                <span style={{ fontSize: 10, color: '#8e8e93' }}>www.tuempresa.cl — {previewTpl.name}</span>
              </div>
              <button
                onClick={() => setPreviewTpl(null)}
                style={{ fontSize: 11, color: 'rgba(224,247,255,0.45)', cursor: 'pointer', background: 'none', border: 'none', padding: '2px 8px', borderRadius: 4 }}
              >
                ✕ Cerrar
              </button>
            </div>
            {/* Scaled preview */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: previewTpl.palette.bg }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 320, height: 200, transformOrigin: 'top left', transform: 'scale(3)' }}>
                {previewTpl.preview}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
