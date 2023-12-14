/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-11 08:53:35
 * @Description: Coding something
 */
import { hmac, utf8, base64 } from './utils';
import { IQuestionOptions, ISparkSocketBaseOptions, SparkChat } from './chat';
import { Socket } from './node-socket';


export interface ISparkOptions extends ISparkSocketBaseOptions {
    secret: string;
    key: string;
    version?: number;
    versionStr?: '';
}

export class Spark {
    secret: string;
    key: string;

    socket: SparkChat;
    version: number;
    versionStr = '';

    constructor ({
        secret,
        key,
        appid,
        uid,
        temperature,
        maxTokens,
        topK,
        chatId,
        useHistory,
        version = 1,
        versionStr = '',
    }: ISparkOptions) {
        if (!key || !secret) throw new Error('Invalid Key Or Secret');
        this.version = version;
        this.versionStr = versionStr;
        this.secret = secret;
        this.key = key;

        // @ts-ignore
        SparkChat.Socket = Socket;

        if (appid) {
            this.socket = new SparkChat({
                appid,
                uid,
                temperature,
                maxTokens,
                topK,
                chatId,
                useHistory,
                urlGetter: () => Promise.resolve(this.generateUrl())
            });
        }
    }

    generateUrl () {
        const data = this._generateAuth() as any;
        const arr = [];
        for (const k in data) {
            arr.push(`${k}=${data[k]}`);
        }
        const vStr = this.versionStr || `v${this.version}.1`;
        return `wss://spark-api.xf-yun.com/${vStr}/chat?${arr.join('&')}`;
    }

    chat (data: IQuestionOptions) {
        return this.socket.chat(data);
    }

    private _generateAuth () {
        const host = 'spark-api.xf-yun.com';
        const date = new Date().toUTCString(); // 'Sun, 11 Jun 2023 01:31:08 GMT'; //
        return {
            host,
            date,
            authorization: this._authorize(host, date),
        };
    }

    private _authorize (host: string, date: string) {
        const APISecret = this.secret;
        const APIKey = this.key;
        const tmp = `host: ${host}\ndate: ${date}\nGET /v1.1/chat HTTP/1.1`;
        const sign = hmac(utf8(APISecret), utf8(tmp));
        // console.log(sign);
        const authorizationOrigin = `api_key="${APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${sign}"`;
        // console.log(authorizationOrigin);
        return base64(utf8(authorizationOrigin));
    }
}
