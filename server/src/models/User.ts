import { User } from "./IUser";
import { AppGlobals } from "../AppGlobals";

export class UserImpl implements User {
    private _id: number;
    private _username: string;
    private _displayName: string;
    private _gender: string;
    private _birthdate: string;
    private _password: string;
    private _type: string;
    private _age: number;

    constructor(
        id: number,
        username: string,
        displayName: string,
        gender: string,
        birthdate: string,
        password: string,
        type: string,
        age: number,
    ) {
        this._id = id;
        this._username = username;
        this._displayName = displayName;
        this._gender = gender;
        this._birthdate = birthdate;
        this._password = password;
        this._type = type;
        this._age = age;
    }

    get id(): number { return this._id; }
    get username(): string { return this._username; }
    get displayName(): string { return this._displayName; }
    get gender(): string { return this._gender; }
    get birthdate(): string { return this._birthdate; }
    get password(): string { return this._password; }
    get type(): string { return this._type; }
    get age(): number { return this._age; }

    private static buildUser(u: any): User | undefined {
        let user = undefined;
        if (u) {
            user = new UserImpl(
                u.id,
                u.name,
                u.display_name,
                u.gender,
                u.date_of_birth,
                u.hash_pass,
                (u.is_admin === 1 ? "admin" : "user"),
                u.age
            );
        }

        return user;
    }

    async store(): Promise<boolean> {
        let db = AppGlobals.db;
        let query = `INSERT INTO User(name, display_name, hash_pass, age, gender, sex, date_created, date_of_birth, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        let conn = await db.getConnection();

        return new Promise<boolean>((res, rej) => {
            conn.query(query, [
                this._username,
                this._displayName,
                this._password,
                this._age,
                this._gender,
                this._gender,
                new Date().getTime(),
                this._birthdate,
                this._type === "admin" ? 1 : 0
            ], (err) => {
                if (err) {
                    conn.release();
                    rej(err.code);
                } else {
                    conn.release();
                    res(true);
                }
            });
        });
    }

    static async getById(id: number): Promise<User | undefined> {
        let db = AppGlobals.db;
        let result: any[] = await db.send("SELECT * FROM User WHERE id=?", [id]);
        return UserImpl.buildUser(result[0]);
    }

    static async getByName(uName: string): Promise<User | undefined> {
        let db = AppGlobals.db;
        let result: any[] = await db.send("SELECT * FROM User WHERE name=?", [uName]);
        return UserImpl.buildUser(result[0]);
    }

    static async getAll(page?: number): Promise<User[]> {
        let db = AppGlobals.db;
        let result: any[];
        if (page) {
            result = await db.send("SELECT * FROM User ORDER BY id LIMIT ?, ?", [(page - 1) * 50, 50]);
        } else {
            result = await db.send("SELECT * FROM User ORDER BY id", []);
        }
        let user: User[] = [];
        for (let u of result) {
            user.push(UserImpl.buildUser(u));
        }

        return user;
    }

    static async findStartWith(prefix: string, field: string, page: number): Promise<User[]> {
        let db = AppGlobals.db;
        let result: any[] = await db.send(`SELECT * FROM User WHERE ? LIKE ?% ORDER BY id LIMIT ?, ?`, [field, prefix, (page - 1) * 50, 50]);
        let user: User[] = [];
        for (let u of result) {
            user.push(UserImpl.buildUser(u));
        }

        return user;
    }

    static async countAll(): Promise<number> {
        let db = AppGlobals.db;
        let result: any[] = await db.send("SELECT COUNT(*) FROM User");

        return result[0]["COUNT(*)"];
    }

    static async deleteUser(id: number) {
        let db = AppGlobals.db;
        await db.send("DELETE FROM User WHERE id=?", [id]);

        return true;
    }
}