import type { Unit } from '@/types';

const iso = (monthsFromNow: number, day = 15) => {
  const d = new Date();
  d.setMonth(d.getMonth() + monthsFromNow, day);
  return d.toISOString();
};

// revenue: últimos 6 meses (R$), el último es el mes actual
export const units: Unit[] = [
  { id: 'U-01', brandId: 'pampa', mall: 'Shopping Ibirapuera', name: 'Pampa Burger Ibirapuera', franchisee: 'Natália Correia', status: 'abierta', openingDate: iso(-26), progress: 100, revenue: [151200, 158900, 162400, 155800, 163200, 189400], tickets: [3820, 3990, 4050, 3910, 4080, 4610] },
  { id: 'U-02', brandId: 'pampa', mall: 'Center Norte', name: 'Pampa Burger Center Norte', franchisee: 'Gustavo Lemos', status: 'abierta', openingDate: iso(-18), progress: 100, revenue: [139400, 142800, 148100, 151300, 146000, 128500], tickets: [3610, 3680, 3790, 3850, 3720, 3290] },
  { id: 'U-03', brandId: 'pampa', mall: 'Shopping Villa-Lobos', name: 'Pampa Burger Villa-Lobos', franchisee: 'Felipe Martins', status: 'abierta', openingDate: iso(-7), progress: 100, revenue: [98200, 112500, 121800, 128900, 139300, 168300], tickets: [2410, 2730, 2950, 3100, 3360, 4010] },
  { id: 'U-04', brandId: 'pampa', mall: 'Shopping Eldorado', name: 'Pampa Burger Eldorado', franchisee: 'Rafael Souza', status: 'apertura', openingDate: iso(2, 20), progress: 68, revenue: [0, 0, 0, 0, 0, 0], tickets: [0, 0, 0, 0, 0, 0], projectId: 'pampa-eldorado' },
  { id: 'U-05', brandId: 'pampa', mall: 'Morumbi Shopping', name: 'Pampa Burger Morumbi', franchisee: 'Matías Fernández', status: 'atrasada', openingDate: iso(4, 10), progress: 30, revenue: [0, 0, 0, 0, 0, 0], tickets: [0, 0, 0, 0, 0, 0], projectId: 'pampa-morumbi' },
  { id: 'U-06', brandId: 'medialunas', mall: 'Shopping Iguatemi', name: 'Medialunas del Sur Iguatemi', franchisee: 'Renata Dias', status: 'abierta', openingDate: iso(-14), progress: 100, revenue: [121300, 124900, 129800, 127400, 133100, 137600], tickets: [6120, 6290, 6510, 6400, 6680, 6900] },
  { id: 'U-07', brandId: 'nahuel', mall: 'Mooca Plaza', name: 'Heladería Nahuel Mooca', franchisee: 'Tomás Herrera', status: 'abierta', openingDate: iso(-10), progress: 100, revenue: [176400, 168200, 141900, 128300, 122100, 120400], tickets: [8820, 8410, 7100, 6420, 6110, 6020] },
  { id: 'U-08', brandId: 'lino', mall: 'Shopping Ibirapuera', name: 'Lino & Algodón Ibirapuera', franchisee: 'Natália Correia', status: 'apertura', openingDate: iso(3, 5), progress: 44, revenue: [0, 0, 0, 0, 0, 0], tickets: [0, 0, 0, 0, 0, 0], projectId: 'lino-ibirapuera' },
  { id: 'U-09', brandId: 'mate', mall: 'Shopping Villa-Lobos', name: 'Mate & Co Villa-Lobos', franchisee: 'Felipe Martins', status: 'apertura', openingDate: iso(3, 25), progress: 38, revenue: [0, 0, 0, 0, 0, 0], tickets: [0, 0, 0, 0, 0, 0], projectId: 'mate-villalobos' },
];

/** Top 5 productos Pampa Burger (unidades vendidas en el mes) */
export const topProducts: { name: [string, string]; units: number }[] = [
  { name: ['Pampa Clásica', 'Pampa Classic'], units: 9420 },
  { name: ['Doble Chimichurri', 'Double Chimichurri'], units: 7310 },
  { name: ['Papas rústicas', 'Rustic fries'], units: 6880 },
  { name: ['Provoleta Burger', 'Provoleta Burger'], units: 4150 },
  { name: ['Alfajor de dulce de leche', 'Dulce de leche alfajor'], units: 3270 },
];
