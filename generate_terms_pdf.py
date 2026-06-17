"""
Genera el PDF de Términos y Condiciones de RIAVA System.
Output: frontend/public/terminos-y-condiciones.pdf
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, white, black
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import PageTemplate, Frame
from reportlab.lib import colors
import os

OUTPUT = os.path.join(
    os.path.dirname(__file__),
    "frontend/public/terminos-y-condiciones.pdf"
)

# ── Colores corporativos ───────────────────────────────────────────────────────
RIAVA_DARK   = HexColor("#0F172A")   # slate-900
RIAVA_BLUE   = HexColor("#3B82F6")   # blue-500
RIAVA_LIGHT  = HexColor("#F8FAFC")   # slate-50
RIAVA_GRAY   = HexColor("#64748B")   # slate-500
RIAVA_BORDER = HexColor("#E2E8F0")   # slate-200
RIAVA_ACCENT = HexColor("#1E40AF")   # blue-800

PAGE_W, PAGE_H = A4
MARGIN = 2 * cm

# ── Estilos ───────────────────────────────────────────────────────────────────
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "RiavaTitle",
    fontName="Helvetica-Bold",
    fontSize=20,
    textColor=RIAVA_DARK,
    alignment=TA_CENTER,
    spaceAfter=4,
    leading=26,
)

subtitle_style = ParagraphStyle(
    "RiavaSubtitle",
    fontName="Helvetica",
    fontSize=11,
    textColor=RIAVA_BLUE,
    alignment=TA_CENTER,
    spaceAfter=2,
)

version_style = ParagraphStyle(
    "RiavaVersion",
    fontName="Helvetica",
    fontSize=9,
    textColor=RIAVA_GRAY,
    alignment=TA_CENTER,
    spaceAfter=0,
)

section_style = ParagraphStyle(
    "RiavaSection",
    fontName="Helvetica-Bold",
    fontSize=11,
    textColor=white,
    alignment=TA_LEFT,
    spaceAfter=0,
    spaceBefore=0,
    leftIndent=8,
    leading=16,
)

body_style = ParagraphStyle(
    "RiavaBody",
    fontName="Helvetica",
    fontSize=9.5,
    textColor=RIAVA_DARK,
    alignment=TA_JUSTIFY,
    spaceAfter=6,
    spaceBefore=0,
    leading=14,
)

bullet_style = ParagraphStyle(
    "RiavaBullet",
    fontName="Helvetica",
    fontSize=9.5,
    textColor=RIAVA_DARK,
    alignment=TA_LEFT,
    spaceAfter=3,
    spaceBefore=0,
    leftIndent=16,
    leading=14,
    bulletIndent=6,
)

footer_style = ParagraphStyle(
    "RiavaFooter",
    fontName="Helvetica",
    fontSize=8,
    textColor=RIAVA_GRAY,
    alignment=TA_CENTER,
    leading=12,
)

# ── Helpers ───────────────────────────────────────────────────────────────────

def section_header(number: str, title: str) -> Table:
    """Encabezado de sección con fondo azul oscuro."""
    text = Paragraph(f"{number}. {title}", section_style)
    tbl = Table([[text]], colWidths=[PAGE_W - 2 * MARGIN])
    tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), RIAVA_ACCENT),
        ("TOPPADDING",    (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("LEFTPADDING",   (0, 0), (-1, -1), 10),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 10),
        ("ROUNDEDCORNERS", [4, 4, 4, 4]),
    ]))
    return tbl


def body(text: str) -> Paragraph:
    return Paragraph(text, body_style)


def bullet(text: str) -> Paragraph:
    return Paragraph(f"• {text}", bullet_style)


def space(h: float = 0.25) -> Spacer:
    return Spacer(1, h * cm)


def hr() -> HRFlowable:
    return HRFlowable(width="100%", thickness=0.5, color=RIAVA_BORDER, spaceAfter=6)


# ── Contenido ────────────────────────────────────────────────────────────────

def build_content():
    story = []

    # ── Encabezado ──────────────────────────────────────────────────────────
    header_data = [[
        Paragraph("RIAVA System", title_style),
    ]]
    header_tbl = Table(header_data, colWidths=[PAGE_W - 2 * MARGIN])
    header_tbl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), RIAVA_DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 20),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
    ]))

    # override color for dark background
    title_on_dark = ParagraphStyle(
        "TitleDark", parent=title_style, textColor=white, fontSize=22
    )
    sub_on_dark = ParagraphStyle(
        "SubDark", parent=subtitle_style, textColor=RIAVA_BLUE, fontSize=12, spaceAfter=4
    )
    ver_on_dark = ParagraphStyle(
        "VerDark", parent=version_style, textColor=HexColor("#94A3B8"), spaceAfter=16
    )

    header_block_data = [[
        Paragraph("RIAVA System", title_on_dark),
    ], [
        Paragraph("TÉRMINOS Y CONDICIONES DE DESARROLLO WEB", sub_on_dark),
    ], [
        Paragraph("Versión 1.0", ver_on_dark),
    ]]
    header_block = Table(header_block_data, colWidths=[PAGE_W - 2 * MARGIN])
    header_block.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), RIAVA_DARK),
        ("TOPPADDING",    (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
        ("ALIGN",         (0, 0), (-1, -1), "CENTER"),
    ]))
    story.append(header_block)
    story.append(space(0.6))

    # ── Introducción ────────────────────────────────────────────────────────
    story.append(body(
        "Los presentes Términos y Condiciones regulan la prestación de servicios de "
        "desarrollo, diseño, implementación, integración, puesta en marcha y mantención "
        "de sitios web, plataformas web, sistemas de gestión, portales corporativos, "
        "tiendas en línea (e-commerce), landing pages, aplicaciones web y cualquier otro "
        "desarrollo tecnológico realizado por <b>RIAVA System</b> para sus clientes."
    ))
    story.append(space(0.3))

    # ── Secciones ────────────────────────────────────────────────────────────

    sections = [
        (
            "1", "ACEPTACIÓN DE LOS TÉRMINOS",
            [body("La contratación de cualquier servicio ofrecido por RIAVA System implica "
                  "la aceptación total e irrevocable de los presentes Términos y Condiciones.")],
        ),
        (
            "2", "ALCANCE DEL SERVICIO",
            [
                body("RIAVA System desarrollará la solución tecnológica de acuerdo con la "
                     "propuesta comercial, técnica y funcional previamente aprobada por el cliente."),
                body("Cualquier funcionalidad, integración, modificación o requerimiento no "
                     "contemplado expresamente en la propuesta aprobada será considerado como "
                     "trabajo adicional y podrá ser cotizado por separado."),
            ],
        ),
        (
            "3", "INFORMACIÓN PROPORCIONADA POR EL CLIENTE",
            [
                body("El cliente declara y acepta que:"),
                bullet("Es el único responsable de proporcionar toda la información necesaria para el desarrollo del proyecto."),
                bullet("Es responsable de la exactitud, veracidad, legalidad y vigencia de la información entregada."),
                bullet("Es responsable de proporcionar oportunamente textos, imágenes, logotipos, fotografías, videos, documentos, accesos, credenciales y cualquier otro material requerido para el desarrollo."),
                space(0.2),
                body("RIAVA System no será responsable por errores, omisiones, inconsistencias o "
                     "perjuicios derivados de información incorrecta, incompleta o desactualizada "
                     "proporcionada por el cliente."),
            ],
        ),
        (
            "4", "PLAZOS DE ENTREGA",
            [
                body("Los plazos de desarrollo establecidos en la propuesta comercial son estimativos "
                     "y consideran la colaboración activa del cliente."),
                body("En caso de retrasos ocasionados por:"),
                bullet("Entrega tardía de información."),
                bullet("Cambios de requerimientos."),
                bullet("Solicitudes adicionales."),
                bullet("Demoras en aprobaciones."),
                bullet("Falta de respuesta del cliente."),
                bullet("Solicitudes de modificaciones fuera del alcance inicial."),
                space(0.2),
                body("Los plazos de entrega podrán extenderse proporcionalmente sin generar "
                     "responsabilidad alguna para RIAVA System."),
                body("RIAVA System no será responsable por retrasos derivados de terceros, "
                     "proveedores externos o dependencias ajenas a su control."),
            ],
        ),
        (
            "5", "INTEGRACIONES CON SERVICIOS DE TERCEROS",
            [
                body("Cuando el cliente solicite integraciones con plataformas externas, incluyendo "
                     "pero no limitado a:"),
                bullet("Google Analytics, Google Search Console, Google Business Profile."),
                bullet("Meta Ads, Facebook, Instagram, WhatsApp Business."),
                bullet("Mercado Pago, WebPay, Transbank, Stripe."),
                bullet("Shopify, ERP externos, CRM externos, APIs de terceros."),
                space(0.2),
                body("RIAVA System realizará únicamente la implementación técnica acordada y no será "
                     "responsable por cambios en políticas de terceros, suspensiones de cuentas, "
                     "bloqueos, errores de plataformas externas, limitaciones de API, costos "
                     "asociados a servicios externos, pérdidas de información en sistemas de "
                     "terceros o problemas de disponibilidad de servicios externos."),
            ],
        ),
        (
            "6", "RESPONSABILIDAD SOBRE EL CONTENIDO",
            [
                body("El cliente será el único responsable del contenido publicado en el sitio web, "
                     "incluyendo textos, imágenes, fotografías, videos, catálogos, publicaciones, "
                     "artículos, información comercial, legal, de productos y servicios."),
                body("RIAVA System no será responsable por reclamos, demandas, sanciones o perjuicios "
                     "derivados de la información publicada por el cliente."),
            ],
        ),
        (
            "7", "PAGOS",
            [
                body("El valor total del proyecto será el indicado en la propuesta comercial aprobada. "
                     "La forma de pago será:"),
                bullet("<b>50%</b> al inicio del proyecto."),
                bullet("<b>50%</b> contra entrega formal del proyecto."),
                space(0.2),
                body("El pago inicial constituye la reserva de agenda, planificación, análisis, "
                     "diseño y comienzo de las actividades de desarrollo."),
            ],
        ),
        (
            "8", "PAGO FRACCIONADO",
            [
                body("Si ambas partes lo acuerdan expresamente, el valor del proyecto podrá dividirse "
                     "en pagos semanales durante la duración del proyecto. La suma total de los pagos "
                     "deberá completar el valor total acordado."),
            ],
        ),
        (
            "9", "DESISTIMIENTO DEL CLIENTE",
            [
                body("Si el cliente decide cancelar, suspender o desistir del proyecto por cualquier "
                     "motivo una vez iniciado el desarrollo, deberá igualmente pagar el 50% inicial "
                     "comprometido."),
                body("Dicho monto no será reembolsable bajo ninguna circunstancia, ya que corresponde "
                     "a horas de trabajo, planificación, diseño, análisis y recursos asignados al proyecto."),
                body("En caso de existir trabajos adicionales ejecutados al momento de la cancelación, "
                     "RIAVA System podrá facturar proporcionalmente los avances efectivamente realizados."),
            ],
        ),
        (
            "10", "ENTREGA FORMAL DEL PROYECTO",
            [
                body("Se considerará realizada la entrega formal cuando:"),
                bullet("El sistema haya sido presentado al cliente."),
                bullet("Se hayan entregado los accesos correspondientes."),
                bullet("Se haya habilitado el ambiente productivo."),
                bullet("Se haya enviado la notificación formal de entrega."),
                space(0.2),
                body("A partir de ese momento comenzará a regir el plazo para el pago final."),
            ],
        ),
        (
            "11", "PLAZO PARA EL PAGO FINAL",
            [
                body("El cliente dispondrá de un máximo de <b>dos (2) días corridos</b> desde la "
                     "entrega formal para efectuar el pago total pendiente."),
                body("Transcurrido dicho plazo sin pago, RIAVA System podrá aplicar un cargo "
                     "adicional equivalente al <b>25% de una Unidad de Fomento (UF)</b> por "
                     "concepto de gastos administrativos y cobranza, sin perjuicio de las demás "
                     "acciones que correspondan."),
                body("Asimismo, RIAVA System podrá suspender accesos, servicios o funcionalidades "
                     "hasta la regularización completa de los pagos pendientes."),
            ],
        ),
        (
            "12", "MODIFICACIONES POSTERIORES A LA ENTREGA",
            [
                body("Toda modificación solicitada después de la entrega formal del proyecto será "
                     "considerada un servicio adicional. El valor mínimo por modificación será:"),
                bullet("<b>1 UF + IVA</b> por cada requerimiento o modificación solicitada."),
                space(0.2),
                body("Esto incluye: cambios de diseño, nuevas funcionalidades, ajustes de contenido, "
                     "integraciones adicionales, cambios estructurales, mejoras visuales y "
                     "correcciones derivadas de nuevos requerimientos."),
            ],
        ),
        (
            "13", "GARANTÍA",
            [
                body("RIAVA System otorgará una garantía de <b>treinta (30) días corridos</b> desde "
                     "la entrega formal únicamente para correcciones de errores atribuibles al "
                     "desarrollo original."),
                body("La garantía no cubrirá: cambios de alcance, nuevos requerimientos, "
                     "modificaciones solicitadas posteriormente, problemas ocasionados por terceros "
                     "o errores provocados por manipulaciones realizadas por el cliente."),
            ],
        ),
        (
            "14", "PROPIEDAD INTELECTUAL",
            [
                body("La propiedad total del desarrollo será transferida al cliente únicamente una vez "
                     "que el proyecto haya sido pagado en su totalidad."),
                body("Mientras existan pagos pendientes, RIAVA System mantendrá la titularidad de "
                     "los desarrollos realizados."),
            ],
        ),
        (
            "15", "LIMITACIÓN DE RESPONSABILIDAD",
            [
                body("RIAVA System no garantiza: incremento de ventas, posicionamiento SEO, "
                     "generación de clientes, resultados comerciales específicos, aprobaciones por "
                     "parte de terceros ni disponibilidad continua de plataformas externas."),
                body("La responsabilidad máxima de RIAVA System quedará limitada al monto "
                     "efectivamente pagado por el cliente por el proyecto contratado."),
            ],
        ),
        (
            "16", "CONFIDENCIALIDAD",
            [
                body("Ambas partes se obligan a mantener estricta confidencialidad respecto de toda "
                     "información técnica, comercial y estratégica intercambiada durante la "
                     "ejecución del proyecto."),
            ],
        ),
        (
            "17", "ACEPTACIÓN",
            [
                body("La aceptación de una cotización, propuesta comercial, orden de compra, "
                     "transferencia bancaria o pago asociado al proyecto implicará la aceptación "
                     "íntegra de los presentes Términos y Condiciones."),
            ],
        ),
    ]

    for num, title, items in sections:
        story.append(KeepTogether([
            section_header(num, title),
            space(0.2),
            *items,
            space(0.3),
        ]))

    # ── Footer ───────────────────────────────────────────────────────────────
    story.append(space(0.4))
    story.append(hr())

    footer_data = [[
        Paragraph(
            "<b>RIAVA System</b>  |  contacto@riavasystem.com  |  www.riavasystem.com  |  Versión 1.0",
            footer_style,
        )
    ]]
    footer_tbl = Table(footer_data, colWidths=[PAGE_W - 2 * MARGIN])
    footer_tbl.setStyle(TableStyle([
        ("BACKGROUND",    (0, 0), (-1, -1), RIAVA_LIGHT),
        ("TOPPADDING",    (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
        ("LEFTPADDING",   (0, 0), (-1, -1), 0),
        ("RIGHTPADDING",  (0, 0), (-1, -1), 0),
    ]))
    story.append(footer_tbl)

    return story


# ── Page number callback ──────────────────────────────────────────────────────

def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(RIAVA_GRAY)
    page_num = canvas.getPageNumber()
    canvas.drawCentredString(PAGE_W / 2, 1.2 * cm, f"Página {page_num}")
    canvas.restoreState()


# ── Build PDF ─────────────────────────────────────────────────────────────────

def generate():
    doc = SimpleDocTemplate(
        OUTPUT,
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=2 * cm,
        title="Términos y Condiciones - RIAVA System",
        author="RIAVA System",
        subject="Términos y Condiciones de Desarrollo Web",
    )
    story = build_content()
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f"PDF generado: {OUTPUT}")


if __name__ == "__main__":
    generate()
