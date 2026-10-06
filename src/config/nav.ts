import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  FolderKanban,
  FolderOpen,
  Gauge,
  Home,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  MessagesSquare,
  Rocket,
  Sparkles,
  Store,
  UserSearch,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/types';

export interface NavItem {
  id: string;
  path: string;
  label: string; // clave i18n
  icon: LucideIcon;
  group: 'comercial' | 'operacion';
}

const propuesta: NavItem = { id: 'propuesta', path: '/propuesta', label: 'nav.propuesta', icon: FileText, group: 'comercial' };

export const NAV: Record<Role, NavItem[]> = {
  admin: [
    propuesta,
    { id: 'panel', path: '/admin/panel', label: 'nav.panel', icon: LayoutDashboard, group: 'operacion' },
    { id: 'crm', path: '/admin/crm', label: 'nav.crm', icon: KanbanSquare, group: 'operacion' },
    { id: 'scoring', path: '/admin/scoring', label: 'nav.scoring', icon: Gauge, group: 'operacion' },
    { id: 'propuestas', path: '/admin/propuestas', label: 'nav.propuestas', icon: Sparkles, group: 'operacion' },
    { id: 'calendario', path: '/admin/calendario', label: 'nav.calendario', icon: CalendarDays, group: 'operacion' },
    { id: 'clientes', path: '/admin/clientes', label: 'nav.clientes', icon: Building2, group: 'operacion' },
    { id: 'usuarios', path: '/admin/usuarios', label: 'nav.usuarios', icon: Users, group: 'operacion' },
  ],
  franquiciante: [
    propuesta,
    { id: 'expansion', path: '/franquiciante/panel', label: 'nav.expansion', icon: Rocket, group: 'operacion' },
    { id: 'unidades', path: '/franquiciante/unidades', label: 'nav.unidades', icon: Store, group: 'operacion' },
    { id: 'candidatos', path: '/franquiciante/candidatos', label: 'nav.candidatos', icon: UserSearch, group: 'operacion' },
    { id: 'reportes', path: '/franquiciante/reportes', label: 'nav.reportes', icon: BarChart3, group: 'operacion' },
  ],
  franquiciado: [
    propuesta,
    { id: 'inicio', path: '/franquiciado/inicio', label: 'nav.inicio', icon: Home, group: 'operacion' },
    { id: 'apertura', path: '/franquiciado/apertura', label: 'nav.apertura', icon: ClipboardCheck, group: 'operacion' },
    { id: 'documentos', path: '/franquiciado/documentos', label: 'nav.documentos', icon: FolderOpen, group: 'operacion' },
    { id: 'carga', path: '/franquiciado/carga', label: 'nav.carga', icon: FileSpreadsheet, group: 'operacion' },
    { id: 'consultas', path: '/franquiciado/consultas', label: 'nav.consultas', icon: MessagesSquare, group: 'operacion' },
  ],
  equipo: [
    propuesta,
    { id: 'proyectos', path: '/equipo/proyectos', label: 'nav.proyectos', icon: FolderKanban, group: 'operacion' },
    { id: 'mistareas', path: '/equipo/mis-tareas', label: 'nav.mistareas', icon: ListChecks, group: 'operacion' },
    { id: 'calendarioEq', path: '/equipo/calendario', label: 'nav.calendario', icon: CalendarDays, group: 'operacion' },
  ],
};

/** Ítems de la bottom-nav mobile (4 + tab Más) */
export const BOTTOM: Record<Role, string[]> = {
  admin: ['propuesta', 'panel', 'crm', 'propuestas'],
  franquiciante: ['propuesta', 'expansion', 'unidades', 'reportes'],
  franquiciado: ['propuesta', 'inicio', 'apertura', 'carga'],
  equipo: ['propuesta', 'proyectos', 'mistareas', 'calendarioEq'],
};

export const ROLE_HOME: Record<Role, string> = {
  admin: '/admin/panel',
  franquiciante: '/franquiciante/panel',
  franquiciado: '/franquiciado/inicio',
  equipo: '/equipo/proyectos',
};

export const ROLE_PREFIX: Record<Role, string> = {
  admin: '/admin',
  franquiciante: '/franquiciante',
  franquiciado: '/franquiciado',
  equipo: '/equipo',
};

export const ROLES: Role[] = ['admin', 'franquiciante', 'franquiciado', 'equipo'];
