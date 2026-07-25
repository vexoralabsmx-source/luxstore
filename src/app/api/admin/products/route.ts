import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';

export const runtime = 'edge';

const productSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140),
  category: z.string().trim().min(2).max(80),
  base_price: z.number().min(0),
  sale_price: z.number().min(0).nullable().optional(),
  warranty_days: z.number().int().min(0).max(3650),
  image_url: z.string().trim().max(2000).optional(),
  description: z.string().max(5000).optional(),
});

async function ensureCategory(admin: any, name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const { data, error } = await admin
    .from('categories')
    .upsert({ name, slug, is_active: true }, { onConflict: 'slug' })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function GET() {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { data, error } = await context.admin
    .from('products')
    .select('*, category:categories(name), images:product_images(id, image_url, sort_order)')
    .neq('status', 'archived')
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stock } = await context.admin
    .from('inventory_items')
    .select('product_id')
    .eq('status', 'AVAILABLE');
  const counts = new Map<string, number>();
  stock?.forEach((item) => counts.set(item.product_id, (counts.get(item.product_id) || 0) + 1));

  return NextResponse.json({
    products: (data || []).map((product) => ({
      ...product,
      category: product.category?.name || 'Digital',
      image_url: product.images?.[0]?.image_url || '',
      stock: counts.get(product.id) || 0,
    })),
  });
}

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Producto inválido' }, { status: 400 });

  try {
    const categoryId = await ensureCategory(context.admin, parsed.data.category);
    const { image_url, category, id, ...product } = parsed.data;
    const { data, error } = await context.admin
      .from('products')
      .insert({ ...product, category_id: categoryId, status: 'active' })
      .select('id')
      .single();
    if (error) throw error;
    if (image_url) {
      const { error: imageError } = await context.admin
        .from('product_images')
        .insert({ product_id: data.id, image_url, sort_order: 0 });
      if (imageError) throw imageError;
    }
    return NextResponse.json({ success: true, id: data.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ error: 'Producto inválido' }, { status: 400 });
  }

  try {
    const categoryId = await ensureCategory(context.admin, parsed.data.category);
    const { id, image_url, category, ...product } = parsed.data;
    const { error } = await context.admin
      .from('products')
      .update({ ...product, category_id: categoryId, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    await context.admin.from('product_images').delete().eq('product_id', id);
    if (image_url) {
      await context.admin.from('product_images').insert({ product_id: id, image_url, sort_order: 0 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

  const { data, error } = await context.admin
    .from('products')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: 'No se pudo retirar el producto del catálogo' },
      { status: 409 }
    );
  }
  if (!data) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    archived: true,
    message: 'Producto retirado del catálogo. El historial de compras se conservó.',
  });
}
