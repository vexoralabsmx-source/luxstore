import { createAdminClient } from '@/lib/supabase/admin';

export interface DiscordEmbed {
  title: string;
  description: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string };
  timestamp?: string;
}

const DEFAULT_DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1509998884007575666/b6TO_9Quz1DtZoKKMAmKGQS_PwTaRMfmdgqxcRomfyg-hq-RvSOPmR18uaPleDwblNng';

/**
 * Envía notificaciones estructuradas vía Webhook a Discord en tiempo real
 */
export async function sendDiscordAlert(embedData: DiscordEmbed, overrideUrl?: string): Promise<{ success: boolean; status?: number; errorMsg?: string }> {
  try {
    let webhookUrl = overrideUrl || process.env.DISCORD_WEBHOOK_URL || DEFAULT_DISCORD_WEBHOOK;

    if (!webhookUrl || webhookUrl.trim() === '') {
      webhookUrl = DEFAULT_DISCORD_WEBHOOK;
    }

    const payload = {
      username: 'Lux Store Alerts Bot',
      avatar_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
      embeds: [
        {
          title: embedData.title,
          description: embedData.description,
          color: embedData.color || 0xC5A880, // Oro Mate Lux Store
          fields: embedData.fields || [],
          footer: embedData.footer || { text: 'Lux Store VIP Alert System' },
          timestamp: embedData.timestamp || new Date().toISOString(),
        },
      ],
    };

    console.log(`Disparando webhook de Discord a ${webhookUrl}...`);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      console.log('Alerta de Discord enviada exitosamente.');
      return { success: true };
    } else {
      const errText = await res.text();
      // Usar console.warn para evitar el modal rojo de desarrollo si el token fue revocado en Discord
      console.warn('Advertencia de Discord Webhook:', res.status, errText);
      return { success: false, status: res.status, errorMsg: errText };
    }
  } catch (error: any) {
    console.warn('Error conectando con webhook de Discord:', error);
    return { success: false, errorMsg: error?.message || 'Error de red' };
  }
}
