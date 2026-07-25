-- Se ejecuta por separado porque PostgreSQL requiere confirmar el nuevo valor
-- del enum antes de utilizarlo en funciones o registros.
ALTER TYPE public.wallet_tx_type ADD VALUE IF NOT EXISTS 'TOPUP';
