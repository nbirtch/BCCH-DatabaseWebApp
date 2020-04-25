import { Survey, SurveyAnswer } from "./IUploadable";
import { User } from "./IUser";
import { AppGlobals } from "../AppGlobals";


export class SurveyImpl implements Survey {
    private _id: number;
    private _assessmentID: number;
    private _templateID: number;
    private _user: User;
    private _timeCreated: number;
    private _isArchived: boolean;
    private _answers: SurveyAnswer[];

    get id() { return this._id; }
    get assessmentID() { return this._assessmentID; }
    get templateID() { return this._templateID; }
    get user() { return this._user; }
    get timeCreated() { return this._timeCreated; }
    get isArchived() { return this._isArchived; }
    get answers() { return this._answers; }

    constructor(
        assessmentID: number,
        templateID: number,
        user: User,
        answers: SurveyAnswer[]
    ) {
        this._id = undefined;
        this._assessmentID = assessmentID;
        this._templateID = templateID;
        this._user = user;
        this._timeCreated = new Date().getTime();
        this._isArchived = false;
        this._answers = answers;
    }

    async store(): Promise<boolean> {
        let db = AppGlobals.db;
        let trans = await db.startTransaction();
        await trans.send(
            "INSERT INTO Survey(assess_id, temp_id, user_id, time_created, is_archived) VALUES (?, ?, ?, ?, ?)",
            [
                this._assessmentID,
                this._templateID,
                this._user.id,
                this._timeCreated,
                this._isArchived ? 1 : 0
            ]
        );
        let maxIDRes = await trans.send("SELECT LAST_INSERT_ID()");
        let maxID = maxIDRes[0]["LAST_INSERT_ID()"];

        let query = "INSERT INTO SurveyAnswer VALUES (?, ?, ?, ?)";
        let pending = [];
        for (let a of this._answers) {
            pending.push(trans.send(query, [
                a.number,
                maxID,
                this._user.id,
                a.answer
            ]));
        }

        await Promise.all(pending);
        let commitRes = trans.commit();
        return commitRes;
    }
}