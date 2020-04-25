import { User } from "./IUser";

export interface Assessment {
    id: number,
    templateID: number,
    user: User,
    isArchived: boolean,
    timeCreated: number,
}

export interface Video {
    id: number,
    assessmentID: number,
    user: User,
    path: string,
    timeCreated: number,
    isArchived: boolean
}

export interface Picture {
    id: number,
    assessmentID: number,
    user: User,
    path: string,
    timeCreated: number,
    isArchived: boolean
}

export interface Survey {
    id: number,
    assessmentID: number,
    templateID: number,
    user: User,
    timeCreated: number,
    isArchived: boolean,
    answers: SurveyAnswer[]
}

export interface SurveyAnswer {
    number: number,
    answer: string
}