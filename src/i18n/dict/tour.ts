import type { Dict } from './index';

const d: Dict = {
  // Welcome modal
  'wel.product': ['MRG Expansión', 'MRG Expansión'],
  'wel.hello': ['Hola Daniel y Carlos 👋', 'Hi Daniel and Carlos 👋'],
  'wel.intro': [
    'Somos Juan y Fede de Insights. Construimos este MVP para que veas tu plataforma funcionando antes de invertir.',
    'We’re Juan and Fede from Insights. We built this MVP so you can see your platform working before investing.',
  ],
  'wel.body': [
    'Acá ves cómo MRG capta y prioriza a los candidatos con un score automático, genera la propuesta comercial con IA a partir del cuestionario que completa cada prospecto, y le da a cada marca, a cada franquiciado y a tu equipo su propio portal para seguir la apertura en São Paulo sin depender de planillas ni de reportes manuales.',
    'Here you’ll see how MRG captures and prioritizes candidates with an automatic score, generates the sales proposal with AI from the questionnaire each prospect fills in, and gives every brand, every franchisee and your team their own portal to follow the São Paulo opening without spreadsheets or manual reports.',
  ],
  'wel.cta': ['Si te gusta lo que ves, hacé clic en \'Quiero arrancar\' y arrancamos.', 'If you like what you see, click \'Let’s start\' and we’ll get going.'],
  'wel.button': ['Ver la plataforma', 'See the platform'],

  // Tour UI
  'tour.step': ['Paso {x} / {y}', 'Step {x} / {y}'],
  'tour.skip': ['Saltar tour', 'Skip tour'],
  'tour.back': ['Atrás', 'Back'],
  'tour.next': ['Siguiente', 'Next'],
  'tour.finish': ['Terminar', 'Finish'],
  'tour.endTitle': ['¡Listo! Ya conocés la plataforma', 'Done! You now know the platform'],
  'tour.endBody': ['Explorá cada módulo a tu ritmo o escribinos y arrancamos con el onboarding.', 'Explore each module at your own pace or message us and we’ll start onboarding.'],
  'tour.explore': ['Explorar por mi cuenta', 'Explore on my own'],
  'tour.wantApp': ['Quiero mi app →', 'I want my app →'],

  // Pasos — welcome por rol
  'tour.w.admin.t': ['Bienvenido al panel de MRG', 'Welcome to the MRG workspace'],
  'tour.w.admin.b': ['Estás viendo la plataforma como Admin MRG: todo el negocio en un lugar — candidatos, propuestas, aperturas y marcas. Te mostramos el menú en 1 minuto.', 'You’re viewing the platform as MRG Admin: the whole business in one place — candidates, proposals, openings and brands. Here’s the menu in 1 minute.'],
  'tour.w.franquiciante.t': ['Así lo ve una marca', 'This is how a brand sees it'],
  'tour.w.franquiciante.b': ['Este es el portal de Lucía Benítez (Pampa Burger). Solo ve su marca: unidades, candidatos y facturación en Brasil.', 'This is Lucía Benítez’s portal (Pampa Burger). She only sees her brand: units, candidates and revenue in Brazil.'],
  'tour.w.franquiciado.t': ['Así lo ve un franquiciado', 'This is how a franchisee sees it'],
  'tour.w.franquiciado.b': ['Este es el portal de Rafael Souza, que abre Pampa Burger en Shopping Eldorado. Sigue su apertura y habla con MRG y la marca.', 'This is Rafael Souza’s portal; he’s opening Pampa Burger at Shopping Eldorado. He follows his opening and talks to MRG and the brand.'],
  'tour.w.equipo.t': ['Así trabaja tu equipo', 'This is how your team works'],
  'tour.w.equipo.b': ['Este es el espacio de Paula Rinaldi (PM). Cada apertura es un proyecto con tareas de legal, shopping, RRHH y obra.', 'This is Paula Rinaldi’s (PM) space. Each opening is a project with legal, mall, HR and build-out tasks.'],

  // Overview nav
  'tour.nav.t': ['El menú', 'The menu'],
  'tour.nav.b': ['Arriba está todo el menú de este perfil. Primero la Propuesta comercial y después cada módulo, en orden.', 'All of this profile’s menu is up here. First the sales Proposal, then each module, in order.'],
  'tour.navm.t': ['El menú', 'The menu'],
  'tour.navm.b': ['Abajo tenés los accesos más usados de este perfil. El resto está en "Más".', 'Down here are this profile’s most used shortcuts. The rest lives in "More".'],

  // Ítems
  'tour.i.propuesta': ['Acá está todo lo que incluye el desarrollo: el circuito, los 6 módulos y las condiciones. Desde cada módulo saltás a verlo funcionando con "Ver en el demo".', 'Everything the build includes is here: the cycle, the 6 modules and the terms. From each module you can jump to see it working with "See it in the demo".'],
  'tour.i.panel': ['El tablero de Daniel: {active} leads activos, score promedio {avg}, propuestas del mes y los {risk} leads en riesgo que hay que llamar hoy.', 'Daniel’s dashboard: {active} active leads, average score {avg}, this month’s proposals and the {risk} at-risk leads to call today.'],
  'tour.i.crm': ['Acá están los {active} leads, ordenados por score en un Kanban de 6 etapas. {top} encabeza con {score}. Arrastrás una tarjeta y queda registrado en el historial.', 'Here are the {active} leads, sorted by score in a 6-stage Kanban. {top} leads with {score}. Drag a card and it’s logged in the history.'],
  'tour.i.scoring': ['Las reglas del score: capital, experiencia, ubicación y rubro. Movés un peso y el ranking se reordena en vivo. Daniel define las variables finales en el onboarding.', 'The score rules: capital, experience, location and industry. Move a weight and the ranking reorders live. Daniel sets the final variables during onboarding.'],
  'tour.i.propuestas': ['El diferencial: la IA lee el cuestionario de Juliana Costa y arma la propuesta sobre la plantilla de MRG en segundos. Editable, con versiones y PDF.', 'The differentiator: AI reads Juliana Costa’s questionnaire and drafts the proposal on MRG’s template in seconds. Editable, versioned, with PDF.'],
  'tour.i.calendario': ['La agenda de seguimientos: {events} eventos este mes entre reuniones, llamadas, vencimientos y visitas a shoppings.', 'The follow-up agenda: {events} events this month across meetings, calls, deadlines and mall visits.'],
  'tour.i.clientes': ['Las 5 marcas argentinas que MRG lleva a Brasil, con sus unidades abiertas y en apertura y la próxima acción de cada una.', 'The 5 Argentine brands MRG brings to Brazil, with open and opening units and each one’s next action.'],
  'tour.i.usuarios': ['Usuarios, roles y permisos: MRG, marcas, franquiciados y equipo, cada uno ve solo lo suyo.', 'Users, roles and permissions: MRG, brands, franchisees and team, each sees only their own.'],
  'tour.i.expansion': ['La foto de Pampa Burger en Brasil: 3 unidades abiertas, 2 en apertura y R$ 486.200 facturados este mes.', 'Pampa Burger’s snapshot in Brazil: 3 open units, 2 opening and R$ 486,200 billed this month.'],
  'tour.i.unidades': ['Cada unidad con su shopping, franquiciado, estado y ticket promedio. Center Norte cayó 12% y aparece marcada.', 'Every unit with its mall, franchisee, status and average ticket. Center Norte dropped 12% and is flagged.'],
  'tour.i.candidatos': ['Los 7 candidatos activos para Pampa Burger, con score y etapa. La marca mira; MRG gestiona.', 'The 7 active candidates for Pampa Burger, with score and stage. The brand watches; MRG manages.'],
  'tour.i.reportes': ['Reportes por período en PDF y CSV, listos para el directorio de la marca.', 'Reports by period in PDF and CSV, ready for the brand’s board.'],
  'tour.i.inicio': ['La apertura de Rafael va al {pct}%: próximo hito, avisos de MRG y accesos rápidos.', 'Rafael’s opening is at {pct}%: next milestone, MRG notices and shortcuts.'],
  'tour.i.apertura': ['El checklist de apertura por etapas. Rafael tilda un ítem y el porcentaje se actualiza para todos.', 'The opening checklist by stage. Rafael ticks an item and the percentage updates for everyone.'],
  'tour.i.documentos': ['Manual de marca, manual operativo, contrato y planos del local, siempre en su última versión.', 'Brand manual, operations manual, contract and store plans, always up to date.'],
  'tour.i.carga': ['Cada mes el franquiciado carga ventas, tickets y costos. Vence el día 5 y llega a la marca y a MRG.', 'Every month the franchisee reports sales, tickets and costs. Due on the 5th and sent to the brand and MRG.'],
  'tour.i.consultas': ['Mensajes con MRG y con la marca en hilos separados. Se terminó el WhatsApp desordenado.', 'Messages with MRG and the brand in separate threads. No more messy WhatsApp.'],
  'tour.i.proyectos': ['Los 6 proyectos de apertura con avance calculado. Pampa Burger Morumbi está atrasado: la negociación con el shopping venció hace 4 días.', 'The 6 opening projects with calculated progress. Pampa Burger Morumbi is late: the mall negotiation expired 4 days ago.'],
  'tour.i.mistareas': ['Las tareas de Paula agrupadas en vencidas, hoy y esta semana. Las tilda y el proyecto avanza.', 'Paula’s tasks grouped as overdue, today and this week. She ticks them and the project moves.'],
  'tour.i.calendarioEq': ['Visitas a shoppings y vencimientos de tareas del equipo en una sola agenda.', 'Mall visits and team task deadlines in a single agenda.'],
  'tour.more': ['(está dentro de "Más")', '(it’s inside "More")'],

  'tour.switch.t': ['Cambiá de vista', 'Switch view'],
  'tour.switch.b': ['Mirá la misma plataforma como Admin MRG, Franquiciante, Franquiciado o Equipo, sin cerrar sesión. Cada uno ve algo distinto.', 'See the same platform as MRG Admin, Franchisor, Franchisee or Team, without logging out. Each one sees something different.'],
  'tour.switchm.b': ['Desde "Más" cambiás de vista: Admin MRG, Franquiciante, Franquiciado o Equipo, sin cerrar sesión.', 'From "More" you can switch view: MRG Admin, Franchisor, Franchisee or Team, without logging out.'],
  'tour.cta.t': ['¿Arrancamos?', 'Shall we start?'],
  'tour.cta.b': ['Si te gusta lo que ves, este botón nos escribe por WhatsApp y empezamos con el onboarding.', 'If you like what you see, this button messages us on WhatsApp and we start onboarding.'],
  'tour.ctam.b': ['Dentro de "Más" está el botón para escribirnos por WhatsApp y arrancar.', 'Inside "More" there’s the button to message us on WhatsApp and get started.'],
};

export default d;
