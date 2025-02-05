
export class Utils {
    private static PC = 0;
    private static IOS = 1;
    private static ANDROID = 2;
    private static isDebug = false;

    static postMsg(obj) {
        try {
            this.log(obj);
            let response = JSON.stringify(obj);
            if(this.getClientIdentity() == this.IOS) {
                // @ts-ignore
                window.webkit.messageHandlers.SolanaWallet.postMessage(obj);
            } else if (this.getClientIdentity() == this.ANDROID) {
                // @ts-ignore
                window.SolanaWallet.postMessage(response);
            } else {
                postMessage(response);
            }
            this.log(response);
        } catch (e) {
            this.log('post message error');
        }
    }

    static parse(obj): any {
        if(this.getClientIdentity() == this.IOS) {
            return obj
        } else {
            return JSON.parse(obj);
        }
    }

    static log(obj) {
        if (this.isDebug) {
            console.log(obj);
        }
    }

    /**
     * 判断前端类型
     */
    private static getClientIdentity() {
        if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
            return this.IOS;
        } else if (/(Android)/i.test(navigator.userAgent)) {
            return this.ANDROID;
        } else {
            return this.PC;
        }
    }

}
