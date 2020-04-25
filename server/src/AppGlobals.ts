import { DBConnection } from "./DBConnection";
import { SessionManager } from "./services/ISessionManager";
import { StorageManager } from "./StorageManager";

export enum AppMode {
    PROD = 1,
    DEV = 2,
    DEMO = 3
}

export function appModeToString(mode: AppMode) {
    switch (mode) {
        case AppMode.PROD:
            return "Production";
        case AppMode.DEV:
            return "Development";
        case AppMode.DEMO:
            return "Demo";
    }
}

export interface ExternalParams {
    sessionExpiredDay: number,
    storagePath: string
}

export class AppGlobals {
    static mode: AppMode;
    static db: DBConnection;
    static storageManager: StorageManager;
    static storagePath: string;
    static sessionManager: SessionManager;
    static sessionExpiredDay: number;
    static port: string | number;
}