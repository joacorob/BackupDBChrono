export function createBackupFileName(dbName, type) {
  const date = new Date().toISOString().replace(/[:.]/g, "-");
  const extension =
    type === "mysql" || type === "postgresql" || type === "postgres"
      ? "sql"
      : type === "mongodb"
        ? "archive"
        : "json";
  return `${dbName}-backup-${date}.${extension}`;
}
