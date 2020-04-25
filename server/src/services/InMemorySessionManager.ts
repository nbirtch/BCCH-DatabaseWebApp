import { SessionManager } from "./ISessionManager";
import { v4 as uuid } from "uuid";
import { User } from "../models/IUser";
import { AppGlobals } from "../AppGlobals";

class Token {
    private _val: string;
    private _user: User;
    private _createdTime: number;
    public static age: number = AppGlobals.sessionExpiredDay * 24 * 60 * 60 * 1000;

    constructor(id: string, u: User) {
        this._val = id;
        this._user = u;
        this._createdTime = new Date().getTime();
    }

    get user(): User { return this._user; }
    get createdDate(): number { return this._createdTime; }
    get val(): string { return this._val; }

    isExpired(time: number): boolean {
        return time > (this._createdTime + Token.age);
    }
}

export class InMemorySessionManager implements SessionManager {

    private static sessionManager: InMemorySessionManager = undefined;
    private sessionMap: Map<string, Token>;

    async getFromToken(token: string): Promise<User> {
        return this.sessionMap.get(token).user;
    }

    async generateToken(u: User): Promise<string> {
        let newId = uuid();
        this.sessionMap.set(newId, new Token(newId, u));

        return newId;
    }

    async hasToken(token: string): Promise<boolean> {
        return this.sessionMap.has(token);
    }

    async removeToken(token: string): Promise<boolean> {
        this.sessionMap.delete(token);
        return true;
    }

    async removeTokenForUser(user: User): Promise<boolean> {
        for (let k of this.sessionMap.keys()) {
            if (this.sessionMap.get(k).user.id === user.id) {
                this.sessionMap.delete(k);
            }
        }
        return true;
    }

    clean() {
        let currentTime = new Date().getTime();

        // use this for debug monitor
        let tokensCleaned = [];

        for (let k of this.sessionMap.keys()) {
            if (this.sessionMap.get(k).isExpired(currentTime)) {
                tokensCleaned.push(this.sessionMap.get(k));
                this.sessionMap.delete(k);
            } 
        }

        // debug usage
        for (let removed of tokensCleaned) {
            console.log(`remove token ${removed.val} for user ${removed.user.username} created at: ${removed.createdDate}`);
        }
    }

    private constructor() {
        this.sessionMap = new Map();
        let oneDay: number = 24 * 60 * 60 * 1000;

        // setup clean up job, every Sunday 00:00
        setInterval(() => {
            InMemorySessionManager.sessionManager.clean();
        }, oneDay);
    }

    public static getInstance() {
        if (!InMemorySessionManager.sessionManager) {
            InMemorySessionManager.sessionManager = new InMemorySessionManager();
        }

        return InMemorySessionManager.sessionManager;
    }
}