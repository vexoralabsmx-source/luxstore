# LUX STORE — ARQUITECTURA Y MANUAL DE SEGURIDAD

Lux Store es un sistema web independiente y privado para la distribución y venta automatizada de productos digitales. La aplicación ha sido desarrollada sobre Next.js 16 (App Router), TypeScript y Supabase PostgreSQL, aplicando un modelo de seguridad estricto y cero confianza (Zero Trust).

---

## 1. RESUMEN ARQUITECTÓNICO

El sistema opera mediante una arquitectura monolítica modular basada en Server Components, Server Actions y API Routes protegidas. 

- **Frontend:** Next.js 16 (App Router), React 19 / 18, Tailwind CSS (Paleta Dark #050505, #0A0A0A, #101010, #242424, acentos #00E5FF y #7C3AED).
- **Backend:** Next.js Server Actions y Node.js APIs con validación mediante esquemas Zod.
- **Base de Datos:** Supabase PostgreSQL con politicas de seguridad en nivel de fila (Row Level Security - RLS).
- **Cifrado en Reposo:** Cifrado simétrico AES-256-GCM para llaves, cuentas y licencias almacenadas en la base de datos.
- **Pasarelas de Pago:** Integración con la API Oficial de Clip, transferencias bancarias SPEI con centavos únicos de conciliación, depósitos en Criptomonedas (USDT TRC20 / Polygon) y monedero de créditos internos.

---

## 2. MEDIDAS DE HARDENING Y PROTECCIÓN CONTRA ATAQUES

### 2.1 Control de Tasa (Rate Limiting) y Prevención de DDoS
Se ha implementado un mecanismo de limitación de tasa por dirección IP en el middleware del servidor (`src/lib/rateLimit.ts`):
- **Rutas de Autenticación y Checkout (`/login`, `/register`, `/checkout`):** Límite máximo de 15 solicitudes por minuto por dirección IP.
- **Rutas de API Pública (`/api/*`):** Límite máximo de 60 solicitudes por minuto por dirección IP.
- **Respuesta HTTP:** Al sobrepasar el límite, el servidor responde automáticamente con código `429 Too Many Requests` y encabezado `Retry-After`.

### 2.2 Protección de Claves y Secretos del Servidor
- Las claves sensibles como `SUPABASE_SERVICE_ROLE_KEY`, `CLIP_SECRET_KEY`, `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY` e `INVENTORY_ENCRYPTION_KEY` están restringidas exclusivamente al entorno de ejecución del servidor.
- Ninguna clave privada se expone al cliente o al paquete ejecutable del navegador web.
- Las únicas variables expuestas al navegador son las identificadas de forma explícita con el prefijo `NEXT_PUBLIC_`.

### 2.3 Cifrado de Inventario Digital (AES-256-GCM)
El contenido de los productos digitales (códigos, cuentas, licencias) se cifra antes de insertarse en la tabla `inventory_items` mediante el algoritmo `aes-256-gcm` con vectores de inicialización (IV) e identificadores de autenticación (Auth Tag) de 128 bits.

### 2.4 Encabezados de Seguridad (HTTP Security Headers)
La configuración en `next.config.ts` aplica los siguientes encabezados en cada respuesta:
- `Strict-Transport-Security:` `max-age=63072000; includeSubDomains; preload` (Fuerza HTTPS permanente).
- `X-Frame-Options:` `DENY` (Previene ataques de Clickjacking e inyección en iframes externos).
- `X-Content-Type-Options:` `nosniff` (Previene la interpretación errónea de tipos MIME).
- `Referrer-Policy:` `strict-origin-when-cross-origin`.
- `Permissions-Policy:` `camera=(), microphone=(), geolocation=()`.
- `Content-Security-Policy (CSP):` Restringe las fuentes permitidas para scripts, imágenes y conexiones de red.
- `poweredByHeader:` `false` (Oculta la firma del servidor Next.js).

### 2.5 Verificación de Webhooks y Cero Confianza
- El webhook de Clip (`/api/webhooks/clip`) no confía en las redirecciones del navegador del cliente.
- Antes de procesar cualquier entrega, el servidor realiza una llamada directa de validación a la API oficial de Clip (`getClipPaymentStatus`) para verificar el estado real del cobro.
- La ejecución de entrega es atómica e idempotente: si la transacción ya fue entregada, el sistema responde de forma segura sin duplicar el stock.

---

## 3. VARIABLES DE ENTORNO REQUERIDAS (EJEMPLO)

Cree un archivo `.env.local` en la raíz del proyecto basándose en la siguiente estructura (nunca publique sus claves reales en el repositorio ni en documentación pública):

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Clip API Oficial
CLIP_API_KEY=your-clip-api-key
CLIP_SECRET_KEY=your-clip-secret-key
CLIP_SANDBOX_MODE=true

# Resend Email API
RESEND_API_KEY=your-resend-api-key

# Cloudflare Turnstile
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000AA

# Llave de Cifrado de Inventario (Hexadecimal de 64 caracteres / 32 bytes)
INVENTORY_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
```

---

## 4. INSTALACIÓN Y DESPLIEGUE

### 4.1 Instalación Local
```bash
git clone <repository-url>
cd LuxStoreWEB
npm install
```

### 4.2 Configuración de Base de Datos
1. Inicie sesión en el panel de Supabase.
2. Abra el Editor SQL y ejecute el script `supabase/schema.sql`.
3. Opcionalmente, ejecute `supabase/seed.sql` para cargar los datos base de prueba.

### 4.3 Inicio en Desarrollo
```bash
npm run dev
```

### 4.4 Compilación de Producción
```bash
npm run build
npm run start
```

---

## 5. ROLES Y MATRIZ DE PERMISOS (RBAC)

| Rol | Alcance y Capacidades |
| :--- | :--- |
| **Owner** | Control absoluto del sistema, administración de credenciales de pago, logs de seguridad, ajustes globales y gestión de usuarios internos. |
| **Admin** | Gestión del catálogo de productos, carga masiva de inventario cifrado, aprobación de pagos SPEI/Crypto y revisión de clientes. |
| **Support** | Atención a tickets de soporte, consulta de estado de pedidos y aprobación de solicitudes de reemplazo bajo garantía. |
| **Customer** | Navegación por el catálogo público, realización de pedidos, consulta de productos entregados y gestión de su monedero de créditos. |
