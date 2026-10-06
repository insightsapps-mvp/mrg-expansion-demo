import type { AppState } from '@/store';
import { checklistProgress } from '@/store';
import type { Lang, Role } from '@/types';
import { computeScore, RISK_DAYS, RISK_SCORE } from '@/config/scoring';
import { brands, brandById } from '@/data/brands';
import { units } from '@/data/units';
import { projects, projectProgress } from '@/data/projects';
import { userById } from '@/data/users';
import { fmtBRL, fmtDate } from '@/lib/format';
import { en } from '@/i18n';

type S = Pick<AppState, 'leads' | 'rules' | 'events' | 'tasks' | 'checklist' | 'proposals' | 'reports'>;

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));

export const SUGGESTIONS: Record<Role, [string, string][]> = {
  admin: [
    ['¿Qué leads están en riesgo?', 'Which leads are at risk?'],
    ['Resumen del pipeline', 'Pipeline summary'],
    ['¿Qué seguimientos tengo esta semana?', 'What follow-ups do I have this week?'],
    ['¿Qué marca convierte mejor?', 'Which brand converts best?'],
  ],
  franquiciante: [
    ['¿Cómo viene la facturación de mis unidades?', 'How is my units’ revenue doing?'],
    ['¿Qué unidad está más floja?', 'Which unit is weakest?'],
    ['¿Cuántos candidatos tengo?', 'How many candidates do I have?'],
    ['¿Cuándo abre Morumbi?', 'When does Morumbi open?'],
  ],
  franquiciado: [
    ['¿Qué me falta para abrir?', 'What’s left before I open?'],
    ['¿Cuándo vence la carga del mes?', 'When is the monthly report due?'],
    ['¿Dónde está el manual de marca?', 'Where is the brand manual?'],
    ['Mis ventas vs. el mes pasado', 'My sales vs. last month'],
  ],
  equipo: [
    ['¿Qué tareas tengo vencidas?', 'Which of my tasks are overdue?'],
    ['Estado de Pampa Eldorado', 'Pampa Eldorado status'],
    ['¿Qué proyecto está más atrasado?', 'Which project is most delayed?'],
    ['Tareas de esta semana', 'This week’s tasks'],
  ],
};

export const GREETING: Record<Role, [string, string]> = {
  admin: [
    'Hola Daniel 👋 Soy el Asistente MRG. Conozco tu pipeline, el calendario y cada apertura. ¿Qué querés saber?',
    'Hi Daniel 👋 I’m the MRG Assistant. I know your pipeline, calendar and every opening. What would you like to know?',
  ],
  franquiciante: [
    'Hola Lucía 👋 Te ayudo con las unidades, candidatos y facturación de Pampa Burger en Brasil.',
    'Hi Lucía 👋 I can help with Pampa Burger’s units, candidates and revenue in Brazil.',
  ],
  franquiciado: [
    'Olá Rafael 👋 Te acompaño con la apertura de Pampa Burger Eldorado: checklist, documentos y cargas.',
    'Olá Rafael 👋 I’m here for the Pampa Burger Eldorado opening: checklist, documents and reports.',
  ],
  equipo: [
    'Hola Paula 👋 Tengo a mano los 6 proyectos de apertura y todas las tareas del equipo.',
    'Hi Paula 👋 I have the 6 opening projects and all team tasks at hand.',
  ],
};

export function answer(raw: string, role: Role, lang: Lang, s: S): string {
  const q = norm(raw);
  const es = lang === 'es';
  const L = (a: string, b: string) => (es ? a : b);

  // Precio de la propuesta: nunca el monto
  if (has(q, 'precio', 'inversion', 'costo', 'cuanto sale', 'cuanto cuesta', 'price', 'cost', 'investment', 'how much', 'presupuesto', 'budget')) {
    return L("Está abajo de todo en Propuesta: tocá 'Ver inversión' para verlo.", "It’s at the very bottom of Proposal: tap 'Show investment' to see it.");
  }

  const scored = s.leads.map((l) => ({ l, sc: computeScore(l, s.rules) }));
  const open = scored.filter((x) => x.l.stage !== 'cerrado');
  const now = new Date();
  const dayMs = 86400000;

  if (role === 'admin') {
    if (has(q, 'riesgo', 'risk')) {
      const risk = open.filter((x) => x.sc >= RISK_SCORE && x.l.lastContactDays > RISK_DAYS).sort((a, b) => b.sc - a.sc);
      if (!risk.length) return L('No hay leads en riesgo: todos los de score alto tuvieron contacto en la última semana. 👌', 'No leads at risk: every high-score lead was contacted within the last week. 👌');
      const list = risk.map((x) => `• ${x.l.name} (score ${x.sc}) — ${x.l.lastContactDays} ${L('días sin contacto', 'days without contact')}, ${brandById(x.l.brandId).name}`).join('\n');
      return L(
        `Tenés ${risk.length} leads en riesgo (score alto sin contacto hace más de ${RISK_DAYS} días):\n${list}\nTe sugiero empezar por ${risk[0].l.name.split(' ')[0]}: ya tiene una propuesta enviada y es el de mayor score.`,
        `You have ${risk.length} leads at risk (high score, no contact for over ${RISK_DAYS} days):\n${list}\nI’d start with ${risk[0].l.name.split(' ')[0]}: highest score in the list.`,
      );
    }
    if (has(q, 'pipeline', 'resumen', 'summary', 'etapa', 'stage')) {
      const by = (['nuevo', 'contactado', 'calificado', 'propuesta', 'negociacion', 'cerrado'] as const).map((st) => `• ${en('stage', st, lang)}: ${s.leads.filter((l) => l.stage === st).length}`);
      const top = [...open].sort((a, b) => b.sc - a.sc)[0];
      const avg = Math.round(scored.reduce((a, b) => a + b.sc, 0) / scored.length);
      return L(
        `Pipeline actual — ${s.leads.length} leads, score promedio ${avg}:\n${by.join('\n')}\nEl mejor candidato abierto es ${top.l.name} (score ${top.sc}, ${fmtBRL(top.l.capital)}) en etapa ${en('stage', top.l.stage, lang)}.`,
        `Current pipeline — ${s.leads.length} leads, average score ${avg}:\n${by.join('\n')}\nBest open candidate: ${top.l.name} (score ${top.sc}, ${fmtBRL(top.l.capital)}) at stage ${en('stage', top.l.stage, lang)}.`,
      );
    }
    if (has(q, 'seguimiento', 'semana', 'agenda', 'week', 'follow', 'calendario', 'calendar')) {
      const wk = s.events
        .filter((e) => {
          const d = new Date(e.date).getTime();
          return d >= now.getTime() - 2 * 3600000 && d <= now.getTime() + 7 * dayMs;
        })
        .sort((a, b) => a.date.localeCompare(b.date));
      if (!wk.length) return L('No tenés seguimientos en los próximos 7 días.', 'No follow-ups in the next 7 days.');
      const list = wk.map((e) => `• ${fmtDate(e.date, es ? "EEE d · HH:mm" : 'EEE d · h:mm a', lang)} — ${e.title[es ? 0 : 1]}`).join('\n');
      return L(`Esta semana tenés ${wk.length} seguimientos:\n${list}`, `You have ${wk.length} follow-ups this week:\n${list}`);
    }
    if (has(q, 'marca', 'convierte', 'brand', 'convert')) {
      const rows = brands
        .map((b) => {
          const ls = s.leads.filter((l) => l.brandId === b.id);
          const closed = ls.filter((l) => l.stage === 'cerrado').length;
          return { b, n: ls.length, closed, rate: ls.length ? closed / ls.length : 0 };
        })
        .sort((a, b) => b.rate - a.rate);
      const best = rows[0];
      return L(
        `${best.b.name} es la que mejor convierte: ${best.closed} de ${best.n} leads cerrados (${Math.round(best.rate * 100)}%).\n${rows.map((r) => `• ${r.b.name}: ${r.closed}/${r.n} (${Math.round(r.rate * 100)}%)`).join('\n')}`,
        `${best.b.name} converts best: ${best.closed} of ${best.n} leads closed (${Math.round(best.rate * 100)}%).\n${rows.map((r) => `• ${r.b.name}: ${r.closed}/${r.n} (${Math.round(r.rate * 100)}%)`).join('\n')}`,
      );
    }
    if (has(q, 'juliana')) {
      const j = scored.find((x) => x.l.id === 'L-001')!;
      return L(
        `Juliana Costa tiene score ${j.sc}, capital de ${fmtBRL(j.l.capital)}, 8 años con restaurante propio y quiere Shopping Eldorado. Está en ${en('stage', j.l.stage, lang)}: el próximo paso es generar su propuesta con IA.`,
        `Juliana Costa has a score of ${j.sc}, ${fmtBRL(j.l.capital)} capital, 8 years running her own restaurant and wants Shopping Eldorado. Stage: ${en('stage', j.l.stage, lang)} — next step is generating her AI proposal.`,
      );
    }
    if (has(q, 'propuesta', 'proposal')) {
      const sent = s.proposals.filter((p) => p.status === 'enviada').length;
      const acc = s.proposals.filter((p) => p.status === 'aceptada').length;
      return L(`Hay ${s.proposals.length} propuestas: ${sent} enviadas esperando respuesta y ${acc} aceptadas.`, `There are ${s.proposals.length} proposals: ${sent} sent awaiting reply and ${acc} accepted.`);
    }
  }

  if (role === 'franquiciante') {
    const mine = units.filter((u) => u.brandId === 'pampa');
    const openU = mine.filter((u) => u.status === 'abierta');
    if (has(q, 'factura', 'revenue', 'ventas', 'sales')) {
      const cur = openU.reduce((a, u) => a + u.revenue[5], 0);
      const prev = openU.reduce((a, u) => a + u.revenue[4], 0);
      const pct = (((cur - prev) / prev) * 100).toFixed(1).replace('.', es ? ',' : '.');
      return L(
        `Este mes Pampa Burger facturó ${fmtBRL(cur)} en Brasil (+${pct}% vs. el mes anterior):\n${openU.map((u) => `• ${u.mall}: ${fmtBRL(u.revenue[5])}`).join('\n')}\nVilla-Lobos es la que más crece; Center Norte viene a la baja.`,
        `This month Pampa Burger billed ${fmtBRL(cur)} in Brazil (+${pct}% vs. last month):\n${openU.map((u) => `• ${u.mall}: ${fmtBRL(u.revenue[5])}`).join('\n')}\nVilla-Lobos is growing fastest; Center Norte is trending down.`,
      );
    }
    if (has(q, 'floja', 'peor', 'weak', 'worst', 'cayo', 'baja')) {
      const cn = openU.find((u) => u.id === 'U-02')!;
      const d = Math.round(((cn.revenue[5] - cn.revenue[4]) / cn.revenue[4]) * 100);
      return L(
        `La más floja es Pampa Burger Center Norte: ${fmtBRL(cn.revenue[5])} este mes, ${d}% vs. el mes anterior. MRG agendó una visita para revisar ventas y operación.`,
        `The weakest is Pampa Burger Center Norte: ${fmtBRL(cn.revenue[5])} this month, ${d}% vs. last month. MRG scheduled a visit to review sales and operations.`,
      );
    }
    if (has(q, 'candidat')) {
      const c = open.filter((x) => x.l.brandId === 'pampa').sort((a, b) => b.sc - a.sc);
      return L(
        `Tenés ${c.length} candidatos activos para Pampa Burger. Los mejores:\n${c.slice(0, 3).map((x) => `• ${x.l.name} — score ${x.sc}, ${en('stage', x.l.stage, lang)}`).join('\n')}`,
        `You have ${c.length} active candidates for Pampa Burger. Top ones:\n${c.slice(0, 3).map((x) => `• ${x.l.name} — score ${x.sc}, ${en('stage', x.l.stage, lang)}`).join('\n')}`,
      );
    }
    if (has(q, 'morumbi')) {
      const u = mine.find((x) => x.id === 'U-05')!;
      return L(
        `Pampa Burger Morumbi está atrasada: la negociación con el shopping venció hace 4 días. Avance ${projectProgress(s.tasks, 'pampa-morumbi')}%, apertura estimada ${fmtDate(u.openingDate, "MMMM 'de' yyyy", lang)}. Marcelo Duarte (MRG) lleva la negociación.`,
        `Pampa Burger Morumbi is delayed: the mall negotiation expired 4 days ago. Progress ${projectProgress(s.tasks, 'pampa-morumbi')}%, estimated opening ${fmtDate(u.openingDate, 'MMMM yyyy', lang)}. Marcelo Duarte (MRG) leads the negotiation.`,
      );
    }
    if (has(q, 'eldorado', 'apertura', 'opening')) {
      return L(`Pampa Burger Eldorado va al ${checklistProgress(s.checklist)}% y abre en ${fmtDate(units[3].openingDate, "MMMM 'de' yyyy", lang)}.`, `Pampa Burger Eldorado is at ${checklistProgress(s.checklist)}% and opens in ${fmtDate(units[3].openingDate, 'MMMM yyyy', lang)}.`);
    }
  }

  if (role === 'franquiciado') {
    if (has(q, 'falta', 'abrir', 'left', 'open', 'apertura', 'checklist')) {
      const pending = s.checklist.flatMap((st) => st.items.filter((i) => !i.done).map((i) => ({ st, i })));
      return L(
        `Vas al ${checklistProgress(s.checklist)}%. Te faltan ${pending.length} ítems; los próximos:\n${pending.slice(0, 4).map((p) => `• ${p.i.label[0]} (${p.st.label[0]})`).join('\n')}\nLa inauguración está prevista para ${fmtDate(units[3].openingDate, "d 'de' MMMM", lang)}.`,
        `You’re at ${checklistProgress(s.checklist)}%. ${pending.length} items left; next ones:\n${pending.slice(0, 4).map((p) => `• ${p.i.label[1]} (${p.st.label[1]})`).join('\n')}\nGrand opening planned for ${fmtDate(units[3].openingDate, 'MMMM d', lang)}.`,
      );
    }
    if (has(q, 'vence', 'carga', 'due', 'report')) {
      const d = new Date(now.getFullYear(), now.getMonth() + (now.getDate() > 5 ? 1 : 0), 5);
      const days = Math.ceil((d.getTime() - now.getTime()) / dayMs);
      return L(`La carga mensual vence el día 5 de cada mes. La próxima es el ${fmtDate(d, "d 'de' MMMM", lang)} (en ${days} días).`, `The monthly report is due on the 5th of each month. Next one: ${fmtDate(d, 'MMMM d', lang)} (in ${days} days).`);
    }
    if (has(q, 'manual', 'documento', 'document')) {
      return L('El Manual de marca está en Documentos (PDF, 48 páginas). También tenés el Manual operativo actualizado hace 12 días.', 'The Brand manual is in Documents (PDF, 48 pages). The Operations manual was updated 12 days ago too.');
    }
    if (has(q, 'venta', 'sales', 'mes pasado', 'last month')) {
      const r = s.reports[0];
      return L(
        `Tu unidad todavía no abrió, así que aún no hay ventas propias. Como referencia, la última carga registrada fue de ${fmtBRL(r.grossSales)} con ${r.tickets} tickets. Cuando abras, acá vas a ver tu comparación mes a mes.`,
        `Your store hasn’t opened yet, so there are no sales of your own. For reference, the last recorded report was ${fmtBRL(r.grossSales)} with ${r.tickets} tickets. Once you open, you’ll see your month-over-month comparison here.`,
      );
    }
  }

  if (role === 'equipo') {
    const mine = s.tasks.filter((t) => t.assigneeId === 'u-paula' && t.status !== 'hecho');
    if (has(q, 'vencid', 'overdue', 'atrasad')) {
      if (has(q, 'proyecto', 'project')) {
        return L('El más atrasado es Pampa Burger Morumbi: la negociación con el shopping venció hace 4 días y el proyecto va al 30%. Lo lleva Marcelo Duarte.', 'The most delayed is Pampa Burger Morumbi: the mall negotiation expired 4 days ago and the project is at 30%. Marcelo Duarte owns it.');
      }
      const over = mine.filter((t) => new Date(t.due).getTime() < now.setHours(0, 0, 0, 0));
      if (!over.length) return L('No tenés tareas vencidas. 🎉', 'You have no overdue tasks. 🎉');
      return L(
        `Tenés ${over.length} tareas vencidas:\n${over.map((t) => `• ${t.title[0]} — ${projects.find((p) => p.id === t.projectId)!.name}`).join('\n')}`,
        `You have ${over.length} overdue tasks:\n${over.map((t) => `• ${t.title[1]} — ${projects.find((p) => p.id === t.projectId)!.name}`).join('\n')}`,
      );
    }
    if (has(q, 'eldorado')) {
      const tk = s.tasks.filter((t) => t.projectId === 'pampa-eldorado');
      const curso = tk.filter((t) => t.status === 'curso' || t.status === 'revision');
      return L(
        `Pampa Burger Eldorado va al ${projectProgress(s.tasks, 'pampa-eldorado')}% (${tk.filter((t) => t.status === 'hecho').length}/${tk.length} tareas). En curso:\n${curso.map((t) => `• ${t.title[0]} — ${userById(t.assigneeId).name}`).join('\n')}`,
        `Pampa Burger Eldorado is at ${projectProgress(s.tasks, 'pampa-eldorado')}% (${tk.filter((t) => t.status === 'hecho').length}/${tk.length} tasks). In progress:\n${curso.map((t) => `• ${t.title[1]} — ${userById(t.assigneeId).name}`).join('\n')}`,
      );
    }
    if (has(q, 'atrasado', 'delayed', 'proyecto', 'project')) {
      return L('El más atrasado es Pampa Burger Morumbi: la negociación con el shopping venció hace 4 días y el proyecto va al 30%. Lo lleva Marcelo Duarte.', 'The most delayed is Pampa Burger Morumbi: the mall negotiation expired 4 days ago and the project is at 30%. Marcelo Duarte owns it.');
    }
    if (has(q, 'semana', 'week', 'tarea', 'task')) {
      const t0 = new Date();
      t0.setHours(0, 0, 0, 0);
      const wk = mine.filter((t) => {
        const d = new Date(t.due).getTime();
        return d >= t0.getTime() && d <= t0.getTime() + 7 * dayMs;
      });
      return L(
        `Esta semana tenés ${wk.length} tareas:\n${wk.map((t) => `• ${fmtDate(t.due, 'EEE d', lang)} — ${t.title[0]}`).join('\n')}`,
        `You have ${wk.length} tasks this week:\n${wk.map((t) => `• ${fmtDate(t.due, 'EEE d', lang)} — ${t.title[1]}`).join('\n')}`,
      );
    }
  }

  if (has(q, 'hola', 'hello', 'hi', 'buen')) {
    return L('¡Hola! Probá con alguna de las preguntas sugeridas de abajo.', 'Hi! Try one of the suggested questions below.');
  }
  return L('No tengo esa información en la demo.', 'I don’t have that information in the demo.');
}
