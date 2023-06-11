/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-11 08:53:35
 * @Description: Coding something
 */
import { hmac, utf8, base64 } from './utils';
import { WebSocket } from 'ws';

export interface ISparkOptions {
    secret: string;
    key: string;
    appid?: string;
    uid?: string;
    temperature?: number; // 取值为[0,1],默认为0.5	核采样阈值。用于决定结果随机性，取值越高随机性越强即相同的问题得到的不同答案的可能性越高
    maxTokens?: number; // 取值为[1,4096]，默认为2048	模型回答的tokens的最大长度
    topK?: number; // 取值为[1，6],默认为4	从k个候选中随机选择⼀个（⾮等概率）
    chatId?: string; // 需要保障用户下的唯一性	用于关联用户会话
    useHistory?: boolean; // default: false
}

export interface IQuestionOptions {
    content: string;
    onData?(options: {content: string; start: boolean; end: boolean, seq: number}): void;
    onEnd?(options: {content: string, tokens: number, questionTokens: number}): void;
}

export class Spark {
    secret: string;
    key: string;
    temperature: number;
    maxTokens: number;
    topK = 0.5;
    chatId?: string;

    appid = '';
    uid = '';
    isInRequest = false;
    useHistory;

    private history: ({content: string, role: 'user'|'assistant'})[] = [];
    private historyTokens: number[] = [];
    private historyTokensSum = 0;
    private maxHistoryTokens = 8192;

    constructor ({
        secret, key, appid,
        uid,
        temperature = 0.5,
        maxTokens = 2048,
        topK = 4,
        chatId,
        useHistory = false,
    }: ISparkOptions) {
        if (!key || !secret) throw new Error('Invalid Key Or Secret');
        this.secret = secret;
        this.key = key;
        this.temperature = temperature;
        this.maxTokens = maxTokens;
        this.topK = topK;
        this.useHistory = useHistory;
        if (chatId) this.chatId = chatId;
        if (appid) this.appid = appid;
        this.uid = uid || Math.random().toString().substring(2);
    }

    generateUrl () {
        const data = this._generateAuth() as any;
        const arr = [];
        for (const k in data) {
            arr.push(`${k}=${data[k]}`);
        }
        return `wss://spark-api.xf-yun.com/v1.1/chat?${arr.join('&')}`;
    }

    private _addIntoHistory (content: string, isUser: boolean, tokens: number) {
        this.historyTokensSum += tokens;
        this.history.push({ content, role: isUser ? 'user' : 'assistant' });
        this.historyTokens.push(tokens);
        // ! 超过最大限制时删除前面的历史对话内容
        while (this.historyTokensSum >= this.maxHistoryTokens) {
            this.history.shift();
            this.historyTokensSum -= (this.historyTokens.shift() || 0);
        }
    }

    chat ({
        content,
        onData,
        onEnd,
    }: IQuestionOptions): Promise<string> {
        return new Promise((resolve, reject) => {
            if (this.isInRequest) {
                return reject('IS_IN_REQUEST');
            }
            this.isInRequest = true;
            const ws = new WebSocket(this.generateUrl());
            ws.on('error', () => {
                this.isInRequest = false;
                reject('WS_ON_ERROR');
            });
            ws.on('close', () => {
                this.isInRequest = false;
            });
            ws.on('open', () => {
                // console.log('open');
                const header = {
                    'app_id': this.appid,
                    'uid': this.uid,
                };
                const chat = {
                    'domain': 'general',
                    'temperature': this.temperature,
                    'max_tokens': this.maxTokens,
                    'top_k': this.topK,
                };
                // @ts-ignore
                if (this.chatId) chat.chat_id = this.chatId;

                const text = [];
                if (this.useHistory) text.push(...this.history);
                text.push({ 'role': 'user', content });
                console.log('text', text);

                ws.send(JSON.stringify({
                    header,
                    'parameter': { chat },
                    'payload': {
                        'message': {
                            // # 如果想获取结合上下文的回答，需要开发者每次将历史问答信息一起传给服务端，如下示例
                            // # 注意：text里面的所有content内容加一起的tokens需要控制在8192以内，开发者如有较长对话需求，需要适当裁剪历史信息
                            text,
                        }
                    }
                }));
            });
            const answers: string[] = [];
            ws.on('message', (e: any) => {
                const { header, payload } = JSON.parse(e.toString('utf8'));
                if (header.code !== 0) {
                    reject('MESSAGE_ERROR:' + header.message);
                    this.isInRequest = false;
                    return;
                }
                // ! 当前分段的content
                const seqContent = payload.choices.text.map((item: any) => item.content).join('');
                const seq = payload.choices.seq;
                answers[seq] = seqContent;
                const end = header.status === 2;
                if (onData) onData({ content: seqContent, start: header.status === 0, end, seq });
                if (end) {
                    this.isInRequest = false;
                    const answerContent = answers.join('');
                    const { total_tokens, question_tokens } = payload.usage.text;
                    if (onEnd) onEnd({ content: answerContent, tokens: total_tokens, questionTokens: question_tokens });
                    if (this.useHistory) {
                        this._addIntoHistory(content, true, question_tokens);
                        this._addIntoHistory(answerContent, false, total_tokens);
                    }
                    resolve(answerContent);
                }
            });
        });
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

export function generateWSUrl () {
}
