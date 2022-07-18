import { createHmac } from 'crypto';

export class CryptoService {
  public static createSha256Hmac(key: string, originalString: string): string {
    const theKey = Buffer.from(key, 'hex');
    const hmac = createHmac('sha256', theKey);
    return hmac.update(originalString).digest('hex');
  }
}
