import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function currentUser() {
  const session = await createClient();
  const { data: { user } } = await session.auth.getUser();
  return user;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('tickets')
    .select('*, order:orders(order_number), messages:ticket_messages(*, sender:profiles(full_name))')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    tickets: (data || []).map((ticket: any) => ({
      ...ticket,
      order_number: ticket.order?.order_number,
      category: ticket.reason,
      priority: 'MEDIUM',
      messages: (ticket.messages || []).map((message: any) => ({
        ...message,
        sender_type: message.sender_id === user.id ? 'customer' : 'support',
        sender_name: message.sender?.full_name || (message.sender_id === user.id ? 'Cliente' : 'Soporte'),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.discriminatedUnion('action', [
    z.object({
      action: z.literal('create'),
      subject: z.string().trim().min(3).max(160),
      category: z.string().trim().min(2).max(100),
      orderNumber: z.string().trim().max(40).optional(),
      message: z.string().trim().min(2).max(4000),
    }),
    z.object({
      action: z.literal('reply'),
      ticketId: z.string().uuid(),
      message: z.string().trim().min(1).max(4000),
    }),
  ]).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });

  const admin = createAdminClient();
  if (parsed.data.action === 'reply') {
    const { data: ticket } = await admin.from('tickets').select('id').eq('id', parsed.data.ticketId).eq('customer_id', user.id).maybeSingle();
    if (!ticket) return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    const { error } = await admin.from('ticket_messages').insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      message: parsed.data.message,
    });
    if (!error) await admin.from('tickets').update({ status: 'WAITING_SUPPORT', updated_at: new Date().toISOString() }).eq('id', ticket.id);
    return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
  }

  let orderId: string | null = null;
  if (parsed.data.orderNumber) {
    const { data: order } = await admin
      .from('orders')
      .select('id')
      .eq('order_number', parsed.data.orderNumber)
      .eq('user_id', user.id)
      .maybeSingle();
    orderId = order?.id || null;
  }
  const ticketNumber = `TCK-${crypto.randomUUID().replaceAll('-', '').slice(0, 8).toUpperCase()}`;
  const { data: ticket, error } = await admin.from('tickets').insert({
    ticket_number: ticketNumber,
    customer_id: user.id,
    order_id: orderId,
    subject: parsed.data.subject,
    reason: parsed.data.category,
    status: 'WAITING_SUPPORT',
  }).select('id').single();
  if (error || !ticket) return NextResponse.json({ error: error?.message || 'No se pudo crear' }, { status: 400 });
  await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_id: user.id,
    message: parsed.data.message,
  });
  return NextResponse.json({ success: true });
}
