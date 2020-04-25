import { Controller } from "./Controller";
import { User } from "../models/IUser";
import { UserService } from "../services/UserService";

export class AuthController extends Controller {
    protected user: User;
    protected isAdmin: boolean;

    private async verify() {
        let cookie = this.request.cookies.access_token;
        this.user = await (new UserService()).getUser(cookie);
        this.isAdmin = this.user.type === "admin";       
    }

    async setup(config?: any): Promise<boolean> {
        try {
            await this.verify();
            return true;
        } catch (e) {
            this.response.status(401).send({ error: "Not logged in yet" });
            return false;
        }
    }
}