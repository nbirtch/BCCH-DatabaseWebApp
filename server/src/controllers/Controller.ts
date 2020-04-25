
import {Request, Response} from "express";

export class Controller {
    protected request: Request
    protected response: Response
    
    constructor(req: Request, res: Response) {
        this.request = req;
        this.response = res;
    }

    async setup(config?: any): Promise<boolean> { return true; }
}