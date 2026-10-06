export type Role = 'admin' | 'franquiciante' | 'franquiciado' | 'equipo';
export type Lang = 'es' | 'en';
/** Texto bilingüe [es, en] */
export type Bi = [string, string];

export type LeadStage = 'nuevo' | 'contactado' | 'calificado' | 'propuesta' | 'negociacion' | 'cerrado';
export type Sector = 'hamburgueseria' | 'panaderia' | 'indumentaria' | 'helados' | 'cafeteria' | 'retail';
export type ExperienceLevel = 'none' | 'retail' | 'retail5' | 'food' | 'franchise';
export type LocationLevel = 'outside' | 'gsp' | 'spcap' | 'prime';
export type LeadOrigin = 'feria' | 'web' | 'csv' | 'referido' | 'linkedin';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  nationality: 'BR' | 'AR';
  origin: LeadOrigin;
  brandId: string;
  sector: Sector;
  capital: number; // R$
  experience: ExperienceLevel;
  experienceYears: number;
  location: LocationLevel;
  desiredZone: string;
  stage: LeadStage;
  ownerId: string;
  lastContactDays: number;
  createdDaysAgo: number;
}

export interface ScoreTier {
  key: string;
  label: Bi;
  points: number;
}
export interface ScoreRule {
  id: 'capital' | 'experience' | 'location' | 'sector';
  label: Bi;
  weight: number;
  tiers: ScoreTier[];
}

export type InteractionType = 'llamada' | 'mail' | 'reunion' | 'nota' | 'whatsapp' | 'etapa';
export interface Interaction {
  id: string;
  leadId: string;
  daysAgo: number;
  authorId: string;
  type: InteractionType;
  text: Bi;
}

export type ProposalStatus = 'borrador' | 'enviada' | 'aceptada' | 'rechazada';
export interface ProposalVersion {
  version: number;
  daysAgo: number;
  authorId: string;
  summary: Bi;
  sections: { title: Bi; body: Bi }[];
}
export interface Proposal {
  id: string;
  leadId: string;
  brandId: string;
  template: 'llave' | 'master';
  status: ProposalStatus;
  daysAgo: number;
  versions: ProposalVersion[];
}

export interface Brand {
  id: string;
  name: string;
  sector: Sector;
  sectorLabel: Bi;
  contact: string;
  contactEmail: string;
  origin: string;
  status: 'operando' | 'expansion' | 'softlanding';
  ownerId: string;
  nextAction: Bi;
  color: string;
}

export type UnitStatus = 'abierta' | 'apertura' | 'atrasada';
export interface Unit {
  id: string;
  brandId: string;
  mall: string;
  name: string;
  franchisee: string;
  status: UnitStatus;
  openingDate: string; // ISO
  progress: number;
  revenue: number[]; // últimos 6 meses R$, último = mes actual
  tickets: number[];
  projectId?: string;
}

export type EventType = 'reunion' | 'llamada' | 'vencimiento' | 'visita';
export interface CalendarEvent {
  id: string;
  date: string; // ISO con hora
  durationMin: number;
  type: EventType;
  title: Bi;
  leadId?: string;
  brandId?: string;
  projectId?: string;
  ownerId: string;
  location?: string;
  reminder?: boolean;
  /** Calendario compartido: quién ve la actividad, quién la propuso y si MRG la confirmó */
  participants?: Role[];
  createdBy?: string;
  status?: 'confirmado' | 'propuesto' | 'rechazado';
  note?: Bi;
}

export type AccessKind = 'franquiciante' | 'franquiciado';
export interface AccessRequest {
  id: string;
  kind: AccessKind;
  name: string;
  email: string;
  phone: string;
  city: string;
  daysAgo: number;
  status: 'pendiente' | 'aprobada' | 'rechazada';
  // marca franquiciante
  company?: string;
  sector?: Sector;
  origin?: string;
  units?: number;
  // franquiciado / candidato
  brandId?: string;
  capital?: number;
  experience?: ExperienceLevel;
  location?: LocationLevel;
  message?: string;
}

export type ProjectStatus = 'tiempo' | 'riesgo' | 'atrasado';
export interface Project {
  id: string;
  name: string;
  brandId: string;
  unitId?: string;
  mall: string;
  ownerId: string;
  targetDate: string;
  status: ProjectStatus;
  alert?: Bi;
}

export type TaskStatus = 'pendiente' | 'curso' | 'revision' | 'hecho';
export type TaskTag = 'legal' | 'shopping' | 'rrhh' | 'obra' | 'marketing';
export interface TaskComment {
  id: string;
  authorId: string;
  daysAgo: number;
  text: Bi;
}
export interface Task {
  id: string;
  projectId: string;
  title: Bi;
  assigneeId: string;
  due: string; // ISO
  tag: TaskTag;
  status: TaskStatus;
  comments: TaskComment[];
}

export interface DocumentItem {
  id: string;
  name: Bi;
  kind: 'pdf' | 'dwg' | 'docx' | 'xlsx';
  sizeKb: number;
  updatedDaysAgo: number;
  owner: Bi;
  preview: Bi;
}

export interface Message {
  id: string;
  thread: 'mrg' | 'marca';
  from: 'me' | 'them';
  author: string;
  daysAgo: number;
  time: string;
  text: Bi;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: Bi;
  brandId?: string;
  lastAccess: Bi;
  initials: string;
}

export interface ChecklistItem {
  id: string;
  label: Bi;
  done: boolean;
}
export interface ChecklistStage {
  id: string;
  label: Bi;
  items: ChecklistItem[];
}

export interface MonthlyReport {
  month: string;
  grossSales: number;
  tickets: number;
  avgTicket: number;
  cogs: number;
  staff: number;
  sentDaysAgo?: number;
}
