import { User } from "./models/IUser";

enum QuestionType {
    SCALE = "scale",
    FILL = "fill",
    FILL_TIME = "fill_time",
    MULTIPLE = "multiple",
    FILL_PARA = "fillPara"
}

export interface Question {
    qOrder: number,
    qDesc: string,
    qOpts?: any,
    qType: QuestionType
}

export interface Survey {
    sTitle: string,
    sId: string,
    sInst: string,
    sContent: Question[]
}

export interface Assessment {
    title: string,
    id: string,
    desc: string,
    pictures: string[],
    videos: string[],
    surveys: Survey[]
}

export let allSurveys: Survey[] = [
    {
        sTitle: "Karolinska Sleepiness Scale",
        sId: "1",
        sInst:
            "This is a sample instruction for researchers to ask patients to follow when performing this survey.",
        sContent: [
            {
                qOrder: 1,
                qDesc:
                    "On a scale of 1 (extremely alert) to 10 (extremely sleepy), rate your sleepiness: .",
                qType: QuestionType.SCALE,
                qOpts: { "max": 10, "min": 1 }
            },
            {
                qOrder: 2,
                qDesc:
                    "please fill out the following _____ .",
                qType: QuestionType.FILL,
                qOpts: {}
            },
            {
                qOrder: 3,
                qDesc:
                    "Tell us something about yourself.",
                qType: QuestionType.FILL_PARA,
                qOpts: {}
            }
        ]
    },
    {
        sTitle: "Vigilance Pong Scoresheet",
        sId: "2",
        sInst:
            "This is a sample instruction for researchers to ask patients to follow when performing this survey.",
        sContent: [
            {
                qOrder: 1,
                qDesc:
                    "In 30 seconds, how many total throws were made?  (can be unknown,otherwise must be non-negative integer)",
                qType: QuestionType.FILL
            },
            {
                qOrder: 2,
                qDesc:
                    "In 30 seconds, how many successful throws were made?  (must be non-negative integer)",
                qType: QuestionType.FILL_TIME
            }
        ]
    },
    {
        sTitle: "Task-Switching Paradigm",
        sId: "3",
        sInst:
            "This is a sample instruction for researchers to ask patients to follow when performing this survey.",
        sContent: [
            {
                qOrder: 1,
                qDesc:
                    "Time taken to complete single task exercise: (must be provided either in seconds orin MM:SS format)",
                qType: QuestionType.MULTIPLE,
                qOpts: { "1": "ABC", "2": "BCD", "3": "CDF", "4": "dlsafl" }
            },
            {
                qOrder: 2,
                qDesc:
                    "Number of incorrect answers in single task exercise: (must be non-negative integer)",
                qType: QuestionType.FILL
            },
            {
                qOrder: 3,
                qDesc:
                    "Time taken to complete task switching exercise: ________ (must be provide either in seconds or in MM:SS format)",
                qType: QuestionType.FILL
            },
            {
                qOrder: 4,
                qDesc:
                    "Number of incorrect answers in task switching exercise: _______ (must be nonnegative integer)",
                qType: QuestionType.FILL
            }
        ]
    }
];

export let surveyDict: Map<string, Survey> = new Map();
surveyDict.set("1", allSurveys[0]);
surveyDict.set("2", allSurveys[1]);
surveyDict.set("3", allSurveys[2]);

export let allAssessments = [
    {
        title: "Selfie Rating",
        id: "1",
        desc:
            "In this session, participants will take a selfie of themselves and rate how tired they are on the Karolinska scale",
        pictures: ["Selfie Photo"],
        videos: [],
        surveys: [allSurveys[0]]
    },
    {
        title: "Vigilance Pong",
        id: "2",
        desc:
            "Pong is a motor control task that can be quantitatively scored to assess performance.",
        pictures: [],
        videos: ["Video of participant playing pong"],
        surveys: [allSurveys[0], allSurveys[1]]
    },
    {
        title: "Task-Switching Paradigm",
        id: "3",
        desc:
            "Task-switching is a cognitive task that requires shifting focus depending on the task at hand. Thus, comparing the speed and accuracy at a single task vs. shifting between multiple tasks assesses higher cognitive functions",
        pictures: ["sefile 1", "sefile 2", "sefile 3"],
        videos: ["Video of participant performing task switch paradigm game"],
        surveys: [allSurveys[2]]
    },
    {
        title: "Demo Assessment",
        id: "4",
        desc:
            "This is a demo assessment",
        pictures: ["sefile 1", "pictue showing your hands", "picture showing your legs"],
        videos: ["Video of participant performing task switch paradigm game", "video of participant sleeping"],
        surveys: [allSurveys[2], allSurveys[0], allSurveys[1]]
    }
];

export const allUsers: User[] = [
    {
        id: 1,
        username: "admin",
        displayName: "Admin A",
        gender: "N/A",
        birthdate: "1970/01/01",
        password: "admin",
        age: 99,
        type: "admin"
    }, {
        id: 2,
        username: "lang",
        displayName: "Lang C",
        gender: "Male",
        birthdate: "9999/12/31",
        password: "123",
        age: 99,
        type: "user"
    }, {
        id: 3,
        username: "raymond",
        displayName: "Raymond Chen",
        gender: "Male",
        birthdate: "1997/01/09",
        password: "123",
        age: 99,
        type: "user"
    },
];
