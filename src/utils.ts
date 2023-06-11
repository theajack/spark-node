/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-11 21:09:53
 * @Description: Coding something
 */
import crypto from 'crypto';

export function utf8 (str: string) {
    return Buffer.from(str, 'utf8') as any as string;
}

export function base64 (str: string) {
    return Buffer.from(str).toString('base64');
}

export function hmac (key: string, content: string)  {
    return crypto.createHmac('sha256', key)
        .update(content)
        .digest('base64');
}