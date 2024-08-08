import { EventEmitter } from 'events';
import { Utils } from './util';

interface ICallbackEntry {
    resolve: (value: unknown) => void;
    reject: (error?: any) => any;
}

interface Message {
    id?: number | string
    method: string
    params?: any
}

export abstract class BaseProvider extends EventEmitter {
    private callback: Map<string, ICallbackEntry> = new Map();

    async request(params: Message): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const id = new Date().getTime() + Math.floor(Math.random() * 1000);
            params.id = id
            this.callback.set(id.toString(), { reject, resolve });
            Utils.postMsg(params)
        });
    }

    public sendResponse(data: any) {
        const response = Utils.parse(data)
        const requestId = response.id!
        if (this.callback.has(requestId.toString())) {
            const callback = this.callback.get(requestId.toString());
            this.callback.delete(requestId.toString());
            callback?.resolve(response.result);
        } else {
            console.error(`Unable to find callback for requestId: ${requestId}`);
        }
    }

    public sendError(data: any) {
        const response = Utils.parse(data)
        const requestId = response.id!
        if (this.callback.has(requestId.toString())) {
            const callback = this.callback.get(requestId.toString());
            this.callback.delete(requestId.toString());
            callback?.reject(response.error);
        } else {
            console.error(`Unable to find callback for requestId: ${requestId}`);
        }
    }
}