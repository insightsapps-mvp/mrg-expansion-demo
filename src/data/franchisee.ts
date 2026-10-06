import type { ChecklistStage, DocumentItem, Message, MonthlyReport } from '@/types';

const it = (id: string, es: string, en: string, done: boolean) => ({ id, label: [es, en] as [string, string], done });

/** 25 ítems, 17 hechos → 68% */
export const initialChecklist: ChecklistStage[] = [
  {
    id: 'sociedad',
    label: ['Sociedad constituida', 'Company incorporated'],
    items: [
      it('s1', 'Contrato social registrado en la Junta Comercial', 'Articles registered with the Board of Trade', true),
      it('s2', 'CNPJ emitido', 'CNPJ issued', true),
      it('s3', 'Inscripción estadual y municipal', 'State and municipal registration', true),
      it('s4', 'Cuenta bancaria en reales abierta', 'BRL bank account opened', true),
    ],
  },
  {
    id: 'contrato',
    label: ['Contrato de franquicia', 'Franchise agreement'],
    items: [
      it('c1', 'Circular de oferta de franquicia (COF) recibida', 'Franchise disclosure document (COF) received', true),
      it('c2', 'Contrato revisado por el área legal de MRG', 'Agreement reviewed by MRG legal', true),
      it('c3', 'Contrato firmado', 'Agreement signed', true),
      it('c4', 'Fee de franquicia abonado', 'Franchise fee paid', true),
    ],
  },
  {
    id: 'local',
    label: ['Local en shopping', 'Mall location'],
    items: [
      it('l1', 'Local asignado en Shopping Eldorado', 'Space assigned at Shopping Eldorado', true),
      it('l2', 'Contrato de locación firmado', 'Lease signed', true),
      it('l3', 'Proyecto aprobado por el shopping', 'Project approved by the mall', true),
      it('l4', 'Licencias municipales y AVCB', 'Municipal permits and AVCB', true),
    ],
  },
  {
    id: 'obra',
    label: ['Obra y equipamiento', 'Build-out & equipment'],
    items: [
      it('o1', 'Obra civil terminada', 'Civil works finished', true),
      it('o2', 'Instalación eléctrica y gas', 'Electrical and gas installation', true),
      it('o3', 'Equipamiento de cocina comprado', 'Kitchen equipment purchased', true),
      it('o4', 'Montaje de equipamiento y mobiliario', 'Equipment and furniture installed', false),
      it('o5', 'Señalética y fachada instaladas', 'Signage and facade installed', false),
    ],
  },
  {
    id: 'personal',
    label: ['Contratación de personal', 'Staff hiring'],
    items: [
      it('p1', 'Búsquedas publicadas', 'Job openings posted', true),
      it('p2', 'Gerente de la unidad contratado', 'Store manager hired', true),
      it('p3', 'Equipo de cocina contratado (8)', 'Kitchen team hired (8)', false),
      it('p4', 'Equipo de salón contratado (10)', 'Front-of-house team hired (10)', false),
      it('p5', 'Altas en eSocial', 'eSocial registrations', false),
    ],
  },
  {
    id: 'capacitacion',
    label: ['Capacitación', 'Training'],
    items: [
      it('k1', 'Capacitación en Pampa Burger Ibirapuera', 'Training at Pampa Burger Ibirapuera', false),
      it('k2', 'Simulacro de servicio (soft opening)', 'Service dry run (soft opening)', false),
    ],
  },
  {
    id: 'inauguracion',
    label: ['Inauguración', 'Grand opening'],
    items: [it('n1', 'Inauguración con acción de marketing', 'Grand opening with marketing event', false)],
  },
];

export const documents: DocumentItem[] = [
  { id: 'd1', name: ['Manual de marca Pampa Burger', 'Pampa Burger brand manual'], kind: 'pdf', sizeKb: 8420, updatedDaysAgo: 30, owner: ['Pampa Burger', 'Pampa Burger'], preview: ['Logo, paleta, tipografías, uso en fachada, packaging y redes sociales. 48 páginas.', 'Logo, palette, typography, facade usage, packaging and social media. 48 pages.'] },
  { id: 'd2', name: ['Manual operativo', 'Operations manual'], kind: 'pdf', sizeKb: 12210, updatedDaysAgo: 12, owner: ['Pampa Burger', 'Pampa Burger'], preview: ['Recetas estandarizadas, tiempos de servicio, higiene y seguridad, apertura y cierre de caja. 112 páginas.', 'Standard recipes, service times, health & safety, opening and closing procedures. 112 pages.'] },
  { id: 'd3', name: ['Contrato de franquicia firmado', 'Signed franchise agreement'], kind: 'pdf', sizeKb: 2140, updatedDaysAgo: 45, owner: ['MRG Legal', 'MRG Legal'], preview: ['Contrato de franquicia por 5 años, territorio Shopping Eldorado, royalties 6% y fondo de marketing 2%.', '5-year franchise agreement, Shopping Eldorado territory, 6% royalties and 2% marketing fund.'] },
  { id: 'd4', name: ['Planos del local · Eldorado L2-114', 'Store plans · Eldorado L2-114'], kind: 'dwg', sizeKb: 5630, updatedDaysAgo: 24, owner: ['MRG Proyectos', 'MRG Projects'], preview: ['Planta general, cortes, layout de cocina y salón (118 m²), aprobado por la administración del shopping.', 'Floor plan, sections, kitchen and dining layout (118 m²), approved by mall management.'] },
  { id: 'd5', name: ['Checklist de inauguración', 'Grand opening checklist'], kind: 'xlsx', sizeKb: 86, updatedDaysAgo: 3, owner: ['MRG Proyectos', 'MRG Projects'], preview: ['64 ítems de control para la semana de inauguración: stock, personal, sistemas, marketing.', '64 control items for opening week: stock, staff, systems, marketing.'] },
];

export const initialMessages: Message[] = [
  { id: 'm1', thread: 'mrg', from: 'them', author: 'Paula Rinaldi · MRG', daysAgo: 2, time: '10:14', text: ['Rafael, la obra va según lo previsto. El jueves pasamos con Marcelo a ver el montaje del equipamiento.', 'Rafael, build-out is on track. On Thursday Marcelo and I will drop by to check the equipment installation.'] },
  { id: 'm2', thread: 'mrg', from: 'me', author: 'Rafael Souza', daysAgo: 2, time: '10:32', text: ['Perfecto. ¿Necesitan algo de mi parte para la contratación del personal?', 'Great. Do you need anything from me for staff hiring?'] },
  { id: 'm3', thread: 'mrg', from: 'them', author: 'Ana Beatriz Santos · MRG', daysAgo: 1, time: '15:05', text: ['Te mando hoy los 12 CV preseleccionados para cocina. Las entrevistas serían la semana que viene.', 'I’m sending you the 12 shortlisted kitchen CVs today. Interviews would be next week.'] },
  { id: 'm4', thread: 'marca', from: 'them', author: 'Lucía Benítez · Pampa Burger', daysAgo: 4, time: '09:20', text: ['¡Hola Rafael! Ya está disponible la versión nueva del manual operativo en Documentos.', 'Hi Rafael! The new operations manual is now available in Documents.'] },
  { id: 'm5', thread: 'marca', from: 'me', author: 'Rafael Souza', daysAgo: 4, time: '11:47', text: ['Gracias Lucía. ¿La capacitación sería en Ibirapuera?', 'Thanks Lucía. Will the training be at Ibirapuera?'] },
  { id: 'm6', thread: 'marca', from: 'them', author: 'Lucía Benítez · Pampa Burger', daysAgo: 3, time: '08:55', text: ['Sí, dos semanas antes de la inauguración. Te confirmo fechas pronto.', 'Yes, two weeks before the opening. I’ll confirm dates soon.'] },
];

/** Historial de cargas de una unidad abierta (para gráfico "Mis ventas vs. mes pasado") */
export const reportHistory: MonthlyReport[] = [
  { month: 'prev', grossSales: 146000, tickets: 3720, avgTicket: 39.2, cogs: 49640, staff: 16, sentDaysAgo: 32 },
];
