import type { Role, User } from '@/types';

export const users: User[] = [
  { id: 'u-daniel', name: 'Daniel Larrategui', email: 'daniel@mrg.com.br', role: 'admin', title: ['Director de Marketing y Alianzas', 'Marketing & Partnerships Director'], lastAccess: ['Ahora', 'Now'], initials: 'DL' },
  { id: 'u-carlos', name: 'Carlos Rua', email: 'carlos@mrg.com.br', role: 'admin', title: ['Director de Ventas y Retail', 'Sales & Retail Director'], lastAccess: ['Hace 1 h', '1 h ago'], initials: 'CR' },
  { id: 'u-paula', name: 'Paula Rinaldi', email: 'paula@mrg.com.br', role: 'equipo', title: ['Project Manager', 'Project Manager'], lastAccess: ['Hace 20 min', '20 min ago'], initials: 'PR' },
  { id: 'u-diego', name: 'Diego Ferraro', email: 'diego@mrg.com.br', role: 'equipo', title: ['Legal y sociedades', 'Legal & incorporation'], lastAccess: ['Hace 3 h', '3 h ago'], initials: 'DF' },
  { id: 'u-ana', name: 'Ana Beatriz Santos', email: 'ana@mrg.com.br', role: 'equipo', title: ['Recursos humanos', 'Human resources'], lastAccess: ['Ayer', 'Yesterday'], initials: 'AS' },
  { id: 'u-marcelo', name: 'Marcelo Duarte', email: 'marcelo@mrg.com.br', role: 'equipo', title: ['Negociación con shoppings', 'Mall negotiations'], lastAccess: ['Hace 2 h', '2 h ago'], initials: 'MD' },
  { id: 'u-lucia', name: 'Lucía Benítez', email: 'lucia@pampaburger.com.ar', role: 'franquiciante', brandId: 'pampa', title: ['Directora de expansión · Pampa Burger', 'Expansion director · Pampa Burger'], lastAccess: ['Hoy 09:12', 'Today 09:12'], initials: 'LB' },
  { id: 'u-martin', name: 'Martín Echeverría', email: 'martin@medialunasdelsur.com.ar', role: 'franquiciante', brandId: 'medialunas', title: ['Socio · Medialunas del Sur', 'Partner · Medialunas del Sur'], lastAccess: ['Hace 2 días', '2 days ago'], initials: 'ME' },
  { id: 'u-sofia', name: 'Sofía Arrieta', email: 'sofia@linoyalgodon.com.ar', role: 'franquiciante', brandId: 'lino', title: ['CEO · Lino & Algodón', 'CEO · Lino & Algodón'], lastAccess: ['Ayer', 'Yesterday'], initials: 'SA' },
  { id: 'u-rafael', name: 'Rafael Souza', email: 'rafael.souza@gmail.com', role: 'franquiciado', brandId: 'pampa', title: ['Franquiciado · Pampa Burger Eldorado', 'Franchisee · Pampa Burger Eldorado'], lastAccess: ['Hoy 08:40', 'Today 08:40'], initials: 'RS' },
  { id: 'u-renata', name: 'Renata Dias', email: 'renata.dias@outlook.com', role: 'franquiciado', brandId: 'medialunas', title: ['Franquiciada · Medialunas del Sur Iguatemi', 'Franchisee · Medialunas del Sur Iguatemi'], lastAccess: ['Hace 4 días', '4 days ago'], initials: 'RD' },
  { id: 'u-felipe', name: 'Felipe Martins', email: 'felipe.martins@gmail.com', role: 'franquiciado', brandId: 'mate', title: ['Franquiciado · Mate & Co Villa-Lobos', 'Franchisee · Mate & Co Villa-Lobos'], lastAccess: ['Hace 1 semana', '1 week ago'], initials: 'FM' },
];

export const userById = (id: string) => users.find((u) => u.id === id)!;

export const demoAccounts: { role: Role; email: string; userId: string }[] = [
  { role: 'admin', email: 'daniel@mrg.com.br', userId: 'u-daniel' },
  { role: 'franquiciante', email: 'lucia@pampaburger.com.ar', userId: 'u-lucia' },
  { role: 'franquiciado', email: 'rafael.souza@gmail.com', userId: 'u-rafael' },
  { role: 'equipo', email: 'paula@mrg.com.br', userId: 'u-paula' },
];

export const roleUser: Record<Role, string> = {
  admin: 'u-daniel',
  franquiciante: 'u-lucia',
  franquiciado: 'u-rafael',
  equipo: 'u-paula',
};

export const roleColor: Record<Role, string> = {
  admin: '#1769aa',
  franquiciante: '#7c3aed',
  franquiciado: '#0a7d4f',
  equipo: '#b45309',
};
