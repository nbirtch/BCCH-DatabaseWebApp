import { User } from "../models/IUser";
import { UserImpl } from "../models/User";
import * as crypto from "crypto";
import { AppGlobals } from "../AppGlobals";
import { SessionManager } from "./ISessionManager";

class LoginError extends Error {
    constructor(...args: any[]) {
        super(...args);
    }
}

export class UserService {

    private encrypt(password: string): string {
        let salt = crypto.createHash('md5').update(password).digest("hex").slice(0, 16);
        return crypto.createHmac('sha256', salt).update(password).digest("hex");
    }

    async login(username: string, rawPassword: string): Promise<any> {
        let user: User = await UserImpl.getByName(username);
        let hashPass = this.encrypt(rawPassword);

        if (user.password !== hashPass) {
            throw new LoginError("password not match");
        }

        let manager: SessionManager = AppGlobals.sessionManager;
        let token = await manager.generateToken(user);

        return { user: user, token: token };
    }

    async getUser(token: string): Promise<User> {
        let manager = AppGlobals.sessionManager;

        let validToken = await manager.hasToken(token);
        if (validToken) {
            let user = await manager.getFromToken(token);
            return user;
        } else {
            throw new LoginError("Invalid Token");
        }
    }

    async addUser(user: User): Promise<boolean> {
        let hashPass = this.encrypt(user.password);
        let res = await new UserImpl(
            -1,
            user.username,
            user.displayName,
            user.gender,
            user.birthdate,
            hashPass,
            user.type,
            user.age
        ).store();

        return res;
    }

    async deleteUser(id: number): Promise<boolean> {
        let user = await UserImpl.getById(id);
        return Promise.all([
            UserImpl.deleteUser(id),
            AppGlobals.storageManager.deleteFile(user),
            AppGlobals.sessionManager.removeTokenForUser(user)
        ]).then(() => { return true })
    }

    async getUsersByPage(page: number): Promise<User[]> {
        if (page > 0) {
            return UserImpl.getAll(page);
        } else {
            return [];
        }
    }

    async getUserCount(): Promise<number> {
        return UserImpl.countAll();
    }

    async findUser(prefix: string, type: string, page: number) {
        const typeToKeys: Map<string, string> = new Map([
            ["username", "name"],
            ["displayName", "display_name"]
        ])

        return UserImpl.findStartWith(prefix, typeToKeys.get(type), page);
    }

    async checkUser(name: string): Promise<boolean> {
        let allUsers = await UserImpl.getAll();
        for (let u of allUsers) {
            if (u.username === name) {
                return false;
            }
        }

        return true;
    }

    async logout(token: string): Promise<boolean> {
        return AppGlobals.sessionManager.removeToken(token);
    }
}