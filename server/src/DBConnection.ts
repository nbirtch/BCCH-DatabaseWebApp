import * as mysql from "mysql";

export interface DBConfig {
    host: string,
    port: number,
    user: string,
    password: string,
    database: string,
    poolSize: number
}

export class DBConnection {

    private connectionPool: mysql.Pool;
    private static db: DBConnection = null;
    private static config: DBConfig;

    private constructor() {
        this.connectionPool = mysql.createPool({
            connectionLimit: DBConnection.config.poolSize,
            host: DBConnection.config.host,
            port: DBConnection.config.port,
            user: DBConnection.config.user,
            password: DBConnection.config.password,
            database: DBConnection.config.database
        });
    }

    async ping() {

        return new Promise((res, rej) => {
            this.connectionPool.getConnection((err, conn) => {
                if (err) {
                    rej(err);
                    return;
                }

                conn.release();
                res();
            });
        })
    }

    static updateConfig(c: DBConfig) {
        DBConnection.config = c;
    }

    static getInstance(): DBConnection {
        if (!DBConnection.db) {
            DBConnection.db = new DBConnection();
        }

        return DBConnection.db;
    }

    async getConnection(): Promise<mysql.PoolConnection> {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((err, conn) => {
                if (err) {
                    reject(new Error(err.code));
                } else {
                    resolve(conn);
                }
            })
        });
    }

    async send(query: string, values: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.connectionPool.query(
                query,
                values,
                (err: mysql.MysqlError, result: any, fields: mysql.FieldInfo[]) => {
                    if (err) {
                        reject(new Error(err.code));
                    } else {
                        resolve(result);
                    }
                })
        });
    }

    async startTransaction(): Promise<Transaction> {
        let conn: mysql.PoolConnection = await new Promise((res, rej) => {
            this.connectionPool.getConnection((err, con) => {
                if (err) {
                    rej(new Error(err.code));
                } else {
                    res(con);
                }
            });
        });

        let trans = new Transaction(conn);
        await trans.begin();
        return trans;
    }

    destroy() {
        this.connectionPool.end((err) => { });
    }
}

export class Transaction {

    private connection: mysql.PoolConnection;

    constructor(conn: mysql.PoolConnection) {
        this.connection = conn;
    }

    async begin(): Promise<boolean> {
        return new Promise((res, rej) => {
            this.connection.beginTransaction((err) => {
                if (err) {
                    this.connection.release();
                    rej(new Error(err.code));
                } else {
                    res(true);
                }
            })

        });
    }

    async send(query: string, values: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.connection.query(
                query,
                values,
                (err: mysql.MysqlError, result: any, fields: mysql.FieldInfo[]) => {
                    if (err) {
                        console.log(err);
                        this.connection.rollback(() => {
                            console.log("rollback done");
                            this.connection.release();
                            reject(new Error(err.code));
                        });
                    } else {
                        resolve(result);
                    }
                })
        });
    }

    async commit(): Promise<boolean> {
        return new Promise((res, rej) => {
            this.connection.commit((err) => {
                if (err) {
                    console.log(err);
                    this.connection.rollback(() => {
                        console.log("rollback done");
                        this.connection.release();
                        rej(new Error(err.code));
                    });
                } else {
                    this.connection.release();
                    res(true);
                }
            })
        })
    }

    async rollback(): Promise<boolean> {
        return new Promise((res, rej) => {
            this.connection.rollback(() => {
                this.connection.release();
                res(true);
            })
        });
    }
}