import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const parsed = z.object({
    code: z.string().trim().min(1).max(50),
    subtotal: z.number().min(0),
  }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ valid: false, message: 'Cupón inválido' });

  const supabase = createAdminClient();
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', parsed.data.code.toUpperCase())
    .eq('is_active', true)
    .maybeSingle();

  if (
    !coupon ||
    (coupon.expiration_date && new Date(coupon.expiration_date) < new Date()) ||
    (coupon.max_uses > 0 && coupon.uses_count >= coupon.max_uses)
  ) {
    return NextResponse.json({ valid: false, message: 'El cupón no existe o expiró' });
  }
  if (Number(coupon.min_purchase) > parsed.data.subtotal) {
    return NextResponse.json({
      valid: false,
      message: `Compra mínima: $${Number(coupon.min_purchase).toFixed(2)} MXN`,
    });
  }

  const rawDiscount = coupon.discount_type === 'percentage'
    ? parsed.data.subtotal * Number(coupon.discount_value) / 100
    : Number(coupon.discount_value);
  const discountAmount = Math.min(parsed.data.subtotal, rawDiscount);
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: Number(coupon.discount_value),
    discount_amount: discountAmount,
    message: `Cupón ${coupon.code} aplicado`,
  });
}
