-- =========================================================
-- LUX STORE — SEED DATA (CREDENCIALES Y AJUSTES INICIALES)
-- =========================================================

-- 1. Insertar Perfil de Owner Admin
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'mikeangdhz@gmail.com',
  crypt('M1kE2408*01', gen_salt('bf')),
  NOW(),
  'authenticated'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (id, full_name, email)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Miguel Ángel Dorantes Hernández (Owner Admin)',
  'mikeangdhz@gmail.com'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'owner'
) ON CONFLICT (user_id, role) DO NOTHING;

-- 2. Configuración Global de la Tienda
INSERT INTO public.store_settings (id, store_name, currency, support_email)
VALUES (
  1,
  'Lux Store',
  'MXN',
  'mikeangdhz@gmail.com'
) ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  currency = EXCLUDED.currency,
  support_email = EXCLUDED.support_email;

-- 3. Categorías Base
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
