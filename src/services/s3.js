import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import path from "path";

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION
// });

const s3Client = new S3Client({
  endpoint: "https://sfo3.digitaloceanspaces.com",
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function uploadToS3(filePath, dbName) {
  const fileContent = await fs.readFile(filePath);
  const fileName = path.basename(filePath);

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `${dbName}/${fileName}`,
      Body: fileContent,
      ContentType: "application/zip",
    })
  );
}

export async function cleanupOldBackups(dbName) {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: `${dbName}/`,
    })
  );

  if (!response.Contents) return;

  // Filter only zip files
  const backups = response.Contents.filter((file) =>
    file.Key.endsWith(".zip")
  ).sort((a, b) => b.LastModified - a.LastModified);

  // Keep only the last 10 backups
  const backupsToDelete = backups.slice(10);

  for (const backup of backupsToDelete) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: backup.Key,
      })
    );
  }
}
