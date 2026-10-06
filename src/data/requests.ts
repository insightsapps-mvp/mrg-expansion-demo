import type { AccessRequest } from '@/types';

/** Solicitudes de acceso enviadas desde el login (pendientes de aprobación del Admin MRG) */
export const initialRequests: AccessRequest[] = [
  {
    id: 'R-001',
    kind: 'franquiciante',
    name: 'Agustina Paz',
    email: 'agustina@empanadaslasaltena.com.ar',
    phone: '+54 387 455-2210',
    city: 'Salta',
    company: 'Empanadas La Salteña',
    sector: 'panaderia',
    origin: 'Salta',
    units: 14,
    message: 'Queremos abrir las primeras 3 unidades en shoppings de São Paulo durante 2027.',
    daysAgo: 1,
    status: 'pendiente',
  },
  {
    id: 'R-002',
    kind: 'franquiciado',
    name: 'Helena Prado',
    email: 'helena.prado@gmail.com',
    phone: '+55 11 98420-1177',
    city: 'São Paulo · Vila Madalena',
    brandId: 'mate',
    sector: 'cafeteria',
    capital: 720_000,
    experience: 'food',
    location: 'spcap',
    message: 'Tengo una cafetería propia hace 6 años y busco sumar una marca argentina.',
    daysAgo: 0,
    status: 'pendiente',
  },
];
