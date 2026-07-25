CREATE TABLE IF NOT EXISTS public.wallet_topups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL CHECK (amount >= 10 AND amount <= 10000),
  currency TEXT NOT NULL DEFAULT 'MXN' CHECK (currency = 'MXN'),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  payment_request_id TEXT UNIQUE,
  clip_status TEXT,
  clip_transaction_id TEXT,
  wallet_transaction_id UUID UNIQUE REFERENCES public.wallet_transactions(id),
  raw_response JSONB,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_topups_user_created
  ON public.wallet_topups (user_id, created_at DESC);

ALTER TABLE public.wallet_topups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios ven sus propias recargas" ON public.wallet_topups;
CREATE POLICY "Usuarios ven sus propias recargas"
ON public.wallet_topups FOR SELECT
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.complete_clip_wallet_topup(
  p_payment_request_id TEXT,
  p_clip_transaction_id TEXT DEFAULT NULL,
  p_raw_response JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_topup public.wallet_topups%ROWTYPE;
  target_wallet public.wallets%ROWTYPE;
  created_transaction_id UUID;
BEGIN
  SELECT * INTO target_topup
  FROM public.wallet_topups
  WHERE payment_request_id = p_payment_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'WALLET_TOPUP_NOT_FOUND';
  END IF;

  IF target_topup.status = 'COMPLETED' THEN
    RETURN FALSE;
  END IF;

  IF target_topup.status <> 'PENDING' THEN
    RAISE EXCEPTION 'WALLET_TOPUP_NOT_PENDING';
  END IF;

  INSERT INTO public.wallets (user_id, balance)
  VALUES (target_topup.user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO target_wallet
  FROM public.wallets
  WHERE user_id = target_topup.user_id
  FOR UPDATE;

  UPDATE public.wallets
  SET balance = balance + target_topup.amount,
      updated_at = NOW()
  WHERE id = target_wallet.id;

  INSERT INTO public.wallet_transactions (
    wallet_id,
    type,
    amount,
    description
  )
  VALUES (
    target_wallet.id,
    'TOPUP',
    target_topup.amount,
    'Recarga de créditos con Clip'
  )
  RETURNING id INTO created_transaction_id;

  UPDATE public.wallet_topups
  SET status = 'COMPLETED',
      clip_status = 'COMPLETED',
      clip_transaction_id = p_clip_transaction_id,
      wallet_transaction_id = created_transaction_id,
      raw_response = p_raw_response,
      completed_at = NOW(),
      updated_at = NOW()
  WHERE id = target_topup.id;

  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.complete_clip_wallet_topup(TEXT, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_clip_wallet_topup(TEXT, TEXT, JSONB)
  TO service_role;
