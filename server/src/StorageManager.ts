import { MediaFile } from "./services/UploadService";
import * as azureStorage from "azure-storage";
import { User } from "./models/IUser";
import * as path from "path";
import * as fs from "fs";
import * as mime from "mime";
import { AppGlobals } from "./AppGlobals";

export interface DownloadFileInfo {
    isAzure: boolean;
    mimeType: string;
    filename: string;
    file: NodeJS.ReadableStream;
}

export interface StorageManager {
    storeFile(fileName: string, file: MediaFile, user: User): Promise<string>;
    getFile(uri: string): Promise<DownloadFileInfo>;
    deleteFile(user: User): Promise<boolean>;
}

export class AzureStorageManager implements StorageManager {

    private host = "https://bcchstorageacc.blob.core.windows.net/";
    private storage = "main";
    private blobService = azureStorage.createBlobService("DefaultEndpointsProtocol=https;AccountName=bcchstorageacc;AccountKey=L6ViruScb6axZWeYOgznQYhrwVzmKzFaNZ+3JEByfMQ8wM5S3BSfn5S5UmwEvQ0YK3lxs9aX95pAkGybMTIITQ==;EndpointSuffix=core.windows.net");
    private static manager: AzureStorageManager;

    static getInstance() {
        if (!AzureStorageManager.manager) {
            AzureStorageManager.manager = new AzureStorageManager();
        }

        return AzureStorageManager.manager;
    }

    storeFile(originalName: string, file: MediaFile, user: User) {
        let filename = `${user.username}_${originalName}`;
        return new Promise<string>((resolve, reject) => {
            let writeStream = this.blobService.createWriteStreamToBlockBlob('main', filename, {}, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res) {
                    const url = this.host + this.storage + "/" + filename;
                    resolve(url);
                }
            })
            writeStream.on("error", (e) => {
                console.log(e);
                reject(e);
            })
            file.getFile().on("error", (e) => {
                console.log(e);
                reject(e);
            });
            file.getFile().pipe(writeStream);
        });
    }

    getFile(uri: string) {
        // Azure's URI itself is downloadable already, just do a trivial resolve here.
        return new Promise<DownloadFileInfo>((resolve, reject) => {
            resolve({
                isAzure: true,
                mimeType: undefined,
                filename: undefined,
                file: undefined
            });
        })
    }

    deleteFile(user: User) {
        return new Promise<boolean>((resolve, reject) => {
            this.blobService.listBlobsSegmentedWithPrefix(
                "main",
                `${user.username}_`,
                null,
                (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        result.entries.forEach((blob) => {
                            this.blobService.deleteBlobIfExists("main", blob.name, (err) => {
                                if (err) {
                                    console.error(`failed to delete blob with filename ${blob.name}, please delete it manually`);
                                }
                            });
                        })
                        resolve(true);
                    }
                }
            )
        })
    }
}

export class FileSystemStorageManager implements StorageManager {

    private static manager: FileSystemStorageManager

    static getInstance() {
        if (!FileSystemStorageManager.manager) {
            FileSystemStorageManager.manager = new FileSystemStorageManager();
        }

        return FileSystemStorageManager.manager;
    }

    storeFile(filename: string, mediaFile: MediaFile, user: User): Promise<string> {
        let file = mediaFile.getFile();
        let tpe = mediaFile.toType();
        let folderPath = path.resolve(AppGlobals.storagePath, `./${user.id}/${tpe}`);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        let storedPath = path.resolve(folderPath, filename);
        return new Promise((resolve, reject) => {
            let writeStream = fs.createWriteStream(storedPath);
            file.on('error', (e) => {
                reject(e);
            });
            writeStream.on('error', (e) => {
                reject(e);
            });
            writeStream.on('finish', () => {
                resolve(storedPath);
            });
            file.pipe(writeStream);
        });
    }

    getFile(uri: string): Promise<DownloadFileInfo> {
        return new Promise((res, rej) => {
            let filename = path.basename(uri);
            let type = mime.getType(uri);
            if (fs.existsSync(uri)) {
                let stream = fs.createReadStream(uri);

                res({
                    isAzure: false,
                    mimeType: type,
                    filename: filename,
                    file: stream
                });
            } else {
                rej(new Error("no such file"));
            }
        })
    }

    deleteFile(user: User) {

        function deleteDirRecursive(p: string) {
            if (fs.existsSync(p)) {
                fs.readdirSync(p).forEach((file) => {
                    let curPath = path.join(p, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        // target file is a directory, recursively delete it
                        deleteDirRecursive(curPath);
                    } else {
                        // target file is a normal file, delete it.
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(p);
            }
        };

        return new Promise<boolean>((res, rej) => {
            let userDir = path.resolve(AppGlobals.storagePath, `./${user.id}`);
            try {
                deleteDirRecursive(userDir);
                res(true);
            } catch (e) {
                console.error(`an error occur when trying to delete user folder upload_test/${user.id}`);
                rej(e);
            }
        });
    }
}