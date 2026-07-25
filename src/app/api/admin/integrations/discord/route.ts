import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/admin';
import { sendDiscordAlert } from '@/services/discordService';

export async function POST(request: Request) {
  const context = await requireAdmin();
  if (!context) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const parsed = z.object({ webhookUrl: z.string().url().optional() }).safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
  if (parsed.data.webhookUrl) {
    const url = new URL(parsed.data.webhookUrl);
    if (!['discord.com', 'discordapp.com'].includes(url.hostname) || !url.pathname.startsWith('/api/webhooks/')) {
      return NextResponse.json({ error: 'Debe ser un webhook oficial de Discord' }, { status: 400 });
    }
  }
  const result = await sendDiscordAlert(
    {
      title: 'Prueba de integración Lux Store',
      description: 'Webhook verificado desde el panel administrativo.',
      color: 0xc5a880,
    },
    parsed.data.webhookUrl
  );
  return NextResponse.json(result, { status: result.success ? 200 : 400 });
}
