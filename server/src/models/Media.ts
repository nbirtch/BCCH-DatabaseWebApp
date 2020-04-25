import { Picture, Video } from "./IUploadable";
import { User } from "./IUser";
import { AppGlobals } from "../AppGlobals"

abstract class Media {
    private _id: number;
    private _assessmentID: number;
    private _user: User;
    private _path: string;
    private _timeCreated: number;
    private _isArchived: boolean;
    protected tableName: string;

    get id(): number { return this._id; }
    get assessmentID(): number { return this._assessmentID; }
    get user(): User { return this._user; }
    get isArchived(): boolean { return this._isArchived; }
    get timeCreated(): number { return this._timeCreated; }
    get path(): string { return this._path; }

    constructor(
        assessmentID: number,
        user: User,
        path: string
    ) {
        this._id = undefined;
        this._assessmentID = assessmentID;
        this._path = path;
        this._user = user;
        this._isArchived = true;
        this._timeCreated = new Date().getTime();
    }

    async store(): Promise<boolean> {
        let db = AppGlobals.db;
        let query = `INSERT INTO ${this.tableName}(assess_id, user_id, path, time_created, is_archived ) VALUES (?, ?, ?, ?, ?)`;
        let conn = await db.getConnection();

        return new Promise<boolean>((res, rej) => {
            conn.query(query, [
                this.assessmentID,
                this._user.id,
                this._path,
                this._timeCreated,
                this.isArchived ? 1 : 0
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
}

export class PictureImpl extends Media implements Picture {
    protected tableName: string = "Picture";
}

export class VideoImpl extends Media implements Video {
    protected tableName: string = "Video";
}
