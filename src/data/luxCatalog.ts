export interface LuxProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  category_name: string;
  prices: { label: string; price: number }[];
  base_price: number;
  sale_price: number;
  note?: string;
  stock: number;
  delivery: string;
  image: string;
  logo: string;
  brandColor: string;
  rating: number;
  sales: number;
}

export const LUX_BANK_INFO = {
  bank: 'BBVA',
  holder: 'Miguel Ángel Dorantes Hernández',
  cardNumber: '4152 3146 1191 9765',
  whatsappLink: 'https://chat.whatsapp.com/HIjH4pcyzlp74ERGT5T3Dl',
};

export const LUX_TERMS_AND_GUARANTEE = [
  'Todos los accesos y licencias cuentan con garantía directa de reemplazo.',
  'La entrega digital es automática tras confirmación o aprobación del pago.',
  'Prohibido revender o modificar contraseñas maestras en accesos compartidos.',
  'Soporte técnico directo mediante la sección de tickets en tu panel de cliente.',
];

export const LUX_CATEGORIES = [
  { id: 'cat_design', name: 'Diseño y Productividad', slug: 'diseno-productividad' },
  { id: 'cat_streaming', name: 'Streaming', slug: 'streaming' },
  { id: 'cat_music', name: 'Música y Video', slug: 'musica-video' },
  { id: 'cat_ai', name: 'IA y Aprendizaje', slug: 'ia-aprendizaje' },
  { id: 'cat_gaming', name: 'Gaming', slug: 'gaming' },
  { id: 'cat_steam', name: 'Steam y Videojuegos', slug: 'steam-videojuegos' },
  { id: 'cat_social', name: 'Redes Sociales', slug: 'redes-sociales' },
  { id: 'cat_security', name: 'Seguridad', slug: 'seguridad' },
];

/**
 * Catálogo general de productos de Lux Store.
 * Inicializado como lista vacía para carga y administración manual directa por el usuario owner.
 */
export const LUX_PRODUCTS: LuxProduct[] = [];
