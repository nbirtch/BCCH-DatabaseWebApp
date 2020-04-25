import { Assessment } from "./IUploadable";
import { User } from "./IUser";
import { AppGlobals } from "../AppGlobals"

export class AssessmentImpl implements Assessment {
    private _id: number;
    private _templateID: number;
    private _user: User;
    private _isArchived: boolean;
    private _timeCreated: number;

    get id(): number { return this._id; }
    get templateID(): number { return this._templateID; }
    get user(): User { return this._user; }
    get isArchived(): boolean { return this._isArchived; }
    get timeCreated(): number { return this._timeCreated; }

    constructor(
        templateID: number,
        user: User,
    ) {
        this._id = undefined;
        this._templateID = templateID;
        this._user = user;
        this._isArchived = true;
        this._timeCreated = new Date().getTime();
    }

    async store(): Promise<number> {
        let db = AppGlobals.db;
        let query = "INSERT INTO Assessment(temp_id, user_id, time_created, is_archived) VALUES (?, ?, ?, ?)";
        let connection = await db.getConnection();

        return new Promise<number>((res, rej) => {
            connection.query(query, [
                this._templateID,
                this._user.id,
                this._timeCreated,
                this.isArchived ? 1 : 0
            ],
                (err) => {
                    if (err) {
                        rej(err.code);
                    } else {
                        connection.query("SELECT LAST_INSERT_ID()", (err, result) => {
                            if (err) {
                                connection.release();
                                rej(err.code);
                            } else {
                                connection.release();
                                res(result[0]["LAST_INSERT_ID()"]);
                            }
                        });
                    }
                });
        });
    }

    static async finalize(id: number): Promise<boolean> {
        let db = AppGlobals.db;
        let trans = await db.startTransaction();
        let assessRes = await trans.send("SELECT time_created FROM Assessment WHERE id=?", [id]);
        let timeCreated = assessRes[0]["time_created"];
        let tableName = ["Video", "Picture", "Survey"];
        let pending = [];
        pending.push(trans.send("UPDATE Assessment SET is_archived=0,time_created=?  WHERE id=?", [timeCreated, id]));
        for (let table of tableName) {
            let query = `UPDATE ${table} SET is_archived=0,time_created=?  WHERE assess_id=?`;
            await trans.send(query, [timeCreated, id]);
        }

        let commitRes = await trans.commit();
        return commitRes;
    }

}