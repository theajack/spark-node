/*
 * @Author: chenzhongsheng
 * @Date: 2023-06-14 08:00:20
 * @Description: Coding something
 */

import { WebSocket } from 'ws';

type IListener = ((e: any) => void)|null;

// 简单封装一下
export class Socket {
    onerror: IListener = null;
    onopen: IListener = null;
    onclose: IListener = null;
    onmessage: IListener = null;

    private socket: WebSocket;

    constructor (url: string) {
        const ws = new WebSocket(url);
        ws.on('error', (e) => {
            if (this.onerror) this.onerror(e);
        });
        ws.on('close', (e) => {
            if (this.onclose) this.onclose(e);
        });
        ws.on('open', (e: any) => {
            if (this.onopen) this.onopen(e);
        });
        ws.on('message', (e: any) => {
            if (this.onmessage) {
                this.onmessage({
                    data: e.toString('utf8')
                });
            }
        });
        this.socket = ws;
    }
    send (data: string) {
        this.socket.send(data);
    }
    close () {
        this.socket.close();
    }
}