export interface LuxPack {
  id: string;
  title: string;
  description: string;
  badge?: string;
  discountBadge: string;
  price: number;
  originalPrice: number;
  featured?: boolean;
  accentColor: string; // hex for glow / border
  itemsCount: number;
  includedServices: string[];
  imageLogo?: string;
}

export const LUX_PACKS: LuxPack[] = [
  {
    id: 'pack-general',
    title: 'Pack General',
    description: '14 cuentas premium — monta tu mega pack a medida.',
    badge: 'MÁS POPULAR',
    discountBadge: '-85%',
    price: 499.00,
    originalPrice: 3499.00,
    featured: true,
    accentColor: '#C5A880',
    itemsCount: 14,
    includedServices: ['Disney+', 'Netflix', 'YouTube Premium', 'Canva Pro', 'ChatGPT Plus', 'Spotify', 'HBO Max', 'Steam Key', 'Xbox Game Pass', 'Nord VPN', 'CapCut Pro', 'Paramount+', 'Crunchyroll', 'Prime Video'],
  },
  {
    id: 'pack-streaming',
    title: 'Pack Streaming',
    description: '4 cuentas - Disney+ [LIFETIME], Crunchyroll [LIFETIME], Netflix [LIFETIME], Max [LIFETIME]',
    discountBadge: '-75%',
    price: 199.00,
    originalPrice: 790.00,
    accentColor: '#3B82F6',
    itemsCount: 4,
    includedServices: ['Disney+', 'Crunchyroll', 'Netflix', 'Max'],
  },
  {
    id: 'pack-futbol',
    title: 'Pack Fútbol',
    description: 'DAZN, Movistar+, Premier Sports y pases de temporada.',
    discountBadge: '-70%',
    price: 179.00,
    originalPrice: 590.00,
    accentColor: '#22C55E',
    itemsCount: 3,
    includedServices: ['DAZN', 'Movistar+', 'Star+'],
  },
  {
    id: 'pack-ai',
    title: 'Pack Inteligencia Artificial',
    description: 'ChatGPT 4o, Midjourney, Claude Pro y Canva AI.',
    discountBadge: '-68%',
    price: 379.00,
    originalPrice: 1190.00,
    accentColor: '#E2E8F0',
    itemsCount: 4,
    includedServices: ['ChatGPT 4o', 'Midjourney', 'Claude Pro', 'Canva Pro'],
  },
  {
    id: 'pack-sports',
    title: 'Pack Deportes',
    description: 'NBA League Pass, UFC Fight Pass, DAZN y NFL Game Pass.',
    discountBadge: '-80%',
    price: 289.00,
    originalPrice: 1490.00,
    accentColor: '#EAB308',
    itemsCount: 4,
    includedServices: ['NBA Pass', 'UFC Pass', 'DAZN', 'NFL Pass'],
  },
];

export const LIVE_NOTIFICATIONS = [
  {
    id: 'notif-1',
    user: 'Alguien en Ciudad de México',
    product: 'Nord VPN [Privada] (LIFETIME)',
    timeAgo: 'hace 47 minutos',
    verified: true,
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'notif-2',
    user: 'Alguien en Monterrey',
    product: 'Disney+ [LIFETIME] Ultra HD',
    timeAgo: 'hace 12 minutos',
    verified: true,
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'notif-3',
    user: 'Alguien en Guadalajara',
    product: 'Canva Pro [Acceso Anual]',
    timeAgo: 'hace 5 minutos',
    verified: true,
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=120&q=80',
  },
  {
    id: 'notif-4',
    user: 'Alguien en Puebla',
    product: 'Pack General (14 Cuentas Premium)',
    timeAgo: 'Ahora mismo',
    verified: true,
    image: 'https://images.unsplash.com/photo-1614680376593-902f749f7cfc?auto=format&fit=crop&w=120&q=80',
  },
];
