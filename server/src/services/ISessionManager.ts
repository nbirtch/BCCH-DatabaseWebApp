import {User} from "../models/IUser";

export abstract class SessionManager {
    abstract async getFromToken(token: string): Promise<User>;
    abstract async generateToken(u: User): Promise<string>;
    abstract async removeToken(token: string): Promise<boolean>;
    abstract async hasToken(token: string): Promise<boolean>;
    abstract async removeTokenForUser(user: User): Promise<boolean>;
}