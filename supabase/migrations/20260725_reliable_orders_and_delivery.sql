-- Corrige permisos de lectura y hace atómica la asignación de inventario.

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order ON public.deliveries(order_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_deliveries_inventory_unique ON public.deliveries(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON public.payments(transaction_id);

DROP POLICY IF EXISTS "Usuarios ven los items de sus pedidos" ON public.order_items;
CREATE POLICY "Usuarios ven los items de sus pedidos"
ON public.order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_items.order_id AND o.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Usuarios actualizan su perfil" ON public.profiles;
CREATE POLICY "Usuarios actualizan su perfil"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Usuarios ven movimientos de su billetera" ON public.wallet_transactions;
CREATE POLICY "Usuarios ven movimientos de su billetera"
ON public.wallet_transactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wallets w
    WHERE w.id = wallet_transactions.wallet_id AND w.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.claim_inventory_for_order(p_order_id UUID)
RETURNS TABLE (
  inventory_item_id UUID,
  order_item_id UUID,
  product_name TEXT,
  variant_name TEXT,
  content_encrypted TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_order public.orders%ROWTYPE;
  line public.order_items%ROWTYPE;
  stock public.inventory_items%ROWTYPE;
  claimed_count INT;
BEGIN
  SELECT * INTO target_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF target_order.status NOT IN ('PAID', 'PROCESSING', 'DELIVERED') THEN
    RAISE EXCEPTION 'ORDER_NOT_PAID';
  END IF;

  IF target_order.status = 'DELIVERED' THEN
    RETURN;
  END IF;

  UPDATE public.orders
  SET status = 'PROCESSING', updated_at = NOW()
  WHERE id = p_order_id;

  FOR line IN
    SELECT * FROM public.order_items WHERE order_id = p_order_id ORDER BY id
  LOOP
    claimed_count := 0;

    FOR stock IN
      SELECT ii.*
      FROM public.inventory_items ii
      WHERE ii.product_id = line.product_id
        AND (
          (line.variant_id IS NULL AND ii.variant_id IS NULL)
          OR ii.variant_id = line.variant_id
        )
        AND (
          ii.status = 'AVAILABLE'
          OR (ii.status = 'SOLD' AND ii.order_id = p_order_id)
        )
      ORDER BY CASE WHEN ii.order_id = p_order_id THEN 0 ELSE 1 END, ii.created_at
      FOR UPDATE SKIP LOCKED
      LIMIT line.quantity
    LOOP
      claimed_count := claimed_count + 1;

      UPDATE public.inventory_items
      SET
        status = 'SOLD',
        order_id = p_order_id,
        customer_id = target_order.user_id,
        sold_at = COALESCE(sold_at, NOW()),
        updated_at = NOW()
      WHERE id = stock.id;

      inventory_item_id := stock.id;
      order_item_id := line.id;
      product_name := line.product_name;
      variant_name := line.variant_name;
      content_encrypted := stock.content_encrypted;
      RETURN NEXT;
    END LOOP;

    IF claimed_count <> line.quantity THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', line.product_name;
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_inventory_for_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_inventory_for_order(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.charge_wallet_for_order(p_order_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_order public.orders%ROWTYPE;
  target_wallet public.wallets%ROWTYPE;
BEGIN
  SELECT * INTO target_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND OR target_order.user_id IS NULL THEN
    RAISE EXCEPTION 'ORDER_OR_USER_NOT_FOUND';
  END IF;

  IF target_order.payment_method <> 'credits' THEN
    RAISE EXCEPTION 'INVALID_PAYMENT_METHOD';
  END IF;

  SELECT * INTO target_wallet
  FROM public.wallets
  WHERE user_id = target_order.user_id
  FOR UPDATE;

  IF NOT FOUND OR target_wallet.balance < target_order.total THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS';
  END IF;

  UPDATE public.wallets
  SET balance = balance - target_order.total, updated_at = NOW()
  WHERE id = target_wallet.id;

  INSERT INTO public.wallet_transactions (wallet_id, type, amount, description, order_id)
  VALUES (
    target_wallet.id,
    'PURCHASE',
    -target_order.total,
    'Compra ' || target_order.order_number,
    target_order.id
  );

  UPDATE public.orders
  SET status = 'PAID', paid_at = NOW(), updated_at = NOW()
  WHERE id = target_order.id;
END;
$$;

REVOKE ALL ON FUNCTION public.charge_wallet_for_order(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.charge_wallet_for_order(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_adjust_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_type wallet_tx_type,
  p_description TEXT,
  p_performed_by UUID
)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_wallet public.wallets%ROWTYPE;
  delta NUMERIC;
  next_balance NUMERIC;
BEGIN
  SELECT * INTO target_wallet FROM public.wallets WHERE user_id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'WALLET_NOT_FOUND'; END IF;

  delta := CASE WHEN p_type = 'ADMIN_CREDIT' THEN ABS(p_amount) ELSE -ABS(p_amount) END;
  next_balance := target_wallet.balance + delta;
  IF next_balance < 0 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  UPDATE public.wallets SET balance = next_balance, updated_at = NOW() WHERE id = target_wallet.id;
  INSERT INTO public.wallet_transactions (wallet_id, type, amount, description, performed_by)
  VALUES (target_wallet.id, p_type, delta, p_description, p_performed_by);
  RETURN next_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_adjust_wallet(UUID, NUMERIC, wallet_tx_type, TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_wallet(UUID, NUMERIC, wallet_tx_type, TEXT, UUID) TO service_role;
