-- DATOS INICIALES PÚBLICOS
-- Este seed NO crea, modifica ni elimina usuarios de Supabase Auth.
-- Las cuentas y contraseñas se gestionan únicamente desde Supabase Auth.

-- 1. Configuración global de la tienda
INSERT INTO public.store_settings (id, store_name, currency, support_email)
VALUES (
  1,
  'Lux Store',
  'MXN',
  'soporte@example.com'
) ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  currency = EXCLUDED.currency,
  support_email = EXCLUDED.support_email;

-- 2. Categorías base
INSERT INTO public.categories (name, slug, description, is_active)
VALUES
  ('Diseño y Productividad', 'diseno-productividad', 'Canva Pro, CapCut Pro, Scribd, Microsoft 365', true),
  ('Streaming', 'streaming', 'Crunchyroll, Disney+, Max, Prime Video, ViX, IPTV', true),
  ('Música y Video', 'musica-video', 'YouTube Premium, Apple Music, Amazon Music', true),
  ('IA y Aprendizaje', 'ia-aprendizaje', 'Gemini, ChatGPT Go, Claude Unlimited, Duolingo', true),
  ('Gaming', 'gaming', 'Robux 1,000, Xbox Game Pass', true),
  ('Steam y Videojuegos', 'steam-videojuegos', 'Steam Keys, GTA V, God of War', true),
  ('Redes Sociales', 'redes-sociales', 'Seguidores Instagram, Likes, Vistas', true),
  ('Seguridad', 'seguridad', 'ExpressVPN', true)
ON CONFLICT (slug) DO NOTHING;
