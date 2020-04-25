
export interface AssessmentTemplate {
    id: number;
    name: string;
    description: string;
    videos: string[];
    pictures: string[];
    surveyIDs: number[];
    isArchived: boolean;
}

export interface AssessmentTitle {
    id: number;
    name: string;
}