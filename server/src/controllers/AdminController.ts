import { AuthController } from "./AuthController";

export class AdminController extends AuthController {

    async setup(config?: any): Promise<boolean> {
       let res = await super.setup(config);

       if (!res) {
           return false;
       }

       if (!this.isAdmin) {
            this.response.status(401).send({ error: "Not an admin user" });
            return false;
       }

       return true;
    }
}