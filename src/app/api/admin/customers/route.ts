import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET() {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { data: profiles, error } = await context.admin
    .from('profiles')
    .select('id, email, full_name, risk_level, is_blocked, created_at, wallet:wallets(balance), orders(total, status)')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    customers: (profiles || []).map((profile: any) => ({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name || profile.email.split('@')[0],
      risk_level: profile.risk_level || 'LOW',
      is_blocked: Boolean(profile.is_blocked),
      created_at: profile.created_at,
      credits: Number(profile.wallet?.[0]?.balance || profile.wallet?.balance || 0),
      orders_count: profile.orders?.length || 0,
      total_spent: (profile.orders || [])
        .filter((order: any) => ['PAID', 'DELIVERED'].includes(order.status))
        .reduce((sum: number, order: any) => sum + Number(order.total), 0),
    })),
  });
}

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.object({
    userId: z.string().uuid(),
    amount: z.number().positive(),
    type: z.enum(['ADMIN_CREDIT', 'ADMIN_DEBIT']),
    description: z.string().trim().min(3).max(300),
  }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Ajuste inválido' }, { status: 400 });
  const { data, error } = await context.admin.rpc('admin_adjust_wallet', {
    p_user_id: parsed.data.userId,
    p_amount: parsed.data.amount,
    p_type: parsed.data.type,
    p_description: parsed.data.description,
    p_performed_by: context.user.id,
  });
  return error
    ? NextResponse.json({ error: error.message }, { status: 409 })
    : NextResponse.json({ success: true, balance: data });
}

export async function PATCH(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.object({ userId: z.string().uuid(), isBlocked: z.boolean() }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Cambio inválido' }, { status: 400 });
  const { error } = await context.admin
    .from('profiles')
    .update({ is_blocked: parsed.data.isBlocked, updated_at: new Date().toISOString() })
    .eq('id', parsed.data.userId);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
