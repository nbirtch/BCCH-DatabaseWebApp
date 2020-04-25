import { SurveyTemplate, SurveyQuestion, SurveyTitle, QuestionType } from "./ISurveyTemplate";
import * as mysql from "mysql";
import { AppGlobals } from "../AppGlobals";

export class SurveyTemplateImpl implements SurveyTemplate {
    private _id: number;
    private _name: string;
    private _inst: string;
    private _questions: SurveyQuestion[];

    get id(): number { return this._id; }
    get name(): string { return this._name; }
    get inst(): string { return this._inst; }
    get questions(): SurveyQuestion[] { return this._questions; }

    constructor(
        id: number,
        name: string,
        inst: string,
        questions: SurveyQuestion[]
    ) {
        this._id = id;
        this._name = name;
        this._inst = inst;
        this._questions = questions;
    }

    private static toQuestionType(id: number) {
        const dict = [
            QuestionType.FILL,
            QuestionType.FILL_TIME,
            QuestionType.MULTIPLE_CHOICE,
            QuestionType.SCALE,
            QuestionType.LARGE_TEXT,
            QuestionType.FILL_NUM
        ]

        return dict[id - 1];
    }

    private static async getAllQuestions(ids?: number[]): Promise<Map<number, SurveyQuestion[]>> {
        let db = AppGlobals.db;
        let query = undefined;
        if (ids) {
            query = "SELECT * FROM SurveyQuestion WHERE temp_id=" + mysql.escape(ids[0]);
            for (let i = 1; i < ids.length; i++) {
                query += " OR temp_id=" + mysql.escape(ids[i]);
            }
            query += " ORDER BY temp_id, q_number";
        } else {
            query = "SELECT * FROM SurveyQuestion";
        }

        let allQuestions = await db.send(query);

        let finalResult = new Map();
        for (let rec of allQuestions) {
            let ques: SurveyQuestion[] = finalResult.get(rec.temp_id);
            if (!ques) {
                ques = [];
            }
            ques.push({
                number: rec.q_number,
                type: SurveyTemplateImpl.toQuestionType(rec.q_type),
                statement: rec.statement,
                meta: JSON.parse(rec.meta)
            });
            finalResult.set(rec.temp_id, ques);
        }

        return finalResult;
    }

    static async getByIds(ids: number[]): Promise<SurveyTemplate[]> {
        let db = AppGlobals.db;
        let query = "SELECT * FROM SurveyTemplate WHERE id=" + mysql.escape(ids[0]);
        for (let i = 1; i < ids.length; i++) {
            query += " OR id=" + mysql.escape(ids[i]);
        }

        let res = await Promise.all([db.send(query), SurveyTemplateImpl.getAllQuestions(ids)])

        let allSurveys = res[0];
        let allQuestions: Map<number, SurveyQuestion[]> = res[1];

        let result = [];
        for (let s of allSurveys) {
            let allQues: SurveyQuestion[] = allQuestions.get(s.id);
            result.push(
                new SurveyTemplateImpl(
                    s.id,
                    s.name,
                    s.instruction,
                    allQues
                ));
        }

        return result;
    }

    static async getAllNames(): Promise<SurveyTitle[]> {
        let db = AppGlobals.db;
        let res = await db.send("SELECT * FROM SurveyTemplate");

        return res.map((sur: any) => { return { name: sur.name, id: sur.id } });
    }

    static async getAll(): Promise<SurveyTemplate[]> {
        let db = AppGlobals.db;
        let query = "SELECT * FROM SurveyTemplate";

        let res = await Promise.all([db.send(query), SurveyTemplateImpl.getAllQuestions()]);

        let allSurveys = res[0];
        let allQuestions: Map<number, SurveyQuestion[]> = res[1];

        let result = [];
        for (let s of allSurveys) {
            let allQues: SurveyQuestion[] = allQuestions.get(s.id);
            result.push(
                new SurveyTemplateImpl(
                    s.id,
                    s.name,
                    s.instruction,
                    allQues
                ));
        }

        return result;
    }

    async store(): Promise<number> {
        let db = AppGlobals.db;
        let query = "INSERT INTO SurveyTemplate(name, instruction, time_created) VALUES (?, ?, ?)";
        let trans = await db.startTransaction();

        await trans.send(query,
            [
                this._name,
                this._inst,
                new Date().getTime(),
            ]);
        let maxIDRes = await trans.send("SELECT LAST_INSERT_ID()");
        let maxID = maxIDRes[0]["LAST_INSERT_ID()"];
        this._id = maxID;

        let queQuery = "INSERT INTO SurveyQuestion(q_number, temp_id, q_type, statement, meta) VALUES (?, ?, ?, ?, ?)";
        let initialQue = this._questions[0];
        let params = [initialQue.number, maxID, initialQue.type, initialQue.statement, JSON.stringify(initialQue.meta)];
        for (let i = 1; i < this._questions.length; i++) {
            queQuery += " ,(?, ?, ?, ?, ?)";
            let theQ = this._questions[i];
            params.push(theQ.number);
            params.push(maxID);
            params.push(theQ.type);
            params.push(theQ.statement);
            params.push(JSON.stringify(theQ.meta))
        }

        await trans.send(queQuery, params);
        await trans.commit();
        return maxID;
    }
}