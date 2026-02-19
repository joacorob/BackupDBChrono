import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "fs/promises";
import { createReadStream } from "fs";
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
  const fileStats = await fs.stat(filePath);
  const fileStream = createReadStream(filePath);
  const fileName = path.basename(filePath);

  const key = `${dbName}/${fileName}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: fileStream,
      ContentLength: fileStats.size,
      ContentType: "application/gzip",
      ACL: "public-read",
    })
  );

  return `https://${process.env.S3_BUCKET}.sfo3.digitaloceanspaces.com/${key}`;
}

export async function cleanupOldBackups(dbName) {
  const response = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: `${dbName}/`,
    })
  );

  if (!response.Contents) return;

  const backups = response.Contents.filter((file) =>
    /\.(zip|gz|archive)$/.test(file.Key)
  ).sort((a, b) => b.LastModified - a.LastModified);

  // Keep only the last 30 backups (5 days with backups every 4 hours = 6 per day × 5 days)
  const backupsToDelete = backups.slice(30);

  for (const backup of backupsToDelete) {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: backup.Key,
      })
    );
  }
}
