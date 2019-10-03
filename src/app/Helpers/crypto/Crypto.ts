import * as crypto from 'crypto';
import { ENV } from '../../../config';

export class CryptoHelper {

    /**
     * Encrypt gived string
     *
     * @param text
     */
    public static encrypt(text: any) {
        const iv: any      = ENV.crypto.iv;
        const cipher: any  = crypto.createCipheriv(ENV.crypto.algorithm, Buffer.from(ENV.crypto.secret), iv);
        let encrypted: any = cipher.update(text);
        encrypted          = Buffer.concat([encrypted, cipher.final()]);

        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    /**
     * Decrypt crypt string
     * @param text
     * @returns {string}
     */
    public static decrypt(text: any) {
        const textParts: any     = text.split(':');
        const iv: any            = Buffer.from(textParts.shift(), 'hex');
        const encryptedText: any = Buffer.from(textParts.join(':'), 'hex');
        const decipher: any      = crypto.createDecipheriv(ENV.crypto.algorithm, Buffer.from(ENV.crypto.secret), iv);
        let decrypted: any       = decipher.update(encryptedText);
        decrypted                = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString();
    }
}