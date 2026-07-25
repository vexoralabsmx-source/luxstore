-- =========================================================
-- LUX STORE — SUPABASE POSTGRESQL DATABASE SCHEMA (FASE 1-4)
-- =========================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('owner', 'admin', 'support', 'customer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE product_status_type AS ENUM ('active', 'draft', 'archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE delivery_type AS ENUM ('code', 'account', 'profile', 'license', 'giftcard', 'download', 'link', 'manual');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE inventory_status_type AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'REPLACED', 'DISABLED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE order_status_type AS ENUM ('PENDING_PAYMENT', 'PAYMENT_REVIEW', 'PAID', 'PROCESSING', 'DELIVERED', 'CANCELLED', 'EXPIRED', 'REFUNDED', 'DISPUTED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('clip', 'spei', 'crypto', 'credits');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE ticket_status_type AS ENUM ('OPEN', 'WAITING_CUSTOMER', 'WAITING_SUPPORT', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE wallet_tx_type AS ENUM ('ADMIN_CREDIT', 'ADMIN_DEBIT', 'PURCHASE', 'REFUND', 'BONUS', 'ADJUSTMENT', 'HOLD', 'RELEASE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. PERFILES DE USUARIO
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  risk_level TEXT DEFAULT 'LOW',
  is_blocked BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROLES DE USUARIO
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role_type NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 5. CONFIGURACIÓN DE LA TIENDA
CREATE TABLE IF NOT EXISTS public.store_settings (
  id INT PRIMARY KEY DEFAULT 1,
  store_name TEXT DEFAULT 'Lux Store',
  logo_url TEXT,
  favicon_url TEXT,
  currency TEXT DEFAULT 'MXN',
  timezone TEXT DEFAULT 'America/Mexico_City',
  support_email TEXT DEFAULT 'soporte@luxstore.com',
  maintenance_mode BOOLEAN DEFAULT FALSE,
  show_stock BOOLEAN DEFAULT TRUE,
  allow_registration BOOLEAN DEFAULT TRUE,
  allow_checkout BOOLEAN DEFAULT TRUE,
  discord_webhook_url TEXT,
  footer_text TEXT DEFAULT '© 2026 Lux Store. Todos los derechos reservados. Productos digitales con entrega inmediata.',
  terms_conditions TEXT DEFAULT 'Términos y condiciones estándar de Lux Store.',
  privacy_policy TEXT DEFAULT 'Política de privacidad de Lux Store.',
  refund_policy TEXT DEFAULT 'Garantía y política de reembolsos de Lux Store.',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_store_row CHECK (id = 1)
);

-- 6. CATEGORÍAS
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_name TEXT DEFAULT 'Package',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRODUCTOS
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  status product_status_type DEFAULT 'active',
  is_featured BOOLEAN DEFAULT FALSE,
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  sale_price DECIMAL(12,2),
  cost_price DECIMAL(12,2),
  tags TEXT[],
  region TEXT DEFAULT 'Global',
  delivery_type delivery_type DEFAULT 'code',
  warranty_days INT DEFAULT 30,
  estimated_delivery_time TEXT DEFAULT 'Entrega inmediata',
  limit_per_customer INT DEFAULT 0,
  show_stock BOOLEAN DEFAULT TRUE,
  pre_purchase_questions JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. IMÁGENES DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VARIANTES DE PRODUCTOS
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(12,2) NOT NULL,
  sale_price DECIMAL(12,2),
  warranty_days INT,
  delivery_type delivery_type,
  purchase_limit INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INVENTARIO DIGITAL (CIFRADO AES-256-GCM)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  content_encrypted TEXT NOT NULL,
  status inventory_status_type DEFAULT 'AVAILABLE',
  expiration_date TIMESTAMPTZ,
  order_id UUID,
  customer_id UUID REFERENCES public.profiles(id),
  added_by UUID REFERENCES public.profiles(id),
  internal_notes TEXT,
  replacement_count INT DEFAULT 0,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RESERVAS DE STOCK TEMPORALES
CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  order_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CARRITOS Y ARTÍCULOS
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. PEDIDOS
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  payment_method payment_method_type NOT NULL,
  payment_reference TEXT,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  status order_status_type DEFAULT 'PENDING_PAYMENT',
  unique_cents_amount DECIMAL(12,2),
  customer_notes TEXT,
  pre_purchase_answers JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  paid_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  product_name TEXT NOT NULL,
  variant_name TEXT,
  unit_price DECIMAL(12,2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(12,2) NOT NULL
);

-- 14. REGISTRO DE PAGOS Y EVENTOS
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider payment_method_type NOT NULL,
  transaction_id TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  status TEXT NOT NULL,
  proof_file_url TEXT,
  txid TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ENTREGAS DIGITALES
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id),
  customer_id UUID REFERENCES public.profiles(id),
  delivered_content TEXT NOT NULL,
  revealed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. BILLETERA DE CRÉDITOS
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  held_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  type wallet_tx_type NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  performed_by UUID REFERENCES public.profiles(id),
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CUPONES Y REDENCIONES
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'percentage',
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2) DEFAULT 0.00,
  max_uses INT DEFAULT 0,
  uses_count INT DEFAULT 0,
  max_uses_per_user INT DEFAULT 1,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  expiration_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  discount_applied DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TICKETS Y REEMPLAZOS
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  subject TEXT NOT NULL,
  reason TEXT NOT NULL,
  status ticket_status_type DEFAULT 'OPEN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.replacements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  original_inventory_id UUID NOT NULL REFERENCES public.inventory_items(id),
  new_inventory_id UUID NOT NULL REFERENCES public.inventory_items(id),
  approved_by UUID NOT NULL REFERENCES public.profiles(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. RESEÑAS DE COMPRAS VERIFICADAS
CREATE TABLE IF NOT EXISTS public.product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_item_id UUID NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL CHECK (char_length(trim(comment)) BETWEEN 12 AND 800),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, order_item_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_public
  ON public.product_reviews (is_published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product
  ON public.product_reviews (product_id, is_published, created_at DESC);

-- 19. AUDITORÍA Y NOTIFICACIONES
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_resource TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_holder TEXT NOT NULL,
  clabe TEXT NOT NULL,
  account_number TEXT,
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.crypto_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency TEXT NOT NULL,
  network TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  qr_code_url TEXT,
  min_amount DECIMAL(12,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. INDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON public.inventory_items(status, product_id, variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets(customer_id);

-- 21. TRIGGERS AUTOMÁTICOS
-- Sincronizar perfiles y billeteras al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');

  INSERT INTO public.wallets (user_id, balance)
  VALUES (NEW.id, 0.00);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 22. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crypto_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS BÁSICAS
-- Productos y Categorías: Lectura pública si está activo
CREATE POLICY "Categorias accesibles públicamente" ON public.categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Productos accesibles públicamente" ON public.products FOR SELECT USING (status = 'active');
CREATE POLICY "Variantes accesibles públicamente" ON public.product_variants FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Imágenes accesibles públicamente" ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "Configuración visible públicamente" ON public.store_settings FOR SELECT USING (TRUE);

-- Perfiles y Billeteras: El propio usuario puede leer su información
CREATE POLICY "Usuarios ven su propio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios ven sus propios roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios ven su propia billetera" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios ven sus propios pedidos" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuarios ven sus entregas digitales" ON public.deliveries FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Reseñas publicadas visibles" ON public.product_reviews
FOR SELECT USING (is_published = TRUE OR auth.uid() = user_id);
CREATE POLICY "Usuarios reseñan compras entregadas" ON public.product_reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.id = order_id
      AND oi.id = order_item_id
      AND oi.product_id = product_id
      AND o.user_id = auth.uid()
      AND o.status = 'DELIVERED'
  )
);
