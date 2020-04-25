import { v4 as uuid } from "uuid";
import * as path from "path";
import { AssessmentImpl } from "../models/Assessment";
import { User } from "../models/IUser";
import { PictureImpl, VideoImpl } from "../models/Media";
import { SurveyImpl } from "../models/Survey";
import { AppGlobals } from "../AppGlobals";

export abstract class MediaFile {

    protected file: NodeJS.ReadableStream;
    protected type: string;

    constructor(file: NodeJS.ReadableStream) { this.file = file; }
    getFile(): NodeJS.ReadableStream { return this.file; }
    toType(): string { return this.type; }
}

export class VideoFile extends MediaFile {
    protected type = "video";
}

export class PictureFile extends MediaFile {
    protected type = "picture";
}

export interface Answers {
    sId: string,
    answers: any
}

export class UploadService {

    async init(user: User, tempID: number): Promise<number> {
        let assess = new AssessmentImpl(tempID, user);
        return assess.store();
    }

    storeMedia(rawFileName: string, mediaFile: MediaFile, user: User): Promise<string> {
        const ext = path.extname(rawFileName);
        const filename = `${uuid()}${ext}`;

        return AppGlobals.storageManager.storeFile(filename, mediaFile, user);
    }

    async recordVideo(assessID: number, user: User, path: string) {
        let video = new VideoImpl(assessID, user, path);
        let storeRes = await video.store()
        return storeRes;
    }

    async recordPicture(assessID: number, user: User, path: string) {
        let pic = new PictureImpl(assessID, user, path);
        let storeRes = pic.store();
        return storeRes;
    }

    async recordSurvey(assessID: number, user: User, ans: Answers) {
        let tempID = parseInt(ans.sId);
        let allAnswers = Object.keys(ans.answers).map(k => {
            let resp: string = ans.answers[k];
            return {
                number: parseInt(k),
                answer: resp
            }
        });

        let sur = new SurveyImpl(
            assessID,
            tempID,
            user,
            allAnswers
        );

        let storeRes = await sur.store();
        return storeRes;
    }

    async finalize(id: number): Promise<boolean> {
        let finalRes = await AssessmentImpl.finalize(id);
        return finalRes;
    }

}
