import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET() {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { data, error } = await context.admin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  return error
    ? NextResponse.json({ error: error.message }, { status: 500 })
    : NextResponse.json({ coupons: data || [] });
}

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.object({
    code: z.string().trim().min(2).max(50),
    discount_type: z.enum(['percentage', 'fixed']),
    discount_value: z.number().positive(),
    min_purchase: z.number().min(0),
    max_uses: z.number().int().min(0),
  }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Cupón inválido' }, { status: 400 });
  const { error } = await context.admin.from('coupons').insert({
    ...parsed.data,
    code: parsed.data.code.toUpperCase(),
    is_active: true,
  });
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.object({ id: z.string().uuid(), is_active: z.boolean() }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Cupón inválido' }, { status: 400 });
  const { error } = await context.admin.from('coupons').update({ is_active: parsed.data.is_active }).eq('id', parsed.data.id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  const { error } = await context.admin.from('coupons').delete().eq('id', id);
  return error ? NextResponse.json({ error: error.message }, { status: 409 }) : NextResponse.json({ success: true });
}
