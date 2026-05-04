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

function TemplatePreview1() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #0a0015 0%, #12003a 50%, #0a0015 100%)' }}>
      {/* Stars */}
      {[...Array(30)].map((_, i) => (
        <div key={i} className="absolute rounded-full" style={{
          width: Math.random() * 2 + 1,
          height: Math.random() * 2 + 1,
          top: `${Math.random() * 70}%`,
          left: `${Math.random() * 100}%`,
          background: `rgba(${Math.random() > 0.5 ? '160,100,255' : '80,180,255'},${Math.random() * 0.8 + 0.2})`,
        }} />
      ))}
      {/* Orb */}
      <div className="absolute" style={{
        width: 140, height: 140, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(120,60,255,0.6) 0%, rgba(60,20,180,0.3) 50%, transparent 70%)',
        top: '10%', left: '50%', transform: 'translateX(-50%)',
        filter: 'blur(8px)',
      }} />
      {/* Hero text */}
      <div className="absolute" style={{ top: '20%', left: 0, right: 0, textAlign: 'center' }}>
        <div className="mx-auto mb-1 text-xs font-bold" style={{ color: '#a855f7', fontSize: 10, letterSpacing: 4 }}>STELLAR PLATFORM</div>
        <div className="mx-2" style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2, textShadow: '0 0 20px rgba(168,85,247,0.8)' }}>
          Build the<br />
          <span style={{ background: 'linear-gradient(90deg,#a855f7,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Future
          </span>
        </div>
        <div className="mt-2 mx-4 text-center" style={{ fontSize: 6, color: 'rgba(200,180,255,0.6)', lineHeight: 1.5 }}>
          AI-powered infrastructure for the next generation of software companies
        </div>
      </div>
      {/* CTA */}
      <div className="absolute flex gap-1.5 justify-center" style={{ bottom: '30%', left: 0, right: 0 }}>
        <div className="rounded-full px-3 py-1 text-xs" style={{ background: 'linear-gradient(90deg,#7c3aed,#2563eb)', color: '#fff', fontSize: 7, fontWeight: 700 }}>
          Get Started
        </div>
        <div className="rounded-full px-3 py-1 text-xs" style={{ border: '1px solid rgba(168,85,247,0.4)', color: 'rgba(200,180,255,0.8)', fontSize: 7 }}>
          Learn More
        </div>
      </div>
      {/* Feature cards */}
      <div className="absolute flex gap-1 justify-center" style={{ bottom: '8%', left: 4, right: 4 }}>
        {['AI Models', 'Scale', 'Security'].map(f => (
          <div key={f} className="flex-1 rounded-lg p-1.5" style={{ background: 'rgba(120,60,255,0.12)', border: '1px solid rgba(120,60,255,0.2)', textAlign: 'center' }}>
            <div style={{ fontSize: 6, color: 'rgba(200,180,255,0.8)', fontWeight: 600 }}>{f}</div>
          </div>
        ))}
      </div>
      {/* 3D perspective floating cards */}
      <div className="absolute" style={{
        width: 50, height: 30, borderRadius: 6,
        background: 'rgba(120,60,255,0.15)',
        border: '1px solid rgba(120,60,255,0.3)',
        top: '55%', right: '5%',
        transform: 'perspective(200px) rotateY(-15deg) rotateX(5deg)',
        backdropFilter: 'blur(4px)',
      }} />
      <div className="absolute" style={{
        width: 40, height: 24, borderRadius: 6,
        background: 'rgba(60,100,255,0.15)',
        border: '1px solid rgba(60,100,255,0.3)',
        top: '52%', left: '5%',
        transform: 'perspective(200px) rotateY(15deg) rotateX(5deg)',
        backdropFilter: 'blur(4px)',
      }} />
    </div>
  )
}

function TemplatePreview2() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl" style={{ background: '#f8fafc' }}>
      {/* Nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2" style={{ background: 'rgba(255,255,255,0.95)', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ width: 40, height: 8, borderRadius: 2, background: 'linear-gradient(90deg,#0ea5e9,#06b6d4)' }} />
        <div className="flex gap-2">
          {['•','•','•'].map((d,i) => <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: '#e2e8f0' }} />)}
        </div>
        <div style={{ width: 28, height: 8, borderRadius: 10, background: '#0ea5e9' }} />
      </div>
      {/* Hero */}
      <div className="absolute flex" style={{ top: '15%', left: 0, right: 0, bottom: 0 }}>
        {/* Left content */}
        <div className="flex-1 flex flex-col justify-center pl-3 pr-1">
          <div style={{ width: 30, height: 4, borderRadius: 2, background: '#0ea5e9', marginBottom: 6 }} />
          <div style={{ fontSize: 11, fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: 4 }}>
            Your Health,<br />Our Priority
          </div>
          <div style={{ fontSize: 5.5, color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>
            World-class medical care with compassionate professionals by your side.
          </div>
          <div style={{ width: 50, height: 14, borderRadius: 20, background: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 6, color: '#fff', fontWeight: 700 }}>Book Now</span>
          </div>
          {/* Stats */}
          <div className="flex gap-2 mt-3">
            {[['98%','Satisfaction'], ['15+','Years'], ['50k+','Patients']].map(([v,l]) => (
              <div key={l}>
                <div style={{ fontSize: 8, fontWeight: 800, color: '#0ea5e9' }}>{v}</div>
                <div style={{ fontSize: 5, color: '#94a3b8' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Right 3D visual */}
        <div className="flex-1 relative flex items-center justify-center">
          {/* 3D floating phone/card */}
          <div style={{
            width: 60, height: 90, borderRadius: 10,
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            border: '2px solid #7dd3fc',
            transform: 'perspective(300px) rotateY(-20deg) rotateX(5deg)',
            boxShadow: '8px 8px 24px rgba(14,165,233,0.2), -4px -4px 12px rgba(255,255,255,0.8)',
            position: 'relative',
          }}>
            <div style={{ width: 40, height: 6, borderRadius: 2, background: '#38bdf8', margin: '8px auto 4px' }} />
            <div style={{ width: 30, height: 4, borderRadius: 2, background: '#bae6fd', margin: '0 auto 6px' }} />
            {[1,2,3].map(i => (
              <div key={i} style={{ width: '80%', height: 10, borderRadius: 4, background: '#e0f2fe', margin: '3px auto', border: '1px solid #bae6fd' }} />
            ))}
          </div>
          {/* Floating badge */}
          <div className="absolute" style={{
            top: '15%', right: '5%', padding: '3px 6px', borderRadius: 6,
            background: '#0ea5e9', color: '#fff', fontSize: 5.5, fontWeight: 700,
            boxShadow: '0 4px 12px rgba(14,165,233,0.4)',
            transform: 'perspective(200px) rotateY(10deg)',
          }}>
            ✓ Available
          </div>
        </div>
      </div>
      {/* Blue accent bar */}
      <div className="absolute bottom-0 left-0 right-0" style={{ height: 4, background: 'linear-gradient(90deg, #0ea5e9, #06b6d4, #0ea5e9)' }} />
    </div>
  )
}

function TemplatePreview3() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl" style={{ background: '#080c0a' }}>
      {/* Gold pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(212,175,55,0.03) 20px, rgba(212,175,55,0.03) 21px)',
      }} />
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
        <div style={{ fontSize: 8, fontWeight: 800, color: '#d4af37', letterSpacing: 3 }}>AURUM</div>
        <div className="flex gap-2">
          {['Properties', 'About', 'Contact'].map(l => (
            <div key={l} style={{ fontSize: 5, color: 'rgba(212,175,55,0.6)' }}>{l}</div>
          ))}
        </div>
      </div>
      {/* Hero */}
      <div className="absolute" style={{ top: '18%', left: 0, right: 0, textAlign: 'center' }}>
        <div style={{ fontSize: 7, letterSpacing: 5, color: 'rgba(212,175,55,0.6)', marginBottom: 4 }}>LUXURY REAL ESTATE</div>
        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2, textShadow: '0 0 30px rgba(212,175,55,0.3)' }}>
          Find Your<br />
          <span style={{ color: '#d4af37' }}>Dream Home</span>
        </div>
        {/* Search bar */}
        <div className="mx-4 mt-3 flex items-center gap-1 rounded-full px-3 py-1.5" style={{
          background: 'rgba(212,175,55,0.07)',
          border: '1px solid rgba(212,175,55,0.25)',
        }}>
          <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(212,175,55,0.1)' }} />
          <div style={{ width: 20, height: 10, borderRadius: 20, background: '#d4af37', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 5, color: '#080c0a', fontWeight: 700 }}>Go</span>
          </div>
        </div>
      </div>
      {/* 3D property cards */}
      <div className="absolute flex gap-2 justify-center" style={{ bottom: '10%', left: 4, right: 4 }}>
        {[
          { price: '$2.4M', type: 'Villa', img: 'rgba(212,175,55,0.15)' },
          { price: '$890K', type: 'Apt', img: 'rgba(180,140,30,0.15)' },
          { price: '$1.2M', type: 'House', img: 'rgba(212,175,55,0.1)' },
        ].map((p, i) => (
          <div key={p.type} style={{
            flex: 1, borderRadius: 8,
            background: p.img,
            border: '1px solid rgba(212,175,55,0.2)',
            transform: i === 1 ? 'translateY(-6px) scale(1.05)' : `perspective(200px) rotateY(${i === 0 ? 10 : -10}deg)`,
            padding: '6px 4px 4px',
            boxShadow: i === 1 ? '0 8px 20px rgba(212,175,55,0.15)' : 'none',
          }}>
            <div style={{ height: 24, borderRadius: 4, background: 'rgba(212,175,55,0.08)', marginBottom: 3, border: '1px solid rgba(212,175,55,0.1)' }} />
            <div style={{ fontSize: 7, color: '#d4af37', fontWeight: 700 }}>{p.price}</div>
            <div style={{ fontSize: 5, color: 'rgba(212,175,55,0.5)' }}>{p.type}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TemplatePreview4() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl" style={{ background: '#1a0800' }}>
      {/* Warm gradient */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(251,146,60,0.2) 0%, transparent 60%)',
      }} />
      {/* Nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2">
        <div style={{ fontSize: 9, fontWeight: 900, color: '#fb923c', letterSpacing: 1 }}>VIVACE</div>
        <div style={{ width: 30, height: 10, borderRadius: 20, background: '#fb923c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 5.5, color: '#fff', fontWeight: 700 }}>Reserve</span>
        </div>
      </div>
      {/* Hero image area */}
      <div className="absolute flex items-end justify-center" style={{ top: '18%', left: 8, right: 8, height: 55 }}>
        {/* Floating dish cards */}
        {[
          { label: 'Pasta', top: 0, left: '5%', rotate: '-8deg', bg: 'rgba(251,146,60,0.15)' },
          { label: 'Risotto', top: -10, left: '35%', rotate: '0deg', bg: 'rgba(251,146,60,0.2)', scale: 1.1 },
          { label: 'Tiramisu', top: 0, right: '5%', rotate: '8deg', bg: 'rgba(234,88,12,0.15)' },
        ].map((d, i) => (
          <div key={d.label} className="absolute" style={{
            width: 44, height: 44, borderRadius: 12,
            background: d.bg,
            border: '1px solid rgba(251,146,60,0.3)',
            top: d.top,
            left: d.left,
            right: (d as any).right,
            transform: `rotate(${d.rotate}) ${(d as any).scale ? 'scale(1.1)' : ''} perspective(200px) rotateX(10deg)`,
            boxShadow: (d as any).scale ? '0 8px 24px rgba(251,146,60,0.3)' : '0 4px 12px rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(251,146,60,0.2)', border: '2px solid rgba(251,146,60,0.4)' }} />
          </div>
        ))}
      </div>
      {/* Text */}
      <div className="absolute text-center" style={{ top: '52%', left: 0, right: 0 }}>
        <div style={{ fontSize: 6, letterSpacing: 4, color: 'rgba(251,146,60,0.7)', marginBottom: 2 }}>FINE DINING</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          Experience <span style={{ color: '#fb923c' }}>Flavor</span><br />Like Never Before
        </div>
      </div>
      {/* Bottom menu preview */}
      <div className="absolute flex gap-1 justify-center" style={{ bottom: '8%', left: 4, right: 4 }}>
        {['Starters', 'Mains', 'Desserts', 'Wine'].map(c => (
          <div key={c} className="flex-1 text-center rounded-lg py-1" style={{
            background: 'rgba(251,146,60,0.08)',
            border: '1px solid rgba(251,146,60,0.15)',
            fontSize: 5,
            color: 'rgba(251,146,60,0.7)',
          }}>
            {c}
          </div>
        ))}
      </div>
    </div>
  )
}

function TemplatePreview5() {
  return (
    <div className="w-full h-full relative overflow-hidden rounded-xl" style={{ background: '#030712' }}>
      {/* Gradient background */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, #030712 0%, #0c1445 40%, #1e1b4b 70%, #030712 100%)',
      }} />
      {/* Grid */}
      <div className="absolute inset-0" style={{
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />
      {/* Top nav */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2" style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
        <div style={{ fontSize: 8, fontWeight: 800, background: 'linear-gradient(90deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NEXUS</div>
        <div className="flex gap-1">
          <div style={{ width: 24, height: 8, borderRadius: 10, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }} />
          <div style={{ width: 24, height: 8, borderRadius: 10, background: 'linear-gradient(90deg,#6366f1,#ec4899)' }} />
        </div>
      </div>
      {/* Hero */}
      <div className="absolute text-center" style={{ top: '18%', left: 0, right: 0 }}>
        <div className="mx-3 mb-2 px-2 py-0.5 rounded-full inline-block" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', fontSize: 5.5, color: '#818cf8' }}>
          🛍 New Collection 2026
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
          Shop the <span style={{ background: 'linear-gradient(90deg,#6366f1,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Future</span>
        </div>
        <div style={{ fontSize: 5.5, color: 'rgba(200,200,255,0.5)', marginTop: 2 }}>
          Curated products for modern living
        </div>
      </div>
      {/* Product cards 3D */}
      <div className="absolute flex gap-1.5 justify-center" style={{ bottom: '12%', left: 4, right: 4 }}>
        {[
          { color: 'rgba(99,102,241,0.2)', accent: '#6366f1', price: '$129', label: 'Pro X1', featured: false },
          { color: 'rgba(236,72,153,0.2)', accent: '#ec4899', price: '$89', label: 'Wave S', featured: true },
          { color: 'rgba(139,92,246,0.2)', accent: '#8b5cf6', price: '$219', label: 'Elite', featured: false },
        ].map((p, i) => (
          <div key={p.label} style={{
            flex: 1, borderRadius: 10,
            background: p.color,
            border: `1px solid ${p.accent}40`,
            padding: '6px 4px 4px',
            transform: i === 1
              ? 'translateY(-8px) scale(1.06)'
              : `perspective(250px) rotateY(${i === 0 ? 12 : -12}deg)`,
            boxShadow: i === 1 ? `0 8px 20px ${p.accent}30` : 'none',
          }}>
            <div style={{ height: 26, borderRadius: 6, background: `${p.accent}15`, marginBottom: 3, border: `1px solid ${p.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: `${p.accent}30`, border: `1px solid ${p.accent}60` }} />
            </div>
            <div style={{ fontSize: 6.5, color: '#fff', fontWeight: 700 }}>{p.label}</div>
            <div style={{ fontSize: 6, color: p.accent, fontWeight: 700 }}>{p.price}</div>
            {p.featured && (
              <div style={{ fontSize: 4.5, background: p.accent, color: '#fff', borderRadius: 3, padding: '1px 3px', marginTop: 2, display: 'inline-block' }}>
                ★ TOP
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const TEMPLATES: Template[] = [
  {
    id: 'stellar',
    name: 'Stellar',
    tagline: 'SaaS & Tecnología IA',
    category: 'Tech / SaaS',
    tags: ['Oscuro', 'Moderno', 'IA', 'Purple'],
    palette: { bg: '#0a0015', accent: '#a855f7', text: '#e9d5ff', glow: 'rgba(168,85,247,0.3)' },
    preview: <TemplatePreview1 />,
  },
  {
    id: 'lumina',
    name: 'Lumina',
    tagline: 'Salud & Bienestar',
    category: 'Healthcare',
    tags: ['Claro', 'Profesional', 'Azul', 'Confianza'],
    palette: { bg: '#f8fafc', accent: '#0ea5e9', text: '#0f172a', glow: 'rgba(14,165,233,0.3)' },
    preview: <TemplatePreview2 />,
  },
  {
    id: 'aurum',
    name: 'Aurum',
    tagline: 'Bienes Raíces de Lujo',
    category: 'Real Estate',
    tags: ['Lujo', 'Dorado', 'Oscuro', 'Premium'],
    palette: { bg: '#080c0a', accent: '#d4af37', text: '#f5e6c8', glow: 'rgba(212,175,55,0.3)' },
    preview: <TemplatePreview3 />,
  },
  {
    id: 'vivace',
    name: 'Vivace',
    tagline: 'Restaurantes & Gastronomía',
    category: 'Food & Beverage',
    tags: ['Cálido', 'Naranja', 'Elegante', 'Premium'],
    palette: { bg: '#1a0800', accent: '#fb923c', text: '#fff', glow: 'rgba(251,146,60,0.3)' },
    preview: <TemplatePreview4 />,
  },
  {
    id: 'nexus',
    name: 'Nexus',
    tagline: 'E-Commerce & Retail',
    category: 'E-Commerce',
    tags: ['Vibrante', 'Moderno', 'Gradiente', 'Joven'],
    palette: { bg: '#030712', accent: '#6366f1', text: '#e0e7ff', glow: 'rgba(99,102,241,0.3)' },
    preview: <TemplatePreview5 />,
  },
]

export default function PlantillasPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="p-4 lg:p-8 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: '#e0f7ff' }}>Plantillas de Páginas Web</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(0,229,255,0.5)' }}>
          Landing pages profesionales con diseño 3D — elige la que mejor representa tu marca
        </p>
      </div>

      {/* Grid */}
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
                border: isSelected
                  ? `1px solid ${tpl.palette.accent}`
                  : `1px solid rgba(0,229,255,0.1)`,
                boxShadow: isSelected
                  ? `0 0 30px ${tpl.palette.glow}, 0 16px 40px rgba(0,0,0,0.5)`
                  : isHovered
                  ? `0 0 20px rgba(0,229,255,0.08), 0 16px 40px rgba(0,0,0,0.4)`
                  : '0 8px 24px rgba(0,0,0,0.4)',
                transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={() => setHoveredId(tpl.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* 3D Preview */}
              <div
                className="relative overflow-hidden"
                style={{
                  height: 200,
                  perspective: '800px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    transform: isHovered
                      ? 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)'
                      : 'perspective(800px) rotateX(4deg) rotateY(-2deg) scale(0.97)',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transformOrigin: 'center center',
                  }}
                >
                  {tpl.preview}
                </div>

                {/* Category badge */}
                <div
                  className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{
                    background: 'rgba(0,10,15,0.85)',
                    border: `1px solid ${tpl.palette.accent}50`,
                    color: tpl.palette.accent,
                    fontSize: 10,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {tpl.category}
                </div>

                {/* Selected check */}
                {isSelected && (
                  <div
                    className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{
                      background: tpl.palette.accent,
                      boxShadow: `0 0 12px ${tpl.palette.glow}`,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
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
                  {/* Color palette dots */}
                  <div className="flex gap-1 mt-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: tpl.palette.bg, border: '1px solid rgba(255,255,255,0.15)' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: tpl.palette.accent }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: tpl.palette.text, border: '1px solid rgba(0,0,0,0.15)' }} />
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tpl.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        background: 'rgba(0,229,255,0.05)',
                        border: '1px solid rgba(0,229,255,0.12)',
                        color: 'rgba(0,229,255,0.6)',
                        fontSize: 10,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelected(isSelected ? null : tpl.id)}
                    className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: isSelected
                        ? `${tpl.palette.accent}20`
                        : 'rgba(0,229,255,0.06)',
                      border: isSelected
                        ? `1px solid ${tpl.palette.accent}60`
                        : '1px solid rgba(0,229,255,0.15)',
                      color: isSelected ? tpl.palette.accent : 'rgba(224,247,255,0.7)',
                    }}
                  >
                    {isSelected ? '✓ Seleccionada' : 'Seleccionar'}
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${tpl.palette.accent}, ${tpl.palette.accent}aa)`,
                      color: '#fff',
                      boxShadow: `0 4px 12px ${tpl.palette.glow}`,
                    }}
                    onClick={() => {
                      alert(`¡Contacta a RIAVA para solicitar la plantilla "${tpl.name}"!\nCorreo: contacto@riava.cl`)
                    }}
                  >
                    Solicitar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected summary */}
      {selected && (
        <div
          className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            background: 'rgba(0,20,30,0.8)',
            border: '1px solid rgba(0,229,255,0.2)',
          }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: '#e0f7ff' }}>
              Plantilla seleccionada: <span style={{ color: '#00e5ff' }}>{TEMPLATES.find(t => t.id === selected)?.name}</span>
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(0,229,255,0.5)' }}>
              Contáctanos para comenzar a construir tu landing page personalizada
            </p>
          </div>
          <button
            className="btn-tron px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
            style={{ color: '#000a0f' }}
            onClick={() => alert('¡Nos pondremos en contacto contigo pronto!\ncontacto@riava.cl')}
          >
            Comenzar proyecto
          </button>
        </div>
      )}
    </div>
  )
}
