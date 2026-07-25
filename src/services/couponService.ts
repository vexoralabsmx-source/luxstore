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

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  try {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await response.json();
  } catch {
    return { valid: false, message: 'No se pudo validar el cupón' };
  }
}
