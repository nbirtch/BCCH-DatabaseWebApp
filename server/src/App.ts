import * as express from "express";
import * as path from "path";
import * as cookieParser from "cookie-parser";
import * as fs from "fs";
import * as bodyParser from "body-parser";
import { DBConnection, DBConfig } from "./DBConnection";
import { LoginController } from "./controllers/LoginController";
import { UserController } from "./controllers/UserController";
import { AssessmentController } from "./controllers/AssessmentController";
import { Controller } from "./controllers/Controller";
import { AppGlobals, AppMode, ExternalParams, appModeToString } from "./AppGlobals";
import { InMemorySessionManager } from "./services/InMemorySessionManager";
import { UploadController } from "./controllers/UploadController";
import { QueryController } from "./controllers/QueryController";
import { AzureStorageManager, FileSystemStorageManager } from "./StorageManager";

const port = process.env.PORT || 3000;
let modeParam = process.argv[2]; // the first one is address of node interpretor, the second is the path to App.js

switch (modeParam) {
    case "--prod":
        AppGlobals.mode = AppMode.PROD;
        break;
    case "--dev":
        AppGlobals.mode = AppMode.DEV;
        break;
    case "--demo":
        AppGlobals.mode = AppMode.DEMO;
        break;
    default:
        throw new Error("unrecognized mode argument " + modeParam);
}

console.log(`App running at ${appModeToString(AppGlobals.mode)}`);

let fileStorage;
let dbConfigPath;
switch (AppGlobals.mode) {
    case AppMode.DEMO:
        dbConfigPath = path.resolve(__dirname, "../../db-conf-demo.json");
        fileStorage = AzureStorageManager.getInstance();
        break;
    case AppMode.DEV:
        dbConfigPath = path.resolve(__dirname, "../../db-conf-dev.json");
        fileStorage = FileSystemStorageManager.getInstance();
        break;
    case AppMode.PROD:
        dbConfigPath = path.resolve(__dirname, "../../db-conf-prod.json");
        fileStorage = FileSystemStorageManager.getInstance();
        break;
}

// setup database
let dbConfigJson = fs.readFileSync(dbConfigPath);
let dbConfig: DBConfig = JSON.parse(dbConfigJson.toString());
DBConnection.updateConfig(dbConfig);

AppGlobals.port = port;
AppGlobals.db = DBConnection.getInstance();
AppGlobals.sessionManager = InMemorySessionManager.getInstance();
AppGlobals.storageManager = fileStorage;

// setup external parameters
const configPath = path.resolve(__dirname, "../../application.conf.json")
const config: ExternalParams = JSON.parse(fs.readFileSync(configPath).toString());

// DEMO uses Azure as media file storage, no need to setup storage path
if (AppGlobals.mode !== AppMode.DEMO) {
    if (path.isAbsolute(config.storagePath)) {
        AppGlobals.storagePath = config.storagePath;
    } else {
        AppGlobals.storagePath = path.resolve(process.cwd(), config.storagePath);
    }
}
AppGlobals.sessionExpiredDay = config.sessionExpiredDay;

let server = express();

// middleware setup
server.use(bodyParser.json());
server.use(cookieParser());
server.use('/assets', express.static(path.resolve(__dirname, "../../web/public")));

function register<T extends Controller>(
    c: new (requ: express.Request, resp: express.Response) => T,
    func: (a: T) => any
) {
    return async (req: express.Request, res: express.Response) => {
        let instance = new c(req, res);
        let setupRes = await instance.setup();
        if (setupRes) {
            func(instance);
        }
    }
}

/**
 * Authentication and Personal information
 */
server.post('/login', register(LoginController, c => c.login()));
server.get('/userInfo', register(LoginController, c => c.userInfo()));
server.post('/logout', register(LoginController, c => c.logout()));

/**
 * Assessments and surveys
 */
server.get('/survey/all', register(AssessmentController, c => c.getAllSurveys()));
server.post('/survey/add', register(AssessmentController, c => c.addSurvey()));
server.get('/assessment/all', register(AssessmentController, c => c.getAllAssessments()));
server.get('/assessment/:type', register(AssessmentController, c => c.getAssessment()));
server.post('/assessment/add', register(AssessmentController, c => c.addAssessment()));
server.delete('/assessment/:type', register(AssessmentController, c => c.archiveAssessment()));


/**
 * Upload End points
 */
server.post('/upload/start/:id', register(UploadController, c => c.startUpload()));
server.post('/upload/video/:id', register(UploadController, c => c.uploadVideo()));
server.post('/upload/picture/:id', register(UploadController, c => c.uploadPicture()));
server.post('/upload/survey/:id', register(UploadController, c => c.uploadSurvey()));
server.post('/upload/end/:id', register(UploadController, c => c.endUpload()));

/**
 * Query End points
 */
server.post('/query/media', register(QueryController, c => c.queryMedia()));
server.post('/query/survey', register(QueryController, c => c.querySurvey()));
server.post('/query/plain', register(QueryController, c => c.queryPlain()));
server.get('/file', register(QueryController, c => c.downloadFile()));

/**
 * User Management End points
 */
server.get('/user/all/:page', register(UserController, c => c.fetchUsers()));
server.get('/user/count', register(UserController, c => c.fetchUserCount()));
server.post('/user/add', register(UserController, c => c.addUser()));
server.delete('/user/:id', register(UserController, c => c.deleteUser()));
server.get('/user/check/:name', register(UserController, c => c.checkUser()))

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
server.get('/', (req: any, res: any) => res.sendFile(path.resolve(__dirname, "../../web/public/index.html")));

AppGlobals.db.ping().then(() => {
    server.listen(port, () => console.log(`listening port ${port}`));
}).catch((e) => {
    console.error('error connecting: ' + e.stack);
    process.exit();
})
