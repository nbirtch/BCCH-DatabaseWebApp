import { AuthController } from "./AuthController";
import { AssessmentTemplateImpl } from "../models/AssessmentTemplate";
import { AssessmentTitle } from "../models/IAssessmentTemplate";
import { SurveyTemplateImpl } from "../models/SurveyTemplate"
import { QuestionType, SurveyQuestion } from "../models/ISurveyTemplate";

export class AssessmentController extends AuthController {

    private withType(handler: (i: number) => Promise<void>) {
        // parseInt is too flexible, restrict the format a little bit;
        let rawID = this.request.params.type;
        let testRes = /^\d+$/.test(rawID) && !rawID.startsWith('0');

        if (testRes) {
            handler(parseInt(this.request.params.type))
                .catch(err => {
                    console.log(err);
                    this.response.status(500).send("something goes wrong");
                });
        } else {
            this.response.status(400).send({ message: `non-number id ${this.request.params.id}` });
        }
    }

    async getAssessment() {
        this.withType(async (idName) => {
            let tempAssessWithOnlySurveyIDs = await AssessmentTemplateImpl.getById(idName);
            let atitle = tempAssessWithOnlySurveyIDs.name;
            let descp = tempAssessWithOnlySurveyIDs.description;
            let videoDesc = tempAssessWithOnlySurveyIDs.videos;
            let picturesDesc = tempAssessWithOnlySurveyIDs.pictures;

            let surveyIDs = tempAssessWithOnlySurveyIDs.surveyIDs;
            let surveyInfos = await SurveyTemplateImpl.getByIds(surveyIDs);
            let surveyResults: any[] = [];
            for (let i of surveyInfos) {
                let template: any = {};
                template.sTitle = i.name;
                template.sId = i.id;
                template.sInst = i.inst;
                let allQuestion: any[] = [];
                for (let q of i.questions) {
                    let surveyQues = {
                        qOrder: q.number,
                        qDesc: q.statement,
                        qType: this.toTransferType(q.type),
                        qOpts: q.meta,
                    };
                    allQuestion.push(surveyQues);
                }
                template.sContent = allQuestion;
                surveyResults.push(template);
            }
            let assessmentForm = {
                title: atitle,
                id: idName,
                desc: descp,
                videos: videoDesc,
                pictures: picturesDesc,
                surveys: surveyResults,
            };
            this.response.status(200).send(assessmentForm);
        })
    }

    async getAllAssessments() {
        try {
            let res: AssessmentTitle[] = await AssessmentTemplateImpl.getAllTitles();
            this.response.status(200).send(res.map(a => { return { title: a.name, id: a.id } }));
        } catch {
            this.response.status(500).send("something goes wrong");
        }
    }

    async getAllSurveys() {
        try {
            let allSurveys = await SurveyTemplateImpl.getAll();
            let result: any[] = [];
            for (let s of allSurveys) {
                let template: any = {};
                template.sTitle = s.name;
                template.sId = s.id;
                template.sInst = s.inst;
                let allQuestion: any[] = [];
                for (let q of s.questions) {
                    let sq = {
                        qOrder: q.number,
                        qDesc: q.statement,
                        qType: this.toTransferType(q.type),
                        qOpts: q.meta,
                    };
                    allQuestion.push(sq);
                }
                template.sContent = allQuestion;
                result.push(template);
            }

            this.response.send(result);
        } catch (e) {
            console.log(e);
            this.response.status(500).send("something goes wrong");
        }
    }

    async addAssessment() {
        if (this.isAdmin) {
            let assessForm: any = this.request.body;
            let newAssess = new AssessmentTemplateImpl(
                undefined,
                assessForm.title,
                assessForm.desc,
                assessForm.videos,
                assessForm.pictures,
                assessForm.surveyIDs,
                false
            );
            try {
                let newID = await newAssess.store();
                this.response.status(200).send({ id: newID });
            } catch (e) {
                console.log(e);
                this.response.status(500).send("something goes wrong");
            }
        } else {
            this.response.status(401).send({ error: "Invalid credentials" });
        }
    }

    async archiveAssessment() {
        if (this.isAdmin) {
            try {
                let id = parseInt(this.request.params.type);
                let res = await AssessmentTemplateImpl.update(id, true);
                this.response.status(200).send({ status: res });
            } catch (e) {
                console.log(e);
                this.response.status(500).send("something goes wrong");
            }
        } else {
            this.response.status(401).send({ error: "Invalid credentials" });
        }
    }

    private toTransferType(t: QuestionType): string {
        switch (t) {
            case QuestionType.SCALE:
                return QuestionTypeTransfer.SCALE;
            case QuestionType.FILL:
                return QuestionTypeTransfer.FILL;
            case QuestionType.LARGE_TEXT:
                return QuestionTypeTransfer.FILL_PARA;
            case QuestionType.FILL_TIME:
                return QuestionTypeTransfer.FILL_TIME;
            case QuestionType.MULTIPLE_CHOICE:
                return QuestionTypeTransfer.MULTIPLE;
            case QuestionType.FILL_NUM:
                return QuestionTypeTransfer.FILL_NUM;
        }
    }

    private fromTransferType(t: QuestionTypeTransfer) {
        switch (t) {
            case QuestionTypeTransfer.SCALE:
                return QuestionType.SCALE;
            case QuestionTypeTransfer.FILL:
                return QuestionType.FILL;
            case QuestionTypeTransfer.FILL_PARA:
                return QuestionType.LARGE_TEXT;
            case QuestionTypeTransfer.FILL_TIME:
                return QuestionType.FILL_TIME;
            case QuestionTypeTransfer.MULTIPLE:
                return QuestionType.MULTIPLE_CHOICE;
            case QuestionTypeTransfer.FILL_NUM:
                return QuestionType.FILL_NUM;
        }
    }

    async addSurvey() {
        if (this.isAdmin) {
            let survey: SurveyTransfer = this.request.body;
            let questions: SurveyQuestion[] = [];

            for (let q of survey.sContent) {
                questions.push({
                    number: q.qOrder,
                    type: this.fromTransferType(q.qType),
                    statement: q.qDesc,
                    meta: q.qOpts
                });
            }

            try {
                let id = await new SurveyTemplateImpl(
                    undefined,
                    survey.sTitle,
                    survey.sInst,
                    questions
                ).store();
                this.response.status(200).send({ id: id });
            } catch (e) {
                console.log(e);
                this.response.status(500).send("something goes wrong");
            }
        } else {
            this.response.status(401).send({ error: "Invalid credentials" });
        }
    }
}

enum QuestionTypeTransfer {
    SCALE = "scale",
    FILL = "fill",
    FILL_TIME = "fill_time",
    MULTIPLE = "multiple",
    FILL_PARA = "fillPara",
    FILL_NUM = "fill_num"
}

interface QuestionTransfer {
    qOrder: number,
    qDesc: string,
    qOpts: any,
    qType: QuestionTypeTransfer
}

interface SurveyTransfer {
    sTitle: string,
    sInst: string,
    sContent: QuestionTransfer[]
}
