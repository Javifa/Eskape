-- ============================================================================
-- MIGRACIÓN 002: DATOS INICIALES (SEED) DE LA CARTA DIGITAL DE ESKAPE
-- ============================================================================
-- Ejecutar en el SQL Editor del proyecto Supabase de ESKAPE después de 001.
-- Carga la configuración inicial, las 6 categorías y los 23 productos actuales.
-- ============================================================================

-- 1. Configuración general del establecimiento
INSERT INTO public.establishment_settings (
  id,
  name,
  tagline,
  welcome_title,
  welcome_subtitle,
  description,
  provisional_notice,
  is_provisional,
  logo_url,
  hero_image_url,
  ambiance_image_url,
  hero_suggestion_label,
  hero_suggestion_title,
  hero_suggestion_meta,
  address_street,
  address_city,
  address_reference,
  maps_url,
  phone_display,
  phone_href,
  whatsapp_number,
  whatsapp_message,
  schedule,
  socials,
  service_notes,
  theme_colors,
  visibility_config
) VALUES (
  'eskape',
  'ESKAPE',
  'Desayunos & Cafetería',
  'Empieza el día con buen sabor',
  'Pan de masa madre tostado al momento, café de tueste natural e ingredientes frescos cada mañana. Explora nuestra carta digital desde tu mesa.',
  'En ESKAPE cuidamos cada detalle de la mañana: desde el molido del grano hasta el horneado del pan. Gracias por visitarnos y consultar nuestra carta digital desde tu mesa.',
  'Carta y datos de contacto de ejemplo — Listos para personalizar desde el panel de administración.',
  true,
  '/logo-eskape.jpg',
  '/images/hero-breakfast.jpg',
  '/images/ambiente-eskape.jpg',
  'Sugerencia Matinal',
  'Desayuno Eskape Especial',
  'Café + Zumo natural + Tostada de aguacate y huevo poché · 7,90 €',
  'Calle de Ejemplo, 14 (Local) — [Dirección provisional]',
  '00000 Ciudad, Provincia',
  'Junto a la Plaza Principal (Dato de muestra)',
  'https://maps.google.com/?q=Cafeteria',
  '+34 600 000 000 (Provisional)',
  'tel:+34600000000',
  '34600000000',
  'Hola ESKAPE, os escribo desde vuestra carta digital para consultar una duda.',
  '[
    {"days": "Lunes a Viernes", "hours": "07:30 – 13:30 y 16:30 – 20:30", "note": "Horario provisional"},
    {"days": "Sábados y Domingos", "hours": "08:30 – 14:00", "note": "Desayunos tardíos y especialidades"},
    {"days": "Martes tarde", "hours": "Cerrado por descanso", "note": "Confirmar día de cierre real"}
  ]'::jsonb,
  '[
    {"id": "instagram", "label": "Instagram", "handle": "@eskape.cafeteria (Ejemplo)", "url": "#contacto"},
    {"id": "facebook", "label": "Facebook", "handle": "Eskape Desayunos (Ejemplo)", "url": "#contacto"}
  ]'::jsonb,
  '[
    "Pan sin gluten disponible para todas nuestras tostadas (consultar en barra o al camarero).",
    "Leche sin lactosa y bebidas vegetales (avena, soja y almendra) disponibles.",
    "Todos nuestros precios incluyen IVA."
  ]'::jsonb,
  '{
    "bgCream": "#F2EBD8",
    "forestPrimary": "#1D2F21",
    "goldAccent": "#B58B42"
  }'::jsonb,
  '{
    "showProvisionalBanner": true,
    "showFeaturedSection": true,
    "showAllergenFilter": true,
    "showAmbianceSection": true,
    "showWhatsAppButton": true,
    "showSocials": true
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  welcome_title = EXCLUDED.welcome_title,
  welcome_subtitle = EXCLUDED.welcome_subtitle,
  description = EXCLUDED.description;

-- 2. Categorías iniciales
INSERT INTO public.categories (id, name, short_description, description, image_url, highlight_tag, sort_order, is_active)
VALUES
  ('desayunos', 'Desayunos', 'Combos matinales completos con café y zumo', 'Fórmulas completas pensadas para empezar la mañana con energía: incluyen tu café o infusión y zumo de naranja recién exprimido.', '/images/hero-breakfast.jpg', 'Combos completos', 1, true),
  ('tostadas', 'Tostadas', 'Hogaza de masa madre, mollete artesano o cereales', 'Elaboradas al momento sobre pan artesano de corteza crujiente y miga alveolada. Disponibles en formato media o entera (opción sin gluten disponible).', '/images/tostada-aguacate.jpg', 'Pan artesano', 2, true),
  ('especialidades', 'Especialidades', 'Platos de cocina, brioches y dulces al momento', 'Recetas de la casa preparadas al instante para quienes buscan un desayuno pausado y gastronómico.', '/images/huevos-benedict.jpg', 'Recetas Eskape', 3, true),
  ('cafes', 'Cafés e infusiones', 'Arábica de tueste natural, matcha y botánicos', 'Café 100% arábica de tueste natural molido al instante, leche fresca emulsionada e infusiones orgánicas en hebra.', '/images/cafe-especialidad.jpg', 'Tueste natural', 4, true),
  ('zumos', 'Zumos y bebidas', 'Exprimidos al momento, smoothies y refrescos', 'Fruta fresca seleccionada y exprimida al momento sin azúcares añadidos, batidos naturales y aguas.', '/images/zumos-naturales.jpg', '100% Fruta fresca', 5, true),
  ('extras', 'Extras', 'Personaliza tu tostada o desayuno a tu gusto', 'Añade tus ingredientes favoritos a cualquier tostada, plato o bebida de nuestra carta.', '/images/tostada-aguacate.jpg', 'Suplementos', 6, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  highlight_tag = EXCLUDED.highlight_tag,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 3. Productos iniciales
INSERT INTO public.products (
  id, category_id, name, description, price, image_url,
  is_active, is_available, is_featured, badge, allergens, dietary, sort_order
) VALUES
  -- DESAYUNOS
  ('des-eskape', 'desayunos', 'Desayuno Eskape Especial', 'Café de especialidad o infusión a elegir, vaso de zumo de naranja recién exprimido y tostada en hogaza de masa madre con aguacate laminado, huevo campero poché y semillas.', 7.90, '/images/hero-breakfast.jpg', true, true, true, 'Especialidad de la Casa', ARRAY['gluten','huevos','lacteos','sesamo'], ARRAY['Opción sin gluten'], 1),
  ('des-iberico', 'desayunos', 'Desayuno Tradicional Ibérico', 'Café con leche o cortado, zumo de naranja natural recién exprimido y mollete artesano tostado con tomate natural rallado, AOVE de primera prensada y jamón ibérico.', 7.50, '/images/desayuno-iberico.jpg', true, true, true, 'Más pedido', ARRAY['gluten','lacteos'], ARRAY['Opción sin gluten'], 2),
  ('des-dulce', 'desayunos', 'Desayuno Francés a la Plancha', 'Cappuccino cremoso o café largo, croissant francés 100% mantequilla abierto a la plancha acompañado de mantequilla batida y confitura casera de frutos rojos.', 5.40, '/images/croissant-plancha.jpg', true, true, false, 'Dulce matinal', ARRAY['gluten','lacteos','huevos'], ARRAY['Vegetariano'], 3),
  ('des-bowl', 'desayunos', 'Bowl Matinal de Yogur & Granola', 'Yogur griego natural cremoso con granola artesana tostada con miel de flores, frambuesas y arándanos frescos, semillas de chía y lascas de almendra.', 5.80, '/images/bowl-yogur.jpg', true, true, false, '', ARRAY['lacteos','frutos_secos','gluten'], ARRAY['Vegetariano'], 4),

  -- TOSTADAS
  ('tos-aguacate', 'tostadas', 'Tostada de Aguacate & Huevo Poché', 'Rebanada de hogaza de masa madre con aguacate maduro en abanico, huevo campero escalfado al punto, sésamo tostado, brotes tiernos, AOVE y escamas de sal marina.', 5.20, '/images/tostada-aguacate.jpg', true, true, true, 'Top Ventas', ARRAY['gluten','huevos','sesamo'], ARRAY['Vegetariano','Opción sin gluten'], 1),
  ('tos-iberica', 'tostadas', 'Tostada Ibérica con Tomate de Huerta', 'Pan rústico o mollete tostado con aceite de oliva virgen extra variedad picual, tomate fresco rallado al día y lonchas de jamón ibérico recién cortado.', 4.90, '/images/desayuno-iberico.jpg', true, true, false, '', ARRAY['gluten'], ARRAY['Sin lácteos','Opción sin gluten'], 2),
  ('tos-salmon', 'tostadas', 'Tostada Nórdica de Salmón & Eneldo', 'Pan de masa madre untado con crema suave de queso batido al eneldo, salmón ahumado noruego, alcaparras, cebolla morada fina y ralladura de limón.', 5.80, '/images/tostada-salmon.jpg', true, true, false, 'Gourmet', ARRAY['gluten','lacteos','pescado'], ARRAY['Opción sin gluten'], 3),
  ('tos-ricotta', 'tostadas', 'Tostada de Ricotta, Higos & Miel de Romero', 'Pan multicereales tostado con ricotta cremosa batida, higos frescos o fruta de temporada, nueces tostadas y un hilo de miel cruda de romero.', 5.10, '/images/tostada-ricotta.jpg', true, true, false, '', ARRAY['gluten','lacteos','frutos_secos','sesamo'], ARRAY['Vegetariano'], 4),

  -- ESPECIALIDADES
  ('esp-benedict', 'especialidades', 'Huevos Benedictinos Eskape', 'Pan brioche artesano dorado con mantequilla, dos huevos camperos poché, virutas de jamón ibérico (o salmón ahumado) y nuestra salsa holandesa tibia con cebollino.', 8.50, '/images/huevos-benedict.jpg', true, true, true, 'Receta de Autor', ARRAY['gluten','huevos','lacteos'], ARRAY[]::text[], 1),
  ('esp-tortitas', 'especialidades', 'Tortitas Esponjosas de Avena & Frutos Rojos', 'Torre de tres tortitas caseras recién hechas a la plancha, servidas con plátano laminado, frutos rojos frescos y sirope de arce puro.', 6.50, '/images/tortitas-avena.jpg', true, true, false, 'Hechas al momento', ARRAY['gluten','huevos','lacteos'], ARRAY['Vegetariano'], 2),
  ('esp-bikini', 'especialidades', 'Bikini Trufado en Pan Brioche', 'Sándwich caliente en pan de molde brioche artesano, jamón cocido extra artesano, doble capa de queso Havarti fundido y mantequilla con toque de trufa negra.', 5.90, '/images/bikini-trufado.jpg', true, true, false, '', ARRAY['gluten','lacteos','huevos'], ARRAY[]::text[], 3),
  ('esp-croissant', 'especialidades', 'Croissant de Mantequilla a la Plancha', 'Cruasán artesano de hojaldre laminado abierto y caramelizado a la plancha, servido con mantequilla en pomada y mermelada casera de temporada.', 3.40, '/images/croissant-plancha.jpg', true, true, false, '', ARRAY['gluten','lacteos','huevos'], ARRAY['Vegetariano'], 4),

  -- CAFÉS E INFUSIONES
  ('caf-flatwhite', 'cafes', 'Flat White · Café de Especialidad', 'Doble shot de espresso 100% arábica de tueste natural coronado con una capa fina y sedosa de leche fresca emulsionada.', 2.60, '/images/cafe-especialidad.jpg', true, true, true, '100% Arábica', ARRAY['lacteos'], ARRAY['Bebida vegetal disponible'], 1),
  ('caf-cappuccino', 'cafes', 'Cappuccino Clásico Cremoso', 'Equilibrio perfecto entre espresso intenso, leche vaporizada y espuma densa terminada con un sutil espolvoreado de cacao puro.', 2.40, '/images/croissant-plancha.jpg', true, true, false, '', ARRAY['lacteos'], ARRAY['Bebida vegetal disponible'], 2),
  ('caf-matcha', 'cafes', 'Matcha Latte Ceremonial', 'Té verde matcha japonés de grado ceremonial batido con chasen al momento y emulsionado con leche fresca o bebida de avena (frío o caliente).', 3.20, '/images/cafe-especialidad.jpg', true, true, false, 'Tendencia', ARRAY['lacteos'], ARRAY['Vegetariano','Bebida vegetal disponible'], 3),
  ('caf-infusion', 'cafes', 'Infusión Botánica en Hebra', 'Servida en tetera individual: Manzanilla flor entera, Rooibos vainilla, Té Earl Grey bergamota, Té Verde Sencha o Menta Poleo.', 2.20, '/images/cafe-especialidad.jpg', true, true, false, '', ARRAY[]::text[], ARRAY['Vegano','Sin gluten'], 4),

  -- ZUMOS Y BEBIDAS
  ('zum-naranja', 'zumos', 'Zumo de Naranja Recién Exprimido', 'Elaborado al instante con naranjas de huerta en su punto óptimo de maduración. 100% fruta natural sin agua ni azúcares añadidos.', 3.10, '/images/zumos-naturales.jpg', true, true, true, '100% Natural', ARRAY[]::text[], ARRAY['Vegano','Sin gluten'], 1),
  ('zum-verde', 'zumos', 'Smoothie Verde Matinal', 'Batido prensado al momento de espinaca baby, manzana verde Granny Smith, pepino fresco, toque de jengibre y zumo de lima.', 4.20, '/images/zumos-naturales.jpg', true, true, false, '', ARRAY[]::text[], ARRAY['Vegano','Sin gluten'], 2),
  ('zum-limonada', 'zumos', 'Agua Mineral / Con Gas (50 cl)', 'Botella de cristal de agua mineral de manantial natural o agua finamente gasificada servida con rodaja de limón.', 1.80, '/images/zumos-naturales.jpg', true, true, false, '', ARRAY[]::text[], ARRAY['Vegano','Sin gluten'], 3),

  -- EXTRAS
  ('ext-aguacate', 'extras', 'Suplemento de Aguacate Fresco', 'Medio aguacate maduro laminado al momento con una pizca de sal en escamas y aceite de oliva virgen extra.', 1.60, '/images/tostada-aguacate.jpg', true, true, false, '', ARRAY[]::text[], ARRAY['Vegano','Sin gluten'], 1),
  ('ext-huevo', 'extras', 'Huevo Campero Extra (Poché o Plancha)', 'Añade un huevo campero cocinado al momento a cualquiera de tus tostadas o platos.', 1.30, '/images/huevos-benedict.jpg', true, true, false, '', ARRAY['huevos'], ARRAY['Vegetariano','Sin gluten'], 2),
  ('ext-iberico', 'extras', 'Porción Extra de Jamón Ibérico', 'Ración adicional de lonchas de jamón ibérico para acompañar tu tostada o desayuno.', 2.20, '/images/desayuno-iberico.jpg', true, true, false, '', ARRAY[]::text[], ARRAY['Sin gluten','Sin lácteos'], 3),
  ('ext-vegetal', 'extras', 'Bebida Vegetal / Pan Sin Gluten', 'Cambio a bebida vegetal barista (avena, soja o almendra) en tu café o cambio a pan artesano certificado sin gluten.', 0.50, '/images/cafe-especialidad.jpg', true, true, false, '', ARRAY['soja','frutos_secos'], ARRAY['Vegano'], 4)
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  is_active = EXCLUDED.is_active,
  is_available = EXCLUDED.is_available,
  is_featured = EXCLUDED.is_featured,
  badge = EXCLUDED.badge,
  allergens = EXCLUDED.allergens,
  dietary = EXCLUDED.dietary,
  sort_order = EXCLUDED.sort_order;

-- ============================================================================
-- 4. ALTA DEL PRIMER USUARIO ADMINISTRADOR DE ESKAPE
-- ============================================================================
-- Una vez creado el usuario del propietario en Authentication > Users dentro
-- del panel de Supabase de ESKAPE, ejecuta esta sentencia sustituyendo el
-- correo electrónico por el del propietario autorizado:
--
-- INSERT INTO public.admin_profiles (id, email, full_name, role, is_active)
-- SELECT id, email, 'Propietario ESKAPE', 'owner', true
-- FROM auth.users
-- WHERE email = 'correo_del_propietario@eskape.es'
-- ON CONFLICT (id) DO UPDATE SET is_active = true, role = 'owner';
