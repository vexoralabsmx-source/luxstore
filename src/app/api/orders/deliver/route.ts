import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deliverOrder } from '@/services/deliveryService';

const schema = z.object({ orderNumber: z.string().min(8).max(40) });

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Pedido inválido' }, { status: 400 });
    }

    const sessionClient = await createClient();
    const {
      data: { user },
    } = await sessionClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const admin = createAdminClient();
    const { data: role } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .maybeSingle();

    if (!role) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });

    const result = await deliverOrder(parsed.data.orderNumber);
    return NextResponse.json(result, { status: result.success ? 200 : 409 });
  } catch (error) {
    console.error('Error en entrega manual:', error);
    return NextResponse.json({ error: 'No se pudo entregar el pedido' }, { status: 500 });
  }
}
