
import { SolanaSignInInput, SolanaSignInOutput } from "@solana/wallet-standard-features";
import { PublicKey, VersionedTransaction, Transaction, SendOptions, Connection } from "@solana/web3.js";
import { ONTO } from "./adapter/window";
import { initialize } from "./adapter/initialize";
import { BaseProvider } from "./baseProvider";
import { isVersionedTransaction } from "./adapter/solana";
import * as bs58 from 'bs58';

export default class SolanaProvider extends BaseProvider implements ONTO {
    isONTO?: boolean = true
    isPhantom?: boolean = false
    publicKey!: PublicKey | null;
    connection!: Connection;
    isConnected: boolean = false
    connected: boolean = false

    static bufferToHex(buffer: Buffer | Uint8Array | string) {
        return '0x' + Buffer.from(buffer).toString('hex');
    }

    static messageToBuffer(message: string | Buffer) {
        let buffer = Buffer.from([]);
        try {
            if (typeof message === 'string') {
                buffer = Buffer.from(message.replace('0x', ''), 'hex');
            } else {
                buffer = Buffer.from(message);
            }
        } catch (err) {
            console.log(`messageToBuffer error: ${err}`);
        }

        return buffer;
    }

    constructor(rpc?: string) {
        super();
        if (typeof rpc !== 'undefined') {
            this.connection = new Connection(rpc, 'confirmed');
        }
        initialize(this);
    }

    async connect(options?: { onlyIfTrusted?: boolean | undefined; } | undefined): Promise<{ publicKey: PublicKey; }> {
        const res = await this.request({
            method: 'connect',
            params: { options }
        }) as { publicKey: string }
        this.publicKey = new PublicKey(res.publicKey)
        this.isConnected = true
        this.connected = true
        return {
            publicKey: this.publicKey
        }
    }
    disconnect(): Promise<void> {
        return new Promise((resolve) => {
            this.publicKey = null;
            this.emit('disconnect');
            this.isConnected = false
            this.connected = false
            resolve();
        });
    }
    async getAccount(): Promise<string> {
        const res = await this.connect()
        return res.publicKey.toBase58();
    }
    async signAndSendTransaction<T extends VersionedTransaction | Transaction>(transaction: T, options?: SendOptions | undefined): Promise<{ signature: string; }> {
        const signedTx = await this.signTransaction(transaction);
        const signature = await this.connection.sendRawTransaction(
            signedTx.serialize(),
            options,
        );
        return { signature: signature };
    }
    signTransaction<T extends VersionedTransaction | Transaction>(transaction: T): Promise<T> {
        var message: string
        if (isVersionedTransaction(transaction)) {
            message = SolanaProvider.bufferToHex(transaction.message.serialize())
        } else {
            message = SolanaProvider.bufferToHex(transaction.serializeMessage())
        }
        const response = this.request({ method: 'signTransaction', params: { message: message } });
        return new Promise<T>((resolve, reject) => {
            response.then (result => {
                const signature = bs58.decode((result as any).signature)
                transaction.addSignature(this.publicKey!, signature)
                resolve(transaction)
            })
            .catch(error => {
                reject(error)
            })
        })
    }
    signAllTransactions<T extends VersionedTransaction | Transaction>(transactions: T[]): Promise<T[]> {
        return Promise.all(transactions.map((tx) => this.signTransaction(tx))) as Promise<T[]>;
    }
    async signMessage(message: Uint8Array): Promise<{ signature: Uint8Array; }> {
        const data = SolanaProvider.bufferToHex(message);
        const res = await this.request({
            method: 'signMessage',
            params: { data },
        }) as string;
        return {
            signature: Buffer.from(SolanaProvider.messageToBuffer(res).buffer),
        };
    }
    signIn(input?: SolanaSignInInput | undefined): Promise<SolanaSignInOutput> {
        throw new Error("Method not implemented.");
    }

}

interface OntoWindow extends Window {
    SolanaProvider?: any
}

declare const window: OntoWindow;
window.SolanaProvider = SolanaProvider;