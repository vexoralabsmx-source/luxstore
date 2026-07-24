import { createAdminClient } from '@/lib/supabase/admin';

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  message?: string;
}

export interface CouponData {
  id?: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase?: number;
  uses_count?: number;
  max_uses?: number;
  is_active: boolean;
  expiration_date?: string;
}

const PREDEFINED_COUPONS: Record<string, CouponData> = {
  LUX10: { code: 'LUX10', discount_type: 'percentage', discount_value: 10, is_active: true, min_purchase: 0, max_uses: 1000 },
  LUX20: { code: 'LUX20', discount_type: 'percentage', discount_value: 20, is_active: true, min_purchase: 100, max_uses: 1000 },
  LUX50: { code: 'LUX50', discount_type: 'percentage', discount_value: 50, is_active: true, min_purchase: 300, max_uses: 1000 },
  BIENVENIDA: { code: 'BIENVENIDA', discount_type: 'fixed', discount_value: 50, is_active: true, min_purchase: 100, max_uses: 1000 },
};

/**
 * Valida un código de cupón contra Supabase, LocalStorage o Cupones activos
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
  userId?: string
): Promise<CouponValidationResult> {
  const cleanCode = code.trim().toUpperCase();

  if (!cleanCode) {
    return { valid: false, message: 'Ingresa un código de cupón' };
  }

  try {
    let coupon: CouponData | null = null;

    // 1. Consultar base de datos de Supabase
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', cleanCode)
        .single();

      if (!error && data) {
        coupon = data;
      }
    } catch (e) {
      console.warn('Supabase coupons offline, checking local coupons:', e);
    }

    // 2. Si no se encontró en Supabase, revisar en LocalStorage / Cupones guardados por Admin
    if (!coupon && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('lux_coupons');
        if (stored) {
          const localCoupons: CouponData[] = JSON.parse(stored);
          const found = localCoupons.find((c) => c.code.toUpperCase() === cleanCode);
          if (found) coupon = found;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 3. Si no está en LocalStorage, revisar cupones predefinidos del sistema (LUX10, LUX20, BIENVENIDA)
    if (!coupon && PREDEFINED_COUPONS[cleanCode]) {
      coupon = PREDEFINED_COUPONS[cleanCode];
    }

    if (!coupon) {
      return { valid: false, message: 'El código de cupón no existe o ha expirado' };
    }

    if (!coupon.is_active) {
      return { valid: false, message: 'El cupón se encuentra inactivo' };
    }

    if (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) {
      return { valid: false, message: 'El cupón ha expirado' };
    }

    if (coupon.min_purchase && coupon.min_purchase > 0 && subtotal < coupon.min_purchase) {
      return { 
        valid: false, 
        message: `El monto mínimo para usar este cupón es $${coupon.min_purchase} MXN` 
      };
    }

    if (coupon.max_uses && coupon.uses_count && coupon.max_uses > 0 && coupon.uses_count >= coupon.max_uses) {
      return { valid: false, message: 'El cupón ha alcanzado el límite máximo de usos' };
    }

    let discount_amount = 0;
    if (coupon.discount_type === 'percentage') {
      discount_amount = (subtotal * coupon.discount_value) / 100;
    } else {
      discount_amount = coupon.discount_value;
    }

    // Asegurar que el descuento no supere el subtotal
    if (discount_amount > subtotal) {
      discount_amount = subtotal;
    }

    return {
      valid: true,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount,
      message: `¡Cupón ${coupon.code} aplicado! Descuento de $${discount_amount.toFixed(2)} MXN`,
    };
  } catch (error) {
    console.error('Error al validar cupón:', error);
    return { valid: false, message: 'Error al verificar el cupón' };
  }
}
