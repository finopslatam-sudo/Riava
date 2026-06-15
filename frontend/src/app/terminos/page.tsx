import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | RIAVA System',
  description: 'Términos y Condiciones de Desarrollo Web de RIAVA System. Versión 1.0.',
}

const sections = [
  {
    num: '1',
    title: 'ACEPTACIÓN DE LOS TÉRMINOS',
    content: [
      'La contratación de cualquier servicio ofrecido por RIAVA System implica la aceptación total e irrevocable de los presentes Términos y Condiciones.',
    ],
  },
  {
    num: '2',
    title: 'ALCANCE DEL SERVICIO',
    content: [
      'RIAVA System desarrollará la solución tecnológica de acuerdo con la propuesta comercial, técnica y funcional previamente aprobada por el cliente.',
      'Cualquier funcionalidad, integración, modificación o requerimiento no contemplado expresamente en la propuesta aprobada será considerado como trabajo adicional y podrá ser cotizado por separado.',
    ],
  },
  {
    num: '3',
    title: 'INFORMACIÓN PROPORCIONADA POR EL CLIENTE',
    content: [
      'El cliente declara y acepta que:',
    ],
    bullets: [
      'Es el único responsable de proporcionar toda la información necesaria para el desarrollo del proyecto.',
      'Es responsable de la exactitud, veracidad, legalidad y vigencia de la información entregada.',
      'Es responsable de proporcionar oportunamente textos, imágenes, logotipos, fotografías, videos, documentos, accesos, credenciales y cualquier otro material requerido para el desarrollo.',
    ],
    after: [
      'RIAVA System no será responsable por errores, omisiones, inconsistencias o perjuicios derivados de información incorrecta, incompleta o desactualizada proporcionada por el cliente.',
    ],
  },
  {
    num: '4',
    title: 'PLAZOS DE ENTREGA',
    content: [
      'Los plazos de desarrollo establecidos en la propuesta comercial son estimativos y consideran la colaboración activa del cliente.',
      'En caso de retrasos ocasionados por:',
    ],
    bullets: [
      'Entrega tardía de información.',
      'Cambios de requerimientos.',
      'Solicitudes adicionales.',
      'Demoras en aprobaciones.',
      'Falta de respuesta del cliente.',
      'Solicitudes de modificaciones fuera del alcance inicial.',
    ],
    after: [
      'Los plazos de entrega podrán extenderse proporcionalmente sin generar responsabilidad alguna para RIAVA System.',
      'RIAVA System no será responsable por retrasos derivados de terceros, proveedores externos o dependencias ajenas a su control.',
    ],
  },
  {
    num: '5',
    title: 'INTEGRACIONES CON SERVICIOS DE TERCEROS',
    content: [
      'Cuando el cliente solicite integraciones con plataformas externas, incluyendo pero no limitado a:',
    ],
    bullets: [
      'Google Analytics, Google Search Console, Google Business Profile.',
      'Meta Ads, Facebook, Instagram, WhatsApp Business.',
      'Mercado Pago, WebPay, Transbank, Stripe.',
      'Shopify, ERP externos, CRM externos, APIs de terceros.',
    ],
    after: [
      'RIAVA System realizará únicamente la implementación técnica acordada y no será responsable por cambios en políticas de terceros, suspensiones de cuentas, bloqueos, errores de plataformas externas, limitaciones de API, costos asociados a servicios externos, pérdidas de información en sistemas de terceros o problemas de disponibilidad de servicios externos.',
    ],
  },
  {
    num: '6',
    title: 'RESPONSABILIDAD SOBRE EL CONTENIDO',
    content: [
      'El cliente será el único responsable del contenido publicado en el sitio web, incluyendo textos, imágenes, fotografías, videos, catálogos, publicaciones, artículos, información comercial, legal, de productos y servicios.',
      'RIAVA System no será responsable por reclamos, demandas, sanciones o perjuicios derivados de la información publicada por el cliente.',
    ],
  },
  {
    num: '7',
    title: 'PAGOS',
    content: [
      'El valor total del proyecto será el indicado en la propuesta comercial aprobada. La forma de pago será:',
    ],
    bullets: [
      '50% al inicio del proyecto.',
      '50% contra entrega formal del proyecto.',
    ],
    after: [
      'El pago inicial constituye la reserva de agenda, planificación, análisis, diseño y comienzo de las actividades de desarrollo.',
    ],
  },
  {
    num: '8',
    title: 'PAGO FRACCIONADO',
    content: [
      'Si ambas partes lo acuerdan expresamente, el valor del proyecto podrá dividirse en pagos semanales durante la duración del proyecto. La suma total de los pagos deberá completar el valor total acordado.',
    ],
  },
  {
    num: '9',
    title: 'DESISTIMIENTO DEL CLIENTE',
    content: [
      'Si el cliente decide cancelar, suspender o desistir del proyecto por cualquier motivo una vez iniciado el desarrollo, deberá igualmente pagar el 50% inicial comprometido.',
      'Dicho monto no será reembolsable bajo ninguna circunstancia, ya que corresponde a horas de trabajo, planificación, diseño, análisis y recursos asignados al proyecto.',
      'En caso de existir trabajos adicionales ejecutados al momento de la cancelación, RIAVA System podrá facturar proporcionalmente los avances efectivamente realizados.',
    ],
  },
  {
    num: '10',
    title: 'ENTREGA FORMAL DEL PROYECTO',
    content: [
      'Se considerará realizada la entrega formal cuando:',
    ],
    bullets: [
      'El sistema haya sido presentado al cliente.',
      'Se hayan entregado los accesos correspondientes.',
      'Se haya habilitado el ambiente productivo.',
      'Se haya enviado la notificación formal de entrega.',
    ],
    after: [
      'A partir de ese momento comenzará a regir el plazo para el pago final.',
    ],
  },
  {
    num: '11',
    title: 'PLAZO PARA EL PAGO FINAL',
    content: [
      'El cliente dispondrá de un máximo de dos (2) días corridos desde la entrega formal para efectuar el pago total pendiente.',
      'Transcurrido dicho plazo sin pago, RIAVA System podrá aplicar un cargo adicional equivalente al 25% de una Unidad de Fomento (UF) por concepto de gastos administrativos y cobranza, sin perjuicio de las demás acciones que correspondan.',
      'Asimismo, RIAVA System podrá suspender accesos, servicios o funcionalidades hasta la regularización completa de los pagos pendientes.',
    ],
  },
  {
    num: '12',
    title: 'MODIFICACIONES POSTERIORES A LA ENTREGA',
    content: [
      'Toda modificación solicitada después de la entrega formal del proyecto será considerada un servicio adicional. El valor mínimo por modificación será:',
    ],
    bullets: [
      '1 UF + IVA por cada requerimiento o modificación solicitada.',
    ],
    after: [
      'Esto incluye: cambios de diseño, nuevas funcionalidades, ajustes de contenido, integraciones adicionales, cambios estructurales, mejoras visuales y correcciones derivadas de nuevos requerimientos.',
    ],
  },
  {
    num: '13',
    title: 'GARANTÍA',
    content: [
      'RIAVA System otorgará una garantía de treinta (30) días corridos desde la entrega formal únicamente para correcciones de errores atribuibles al desarrollo original.',
      'La garantía no cubrirá: cambios de alcance, nuevos requerimientos, modificaciones solicitadas posteriormente, problemas ocasionados por terceros o errores provocados por manipulaciones realizadas por el cliente.',
    ],
  },
  {
    num: '14',
    title: 'PROPIEDAD INTELECTUAL',
    content: [
      'La propiedad total del desarrollo será transferida al cliente únicamente una vez que el proyecto haya sido pagado en su totalidad.',
      'Mientras existan pagos pendientes, RIAVA System mantendrá la titularidad de los desarrollos realizados.',
    ],
  },
  {
    num: '15',
    title: 'LIMITACIÓN DE RESPONSABILIDAD',
    content: [
      'RIAVA System no garantiza: incremento de ventas, posicionamiento SEO, generación de clientes, resultados comerciales específicos, aprobaciones por parte de terceros ni disponibilidad continua de plataformas externas.',
      'La responsabilidad máxima de RIAVA System quedará limitada al monto efectivamente pagado por el cliente por el proyecto contratado.',
    ],
  },
  {
    num: '16',
    title: 'CONFIDENCIALIDAD',
    content: [
      'Ambas partes se obligan a mantener estricta confidencialidad respecto de toda información técnica, comercial y estratégica intercambiada durante la ejecución del proyecto.',
    ],
  },
  {
    num: '17',
    title: 'ACEPTACIÓN',
    content: [
      'La aceptación de una cotización, propuesta comercial, orden de compra, transferencia bancaria o pago asociado al proyecto implicará la aceptación íntegra de los presentes Términos y Condiciones.',
    ],
  },
]

export default function TerminosPage() {
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
          <p className="text-blue-400 text-lg font-semibold tracking-wide mb-1">TÉRMINOS Y CONDICIONES DE DESARROLLO WEB</p>
          <p className="text-slate-400 text-sm">Versión 1.0</p>
        </div>
      </div>

      {/* Intro */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <p className="text-gray-600 text-base leading-relaxed border-l-4 border-blue-500 pl-4">
          Los presentes Términos y Condiciones regulan la prestación de servicios de desarrollo, diseño, implementación,
          integración, puesta en marcha y mantención de sitios web, plataformas web, sistemas de gestión, portales
          corporativos, tiendas en línea (e-commerce), landing pages, aplicaciones web y cualquier otro desarrollo
          tecnológico realizado por <strong>RIAVA System</strong> para sus clientes.
        </p>

        {/* Download button */}
        <div className="mt-6 flex justify-end">
          <a
            href="/terminos-y-condiciones.pdf"
            download="Términos y Condiciones - RIAVA System.pdf"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar PDF
          </a>
        </div>
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
            <a href="mailto:contacto@riavasystem.com" className="text-blue-400 hover:text-blue-300">contacto@riavasystem.com</a>
            {'  ·  '}
            <a href="https://www.riavasystem.com" className="text-blue-400 hover:text-blue-300">www.riavasystem.com</a>
            {'  ·  '}
            Versión 1.0
          </p>
        </div>
      </div>
    </main>
  )
}
