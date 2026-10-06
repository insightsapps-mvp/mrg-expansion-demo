import type { Project, Task, TaskStatus, TaskTag } from '@/types';

const inDays = (d: number, h = 18) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  x.setHours(h, 0, 0, 0);
  return x.toISOString();
};

export const projects: Project[] = [
  { id: 'pampa-eldorado', name: 'Pampa Burger Eldorado', brandId: 'pampa', unitId: 'U-04', mall: 'Shopping Eldorado', ownerId: 'u-paula', targetDate: inDays(75), status: 'tiempo' },
  { id: 'pampa-morumbi', name: 'Pampa Burger Morumbi', brandId: 'pampa', unitId: 'U-05', mall: 'Morumbi Shopping', ownerId: 'u-marcelo', targetDate: inDays(126), status: 'atrasado', alert: ['Negociación con el shopping vencida hace 4 días', 'Mall negotiation overdue by 4 days'] },
  { id: 'lino-ibirapuera', name: 'Lino & Algodón Ibirapuera', brandId: 'lino', unitId: 'U-08', mall: 'Shopping Ibirapuera', ownerId: 'u-paula', targetDate: inDays(90), status: 'tiempo' },
  { id: 'mate-villalobos', name: 'Mate & Co Villa-Lobos', brandId: 'mate', unitId: 'U-09', mall: 'Shopping Villa-Lobos', ownerId: 'u-paula', targetDate: inDays(110), status: 'riesgo', alert: ['Contrato de locación sin firmar', 'Lease not signed yet'] },
  { id: 'medialunas-villalobos', name: 'Medialunas del Sur Villa-Lobos', brandId: 'medialunas', mall: 'Shopping Villa-Lobos', ownerId: 'u-diego', targetDate: inDays(160), status: 'tiempo' },
  { id: 'nahuel-iguatemi', name: 'Heladería Nahuel Iguatemi', brandId: 'nahuel', mall: 'Shopping Iguatemi', ownerId: 'u-diego', targetDate: inDays(190), status: 'riesgo', alert: ['Registro de marca en el INPI pendiente', 'INPI trademark filing pending'] },
];

type T = [title: [string, string], assignee: string, due: number, tag: TaskTag, status: TaskStatus];

const P: Record<string, T[]> = {
  'pampa-eldorado': [
    [['Constituir la sociedad (Ltda.) en Brasil', 'Incorporate the company (Ltda.) in Brazil'], 'u-diego', -60, 'legal', 'hecho'],
    [['Obtener CNPJ e inscripción estadual', 'Obtain CNPJ and state registration'], 'u-diego', -52, 'legal', 'hecho'],
    [['Firmar contrato de franquicia', 'Sign franchise agreement'], 'u-diego', -45, 'legal', 'hecho'],
    [['Registro de marca local (INPI)', 'Local trademark filing (INPI)'], 'u-diego', -40, 'legal', 'hecho'],
    [['Negociar canon y fondo de promoción', 'Negotiate rent and promotion fund'], 'u-marcelo', -38, 'shopping', 'hecho'],
    [['Firmar contrato de locación con Eldorado', 'Sign lease with Eldorado'], 'u-marcelo', -30, 'shopping', 'hecho'],
    [['Aprobar proyecto de arquitectura con el shopping', 'Get architecture approved by the mall'], 'u-marcelo', -24, 'shopping', 'hecho'],
    [['Licencias municipales y bomberos (AVCB)', 'Municipal & fire permits (AVCB)'], 'u-diego', -18, 'legal', 'hecho'],
    [['Contratar estudio de obra', 'Hire build-out contractor'], 'u-paula', -20, 'obra', 'hecho'],
    [['Demolición y obra civil', 'Demolition and civil works'], 'u-paula', -10, 'obra', 'hecho'],
    [['Instalación eléctrica y gas', 'Electrical and gas installation'], 'u-paula', -4, 'obra', 'hecho'],
    [['Compra de equipamiento de cocina', 'Kitchen equipment purchase'], 'u-paula', -2, 'obra', 'hecho'],
    [['Publicar búsquedas de personal', 'Post job openings'], 'u-ana', -8, 'rrhh', 'hecho'],
    [['Montaje de equipamiento y mobiliario', 'Equipment and furniture installation'], 'u-paula', 6, 'obra', 'curso'],
    [['Entrevistas y contratación (18 personas)', 'Interviews and hiring (18 people)'], 'u-ana', 9, 'rrhh', 'curso'],
    [['Señalética y fachada aprobada por la marca', 'Signage and facade approved by the brand'], 'u-paula', 0, 'marketing', 'revision'],
    [['Capacitación del equipo con Pampa Burger', 'Team training with Pampa Burger'], 'u-ana', 30, 'rrhh', 'pendiente'],
    [['Plan de marketing de inauguración', 'Grand opening marketing plan'], 'u-paula', 3, 'marketing', 'curso'],
    [['Inauguración y acompañamiento 30 días', 'Grand opening and 30-day support'], 'u-paula', 75, 'obra', 'pendiente'],
  ],
  'pampa-morumbi': [
    [['Constituir la sociedad (Ltda.) en Brasil', 'Incorporate the company (Ltda.) in Brazil'], 'u-diego', -40, 'legal', 'hecho'],
    [['Firmar contrato de franquicia', 'Sign franchise agreement'], 'u-diego', -32, 'legal', 'hecho'],
    [['Relevar locales disponibles en Morumbi', 'Survey available spaces at Morumbi'], 'u-marcelo', -25, 'shopping', 'hecho'],
    [['Cerrar negociación con Morumbi Shopping', 'Close negotiation with Morumbi Shopping'], 'u-marcelo', -4, 'shopping', 'curso'],
    [['Revisión legal del contrato de locación', 'Legal review of the lease'], 'u-diego', -1, 'legal', 'revision'],
    [['Proyecto de arquitectura', 'Architecture project'], 'u-paula', 12, 'obra', 'pendiente'],
    [['Licencias municipales', 'Municipal permits'], 'u-diego', 30, 'legal', 'pendiente'],
    [['Obra civil', 'Civil works'], 'u-paula', 60, 'obra', 'pendiente'],
    [['Búsqueda de personal', 'Staff recruiting'], 'u-ana', 80, 'rrhh', 'pendiente'],
    [['Inauguración', 'Grand opening'], 'u-paula', 126, 'obra', 'pendiente'],
  ],
  'lino-ibirapuera': [
    [['Constituir la sociedad en Brasil', 'Incorporate the company in Brazil'], 'u-diego', -50, 'legal', 'hecho'],
    [['Registro de marca (INPI)', 'Trademark filing (INPI)'], 'u-diego', -35, 'legal', 'hecho'],
    [['Firmar locación en Ibirapuera', 'Sign lease at Ibirapuera'], 'u-marcelo', -20, 'shopping', 'hecho'],
    [['Importación de la primera colección', 'Import first collection'], 'u-paula', -6, 'obra', 'hecho'],
    [['Aprobar layout del local', 'Approve store layout'], 'u-paula', -2, 'obra', 'revision'],
    [['Obra y vidrieras', 'Build-out and windows'], 'u-paula', 25, 'obra', 'curso'],
    [['Contratar vendedores (6)', 'Hire sales staff (6)'], 'u-ana', 2, 'rrhh', 'curso'],
    [['Capacitación en atención', 'Customer service training'], 'u-ana', 70, 'rrhh', 'pendiente'],
    [['Inauguración', 'Grand opening'], 'u-paula', 90, 'marketing', 'pendiente'],
  ],
  'mate-villalobos': [
    [['Constituir la sociedad en Brasil', 'Incorporate the company in Brazil'], 'u-diego', -30, 'legal', 'hecho'],
    [['Firmar contrato de franquicia', 'Sign franchise agreement'], 'u-diego', -22, 'legal', 'hecho'],
    [['Elegir local en Villa-Lobos', 'Pick space at Villa-Lobos'], 'u-marcelo', -12, 'shopping', 'hecho'],
    [['Firmar contrato de locación', 'Sign the lease'], 'u-marcelo', 1, 'shopping', 'curso'],
    [['Proyecto de arquitectura', 'Architecture project'], 'u-paula', 4, 'obra', 'pendiente'],
    [['Licencias y AVCB', 'Permits and AVCB'], 'u-diego', 40, 'legal', 'pendiente'],
    [['Contratar baristas', 'Hire baristas'], 'u-ana', 80, 'rrhh', 'pendiente'],
    [['Inauguración', 'Grand opening'], 'u-paula', 110, 'marketing', 'pendiente'],
  ],
  'medialunas-villalobos': [
    [['Market Discovery de la zona oeste', 'West-area Market Discovery'], 'u-paula', -15, 'marketing', 'hecho'],
    [['Diagnóstico con Medialunas del Sur', 'Diagnosis with Medialunas del Sur'], 'u-paula', -9, 'marketing', 'hecho'],
    [['Constituir sociedad para Villa-Lobos', 'Incorporate company for Villa-Lobos'], 'u-diego', 5, 'legal', 'curso'],
    [['Apertura de cuenta bancaria en reales', 'Open BRL bank account'], 'u-diego', 12, 'legal', 'pendiente'],
    [['Negociación con el shopping', 'Mall negotiation'], 'u-marcelo', 35, 'shopping', 'pendiente'],
    [['Obra civil', 'Civil works'], 'u-paula', 100, 'obra', 'pendiente'],
    [['Inauguración', 'Grand opening'], 'u-paula', 160, 'marketing', 'pendiente'],
  ],
  'nahuel-iguatemi': [
    [['Diagnóstico y análisis del mercado', 'Diagnosis and market analysis'], 'u-paula', -20, 'marketing', 'hecho'],
    [['Registro de marca en el INPI', 'INPI trademark filing'], 'u-diego', -3, 'legal', 'curso'],
    [['Constitución de la sociedad', 'Company incorporation'], 'u-diego', 20, 'legal', 'pendiente'],
    [['Plan de importación de insumos', 'Supply import plan'], 'u-paula', 0, 'obra', 'revision'],
    [['Negociación con Iguatemi', 'Negotiation with Iguatemi'], 'u-marcelo', 50, 'shopping', 'pendiente'],
    [['Contratación de personal', 'Staff hiring'], 'u-ana', 150, 'rrhh', 'pendiente'],
    [['Inauguración', 'Grand opening'], 'u-paula', 190, 'marketing', 'pendiente'],
  ],
};

const sampleComments: [string, [string, string]][] = [
  ['u-diego', ['Ya mandé la documentación al contador.', 'Already sent the paperwork to the accountant.']],
  ['u-paula', ['Perfecto, lo reviso mañana a primera hora.', 'Great, I’ll review it first thing tomorrow.']],
];

export const initialTasks: Task[] = Object.entries(P).flatMap(([projectId, list]) =>
  list.map(([title, assigneeId, due, tag, status], i) => ({
    id: `${projectId}-t${i + 1}`,
    projectId,
    title,
    assigneeId,
    due: inDays(due),
    tag,
    status,
    comments:
      status === 'curso' || status === 'revision'
        ? sampleComments.map((c, j) => ({ id: `c-${projectId}-${i}-${j}`, authorId: c[0], daysAgo: 2 - j, text: c[1] }))
        : [],
  })),
);

export const projectProgress = (tasks: Task[], projectId: string) => {
  const t = tasks.filter((x) => x.projectId === projectId);
  if (!t.length) return 0;
  return Math.round((t.filter((x) => x.status === 'hecho').length / t.length) * 100);
};
