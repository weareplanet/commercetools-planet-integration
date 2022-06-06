import { createHmac } from 'crypto';
import { ServiceWithLogger } from '../log-service';

export class CryptoService extends ServiceWithLogger {
  public createSha256Hmac(key: string, originalString: string): string {
    const theKey = Buffer.from(key, 'hex');
    const hmac = createHmac('sha256', theKey);
    return hmac.update(originalString).digest('hex');
  }
}
