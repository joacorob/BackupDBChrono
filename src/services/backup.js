import fs from "fs/promises";
import path from "path";
import { createBackupFileName } from "../utils/naming.js";
import { backupSqlite } from "./sqlite-backup.js";
import { backupMysql } from "./mysql-backup.js";
import { backupMongodb } from "./mongodb-backup.js";

const BACKUP_DIR = "./backups";

export async function backupDatabase(db) {
  const backupFileName = createBackupFileName(db.name, db.type);
  const backupPath = path.join(BACKUP_DIR, backupFileName);

  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    switch (db.type) {
      case "sqlite":
        await backupSqlite(db.path, backupPath);
        break;
      case "mysql":
        await backupMysql(db.url, backupPath);
        break;
      case "mongodb":
        await backupMongodb(db.url, backupPath);
        break;
      default:
        throw new Error(`Unsupported database type: ${db.type}`);
    }

    return backupPath;
  } catch (error) {
    console.error(`Backup failed for ${db.name}:`, error);
    throw error;
  }
}
