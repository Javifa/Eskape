/**
 * ============================================================================
 * ARCHIVO DE DATOS DE LA CARTA DIGITAL Y ESTABLECIMIENTO — ESKAPE
 * ============================================================================
 * Modifica este archivo para actualizar productos, categorías, precios,
 * fotografías, alérgenos y datos de contacto del local sin tocar el código
 * de los componentes visuales.
 *
 * NOTA: Todos los datos de contacto, horarios, productos y precios incluidos
 * actualmente son CONTENIDO PROVISIONAL DE EJEMPLO claramente identificado
 * hasta disponer de la carta y datos definitivos del establecimiento.
 */

export const BRAND_IDENTITY = {
  name: 'ESKAPE',
  tagline: 'Desayunos & Cafetería',
  welcomeTitle: 'Empieza el día con buen sabor',
  welcomeSubtitle:
    'Pan de masa madre tostado al momento, café de tueste natural e ingredientes frescos cada mañana. Explora nuestra carta digital desde tu mesa.',
  provisionalNotice:
    'Carta y datos de contacto de ejemplo — Listos para personalizar con la información oficial del establecimiento.',
};

export const ESTABLISHMENT_INFO = {
  isProvisional: true,
  name: 'ESKAPE · Bar de Desayunos y Cafetería',
  address: {
    street: 'Calle de Ejemplo, 14 (Local) — [Dirección provisional]',
    city: '00000 Ciudad, Provincia',
    reference: 'Junto a la Plaza Principal (Dato de muestra)',
    mapsQuery: 'Cafeteria+Eskape',
    mapsUrl: 'https://maps.google.com/?q=Cafeteria',
  },
  schedule: [
    {
      days: 'Lunes a Viernes',
      hours: '07:30 – 13:30 y 16:30 – 20:30',
      note: 'Horario provisional',
    },
    {
      days: 'Sábados y Domingos',
      hours: '08:30 – 14:00',
      note: 'Desayunos tardíos y especialidades',
    },
    {
      days: 'Martes tarde',
      hours: 'Cerrado por descanso',
      note: 'Confirmar día de cierre real',
    },
  ],
  contact: {
    phoneDisplay: '+34 600 000 000 (Provisional)',
    phoneHref: 'tel:+34600000000',
    whatsappNumber: '34600000000',
    whatsappMessage:
      'Hola ESKAPE, os escribo desde vuestra carta digital para consultar una duda.',
  },
  socials: [
    {
      id: 'instagram',
      label: 'Instagram',
      handle: '@eskape.cafeteria (Ejemplo)',
      url: '#contacto',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      handle: 'Eskape Desayunos (Ejemplo)',
      url: '#contacto',
    },
  ],
  serviceNotes: [
    'Pan sin gluten disponible para todas nuestras tostadas (consultar en barra o al camarero).',
    'Leche sin lactosa y bebidas vegetales (avena, soja y almendra) disponibles.',
    'Todos nuestros precios incluyen IVA. Carta informativa de ejemplo.',
  ],
};

/**
 * Diccionario oficial de alérgenos alimentarios
 */
export const ALLERGENS = {
  gluten: {
    id: 'gluten',
    name: 'Gluten',
    short: 'GLU',
    description: 'Cereales que contienen gluten (trigo, centeno, cebada, avena).',
  },
  lacteos: {
    id: 'lacteos',
    name: 'Lácteos',
    short: 'LAC',
    description: 'Leche y sus derivados (incluida la lactosa y mantequilla).',
  },
  huevos: {
    id: 'huevos',
    name: 'Huevos',
    short: 'HUE',
    description: 'Huevo campero y productos a base de huevo.',
  },
  pescado: {
    id: 'pescado',
    name: 'Pescado',
    short: 'PES',
    description: 'Pescado (salmón ahumado y derivados).',
  },
  frutos_secos: {
    id: 'frutos_secos',
    name: 'Frutos de cáscara',
    short: 'FRU',
    description: 'Nueces, almendras, avellanas, pistachos o anacardos.',
  },
  sesamo: {
    id: 'sesamo',
    name: 'Sésamo',
    short: 'SES',
    description: 'Granos de sésamo / ajonjolí tostado y productos derivados.',
  },
  soja: {
    id: 'soja',
    name: 'Soja',
    short: 'SOJ',
    description: 'Soja y bebidas o productos a base de soja.',
  },
};

/**
 * Categorías de la carta digital
 */
export const CATEGORIES = [
  {
    id: 'desayunos',
    name: 'Desayunos',
    shortDescription: 'Combos matinales completos con café y zumo',
    description:
      'Fórmulas completas pensadas para empezar la mañana con energía: incluyen tu café o infusión y zumo de naranja recién exprimido.',
    image: '/images/hero-breakfast.jpg',
    highlightTag: 'Combos completos',
  },
  {
    id: 'tostadas',
    name: 'Tostadas',
    shortDescription: 'Hogaza de masa madre, mollete artesano o cereales',
    description:
      'Elaboradas al momento sobre pan artesano de corteza crujiente y miga alveolada. Disponibles en formato media o entera (opción sin gluten disponible).',
    image: '/images/tostada-aguacate.jpg',
    highlightTag: 'Pan artesano',
  },
  {
    id: 'especialidades',
    name: 'Especialidades',
    shortDescription: 'Platos de cocina, brioches y dulces al momento',
    description:
      'Recetas de la casa preparadas al instante para quienes buscan un desayuno pausado y gastronómico.',
    image: '/images/huevos-benedict.jpg',
    highlightTag: 'Recetas Eskape',
  },
  {
    id: 'cafes',
    name: 'Cafés e infusiones',
    shortDescription: 'Arábica de tueste natural, matcha y botánicos',
    description:
      'Café 100% arábica de tueste natural molido al instante, leche fresca emulsionada e infusiones orgánicas en hebra.',
    image: '/images/cafe-especialidad.jpg',
    highlightTag: 'Tueste natural',
  },
  {
    id: 'zumos',
    name: 'Zumos y bebidas',
    shortDescription: 'Exprimidos al momento, smoothies y refrescos',
    description:
      'Fruta fresca seleccionada y exprimida al momento sin azúcares añadidos, batidos naturales y aguas.',
    image: '/images/zumos-naturales.jpg',
    highlightTag: '100% Fruta fresca',
  },
  {
    id: 'extras',
    name: 'Extras',
    shortDescription: 'Personaliza tu tostada o desayuno a tu gusto',
    description:
      'Añade tus ingredientes favoritos a cualquier tostada, plato o bebida de nuestra carta.',
    image: '/images/tostada-aguacate.jpg',
    highlightTag: 'Suplementos',
  },
];

/**
 * Productos de la carta digital (Datos y precios de ejemplo)
 */
export const PRODUCTS = [
  // ==========================================================================
  // 1. DESAYUNOS
  // ==========================================================================
  {
    id: 'des-eskape',
    categoryId: 'desayunos',
    name: 'Desayuno Eskape Especial',
    description:
      'Café de especialidad o infusión a elegir, vaso de zumo de naranja recién exprimido y tostada en hogaza de masa madre con aguacate laminado, huevo campero poché y semillas.',
    price: 7.9,
    image: '/images/hero-breakfast.jpg',
    allergens: ['gluten', 'huevos', 'lacteos', 'sesamo'],
    featured: true,
    badge: 'Especialidad de la Casa',
    dietary: ['Opción sin gluten'],
  },
  {
    id: 'des-iberico',
    categoryId: 'desayunos',
    name: 'Desayuno Tradicional Ibérico',
    description:
      'Café con leche o cortado, zumo de naranja natural recién exprimido y mollete artesano tostado con tomate natural rallado, AOVE de primera prensada y jamón ibérico.',
    price: 7.5,
    image: '/images/desayuno-iberico.jpg',
    allergens: ['gluten', 'lacteos'],
    featured: true,
    badge: 'Más pedido',
    dietary: ['Opción sin gluten'],
  },
  {
    id: 'des-dulce',
    categoryId: 'desayunos',
    name: 'Desayuno Francés a la Plancha',
    description:
      'Cappuccino cremoso o café largo, croissant francés 100% mantequilla abierto a la plancha acompañado de mantequilla batida y confitura casera de frutos rojos.',
    price: 5.4,
    image: '/images/croissant-plancha.jpg',
    allergens: ['gluten', 'lacteos', 'huevos'],
    featured: false,
    badge: 'Dulce matinal',
    dietary: ['Vegetariano'],
  },
  {
    id: 'des-bowl',
    categoryId: 'desayunos',
    name: 'Bowl Matinal de Yogur & Granola',
    description:
      'Yogur griego natural cremoso con granola artesana tostada con miel de flores, frambuesas y arándanos frescos, semillas de chía y lascas de almendra.',
    price: 5.8,
    image: '/images/bowl-yogur.jpg',
    allergens: ['lacteos', 'frutos_secos', 'gluten'],
    featured: false,
    dietary: ['Vegetariano'],
  },

  // ==========================================================================
  // 2. TOSTADAS
  // ==========================================================================
  {
    id: 'tos-aguacate',
    categoryId: 'tostadas',
    name: 'Tostada de Aguacate & Huevo Poché',
    description:
      'Rebanada de hogaza de masa madre con aguacate maduro en abanico, huevo campero escalfado al punto, sésamo tostado, brotes tiernos, AOVE y escamas de sal marina.',
    price: 5.2,
    image: '/images/tostada-aguacate.jpg',
    allergens: ['gluten', 'huevos', 'sesamo'],
    featured: true,
    badge: 'Top Ventas',
    dietary: ['Vegetariano', 'Opción sin gluten'],
  },
  {
    id: 'tos-iberica',
    categoryId: 'tostadas',
    name: 'Tostada Ibérica con Tomate de Huerta',
    description:
      'Pan rústico o mollete tostado con aceite de oliva virgen extra variedad picual, tomate fresco rallado al día y lonchas de jamón ibérico recién cortado.',
    price: 4.9,
    image: '/images/desayuno-iberico.jpg',
    allergens: ['gluten'],
    featured: false,
    dietary: ['Sin lácteos', 'Opción sin gluten'],
  },
  {
    id: 'tos-salmon',
    categoryId: 'tostadas',
    name: 'Tostada Nórdica de Salmón & Eneldo',
    description:
      'Pan de masa madre untado con crema suave de queso batido al eneldo, salmón ahumado noruego, alcaparras, cebolla morada fina y ralladura de limón.',
    price: 5.8,
    image: '/images/tostada-salmon.jpg',
    allergens: ['gluten', 'lacteos', 'pescado'],
    featured: false,
    badge: 'Gourmet',
    dietary: ['Opción sin gluten'],
  },
  {
    id: 'tos-ricotta',
    categoryId: 'tostadas',
    name: 'Tostada de Ricotta, Higos & Miel de Romero',
    description:
      'Pan multicereales tostado con ricotta cremosa batida, higos frescos o fruta de temporada, nueces tostadas y un hilo de miel cruda de romero.',
    price: 5.1,
    image: '/images/tostada-ricotta.jpg',
    allergens: ['gluten', 'lacteos', 'frutos_secos', 'sesamo'],
    featured: false,
    dietary: ['Vegetariano'],
  },

  // ==========================================================================
  // 3. ESPECIALIDADES
  // ==========================================================================
  {
    id: 'esp-benedict',
    categoryId: 'especialidades',
    name: 'Huevos Benedictinos Eskape',
    description:
      'Pan brioche artesano dorado con mantequilla, dos huevos camperos poché, virutas de jamón ibérico (o salmón ahumado) y nuestra salsa holandesa tibia con cebollino.',
    price: 8.5,
    image: '/images/huevos-benedict.jpg',
    allergens: ['gluten', 'huevos', 'lacteos'],
    featured: true,
    badge: 'Receta de Autor',
    dietary: [],
  },
  {
    id: 'esp-tortitas',
    categoryId: 'especialidades',
    name: 'Tortitas Esponjosas de Avena & Frutos Rojos',
    description:
      'Torre de tres tortitas caseras recién hechas a la plancha, servidas con plátano laminado, frutos rojos frescos y sirope de arce puro.',
    price: 6.5,
    image: '/images/tortitas-avena.jpg',
    allergens: ['gluten', 'huevos', 'lacteos'],
    featured: false,
    badge: 'Hechas al momento',
    dietary: ['Vegetariano'],
  },
  {
    id: 'esp-bikini',
    categoryId: 'especialidades',
    name: 'Bikini Trufado en Pan Brioche',
    description:
      'Sándwich caliente en pan de molde brioche artesano, jamón cocido extra artesano, doble capa de queso Havarti fundido y mantequilla con toque de trufa negra.',
    price: 5.9,
    image: '/images/bikini-trufado.jpg',
    allergens: ['gluten', 'lacteos', 'huevos'],
    featured: false,
    dietary: [],
  },
  {
    id: 'esp-croissant',
    categoryId: 'especialidades',
    name: 'Croissant de Mantequilla a la Plancha',
    description:
      'Cruasán artesano de hojaldre laminado abierto y caramelizado a la plancha, servido con mantequilla en pomada y mermelada casera de temporada.',
    price: 3.4,
    image: '/images/croissant-plancha.jpg',
    allergens: ['gluten', 'lacteos', 'huevos'],
    featured: false,
    dietary: ['Vegetariano'],
  },

  // ==========================================================================
  // 4. CAFÉS E INFUSIONES
  // ==========================================================================
  {
    id: 'caf-flatwhite',
    categoryId: 'cafes',
    name: 'Flat White · Café de Especialidad',
    description:
      'Doble shot de espresso 100% arábica de tueste natural coronado con una capa fina y sedosa de leche fresca emulsionada.',
    price: 2.6,
    image: '/images/cafe-especialidad.jpg',
    allergens: ['lacteos'],
    featured: true,
    badge: '100% Arábica',
    dietary: ['Bebida vegetal disponible'],
  },
  {
    id: 'caf-cappuccino',
    categoryId: 'cafes',
    name: 'Cappuccino Clásico Cremoso',
    description:
      'Equilibrio perfecto entre espresso intenso, leche vaporizada y espuma densa terminada con un sutil espolvoreado de cacao puro.',
    price: 2.4,
    image: '/images/croissant-plancha.jpg',
    allergens: ['lacteos'],
    featured: false,
    dietary: ['Bebida vegetal disponible'],
  },
  {
    id: 'caf-matcha',
    categoryId: 'cafes',
    name: 'Matcha Latte Ceremonial',
    description:
      'Té verde matcha japonés de grado ceremonial batido con chasen al momento y emulsionado con leche fresca o bebida de avena (frío o caliente).',
    price: 3.2,
    image: '/images/cafe-especialidad.jpg',
    allergens: ['lacteos'],
    featured: false,
    badge: 'Tendencia',
    dietary: ['Vegetariano', 'Bebida vegetal disponible'],
  },
  {
    id: 'caf-infusion',
    categoryId: 'cafes',
    name: 'Infusión Botánica en Hebra',
    description:
      'Servida en tetera individual: Manzanilla flor entera, Rooibos vainilla, Té Earl Grey bergamota, Té Verde Sencha o Menta Poleo.',
    price: 2.2,
    image: '/images/cafe-especialidad.jpg',
    allergens: [],
    featured: false,
    dietary: ['Vegano', 'Sin gluten'],
  },

  // ==========================================================================
  // 5. ZUMOS Y BEBIDAS
  // ==========================================================================
  {
    id: 'zum-naranja',
    categoryId: 'zumos',
    name: 'Zumo de Naranja Recién Exprimido',
    description:
      'Elaborado al instante con naranjas de huerta en su punto óptimo de maduración. 100% fruta natural sin agua ni azúcares añadidos.',
    price: 3.1,
    image: '/images/zumos-naturales.jpg',
    allergens: [],
    featured: true,
    badge: '100% Natural',
    dietary: ['Vegano', 'Sin gluten'],
  },
  {
    id: 'zum-verde',
    categoryId: 'zumos',
    name: 'Smoothie Verde Matinal',
    description:
      'Batido prensado al momento de espinaca baby, manzana verde Granny Smith, pepino fresco, toque de jengibre y zumo de lima.',
    price: 4.2,
    image: '/images/zumos-naturales.jpg',
    allergens: [],
    featured: false,
    dietary: ['Vegano', 'Sin gluten'],
  },
  {
    id: 'zum-limonada',
    categoryId: 'zumos',
    name: 'Agua Mineral / Con Gas (50 cl)',
    description:
      'Botella de cristal de agua mineral de manantial natural o agua finamente gasificada servida con rodaja de limón.',
    price: 1.8,
    image: '/images/zumos-naturales.jpg',
    allergens: [],
    featured: false,
    dietary: ['Vegano', 'Sin gluten'],
  },

  // ==========================================================================
  // 6. EXTRAS
  // ==========================================================================
  {
    id: 'ext-aguacate',
    categoryId: 'extras',
    name: 'Suplemento de Aguacate Fresco',
    description:
      'Medio aguacate maduro laminado al momento con una pizca de sal en escamas y aceite de oliva virgen extra.',
    price: 1.6,
    image: '/images/tostada-aguacate.jpg',
    allergens: [],
    featured: false,
    dietary: ['Vegano', 'Sin gluten'],
  },
  {
    id: 'ext-huevo',
    categoryId: 'extras',
    name: 'Huevo Campero Extra (Poché o Plancha)',
    description:
      'Añade un huevo campero cocinado al momento a cualquiera de tus tostadas o platos.',
    price: 1.3,
    image: '/images/huevos-benedict.jpg',
    allergens: ['huevos'],
    featured: false,
    dietary: ['Vegetariano', 'Sin gluten'],
  },
  {
    id: 'ext-iberico',
    categoryId: 'extras',
    name: 'Porción Extra de Jamón Ibérico',
    description:
      'Ración adicional de lonchas de jamón ibérico para acompañar tu tostada o desayuno.',
    price: 2.2,
    image: '/images/desayuno-iberico.jpg',
    allergens: [],
    featured: false,
    dietary: ['Sin gluten', 'Sin lácteos'],
  },
  {
    id: 'ext-vegetal',
    categoryId: 'extras',
    name: 'Bebida Vegetal / Pan Sin Gluten',
    description:
      'Cambio a bebida vegetal barista (avena, soja o almendra) en tu café o cambio a pan artesano certificado sin gluten.',
    price: 0.5,
    image: '/images/cafe-especialidad.jpg',
    allergens: ['soja', 'frutos_secos'],
    featured: false,
    dietary: ['Vegano'],
  },
];

/**
 * Formateador de precios estándar (ej. 7.9 -> "7,90 €")
 */
export function formatPrice(price) {
  return `${price.toFixed(2).replace('.', ',')} €`;
}
