import { createHmac } from 'crypto';

export class CryptoService {
  public static createSha256Hmac(key: string, originalString: string): string {
    const hmac = createHmac('sha256', key);
    return hmac.update(originalString).digest('hex');
  }
}
