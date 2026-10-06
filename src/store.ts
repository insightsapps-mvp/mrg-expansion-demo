import { create } from 'zustand';
import type {
  Bi,
  CalendarEvent,
  ChecklistStage,
  Interaction,
  Lang,
  Lead,
  LeadStage,
  Message,
  MonthlyReport,
  Proposal,
  Role,
  ScoreRule,
  Task,
  TaskStatus,
} from '@/types';
import { initialLeads } from '@/data/leads';
import { initialInteractions } from '@/data/interactions';
import { initialProposals } from '@/data/proposals';
import { initialEvents } from '@/data/events';
import { initialTasks } from '@/data/projects';
import { initialChecklist, initialMessages, reportHistory } from '@/data/franchisee';
import { DEFAULT_RULES } from '@/config/scoring';
import { initialRequests } from '@/data/requests';
import type { AccessRequest } from '@/types';

const ss = {
  get: (k: string) => {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string | null) => {
    try {
      if (v === null) sessionStorage.removeItem(k);
      else sessionStorage.setItem(k, v);
    } catch {
      /* noop */
    }
  },
};
const ls = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* noop */
    }
  },
};

export interface Preview {
  modulo: number;
  view: string;
  rolePrevio: Role;
  titulo: Bi;
}

export interface Toast {
  id: number;
  text: string;
  kind?: 'ok' | 'info' | 'warn';
}

interface Session {
  role: Role;
}
const savedSession: Session | null = (() => {
  const raw = ss.get('mrg_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
})();

export interface AppState {
  authed: boolean;
  role: Role;
  lang: Lang;
  theme: 'light' | 'dark';
  preview: Preview | null;
  moduloDestacado: number | null;
  trailer: boolean;
  tourRun: number; // contador: cada incremento lanza el tour desde el paso 1
  tourActive: boolean;
  toasts: Toast[];

  leads: Lead[];
  interactions: Interaction[];
  proposals: Proposal[];
  events: CalendarEvent[];
  tasks: Task[];
  checklist: ChecklistStage[];
  messages: Message[];
  reports: MonthlyReport[];
  rules: ScoreRule[];
  requests: AccessRequest[];

  login: (role: Role) => void;
  logout: () => void;
  setRole: (role: Role) => void;
  setLang: (l: Lang) => void;
  toggleTheme: () => void;
  abrirPreview: (modulo: number, view: string, rolDestino: Role, titulo: Bi) => void;
  cancelarPreview: () => void;
  cerrarPreview: () => void;
  limpiarDestacado: () => void;
  setTrailer: (v: boolean) => void;
  startTour: () => void;
  setTourActive: (v: boolean) => void;
  toast: (text: string, kind?: Toast['kind']) => void;
  dismissToast: (id: number) => void;

  moveLead: (id: string, stage: LeadStage, authorId: string) => void;
  addLeads: (l: Lead[]) => void;
  addInteraction: (i: Interaction) => void;
  touchLead: (id: string) => void;
  upsertProposal: (p: Proposal) => void;
  addEvent: (e: CalendarEvent) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  addRequest: (r: AccessRequest) => void;
  setRequestStatus: (id: string, status: AccessRequest['status']) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  addTaskComment: (taskId: string, authorId: string, text: string) => void;
  toggleChecklist: (stageId: string, itemId: string) => void;
  addMessage: (m: Message) => void;
  addReport: (r: MonthlyReport) => void;
  setRules: (r: ScoreRule[]) => void;
}

let toastId = 1;

export const useApp = create<AppState>((set, get) => ({
  authed: !!savedSession,
  role: savedSession?.role ?? 'admin',
  lang: (ls.get('mrg_lang') as Lang) || 'es',
  theme: (ls.get('mrg_theme') as 'light' | 'dark') || 'light',
  preview: null,
  moduloDestacado: null,
  trailer: false,
  tourRun: 0,
  tourActive: false,
  toasts: [],

  leads: initialLeads,
  interactions: initialInteractions,
  proposals: initialProposals,
  events: initialEvents,
  tasks: initialTasks,
  checklist: initialChecklist,
  messages: initialMessages,
  reports: reportHistory,
  rules: DEFAULT_RULES,
  requests: initialRequests,

  login: (role) => {
    ss.set('mrg_session', JSON.stringify({ role }));
    set({ authed: true, role, preview: null });
  },
  logout: () => {
    ss.set('mrg_session', null);
    ss.set('mrg_welcome_modal_seen', null);
    set({ authed: false, preview: null, tourActive: false });
  },
  setRole: (role) => {
    if (get().authed) ss.set('mrg_session', JSON.stringify({ role }));
    set({ role });
  },
  setLang: (lang) => {
    ls.set('mrg_lang', lang);
    document.documentElement.lang = lang;
    set({ lang });
  },
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    ls.set('mrg_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.background = theme === 'dark' ? '#070d16' : '#ffffff';
    set({ theme });
  },
  abrirPreview: (modulo, view, rolDestino, titulo) => {
    const { role, setRole } = get();
    set({ preview: { modulo, view, rolePrevio: role, titulo } });
    if (rolDestino !== role) setRole(rolDestino);
  },
  cancelarPreview: () => set({ preview: null }),
  cerrarPreview: () => {
    const p = get().preview;
    if (!p) return;
    if (p.rolePrevio !== get().role) get().setRole(p.rolePrevio);
    set({ preview: null, moduloDestacado: p.modulo });
  },
  limpiarDestacado: () => set({ moduloDestacado: null }),
  setTrailer: (trailer) => set({ trailer }),
  startTour: () => set((s) => ({ tourRun: s.tourRun + 1 })),
  setTourActive: (tourActive) => set({ tourActive }),
  toast: (text, kind = 'ok') => {
    const id = toastId++;
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, kind }] }));
    setTimeout(() => get().dismissToast(id), 3200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  moveLead: (id, stage, authorId) =>
    set((s) => ({
      leads: s.leads.map((l) => (l.id === id ? { ...l, stage, lastContactDays: 0 } : l)),
      interactions: [
        {
          id: `i-${Date.now()}`,
          leadId: id,
          daysAgo: 0,
          authorId,
          type: 'etapa',
          text: [`Movido a "${stageLabel[stage][0]}".`, `Moved to "${stageLabel[stage][1]}".`],
        },
        ...s.interactions,
      ],
    })),
  addLeads: (l) => set((s) => ({ leads: [...l, ...s.leads] })),
  addInteraction: (i) =>
    set((s) => ({
      interactions: [i, ...s.interactions],
      leads: s.leads.map((l) => (l.id === i.leadId ? { ...l, lastContactDays: 0 } : l)),
    })),
  touchLead: (id) => set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, lastContactDays: 0 } : l)) })),
  upsertProposal: (p) =>
    set((s) => ({
      proposals: s.proposals.some((x) => x.id === p.id)
        ? s.proposals.map((x) => (x.id === p.id ? p : x))
        : [p, ...s.proposals],
    })),
  addEvent: (e) => set((s) => ({ events: [...s.events, e] })),
  updateEvent: (id, patch) => set((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
  addRequest: (r) => set((s) => ({ requests: [r, ...s.requests] })),
  setRequestStatus: (id, status) =>
    set((s) => {
      const req = s.requests.find((r) => r.id === id);
      const requests = s.requests.map((r) => (r.id === id ? { ...r, status } : r));
      // Un franquiciado aprobado entra al CRM como lead nuevo con score calculado
      if (req && status === 'aprobada' && req.kind === 'franquiciado' && !s.leads.some((l) => l.email === req.email)) {
        const lead: Lead = {
          id: `L-${String(s.leads.length + 1).padStart(3, '0')}`,
          name: req.name,
          email: req.email,
          phone: req.phone,
          city: req.city,
          nationality: 'BR',
          origin: 'web',
          brandId: req.brandId ?? 'pampa',
          sector: req.sector ?? 'hamburgueseria',
          capital: req.capital ?? 0,
          experience: req.experience ?? 'none',
          experienceYears: 0,
          location: req.location ?? 'spcap',
          desiredZone: 'Shopping Eldorado',
          stage: 'nuevo',
          ownerId: 'u-daniel',
          lastContactDays: 0,
          createdDaysAgo: 0,
        };
        return { requests, leads: [lead, ...s.leads] };
      }
      return { requests };
    }),
  moveTask: (id, status) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
  addTaskComment: (taskId, authorId, text) =>
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t.id === taskId
          ? { ...t, comments: [...t.comments, { id: `c-${Date.now()}`, authorId, daysAgo: 0, text: [text, text] }] }
          : t,
      ),
    })),
  toggleChecklist: (stageId, itemId) =>
    set((s) => ({
      checklist: s.checklist.map((st) =>
        st.id === stageId
          ? { ...st, items: st.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)) }
          : st,
      ),
    })),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  addReport: (r) => set((s) => ({ reports: [r, ...s.reports] })),
  setRules: (rules) => set({ rules }),
}));

const stageLabel: Record<LeadStage, Bi> = {
  nuevo: ['Nuevo', 'New'],
  contactado: ['Contactado', 'Contacted'],
  calificado: ['Calificado', 'Qualified'],
  propuesta: ['Propuesta enviada', 'Proposal sent'],
  negociacion: ['Negociación', 'Negotiation'],
  cerrado: ['Cerrado', 'Closed'],
};

export const checklistProgress = (c: ChecklistStage[]) => {
  const all = c.flatMap((s) => s.items);
  return Math.round((all.filter((i) => i.done).length / all.length) * 100);
};
