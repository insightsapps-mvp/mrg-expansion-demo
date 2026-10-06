import type { ExperienceLevel, Lead, LeadOrigin, LeadStage, LocationLevel, Sector } from '@/types';

type Row = [
  id: string,
  name: string,
  city: string,
  nat: 'BR' | 'AR',
  origin: LeadOrigin,
  brandId: string,
  sector: Sector,
  capital: number,
  exp: ExperienceLevel,
  years: number,
  loc: LocationLevel,
  zone: string,
  stage: LeadStage,
  owner: string,
  lastContact: number,
  created: number,
];

const rows: Row[] = [
  ['L-001', 'Juliana Costa', 'São Paulo · Pinheiros', 'BR', 'feria', 'pampa', 'hamburgueseria', 1_200_000, 'food', 8, 'spcap', 'Shopping Eldorado', 'calificado', 'u-carlos', 2, 34],
  ['L-002', 'Rafael Souza', 'São Paulo · Butantã', 'BR', 'referido', 'pampa', 'hamburgueseria', 950_000, 'franchise', 6, 'spcap', 'Shopping Eldorado', 'cerrado', 'u-carlos', 1, 140],
  ['L-003', 'Thiago Oliveira', 'São Paulo · Tatuapé', 'BR', 'web', 'medialunas', 'cafeteria', 850_000, 'retail5', 7, 'spcap', 'Mooca Plaza', 'calificado', 'u-daniel', 11, 41],
  ['L-004', 'Camila Ferreira', 'São Paulo · Jardins', 'BR', 'linkedin', 'lino', 'indumentaria', 700_000, 'retail', 3, 'prime', 'Shopping Iguatemi', 'propuesta', 'u-daniel', 3, 52],
  ['L-005', 'Bruno Almeida', 'São Paulo · Moema', 'BR', 'feria', 'pampa', 'cafeteria', 1_400_000, 'retail5', 9, 'spcap', 'Shopping Ibirapuera', 'propuesta', 'u-carlos', 9, 47],
  ['L-006', 'Larissa Ribeiro', 'Santo André', 'BR', 'feria', 'nahuel', 'helados', 1_100_000, 'retail', 4, 'gsp', 'Mooca Plaza', 'contactado', 'u-marcelo', 8, 19],
  ['L-007', 'Gustavo Pereira', 'São Paulo · Lapa', 'BR', 'web', 'mate', 'cafeteria', 420_000, 'retail', 2, 'spcap', 'Shopping Villa-Lobos', 'contactado', 'u-marcelo', 4, 15],
  ['L-008', 'Fernanda Lima', 'Guarulhos', 'BR', 'feria', 'pampa', 'hamburgueseria', 780_000, 'food', 5, 'gsp', 'Center Norte', 'calificado', 'u-carlos', 2, 29],
  ['L-009', 'Lucas Carvalho', 'Campinas', 'BR', 'csv', 'medialunas', 'panaderia', 280_000, 'none', 0, 'outside', 'Shopping Iguatemi', 'nuevo', 'u-daniel', 1, 3],
  ['L-010', 'Mariana Gomes', 'São Paulo · Vila Mariana', 'BR', 'linkedin', 'lino', 'indumentaria', 520_000, 'retail5', 11, 'spcap', 'Shopping Ibirapuera', 'negociacion', 'u-daniel', 2, 66],
  ['L-011', 'Pedro Henrique Santos', 'Osasco', 'BR', 'web', 'pampa', 'retail', 1_100_000, 'franchise', 5, 'gsp', 'Shopping Villa-Lobos', 'nuevo', 'u-carlos', 3, 5],
  ['L-012', 'Beatriz Rocha', 'São Paulo · Perdizes', 'BR', 'referido', 'nahuel', 'helados', 350_000, 'food', 6, 'spcap', 'Shopping Eldorado', 'propuesta', 'u-marcelo', 5, 38],
  ['L-013', 'Felipe Martins', 'São Paulo · Itaim Bibi', 'BR', 'feria', 'mate', 'panaderia', 900_000, 'franchise', 10, 'spcap', 'Shopping Villa-Lobos', 'cerrado', 'u-marcelo', 6, 120],
  ['L-014', 'Aline Barbosa', 'Sorocaba', 'BR', 'csv', 'medialunas', 'panaderia', 610_000, 'retail', 3, 'outside', 'Shopping Iguatemi', 'contactado', 'u-daniel', 6, 12],
  ['L-015', 'Rodrigo Nunes', 'Ribeirão Preto', 'BR', 'web', 'pampa', 'hamburgueseria', 240_000, 'retail', 2, 'outside', 'Center Norte', 'nuevo', 'u-carlos', 2, 4],
  ['L-016', 'Patrícia Moreira', 'São Paulo · Santana', 'BR', 'linkedin', 'lino', 'retail', 450_000, 'retail5', 8, 'spcap', 'Center Norte', 'contactado', 'u-daniel', 5, 21],
  ['L-017', 'Vinícius Araújo', 'São Bernardo do Campo', 'BR', 'csv', 'nahuel', 'cafeteria', 300_000, 'none', 0, 'gsp', 'Mooca Plaza', 'nuevo', 'u-marcelo', 4, 6],
  ['L-018', 'Gabriela Teixeira', 'Barueri', 'BR', 'feria', 'mate', 'cafeteria', 1_050_000, 'food', 7, 'gsp', 'Shopping Villa-Lobos', 'negociacion', 'u-marcelo', 1, 58],
  ['L-019', 'Eduardo Cardoso', 'São Paulo · Ipiranga', 'BR', 'web', 'pampa', 'helados', 680_000, 'retail', 4, 'spcap', 'Shopping Ibirapuera', 'calificado', 'u-carlos', 7, 27],
  ['L-020', 'Renata Dias', 'São Paulo · Higienópolis', 'BR', 'referido', 'medialunas', 'panaderia', 1_300_000, 'retail', 4, 'spcap', 'Shopping Iguatemi', 'cerrado', 'u-daniel', 12, 160],
  ['L-021', 'Matías Fernández', 'São Paulo · Brooklin', 'AR', 'linkedin', 'pampa', 'hamburgueseria', 560_000, 'franchise', 6, 'spcap', 'Morumbi Shopping', 'propuesta', 'u-carlos', 4, 44],
  ['L-022', 'Carolina Sosa', 'São Paulo · Jardins', 'AR', 'feria', 'lino', 'indumentaria', 380_000, 'retail', 3, 'prime', 'Shopping Iguatemi', 'calificado', 'u-daniel', 3, 25],
  ['L-023', 'Leandro Mendes', 'Jundiaí', 'BR', 'csv', 'mate', 'cafeteria', 200_000, 'none', 0, 'outside', 'Shopping Villa-Lobos', 'nuevo', 'u-marcelo', 1, 2],
  ['L-024', 'Tatiane Freitas', 'Santos', 'BR', 'web', 'nahuel', 'helados', 900_000, 'retail', 3, 'outside', 'Shopping Ibirapuera', 'contactado', 'u-marcelo', 3, 17],
  ['L-025', 'André Castro', 'Mogi das Cruzes', 'BR', 'feria', 'medialunas', 'panaderia', 330_000, 'food', 4, 'gsp', 'Mooca Plaza', 'nuevo', 'u-daniel', 1, 7],
  ['L-026', 'Débora Pinto', 'São Paulo · Pompeia', 'BR', 'referido', 'medialunas', 'cafeteria', 750_000, 'retail5', 6, 'spcap', 'Shopping Villa-Lobos', 'negociacion', 'u-daniel', 5, 61],
  ['L-027', 'Caio Ramos', 'São Paulo · Mooca', 'BR', 'web', 'mate', 'retail', 500_000, 'retail', 2, 'spcap', 'Mooca Plaza', 'contactado', 'u-marcelo', 6, 14],
  ['L-028', 'Natália Correia', 'Alphaville', 'BR', 'linkedin', 'lino', 'indumentaria', 1_600_000, 'franchise', 9, 'gsp', 'Shopping Ibirapuera', 'cerrado', 'u-daniel', 4, 150],
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .split(' ');

export const initialLeads: Lead[] = rows.map((r, i) => {
  const parts = slug(r[1]);
  return {
    id: r[0],
    name: r[1],
    email: `${parts[0]}.${parts[parts.length - 1]}@${i % 3 === 0 ? 'gmail.com' : i % 3 === 1 ? 'outlook.com' : 'uol.com.br'}`,
    phone: `+55 11 9${(8123 + i * 137).toString().slice(0, 4)}-${(4021 + i * 311).toString().slice(0, 4)}`,
    city: r[2],
    nationality: r[3],
    origin: r[4],
    brandId: r[5],
    sector: r[6],
    capital: r[7],
    experience: r[8],
    experienceYears: r[9],
    location: r[10],
    desiredZone: r[11],
    stage: r[12],
    ownerId: r[13],
    lastContactDays: r[14],
    createdDaysAgo: r[15],
  };
});

export const STAGES: LeadStage[] = ['nuevo', 'contactado', 'calificado', 'propuesta', 'negociacion', 'cerrado'];

/** Leads importados desde "leads_feria_franquicias_sp.csv" */
export const csvImportRows: Omit<Lead, 'id' | 'stage' | 'ownerId' | 'lastContactDays' | 'createdDaysAgo'>[] = [
  { name: 'Marcos Vieira', email: 'marcos.vieira@gmail.com', phone: '+55 11 98811-2033', city: 'São Paulo · Morumbi', nationality: 'BR', origin: 'csv', brandId: 'pampa', sector: 'hamburgueseria', capital: 1_150_000, experience: 'food', experienceYears: 6, location: 'prime', desiredZone: 'Morumbi Shopping' },
  { name: 'Juliano Prado', email: 'juliano.prado@uol.com.br', phone: '+55 11 97702-1144', city: 'Guarulhos', nationality: 'BR', origin: 'csv', brandId: 'medialunas', sector: 'panaderia', capital: 480_000, experience: 'retail', experienceYears: 3, location: 'gsp', desiredZone: 'Center Norte' },
  { name: 'Isabela Duarte', email: 'isabela.duarte@outlook.com', phone: '+55 11 96655-3321', city: 'São Paulo · Vila Olímpia', nationality: 'BR', origin: 'csv', brandId: 'lino', sector: 'indumentaria', capital: 820_000, experience: 'retail5', experienceYears: 7, location: 'spcap', desiredZone: 'Shopping Iguatemi' },
  { name: 'Federico Paz', email: 'federico.paz@gmail.com', phone: '+55 11 95544-7781', city: 'São Paulo · Brooklin', nationality: 'AR', origin: 'csv', brandId: 'mate', sector: 'cafeteria', capital: 610_000, experience: 'franchise', experienceYears: 4, location: 'spcap', desiredZone: 'Shopping Villa-Lobos' },
  { name: 'Letícia Campos', email: 'leticia.campos@gmail.com', phone: '+55 11 94433-9012', city: 'Campinas', nationality: 'BR', origin: 'csv', brandId: 'nahuel', sector: 'helados', capital: 260_000, experience: 'none', experienceYears: 0, location: 'outside', desiredZone: 'Shopping Iguatemi' },
  { name: 'Ricardo Lopes', email: 'ricardo.lopes@uol.com.br', phone: '+55 11 93322-4567', city: 'São Caetano do Sul', nationality: 'BR', origin: 'csv', brandId: 'pampa', sector: 'retail', capital: 700_000, experience: 'retail', experienceYears: 4, location: 'gsp', desiredZone: 'Mooca Plaza' },
];
