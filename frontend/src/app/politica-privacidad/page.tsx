import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad | RIAVA System',
  description: 'Política de Privacidad y tratamiento de datos de RIAVA System. Versión 1.0.',
}

const sections = [
  {
    num: '1',
    title: 'RESPONSABLE DEL TRATAMIENTO',
    content: [
      'RIAVA System ("nosotros", "RIAVA") es responsable del tratamiento de los datos personales recopilados a través de riava.cl, sus formularios de contacto, sus campañas publicitarias en Meta (Facebook e Instagram) y sus canales de WhatsApp Business.',
      'Para cualquier consulta sobre esta política o sobre tus datos personales, puedes escribirnos a contacto@riava.cl.',
    ],
  },
  {
    num: '2',
    title: 'QUÉ DATOS RECOPILAMOS',
    content: [
      'Dependiendo de cómo interactúes con nosotros, podemos recopilar:',
    ],
    bullets: [
      'Datos de contacto que envías voluntariamente a través del formulario de contacto de riava.cl (nombre, apellido, correo electrónico, teléfono, servicio de interés y mensaje).',
      'Datos de formularios de clientes potenciales ("lead ads") completados en nuestras campañas de Instagram o Facebook, incluyendo las respuestas a preguntas personalizadas del formulario.',
      'El contenido de las conversaciones que mantengas con nosotros o con nuestros agentes de inteligencia artificial a través de WhatsApp Business, cuando nos escribes o cuando aceptas ser contactado.',
      'Información técnica básica asociada al uso del sitio web (por ejemplo, a través de cookies o herramientas de analítica), si corresponde.',
    ],
  },
  {
    num: '3',
    title: 'PARA QUÉ USAMOS TUS DATOS',
    content: [
      'Utilizamos los datos recopilados para:',
    ],
    bullets: [
      'Responder tus consultas y coordinar la prestación de nuestros servicios.',
      'Evaluar y calificar la calidad de un contacto comercial (incluyendo el uso de modelos de inteligencia artificial para generar un puntaje de calificación y un resumen explicativo, cuando aplica).',
      'Enviarte respuestas automatizadas o asistidas por inteligencia artificial a través de WhatsApp, en el contexto de la conversación que iniciaste con nosotros o con uno de nuestros clientes que utiliza nuestra plataforma.',
      'Notificar internamente a nuestro equipo comercial cuando se recibe un nuevo contacto o lead.',
      'Mejorar nuestros servicios y el funcionamiento de nuestras herramientas internas.',
    ],
  },
  {
    num: '4',
    title: 'BASE LEGAL Y CONSENTIMIENTO',
    content: [
      'Tratamos tus datos en base al consentimiento que otorgas al completar voluntariamente un formulario de contacto, un formulario de leads en Meta, o al iniciar una conversación por WhatsApp con nosotros o con un negocio que utiliza nuestra plataforma de agentes de IA.',
    ],
  },
  {
    num: '5',
    title: 'PROVEEDORES Y SERVICIOS DE TERCEROS',
    content: [
      'Para operar nuestros servicios, utilizamos proveedores externos que procesan datos en nuestro nombre, entre ellos:',
    ],
    bullets: [
      'Meta Platforms, Inc. — para la gestión de campañas publicitarias, formularios de clientes potenciales y la API oficial de WhatsApp Business (Cloud API).',
      'Vercel Inc. — para el alojamiento (hosting) de nuestra plataforma web y funciones de servidor.',
      'Upstash — para el almacenamiento de datos operativos (leads, conversaciones y configuración) en una base de datos administrada.',
      'Anthropic — para la generación de respuestas y análisis mediante modelos de inteligencia artificial (Claude).',
      'Zoho — para el envío de notificaciones por correo electrónico.',
    ],
    after: [
      'No vendemos tus datos personales a terceros. Solo los compartimos con los proveedores necesarios para prestar el servicio, bajo sus propias políticas de seguridad y confidencialidad.',
    ],
  },
  {
    num: '6',
    title: 'CONSERVACIÓN DE LOS DATOS',
    content: [
      'Conservamos tus datos mientras exista una relación comercial activa o potencial contigo, o mientras sea necesario para cumplir con los fines descritos en esta política. Puedes solicitar la eliminación de tus datos en cualquier momento escribiendo a contacto@riava.cl.',
    ],
  },
  {
    num: '7',
    title: 'TUS DERECHOS',
    content: [
      'Puedes solicitarnos en cualquier momento, escribiendo a contacto@riava.cl:',
    ],
    bullets: [
      'Acceder a los datos personales que tenemos sobre ti.',
      'Rectificar datos inexactos o incompletos.',
      'Solicitar la eliminación de tus datos.',
      'Oponerte al tratamiento de tus datos para fines comerciales.',
      'Dejar de recibir mensajes por WhatsApp respondiendo con la palabra "STOP" o solicitándolo directamente.',
    ],
  },
  {
    num: '8',
    title: 'SEGURIDAD',
    content: [
      'Aplicamos medidas técnicas razonables para proteger tus datos, incluyendo el uso de conexiones cifradas (HTTPS), almacenamiento en proveedores con controles de seguridad reconocidos, y acceso restringido a la información por parte de nuestro equipo.',
    ],
  },
  {
    num: '9',
    title: 'MENORES DE EDAD',
    content: [
      'Nuestros servicios están dirigidos a empresas y personas naturales mayores de 18 años. No recopilamos intencionalmente datos de menores de edad.',
    ],
  },
  {
    num: '10',
    title: 'CAMBIOS A ESTA POLÍTICA',
    content: [
      'Podemos actualizar esta Política de Privacidad periódicamente. La versión vigente siempre estará disponible en esta misma página, indicando su número de versión.',
    ],
  },
]

export default function PoliticaPrivacidadPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-400 text-sm mb-8 hover:text-blue-300 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold mb-2">RIAVA System</h1>
          <p className="text-blue-400 text-lg font-semibold tracking-wide mb-1">POLÍTICA DE PRIVACIDAD</p>
          <p className="text-slate-400 text-sm">Versión 1.0</p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600 text-base leading-relaxed border-l-4 border-blue-500 pl-4">
          En <strong>RIAVA System</strong> respetamos tu privacidad. Esta política explica qué datos personales
          recopilamos cuando interactúas con nuestro sitio web, nuestros formularios de contacto, nuestras
          campañas en Meta (Facebook e Instagram) y nuestros canales de WhatsApp Business, cómo los usamos y
          qué derechos tienes sobre ellos.
        </p>
      </div>

      {/* Sections */}
      <div className="max-w-4xl mx-auto px-6 pb-16 space-y-6">
        {sections.map((s) => (
          <div key={s.num} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-800 px-6 py-3">
              <h2 className="text-white font-semibold text-sm tracking-wide">
                {s.num}. {s.title}
              </h2>
            </div>
            <div className="px-6 py-5 space-y-3">
              {s.content.map((p, i) => (
                <p key={i} className="text-gray-700 text-sm leading-relaxed">{p}</p>
              ))}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="space-y-1.5 pl-2">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.after?.map((p, i) => (
                <p key={i} className="text-gray-700 text-sm leading-relaxed">{p}</p>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="bg-slate-900 rounded-xl px-6 py-6 text-center">
          <p className="text-slate-400 text-sm">
            <span className="text-white font-semibold">RIAVA System</span>
            {'  ·  '}
            <a href="mailto:contacto@riava.cl" className="text-blue-400 hover:text-blue-300">contacto@riava.cl</a>
            {'  ·  '}
            <a href="https://www.riava.cl" className="text-blue-400 hover:text-blue-300">www.riava.cl</a>
            {'  ·  '}
            Versión 1.0
          </p>
        </div>
      </div>
    </main>
  )
}
