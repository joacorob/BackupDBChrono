import fs from 'fs/promises';
import Database from 'better-sqlite3';

export async function backupSqlite(sourcePath, destPath) {
  const db = new Database(sourcePath);
  
  try {
    const backup = db.backup(destPath);
    await backup.step(-1); // -1 means copy entire database
    await backup.finish();
  } finally {
    db.close();
  }
}
