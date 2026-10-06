import type { Dict } from './index';

const d: Dict = {
  // Cabecera
  'gen.title': ['Generador de propuestas con IA', 'AI proposal generator'],
  'gen.subtitle': [
    'Cargá las respuestas del relevamiento y obtené en segundos un borrador de propuesta comercial sobre la plantilla de MRG, listo para editar, exportar y enviar.',
    'Load the discovery answers and get a sales proposal draft on MRG’s template in seconds, ready to edit, export and send.',
  ],
  'gen.banner.1': [
    'El borrador lo redacta un modelo de lenguaje ajustado con las propuestas y el tono comercial de MRG.',
    'The draft is written by a language model tuned on MRG’s proposals and sales tone.',
  ],
  'gen.banner.2': [
    'Las respuestas del cuestionario se completan solas desde el CRM y el formulario del prospecto.',
    'Questionnaire answers auto-fill from the CRM and the prospect’s form.',
  ],
  'gen.banner.3': [
    'El PDF sale con la identidad de MRG y cada envío queda registrado en la ficha del lead.',
    'The PDF carries MRG’s identity and every send is logged on the lead record.',
  ],
  'gen.dev.feature': ['Generación con IA', 'AI generation'],
  'gen.dev.now': [
    'el borrador se arma sobre la plantilla de MRG con las respuestas cargadas.',
    'the draft is built on MRG’s template with the loaded answers.',
  ],
  'gen.dev.later': ['se conecta un modelo de lenguaje.', 'a language model is connected.'],

  // Lead
  'gen.lead.label': ['Prospecto', 'Prospect'],
  'gen.lead.score': ['Score MRG', 'MRG score'],
  'gen.lead.brand': ['Marca', 'Brand'],
  'gen.lead.stage': ['Etapa', 'Stage'],
  'gen.lead.capital': ['Capital declarado', 'Declared capital'],

  // Cuestionario
  'gen.q.title': ['Cuestionario de relevamiento', 'Discovery questionnaire'],
  'gen.q.subtitle': ['Precargado con los datos del CRM. Editá lo que necesites.', 'Pre-filled from the CRM. Edit anything you need.'],
  'gen.q.prefilled': ['Precargado del CRM', 'Pre-filled from CRM'],
  'gen.q.edited': ['Editado', 'Edited'],
  'gen.q.editedCount': ['{n} editadas', '{n} edited'],
  'gen.q.reset': ['Restablecer', 'Reset'],
  'gen.q.capital': ['Capital disponible', 'Available capital'],
  'gen.q.capitalHint': ['En reales (R$)', 'In reais (R$)'],
  'gen.q.timeline': ['Plazo para abrir', 'Time to open'],
  'gen.q.months': ['{n} meses', '{n} months'],
  'gen.q.zone': ['Zona preferida', 'Preferred area'],
  'gen.q.partners': ['¿Opera solo o con socios?', 'Solo or with partners?'],
  'gen.q.solo': ['Solo', 'Solo'],
  'gen.q.socios': ['Con socios', 'With partners'],
  'gen.q.foodYears': ['Experiencia en gastronomía', 'Food service experience'],
  'gen.q.years': ['años', 'years'],
  'gen.q.sqm': ['Metros disponibles', 'Available space'],
  'gen.q.roi': ['Expectativa de retorno', 'Expected payback'],
  'gen.q.monthsUnit': ['meses', 'months'],
  'gen.q.premises': ['¿Tiene local o busca en shopping?', 'Own premises or looking in a mall?'],
  'gen.q.shopping': ['Busca en shopping', 'Looking in a mall'],
  'gen.q.propio': ['Tiene local propio', 'Has own premises'],
  'gen.q.minus': ['Restar', 'Decrease'],
  'gen.q.plus': ['Sumar', 'Increase'],

  // Plantillas
  'gen.tpl.title': ['Plantilla', 'Template'],
  'gen.tpl.llave': ['Plantilla MRG · Llave en mano', 'MRG template · Turnkey'],
  'gen.tpl.llaveDesc': [
    'Softlanding, negociación con el shopping, RRHH y apertura. MRG acompaña todo el proceso.',
    'Softlanding, mall negotiation, HR and opening. MRG runs the whole process.',
  ],
  'gen.tpl.master': ['Plantilla MRG · Solo master franquicia', 'MRG template · Master franchise only'],
  'gen.tpl.masterDesc': [
    'Cesión de la master franquicia por zona, con derecho a sub-franquiciar.',
    'Area master franchise grant, with sub-franchising rights.',
  ],
  'gen.tpl.recommended': ['Recomendada', 'Recommended'],

  // Botones
  'gen.btn.generate': ['Generar propuesta con IA', 'Generate proposal with AI'],
  'gen.btn.generating': ['Generando…', 'Generating…'],
  'gen.btn.regenerate': ['Regenerar propuesta', 'Regenerate proposal'],
  'gen.btn.genShort': ['Generar', 'Generate'],
  'gen.btn.regenShort': ['Regenerar', 'Regenerate'],
  'gen.btn.export': ['Exportar', 'Export'],
  'gen.btn.exportPdf': ['Exportar PDF', 'Export PDF'],
  'gen.btn.save': ['Guardar versión', 'Save version'],
  'gen.btn.send': ['Enviar al prospecto', 'Send to prospect'],
  'gen.btn.resend': ['Reenviar', 'Resend'],
  'gen.btn.skip': ['Saltar animación', 'Skip animation'],
  'gen.btn.regenSection': ['Regenerar sección', 'Regenerate section'],
  'gen.btn.history': ['Historial', 'History'],
  'gen.btn.print': ['Imprimir / Guardar PDF', 'Print / Save PDF'],
  'gen.btn.restore': ['Restaurar', 'Restore'],
  'gen.btn.openProposal': ['Ver en Propuestas', 'View in Proposals'],
  'gen.hint.time': ['~15 segundos · 6 secciones · editable', '~15 seconds · 6 sections · editable'],

  // Tabs mobile
  'gen.tabs.q': ['Cuestionario', 'Questionnaire'],
  'gen.tabs.draft': ['Borrador', 'Draft'],

  // Estado vacío / análisis / streaming
  'gen.empty.title': ['El borrador aparecerá acá', 'The draft will appear here'],
  'gen.empty.text': [
    'Revisá el cuestionario, elegí la plantilla y apretá “Generar propuesta con IA”.',
    'Review the questionnaire, pick a template and press “Generate proposal with AI”.',
  ],
  'gen.empty.includes': ['Qué incluye', 'What’s included'],
  'gen.empty.meta': ['Personalizado con las respuestas · bilingüe ES/EN', 'Personalized with the answers · bilingual ES/EN'],
  'gen.analyzing.title': ['Analizando respuestas…', 'Analyzing answers…'],
  'gen.analyzing.sub': ['Preparando el borrador para {name}', 'Preparing the draft for {name}'],
  'gen.step.read': ['Leyendo cuestionario', 'Reading questionnaire'],
  'gen.step.template': ['Aplicando plantilla MRG', 'Applying MRG template'],
  'gen.step.write': ['Redactando secciones', 'Drafting sections'],
  'gen.stream.writing': ['Redactando sección {n} de {total}…', 'Drafting section {n} of {total}…'],
  'gen.stream.done': ['Borrador listo · podés editar cualquier sección', 'Draft ready · you can edit any section'],
  'gen.stream.regen': ['Reescribiendo sección…', 'Rewriting section…'],
  'gen.changed': ['Cambiaste respuestas después de generar.', 'You changed answers after generating.'],
  'gen.changedCta': ['Regenerar con los cambios', 'Regenerate with changes'],

  // Documento
  'gen.doc.kicker': ['Propuesta comercial', 'Sales proposal'],
  'gen.doc.for': ['Para', 'For'],
  'gen.doc.words': ['{n} palabras', '{n} words'],
  'gen.doc.edited': ['Editado', 'Edited'],
  'gen.doc.aiBadge': ['Redactado con IA', 'AI-drafted'],

  // Versiones
  'gen.ver.unsaved': ['sin guardar', 'unsaved'],
  'gen.ver.new': ['Nuevo borrador', 'New draft'],
  'gen.ver.title': ['Historial de versiones', 'Version history'],
  'gen.ver.none': ['Todavía no hay versiones guardadas.', 'No saved versions yet.'],
  'gen.ver.summaryFirst': ['Primera versión generada con IA desde el cuestionario.', 'First AI-generated version from the questionnaire.'],
  'gen.ver.summaryNext': ['Versión ajustada en el generador.', 'Version refined in the generator.'],
  'gen.toast.saved': ['Versión v{v} guardada', 'Version v{v} saved'],
  'gen.toast.sent': ['Propuesta enviada a {name}', 'Proposal sent to {name}'],
  'gen.toast.restored': ['Versión v{v} cargada en el editor', 'Version v{v} loaded in the editor'],
  'gen.toast.regen': ['Sección regenerada', 'Section regenerated'],
  'gen.toast.generated': ['Borrador generado para {name}', 'Draft generated for {name}'],

  // PDF
  'gen.pdf.title': ['Vista previa del PDF', 'PDF preview'],
  'gen.pdf.date': ['Fecha', 'Date'],
  'gen.pdf.prepared': ['Preparada por', 'Prepared by'],
  'gen.pdf.template': ['Modalidad', 'Model'],
  'gen.pdf.confidential': ['Documento confidencial', 'Confidential document'],
  'gen.pdf.dev.feature': ['PDF con identidad MRG', 'PDF with MRG identity'],
  'gen.pdf.dev.now': ['usa la impresión del navegador.', 'uses the browser’s print dialog.'],
  'gen.pdf.dev.later': ['se genera el PDF con la identidad visual de MRG.', 'the PDF is generated with MRG’s visual identity.'],
};

export default d;
