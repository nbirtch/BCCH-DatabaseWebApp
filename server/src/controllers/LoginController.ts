import { Controller } from "./Controller";
import { UserService } from "../services/UserService";
import { User } from "../models/IUser";

export class LoginController extends Controller {

    async login() {
        let body = this.request.body;
        if (body.username == null || body.password == null) {
            this.response.status(400).send({ error: "Missing required parameters" });
            return;
        }

        try {
            let res = await (new UserService()).login(body.username, body.password);
            let u: User = res.user;
            let resp = {
                username: u.username,
                displayName: u.displayName,
                gender: u.gender,
                age: u.age,
                token: res.token,
                birthdate: u.birthdate,
                type: u.type
            };

            this.response.status(200).send(resp);
        } catch (e) {
            this.response.status(401).send({ error: "Invalid credentials" });
        }
    }

    async userInfo() {
        let token = this.request.cookies.access_token;

        try {
            let u = await (new UserService()).getUser(token);
            this.response.status(200).send({
                username: u.username,
                displayName: u.displayName,
                gender: u.gender,
                age: u.age,
                token: token,
                birthdate: u.birthdate,
                type: u.type
            });
        } catch (e) {
            this.response.status(401).send({ error: "Invalid credentials" });
        }

    }

    async logout() {
        let token = this.request.cookies.access_token;
        let deleteStatus = await (new UserService).logout(token);
        this.response.status(200).send({ status: deleteStatus });
    }
}