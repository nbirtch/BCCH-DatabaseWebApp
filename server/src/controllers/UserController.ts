import { AdminController } from "./AdminController";
import { UserService } from "../services/UserService";
import { User } from "../models/IUser";

export class UserController extends AdminController {

    private service: UserService = new UserService();

    private withNumber(field: string, handler: (i: number) => Promise<void>) {
        // parseInt is too flexible, restrict the format a little bit;
        let rawInput = this.request.params[field];
        let testRes = /^\d+$/.test(rawInput) && !rawInput.startsWith('0');

        if (testRes) {
            handler(parseInt(rawInput))
                .catch(err => {
                    console.log(err);
                    this.response.status(500).send("something goes wrong");
                });
        } else {
            this.response.status(400).send({ message: `non-number ${rawInput}` });
        }
    }

    async addUser() {
        let body = this.request.body;
        let newUser: User = {
            id: -1,
            username: body.username,
            displayName: body.displayName,
            gender: body.gender,
            birthdate: body.birthdate,
            age: body.age,
            password: body.password,
            type: body.type
        }
        await this.service.addUser(newUser);

        this.response.status(200).send({ result: true });
    }

    async deleteUser() {
        this.withNumber("id", async (id) => {
            if (id === this.user.id) {
                this.response.status(400).send("a user cannot delete itself");
            } else {
                await this.service.deleteUser(id);
                this.response.status(200).send({ id: id });
            }
        })
    }

    async fetchUserCount() {
        let res = await this.service.getUserCount();
        this.response.status(200).send({ count: res });
    }

    private convertUser(res: any[]): any[] {
        return res.map((u) => {
            return {
                id: u.id,
                username: u.username,
                displayName: u.displayName,
                gender: u.gender,
                age: u.age,
                birthdate: u.birthdate,
                type: u.type
            }
        });
    }

    async fetchUsers() {
        this.withNumber("page", async (page) => {
            let res = await this.service.getUsersByPage(page);
            this.response.status(200).send({ currentPage: page, users: this.convertUser(res) });
        })
    }

    async findUsers() {
        this.withNumber("page", async (page) => {
            let prefix: string = this.request.params.name;
            let type = this.request.params.type;

            let res = await this.service.findUser(prefix, type, page);
            this.response.status(200).send({ currentPage: page, users: this.convertUser(res) });
        });

    }

    async checkUser() {
        let name = this.request.params.name;
        let res = await this.service.checkUser(name);

        this.response.status(200).send({ valid: res });
    }
}