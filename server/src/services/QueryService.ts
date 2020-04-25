import { DBConnection } from "../DBConnection";
import { AppGlobals } from "../AppGlobals";
import { DownloadFileInfo } from "../StorageManager";

export class QueryService {
    private db: DBConnection = AppGlobals.db;
    private allFilters: { [key: string]: string[] };
    private doesFilterUser: boolean;
    private doesFilterAssessment: boolean;
    private doesFilterSurveys: boolean;
    private surveyID: string;

    async runMediaQuery(type: string, filter: any[], groupBy: string, limit: number, page: number): Promise<any> {
        this.surveyID = null;
        this.doesFilterAssessment = false;
        this.doesFilterUser = false;
        this.doesFilterSurveys = false;
        this.allFilters = { normal: ["(is_archived = 0)"], user: [], assessment: [] };
        let from = `FROM ${type} ${this.extendQuery(type, filter, groupBy)}`;
        let count: number = await this.countByQuery(from);
        let query = "SELECT * " + from + this.buildPagination(limit, page);
        let result: any[] = await this.db.send(query);
        return this.buildResult(result, count, groupBy, limit, page);
    }

    private async countByQuery(query: string): Promise<number> {
        let result: any[] = await this.db.send("SELECT COUNT(*) AS count " + query);
        return result === null ? 0 : result[0].count;
    }

    private extendQuery(type: string, filter: any[], groupBy: string): string {
        let query = "";
        let grouping = this.buildGroupBy(groupBy);
        filter.forEach(f => {
            let type = f.type;
            let value = f.value;
            this.getFilter(type, value);
        });
        let tableQueries: string[] = this.buildInnerTableQueries();
        if (tableQueries.length !== 0) {
            query = " INNER JOIN ";
            if (tableQueries.length === 1) {
                query += tableQueries[0] + " ON ";
                if (this.doesFilterAssessment) {
                    query += `${type}.assess_id = assessmentTable.aid`;
                } else {
                    query += `${type}.user_id = userTable.uid`;
                }
            } else {
                query += `(SELECT * FROM (${tableQueries.join(" INNER JOIN ")} ON userTable.uid = assessmentTable.auid)) AS joinedTable ON ${type}.assess_id = joinedTable.aid`;
            }
        }
        if(this.doesFilterSurveys) {
            query += ` INNER JOIN (SELECT q_number, survey_id, answer FROM SurveyAnswer) AS surveyAnswerTable ON ${type}.id = surveyAnswerTable.survey_id`;
        }
        if ("normal" in this.allFilters && this.allFilters["normal"].length != 0) {
            query += " WHERE " + this.allFilters["normal"].join(" AND ");
            if (this.doesFilterSurveys) { query += ` AND ${type}.temp_id = ${this.surveyID}`;}
        } else if (this.doesFilterSurveys) {
            query += ` WHERE ${type}.temp_id = ${this.surveyID}`;
        }
        return query + grouping;
    }

    private getFilter(type: string, value: any): any {
        switch (type) {
            case "assessment":
                let values = value.map((v: string) => `'${v}'`);
                this.doesFilterAssessment = true;
                this.allFilters["assessment"].push(`(temp_id IN (${values.join(",")}))`);
                break;
            case "time":
                this.allFilters["normal"].push(`(${value.max} >= time_created AND time_created >= ${value.min})`);
                break;
            case "age":
                this.doesFilterUser = true;
                this.allFilters["user"].push(`(${value.max} >= age AND age >= ${value.min})`);
                break;
            case "gender":
                this.doesFilterUser = true;
                this.allFilters["user"].push(`(gender = '${value.toUpperCase()}')`);
                break;
        }
    }

    private buildInnerTableQueries(): string[] {
        let result: string[] = [];
        if (this.doesFilterUser) {
            let userQuery = "SELECT id AS uid, age, gender FROM User";
            if ("user" in this.allFilters && this.allFilters["user"].length != 0) {
                userQuery += " WHERE " + this.allFilters["user"].join(" AND ");
            }
            result.push(`(${userQuery}) AS userTable`);
        }
        if (this.doesFilterAssessment) {
            let assessmentQuery = "SELECT Assessment.id AS aid, temp_id, user_id AS auid, AssessmentTemplate.name as template FROM Assessment INNER JOIN AssessmentTemplate ON Assessment.temp_id = AssessmentTemplate.id";
            if ("assessment" in this.allFilters && this.allFilters["assessment"].length != 0) {
                assessmentQuery += " WHERE " + this.allFilters["assessment"].join(" AND ");
            }
            result.push(`(${assessmentQuery}) AS assessmentTable`);
        }
        return result;
    }

    private buildGroupBy(groupBy: string): string {
        let group = "none";
        switch (groupBy) {
            case "assessment":
                group = "template";
                this.doesFilterAssessment = true;
                break;
            case "age":
                group = "age";
                this.doesFilterUser = true;
                break;
            case "gender":
                group = "gender";
                this.doesFilterUser = true;
                break;
            case "question_number":
                group = "q_number";
                this.doesFilterSurveys = true;
                break;
        }
        return group === "none" ? "" : " ORDER BY " + group;;
    }

    private buildPagination(limit: number, page: number): string {
        return ` LIMIT ${(page - 1) * limit}, ${limit}`;
    }

    private buildResult(rawData: any[], count: number, groupBy: string, limit: number, page: number): any {
        let groupKey = groupBy === "assessment" ? "template" : groupBy;
        let result: { [key: string]: any } = {};
        if (groupKey !== "none") {
            rawData.forEach(d => {
                let obj: { [key: string]: any } = { path: d.path, date: d.time_created };
                if (!(d[groupKey] in result)) {
                    result[d[groupKey]] = [];
                }
                result[d[groupKey]].push(obj);
            });
        } else {
            let data = rawData.map((d: any) => { return { path: d.path, date: d.time_created }; });
            result["none"] = data;
        }
        if (count == 0) {
            page = 0;
        }
        return {
            total: Math.ceil(count / limit),
            current: page,
            data: result
        };
    }
    
    async runSurveyQuery(surveyID: string, filter: any[], groupBy: string, limit: number, page: number): Promise<any> {
        let type: string = "survey";
        this.surveyID = surveyID;
        this.doesFilterAssessment = false;
        this.doesFilterUser = false;
        this.doesFilterSurveys = true;
        this.allFilters = {normal: ["(is_archived = 0)"], user: [], assessment: []};
        let from = `FROM ${type} ${this.extendQuery(type, filter, groupBy)}`;
        let count: number = await this.countByQuery(from);
        let query = "SELECT * " + from + this.buildPagination(limit, page);
        let result: any[] = await this.db.send(query);
        return this.buildResultSurvey(result, count, groupBy, limit, page);
    }

    private buildResultSurvey(rawData: any[], count: number, groupBy: string, limit: number, page: number): any {
        let groupKey = groupBy === "assessment" ? "template" : groupBy;
        groupKey = groupBy === "question_number" ? "q_number" : groupKey;
        let result: {[key: string]: any} = {};
        if (groupKey !== "none") {
            rawData.forEach(d => {
                let obj: {[key: string]: any} = { number: d.q_number, answer: d.answer};
                if (!(d[groupKey] in result)) {
                    result[d[groupKey]] = [];
                }
                result[d[groupKey]].push(obj);
            });
        } else {
            let data = rawData.map((d: any) => { return { number: d.q_number, answer: d.answer}; });
            result["none"] = data;
        }
        if (count == 0) {
            page = 0;
        }
        return {
            total: Math.ceil(count / limit),
            current: page,
            data: result
        };
    }

    async plainQuery(sql: string) {
        let res = await this.db.send(sql);
        return res;
    }

    downloadFile(uri: string): Promise<DownloadFileInfo> {
        return AppGlobals.storageManager.getFile(uri);
    }
}
