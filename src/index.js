import "dotenv/config";
import cron from "node-cron";
import fs from "fs/promises";
import { databases } from "./config/databases.js";
import { backupDatabase } from "./services/backup.js";
import { uploadToS3, cleanupOldBackups } from "./services/s3.js";
import { compressFile } from "./utils/compression.js";
import { telegramService } from "./services/telegram.js";

async function getFileSize(path) {
  const stats = await fs.stat(path);
  const bytes = stats.size;
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }

  return `${size.toFixed(2)} ${units[unit]}`;
}

async function performBackup() {
  console.log("Starting backup process:", new Date().toISOString());

  for (const db of databases) {
    try {
      // Create backup
      const backupPath = await backupDatabase(db);

      // Compress backup
      const compressedPath = await compressFile(backupPath);
      console.log(`Backup compressed for ${db.name}`);

      // Get compressed file size
      const fileSize = await getFileSize(compressedPath);

      // Upload to S3
      await uploadToS3(compressedPath, db.name);
      console.log(`Backup uploaded for ${db.name}`);

      // Notify success
      await telegramService.notifyBackupSuccess(db.name, fileSize);

      // Cleanup local compressed file
      await fs.unlink(compressedPath);

      // Cleanup old backups in S3
      await cleanupOldBackups(db.name);

      console.log(`Backup completed for ${db.name}`);
    } catch (error) {
      console.error(`Error processing ${db.name}:`, error);
      await telegramService.notifyBackupError(db.name, error);
    }
  }
}

// Run backup every 12 hours
cron.schedule("0 */12 * * *", performBackup);

// Initial backup on start
performBackup();

console.log("Backup service started");
