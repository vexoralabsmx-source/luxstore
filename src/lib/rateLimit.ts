import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Obtiene la dirección IP del cliente analizando encabezados de proxies de producción (Cloudflare, Vercel, NGINX)
 */
export function getClientIp(request: NextRequest): string {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

/**
 * Control de tasa de peticiones (Rate Limiting) basado en IP con ventana deslizante
 */
export function checkRateLimit(
  request: NextRequest,
  options: RateLimitOptions = { limit: 60, windowMs: 60000 }
): { success: boolean; limit: number; remaining: number; reset: number } {
  const ip = getClientIp(request);
  const path = request.nextUrl.pathname;
  const key = `${ip}:${path}`;
  const now = Date.now();

  // Limpieza periódica de llaves expiradas en memoria
  if (Math.random() < 0.05) {
    for (const k in store) {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    }
  }

  const record = store[key] || { count: 0, resetTime: now + options.windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + options.windowMs;
  } else {
    record.count += 1;
  }

  store[key] = record;

  const remaining = Math.max(0, options.limit - record.count);
  const success = record.count <= options.limit;

  return {
    success,
    limit: options.limit,
    remaining,
    reset: Math.ceil((record.resetTime - now) / 1000),
  };
}
