import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_KEY = process.env.INVENTORY_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

function getEncryptionKey(): Buffer {
  return Buffer.from(DEFAULT_KEY.slice(0, 64), 'hex');
}

/**
 * Cifra contenido sensible de stock (cuentas, licencias, códigos)
 */
export function encryptStockContent(text: string): string {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag().toString('hex');

  // Retorna iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Descifra el contenido de stock para revelarlo o entregarlo
 */
export function decryptStockContent(encryptedPayload: string): string {
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      // Si no viene en formato cifrado (ej. texto plano heredado), retornarlo tal cual
      return encryptedPayload;
    }

    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error al descifrar stock:', error);
    return encryptedPayload;
  }
}
