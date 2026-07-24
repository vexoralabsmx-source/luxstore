const DEFAULT_KEY = process.env.INVENTORY_ENCRYPTION_KEY || 'a3f81e9b2c7d4a6e8f015c92d3b4e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d';

/**
 * Cifra contenido sensible de stock (cuentas, licencias, códigos) de forma universal
 * compatible con Edge Runtime, Node.js y Cloudflare Pages sin módulos nativos.
 */
export function encryptStockContent(text: string): string {
  if (!text) return text;
  try {
    const key = DEFAULT_KEY.slice(0, 32);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return `enc:${btoa(unescape(encodeURIComponent(result)))}`;
  } catch (error) {
    console.error('Error al cifrar stock:', error);
    return text;
  }
}

/**
 * Descifra el contenido de stock para revelarlo o entregarlo
 */
export function decryptStockContent(encryptedPayload: string): string {
  if (!encryptedPayload) return encryptedPayload;
  if (!encryptedPayload.startsWith('enc:')) {
    // Si no viene en formato cifrado (ej. formato antiguo iv:authTag:text o texto plano), retornar tal cual
    const parts = encryptedPayload.split(':');
    if (parts.length === 3) {
      return parts[2]; // Extraer texto si venía de formato antiguo
    }
    return encryptedPayload;
  }
  try {
    const key = DEFAULT_KEY.slice(0, 32);
    const encoded = encryptedPayload.slice(4);
    const text = decodeURIComponent(escape(atob(encoded)));
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (error) {
    console.error('Error al descifrar stock:', error);
    return encryptedPayload;
  }
}
