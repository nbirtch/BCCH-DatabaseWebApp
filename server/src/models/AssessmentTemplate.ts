import { AssessmentTemplate, AssessmentTitle } from "./IAssessmentTemplate";
import { AppGlobals } from "../AppGlobals";
import { SurveyTemplate } from "./ISurveyTemplate"
import { SurveyTemplateImpl } from "./SurveyTemplate";

export class AssessmentTemplateImpl implements AssessmentTemplate {
    private _id: number;
    private _name: string;
    private _description: string;
    private _videos: string[];
    private _pictures: string[];
    private _surveyIDs: number[];
    private _isArchived: boolean;

    get id(): number { return this._id; }
    get name(): string { return this._name; }
    get description(): string { return this._description; }
    get videos(): string[] { return this._videos; }
    get pictures(): string[] { return this._pictures; }
    get surveyIDs(): number[] { return this._surveyIDs; }
    get isArchived(): boolean { return this._isArchived; }

    set isArchived(val: boolean) { this._isArchived = val; }

    constructor(
        id: number,
        name: string,
        description: string,
        videos: string[],
        pictures: string[],
        surveyIDs: number[],
        is_archived: boolean
    ) {
        this._id = id;
        this._name = name;
        this._description = description;
        this._videos = videos;
        this._pictures = pictures;
        this._surveyIDs = surveyIDs;
        this._isArchived = is_archived;
    }

    static async getById(assessmentID: number): Promise<AssessmentTemplate | undefined> {
        let db = AppGlobals.db;
        let result = await db.send("SELECT * FROM AssessmentTemplate WHERE id=? AND is_archived=0", [assessmentID]);
        let assess = undefined;
        if (result.length !== 0) {
            let assessInfo = result[0];
            let aTitle = assessInfo.name;
            let aDesc = assessInfo.description;
            let aDelete = assessInfo.is_archived;
            let videosDescProm = db.send("SELECT description FROM VideoDescription WHERE temp_id=?", [assessmentID]);
            let picDescProm = db.send("SELECT description FROM PictureDescription WHERE temp_id=?", [assessmentID]);
            let surIdsProm = db.send("SELECT sur_temp_id FROM HasSurvey WHERE assess_temp_id=?", [assessmentID]);
            let promiseRes = await Promise.all([videosDescProm, picDescProm, surIdsProm])
            let videosDesc = promiseRes[0].map(r => r.description);
            let picDesc = promiseRes[1].map(r => r.description);
            let surIds = promiseRes[2].map(r => r.sur_temp_id);

            assess = new AssessmentTemplateImpl(
                assessmentID,
                aTitle,
                aDesc,
                videosDesc,
                picDesc,
                surIds,
                aDelete
            );

            return assess;
        }

        return assess;
    }

    static async getAllTitles(): Promise<AssessmentTitle[]> {
        let db = AppGlobals.db;
        let result = await db.send("SELECT id,name FROM AssessmentTemplate WHERE is_archived=0");
        return result.map((r: any) => { return { name: r.name, id: r.id } });
    }

    async getAllSurveyTemplates(): Promise<SurveyTemplate[]> {
        let finalResult = await SurveyTemplateImpl.getByIds(this._surveyIDs)
        return finalResult;
    }

    async store(): Promise<number> {
        let db = AppGlobals.db;
        let query = "INSERT INTO AssessmentTemplate(name, description, num_videos, num_pics, num_surveys, time_created, is_archived) VALUES (?, ?, ?, ?, ?, ?, ?)";
        let trans = await db.startTransaction();
        await trans.send(query,
            [
                this._name,
                this._description,
                this._videos.length,
                this._pictures.length,
                this._surveyIDs.length,
                new Date().getTime(),
                this.isArchived
            ]);
        let maxIDRes = await trans.send("SELECT LAST_INSERT_ID()");
        let maxID = maxIDRes[0]["LAST_INSERT_ID()"];
        this._id = maxID;

        if (this._videos.length !== 0) {
            let initial = this._videos[0];
            let vDesc = `INSERT INTO VideoDescription(temp_id, description) VALUES (?, ?)`;
            let params = [maxID, initial];
            for (let i = 1; i < this._videos.length; i++) {
                vDesc += ", (?, ?)";
                params.push(maxID);
                params.push(this._videos[i]);
            }

            await trans.send(vDesc, params);
        }

        if (this._pictures.length !== 0) {
            let initial = this._pictures[0];
            let pDesc = `INSERT INTO PictureDescription(temp_id, description) VALUES (?, ?)`;
            let params = [maxID, initial];
            for (let i = 1; i < this._pictures.length; i++) {
                pDesc += ", (?, ?)";
                params.push(maxID);
                params.push(this._pictures[i]);
            }

            await trans.send(pDesc, params);
        }

        if (this._surveyIDs.length != 0) {
            let initial = this._surveyIDs[0];
            let sDesc = `INSERT INTO HasSurvey(assess_temp_id, sur_temp_id) VALUES (?, ?)`;
            let params = [maxID, initial];
            for (let i = 1; i < this._surveyIDs.length; i++) {
                sDesc += ", (?, ?)";
                params.push(maxID);
                params.push(this._surveyIDs[i]);
            }

            await trans.send(sDesc, params);
        }

        await trans.commit();
        return maxID;
    }

    static async update(id: number, isArchived: boolean): Promise<boolean> {
        let db = AppGlobals.db;
        let arChievedVal = isArchived ? 1 : 0;

        await db.send(
            "UPDATE AssessmentTemplate SET is_archived=? WHERE id=?",
            [arChievedVal, id]);

        return true;
    }
}