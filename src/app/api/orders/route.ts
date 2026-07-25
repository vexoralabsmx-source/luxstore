import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createOrder } from '@/services/orderService';

export const runtime = 'edge';

const requestSchema = z.object({
  customerEmail: z.string().email(),
  paymentMethod: z.enum(['clip', 'spei', 'credits']),
  customerNotes: z.string().max(1000).optional(),
  couponCode: z.string().trim().max(50).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(30),
});

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Los datos del pedido no son válidos' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (parsed.data.paymentMethod === 'credits' && !user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para pagar con créditos' },
        { status: 401 }
      );
    }

    const result = await createOrder({
      ...parsed.data,
      userId: user?.id,
      customerEmail: user?.email || parsed.data.customerEmail,
      ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      orderNumber: result.order.order_number,
      total: result.order.total,
      emailSent: result.emailSent,
      deliveryMessage: result.deliveryMessage,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo crear el pedido';
    console.error('Error creando pedido:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
