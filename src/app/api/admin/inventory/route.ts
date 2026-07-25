import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { decryptStockContent, encryptStockContent } from '@/lib/crypto';

export const runtime = 'edge';

const addSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  lines: z.array(z.string().trim().min(1).max(4000)).min(1).max(500),
});

export async function GET() {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const [{ data: items, error }, { data: products }] = await Promise.all([
    context.admin
      .from('inventory_items')
      .select('*, product:products(name), variant:product_variants(name)')
      .order('created_at', { ascending: false }),
    context.admin.from('products').select('id, name').eq('status', 'active').order('name'),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    products: products || [],
    items: (items || []).map((item) => ({
      ...item,
      product_name: item.product?.name || 'Producto',
      variant_name: item.variant?.name || 'Estándar',
      content: decryptStockContent(item.content_encrypted),
      order_number: item.order_id,
    })),
  });
}

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = addSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Inventario inválido' }, { status: 400 });
  const rows = parsed.data.lines.map((line) => ({
    product_id: parsed.data.productId,
    variant_id: parsed.data.variantId || null,
    content_encrypted: encryptStockContent(line),
    status: 'AVAILABLE',
    added_by: context.user.id,
  }));
  const { error } = await context.admin.from('inventory_items').insert(rows);
  return error
    ? NextResponse.json({ error: error.message }, { status: 400 })
    : NextResponse.json({ success: true, count: rows.length });
}

export async function DELETE(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });
  const { error } = await context.admin
    .from('inventory_items')
    .delete()
    .eq('id', id)
    .eq('status', 'AVAILABLE');
  return error
    ? NextResponse.json({ error: error.message }, { status: 409 })
    : NextResponse.json({ success: true });
}
